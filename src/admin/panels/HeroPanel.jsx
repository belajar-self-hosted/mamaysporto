import { createResource, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { fetchCollection, updateSingleton, uploadSiteImage } from "../../lib/api";
import { normalizeUrl } from "../../lib/url";
import { notifySuccess, notifyError, setDirty } from "../adminStore";

export default function HeroPanel() {
  const [hero, { refetch }] = createResource(() => fetchCollection("hero"));
  const [form, setForm] = createSignal(null);
  const [original, setOriginal] = createSignal(null);
  const [saving, setSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  createEffect(() => {
    if (hero() && !form()) {
      setForm({ ...hero() });
      setOriginal({ ...hero() });
    }
  });

  createEffect(() => {
    if (form() && original()) {
      setDirty(JSON.stringify(form()) !== JSON.stringify(original()));
    }
  });

  onCleanup(() => setDirty(false));

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file);
      setForm({ ...form(), image: url });
    } catch (err) {
      notifyError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, ...patch } = form();
      patch.cta_yowman_link = normalizeUrl(patch.cta_yowman_link);
      const updated = await updateSingleton("hero", patch);
      setForm({ ...updated });
      setOriginal({ ...updated });
      setDirty(false);
      notifySuccess("Hero section berhasil disimpan.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Hero Section</h2>
      <Show when={form()} fallback={<p>Memuat...</p>}>
        <form class="admin-form" onSubmit={handleSubmit}>
          <div class="admin-form-group">
            <label>Foto Profil (rasio mengikuti gambar yang diupload, maks 1 MB)</label>
            <Show when={form().image}>
              <img src={form().image} alt="preview" class="admin-hero-image-preview" />
            </Show>
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading()} />
            {uploading() && <p class="admin-hint">Mengupload...</p>}
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Sapaan (mis. "HALO, AKU")</label>
              <input class="neo-input" value={form().greeting} onInput={update("greeting")} />
            </div>
            <div class="admin-form-group">
              <label>Nama (highlight)</label>
              <input class="neo-input" value={form().display_name} onInput={update("display_name")} />
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Prefix Role (mis. "JUNIOR FULL STACK")</label>
              <input class="neo-input" value={form().role_prefix} onInput={update("role_prefix")} />
            </div>
            <div class="admin-form-group">
              <label>Role Highlight (mis. "DEVELOPER")</label>
              <input class="neo-input" value={form().role_highlight} onInput={update("role_highlight")} />
            </div>
          </div>
          <div class="admin-form-group">
            <label>Subtitle</label>
            <textarea class="neo-input" rows="3" value={form().subtitle} onInput={update("subtitle")} />
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Label tombol "Projects"</label>
              <input class="neo-input" value={form().cta_projects_label} onInput={update("cta_projects_label")} />
            </div>
            <div class="admin-form-group">
              <label>Label tombol "Contact"</label>
              <input class="neo-input" value={form().cta_contact_label} onInput={update("cta_contact_label")} />
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Label tombol AI Chat</label>
              <input class="neo-input" value={form().cta_yowman_label} onInput={update("cta_yowman_label")} />
            </div>
            <div class="admin-form-group">
              <label>Link tombol AI Chat</label>
              <input class="neo-input" value={form().cta_yowman_link} onInput={update("cta_yowman_link")} />
            </div>
          </div>

          <button type="submit" class="neo-btn btn-primary" disabled={saving() || uploading()}>
            {saving() ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Show>
    </div>
  );
}
