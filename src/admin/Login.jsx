import { createSignal, Show } from "solid-js";
import { signIn } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email(), password());
    } catch (err) {
      setError(err.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="admin-login-page">
      <form class="admin-login-box neo-box" onSubmit={handleSubmit}>
        <h1 class="admin-login-title">CMS Login</h1>
        <p class="admin-login-subtitle">Masuk untuk mengelola konten portfolio.</p>

        <div class="admin-form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            class="neo-input"
            required
            autocomplete="username"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
          />
        </div>

        <div class="admin-form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            class="neo-input"
            required
            autocomplete="current-password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
          />
        </div>

        <Show when={error()}>
          <p class="admin-error">{error()}</p>
        </Show>

        <button type="submit" class="neo-btn btn-primary admin-login-submit" disabled={loading()}>
          {loading() ? "Memproses..." : "Login"}
        </button>

        <a href="#/" class="admin-back-link">← Kembali ke website</a>
      </form>
    </div>
  );
}
