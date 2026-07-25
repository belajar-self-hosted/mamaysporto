import { createResource, createSignal, createEffect, Show } from "solid-js";
import { fetchCollection, updateSingleton, uploadSiteImage } from "../../lib/api";

export default function SiteSettingsPanel() {
  const [settings, { refetch }] = createResource(() => fetchCollection("site_settings"));
  const [form, setForm] = createSignal(null);
  const [status, setStatus] = createSignal({ type: "", message: "" });
  const [saving, setSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  createEffect(() => {
    if (settings() && !form()) setForm({ ...settings() });
  });

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleFaviconFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus({ type: "", message: "" });
    try {
      const url = await uploadSiteImage(file);
      setForm({ ...form(), favicon_url: url });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const { id, ...patch } = form();
      await updateSingleton("site_settings", patch);
      setStatus({ type: "success", message: "Tersimpan." });
      refetch();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Site Settings</h2>
      <Show when={form()} fallback={<p>Memuat...</p>}>
        <form class="admin-form" onSubmit={handleSubmit}>
          <h3>Browser Tab</h3>
          <div class="admin-form-group">
            <label>Judul Tab Browser</label>
            <input class="neo-input" value={form().site_title} onInput={update("site_title")} />
          </div>
          <div class="admin-form-group">
            <label>Favicon (ikon di tab browser, maks 1 MB)</label>
            <Show when={form().favicon_url}>
              <img src={form().favicon_url} alt="favicon preview" class="admin-favicon-preview" />
            </Show>
            <input type="file" accept="image/*" onChange={handleFaviconFile} disabled={uploading()} />
            {uploading() && <p class="admin-hint">Mengupload...</p>}
          </div>

          <h3>Navbar & Footer</h3>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Navbar Brand</label>
              <input class="neo-input" value={form().navbar_brand} onInput={update("navbar_brand")} />
            </div>
            <div class="admin-form-group">
              <label>Footer Nama</label>
              <input class="neo-input" value={form().footer_name} onInput={update("footer_name")} />
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>GitHub URL</label>
              <input class="neo-input" value={form().footer_github} onInput={update("footer_github")} />
            </div>
            <div class="admin-form-group">
              <label>LinkedIn URL</label>
              <input class="neo-input" value={form().footer_linkedin} onInput={update("footer_linkedin")} />
            </div>
          </div>
          <div class="admin-form-group">
            <label>Instagram URL</label>
            <input class="neo-input" value={form().footer_instagram} onInput={update("footer_instagram")} />
          </div>

          <h3>Contact Section</h3>
          <div class="admin-form-group">
            <label>Judul Contact</label>
            <input class="neo-input" value={form().contact_title} onInput={update("contact_title")} />
          </div>
          <div class="admin-form-group">
            <label>Deskripsi Contact</label>
            <textarea class="neo-input" rows="2" value={form().contact_desc} onInput={update("contact_desc")} />
          </div>
          <div class="admin-form-group">
            <label>Link "Report" (WhatsApp)</label>
            <input class="neo-input" value={form().report_whatsapp_link} onInput={update("report_whatsapp_link")} />
          </div>

          <h3>AI Chat (Yowman) System Prompt</h3>
          <div class="admin-form-group">
            <label>System Prompt</label>
            <textarea
              class="neo-input admin-textarea-large"
              rows="16"
              value={form().ai_system_prompt}
              onInput={update("ai_system_prompt")}
            />
            <p class="admin-hint">
              Prompt ini menentukan bagaimana asisten AI Yowman menjawab pertanyaan pengunjung.
            </p>
          </div>

          <Show when={status().message}>
            <p class={status().type === "error" ? "admin-error" : "admin-success"}>{status().message}</p>
          </Show>

          <button type="submit" class="neo-btn btn-primary" disabled={saving() || uploading()}>
            {saving() ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Show>
    </div>
  );
}
