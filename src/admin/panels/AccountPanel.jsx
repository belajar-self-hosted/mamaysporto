import { createSignal, onMount, Show } from "solid-js";
import { getSession, updateAccount, signOut } from "../../lib/auth";
import { notifySuccess, notifyError } from "../adminStore";

export default function AccountPanel() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [initialLoading, setInitialLoading] = createSignal(true);

  onMount(async () => {
    try {
      const session = await getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    } catch (e) {
      console.error("Gagal memuat sesi email admin:", e);
    } finally {
      setInitialLoading(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email().trim() || !email().includes("@")) {
      notifyError("Format email tidak valid.");
      return;
    }

    if (password()) {
      if (password().length < 6) {
        notifyError("Password baru minimal terdiri dari 6 karakter.");
        return;
      }
      if (password() !== confirmPassword()) {
        notifyError("Konfirmasi password tidak cocok dengan password baru.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateAccount({
        email: email().trim(),
        password: password() || undefined,
      });

      notifySuccess(res.message || "Akun & Keamanan berhasil diperbarui! Mengalihkan ke login...");

      // Tunggu notifikasi terbaca sejenak, lalu otomatis logout
      setTimeout(() => {
        signOut();
      }, 1500);
    } catch (err) {
      notifyError(err.message || "Gagal memperbarui akun.");
      setLoading(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Akun & Keamanan</h2>
      <p class="admin-hint" style={{ "margin-bottom": "1.5rem" }}>
        Kelola kredensial akses panel CMS Anda. Setelah memperbarui email atau password, sesi saat ini akan otomatis diakhiri dan Anda akan diarahkan ke halaman login untuk menguji kredensial baru.
      </p>

      <Show when={!initialLoading()} fallback={<p>Memuat profil admin...</p>}>
        <form class="admin-form" onSubmit={handleSubmit} style={{ "max-width": "540px" }}>
          <div class="admin-form-group">
            <label for="admin-email">Alamat Email Admin</label>
            <input
              id="admin-email"
              type="email"
              class="neo-input"
              required
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              placeholder="admin@mamay.my.id"
            />
            <span class="admin-hint">Digunakan untuk login ke panel admin CMS.</span>
          </div>

          <div class="admin-form-group">
            <label for="new-password">Password Baru (Opsional)</label>
            <input
              id="new-password"
              type={showPassword() ? "text" : "password"}
              class="neo-input"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika hanya ingin ganti email"
              autocomplete="new-password"
            />
            <span class="admin-hint">Minimal 6 karakter. Biarkan kosong jika tidak ingin mengubah password.</span>
          </div>

          <Show when={password().length > 0}>
            <div class="admin-form-group">
              <label for="confirm-password">Konfirmasi Password Baru</label>
              <input
                id="confirm-password"
                type={showPassword() ? "text" : "password"}
                class="neo-input"
                required={password().length > 0}
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                autocomplete="new-password"
              />
              <Show when={confirmPassword().length > 0 && password() !== confirmPassword()}>
                <span class="admin-hint" style={{ color: "var(--accent-1, #e63946)", "font-weight": "600" }}>
                  ⚠️ Konfirmasi password belum cocok.
                </span>
              </Show>
            </div>
          </Show>

          <div style={{ display: "flex", "align-items": "center", gap: "0.5rem", "margin-bottom": "1.5rem" }}>
            <input
              type="checkbox"
              id="toggle-show-pass"
              checked={showPassword()}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label for="toggle-show-pass" style={{ "font-size": "0.9rem", cursor: "pointer", "font-weight": "500" }}>
              Tampilkan Password
            </label>
          </div>

          <button
            type="submit"
            class="neo-btn btn-primary"
            disabled={loading()}
            style={{ width: "100%", "font-size": "1rem", padding: "0.8rem" }}
          >
            {loading() ? "Menyimpan Perubahan..." : "Simpan Perubahan & Logout"}
          </button>
        </form>
      </Show>
    </div>
  );
}
