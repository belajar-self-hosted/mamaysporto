import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

function askHidden(question) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      reject(new Error("Admin creation requires an interactive terminal."));
      return;
    }

    let value = "";
    const cleanup = () => {
      stdin.off("data", handleInput);
      stdin.setRawMode(false);
      stdin.pause();
    };
    const handleInput = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          cleanup();
          stdout.write("\n");
          reject(new Error("Admin creation canceled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", handleInput);
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  const email = (await prompt.question("Admin email: ")).trim().toLowerCase();
  prompt.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required.");
  }

  const password = await askHidden("Admin password (minimum 14 characters): ");
  if (Array.from(password).length < 14 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Admin password must contain at least 14 characters and at most 72 UTF-8 bytes.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rowCount } = await pool.query(
      "INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email, passwordHash],
    );
    if (rowCount === 0) {
      throw new Error("An admin with this email already exists; this command never resets existing credentials.");
    }
    stdout.write("Admin account created.\n");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
