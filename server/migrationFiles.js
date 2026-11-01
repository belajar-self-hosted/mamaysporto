import fs from "node:fs/promises";

const MIGRATION_FILE_PATTERN = /^\d{12}_[a-z0-9_]+\.sql$/;

export async function listMigrationFiles(directory) {
  const sqlFiles = (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
  const invalidFiles = sqlFiles.filter((file) => !MIGRATION_FILE_PATTERN.test(file));

  if (invalidFiles.length > 0) {
    throw new Error(`Invalid migration filename(s): ${invalidFiles.join(", ")}`);
  }

  return sqlFiles;
}
