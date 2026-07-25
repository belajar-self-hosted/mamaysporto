import { createResource, createSignal, createEffect, For, Show } from "solid-js";
import { fetchCollection, updateSingleton, uploadSiteImage } from "../../lib/api";
import { normalizeUrl } from "../../lib/url";
import SocialIcon, { platformLabel } from "../../lib/socialIcons.jsx";

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

  const addSocialLink = () => {
    setForm({ ...form(), social_links: [...(form().social_links || []), { url: "" }] });
  };

  const updateSocialLink = (index, value) => {
    const links = [...(form().social_links || [])];
    links[index] = { url: value };
    setForm({ ...form(), social_links: links });
  };

  const removeSocialLink = (index) => {
    const links = (form().social_links || []).filter((_, i) => i !== index);
    setForm({ ...form(), social_links: links });
  };

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
      patch.social_links = (patch.social_links || [])
        .map((link) => ({ url: normalizeUrl(link.url) }))
        .filter((link) => link.url && link.url !== "#");
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
          <div class="admin-form-group">
            <label>Social Media Links</label>
            <p class="admin-hint">
              Tambahkan link sosial media apa saja (GitHub, LinkedIn, Instagram, TikTok, YouTube, dll). Ikon di homepage otomatis menyesuaikan berdasarkan URL yang kamu masukkan.
            </p>
            <div class="admin-social-list">
              <For each={form().social_links || []}>
                {(link, index) => (
                  <div class="admin-social-row">
                    <span class="admin-social-icon"><SocialIcon url={link.url} size={20} /></span>
                    <input
                      class="neo-input"
                      placeholder="https://..."
                      value={link.url}
                      onInput={(e) => updateSocialLink(index(), e.target.value)}
                    />
                    <span class="admin-social-platform">{platformLabel(link.url)}</span>
                    <button
                      type="button"
                      class="neo-btn btn-accent"
                      onClick={() => removeSocialLink(index())}
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </For>
            </div>
            <button type="button" class="neo-btn btn-default admin-add-toggle" onClick={addSocialLink}>
              + Tambah Social Media
            </button>
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
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Nomor WhatsApp (tombol "Report")</label>
              <input
                class="neo-input"
                placeholder="628xxxxxxxxxx"
                value={form().report_whatsapp_number}
                onInput={update("report_whatsapp_number")}
              />
            </div>
            <div class="admin-form-group">
              <label>Pesan Default (Report)</label>
              <input
                class="neo-input"
                placeholder="Halo admin, saya ingin melaporkan..."
                value={form().report_whatsapp_message}
                onInput={update("report_whatsapp_message")}
              />
            </div>
          </div>
          <p class="admin-hint">
            Kalau pengunjung klik tombol "Report" di navbar, WhatsApp akan terbuka ke nomor ini dengan pesan default di atas sudah terisi otomatis.
          </p>

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
