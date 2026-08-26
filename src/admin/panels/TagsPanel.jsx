import { createResource, createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow } from "../../lib/api";
import { notifySuccess, notifyError, setDirty, confirmAction } from "../adminStore";

export default function TagsPanel() {
  const [tags, { refetch }] = createResource(() => fetchCollection("project_tags"));
  const [newTag, setNewTag] = createSignal("");
  const [edits, setEdits] = createSignal({});
  const [busy, setBusy] = createSignal(false);

  createEffect(() => {
    const list = tags() || [];
    const hasEdit = Object.entries(edits()).some(([id, value]) => {
      const orig = list.find((t) => String(t.id) === String(id))?.name;
      return value !== undefined && value !== orig;
    });
    setDirty(hasEdit || newTag().trim() !== "");
  });

  onCleanup(() => setDirty(false));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTag().trim()) return;
    setBusy(true);
    try {
      await insertRow("project_tags", { name: newTag().trim() });
      setNewTag("");
      notifySuccess("Tag berhasil ditambahkan.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (id) => {
    const value = edits()[id];
    if (value === undefined) return;
    setBusy(true);
    try {
      await updateRow("project_tags", id, { name: value });
      notifySuccess("Tag berhasil disimpan.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (tag) => {
    const ok = await confirmAction(`Hapus tag "${tag.name}"? Project yang sudah punya tag ini tidak akan otomatis ikut berubah.`, {
      title: "Hapus Tag",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteRow("project_tags", tag.id);
      notifySuccess("Tag berhasil dihapus.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Tags</h2>
      <p class="admin-hint">Tag di sini yang muncul sebagai pilihan checkbox di form Project.</p>

      <form class="admin-inline-form" onSubmit={handleAdd}>
        <input
          class="neo-input"
          placeholder="Tambah tag baru..."
          value={newTag()}
          onInput={(e) => setNewTag(e.target.value)}
        />
        <button type="submit" class="neo-btn btn-primary" disabled={busy()}>Tambah</button>
      </form>

      <Show when={!tags.loading} fallback={<p>Memuat...</p>}>
        <div class="admin-list">
          <For each={tags()}>
            {(tag) => (
              <div class="admin-list-item">
                <input
                  class="neo-input"
                  value={edits()[tag.id] ?? tag.name}
                  onInput={(e) => setEdits({ ...edits(), [tag.id]: e.target.value })}
                />
                <button class="neo-btn btn-default" disabled={busy()} onClick={() => handleSave(tag.id)}>Simpan</button>
                <button class="neo-btn btn-accent" disabled={busy()} onClick={() => handleDelete(tag)}>Hapus</button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
