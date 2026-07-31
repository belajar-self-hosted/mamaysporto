import { createResource, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { fetchCollection, updateSingleton } from "../../lib/api";
import { notifySuccess, notifyError, setDirty } from "../adminStore";

export default function AboutPanel() {
  const [about, { refetch }] = createResource(() => fetchCollection("about"));
  const [form, setForm] = createSignal(null);
  const [original, setOriginal] = createSignal(null);
  const [saving, setSaving] = createSignal(false);

  createEffect(() => {
    if (about() && !form()) {
      setForm({ ...about() });
      setOriginal({ ...about() });
    }
  });

  createEffect(() => {
    if (form() && original()) {
      setDirty(JSON.stringify(form()) !== JSON.stringify(original()));
    }
  });

  onCleanup(() => setDirty(false));

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, ...patch } = form();
      const updated = await updateSingleton("about", patch);
      setForm({ ...updated });
      setOriginal({ ...updated });
      setDirty(false);
      notifySuccess("About section berhasil disimpan.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>About Section</h2>
      <Show when={form()} fallback={<p>Memuat...</p>}>
        <form class="admin-form" onSubmit={handleSubmit}>
          <div class="admin-form-group">
            <label>Konten (HTML diperbolehkan, mis. &lt;strong&gt;)</label>
            <textarea class="neo-input" rows="6" value={form().content} onInput={update("content")} />
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Stat 1 - Angka</label>
              <input class="neo-input" value={form().stat_1_number} onInput={update("stat_1_number")} />
            </div>
            <div class="admin-form-group">
              <label>Stat 1 - Label</label>
              <input class="neo-input" value={form().stat_1_label} onInput={update("stat_1_label")} />
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Stat 2 - Angka</label>
              <input class="neo-input" value={form().stat_2_number} onInput={update("stat_2_number")} />
            </div>
            <div class="admin-form-group">
              <label>Stat 2 - Label</label>
              <input class="neo-input" value={form().stat_2_label} onInput={update("stat_2_label")} />
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>Stat 3 - Angka</label>
              <input class="neo-input" value={form().stat_3_number} onInput={update("stat_3_number")} />
            </div>
            <div class="admin-form-group">
              <label>Stat 3 - Label</label>
              <input class="neo-input" value={form().stat_3_label} onInput={update("stat_3_label")} />
            </div>
          </div>

          <button type="submit" class="neo-btn btn-primary" disabled={saving()}>
            {saving() ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Show>
    </div>
  );
}
