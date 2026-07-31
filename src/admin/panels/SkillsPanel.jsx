import { createResource, createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow } from "../../lib/api";
import { notifySuccess, notifyError, setDirty, confirmAction } from "../adminStore";

export default function SkillsPanel() {
  const [skills, { refetch }] = createResource(() => fetchCollection("skills"));
  const [newSkill, setNewSkill] = createSignal("");
  const [edits, setEdits] = createSignal({});
  const [busy, setBusy] = createSignal(false);

  createEffect(() => {
    const list = skills() || [];
    const hasEdit = Object.entries(edits()).some(([id, value]) => {
      const orig = list.find((s) => String(s.id) === String(id))?.name;
      return value !== undefined && value !== orig;
    });
    setDirty(hasEdit || newSkill().trim() !== "");
  });

  onCleanup(() => setDirty(false));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSkill().trim()) return;
    setBusy(true);
    try {
      await insertRow("skills", { name: newSkill().trim() });
      setNewSkill("");
      notifySuccess("Skill berhasil ditambahkan.");
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
      await updateRow("skills", id, { name: value });
      notifySuccess("Skill berhasil disimpan.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (skill) => {
    const ok = await confirmAction(`Hapus skill "${skill.name}"? Tindakan ini tidak bisa dibatalkan.`, {
      title: "Hapus Skill",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteRow("skills", skill.id);
      notifySuccess("Skill berhasil dihapus.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Skills</h2>

      <form class="admin-inline-form" onSubmit={handleAdd}>
        <input
          class="neo-input"
          placeholder="Tambah skill baru..."
          value={newSkill()}
          onInput={(e) => setNewSkill(e.target.value)}
        />
        <button type="submit" class="neo-btn btn-primary" disabled={busy()}>Tambah</button>
      </form>

      <Show when={!skills.loading} fallback={<p>Memuat...</p>}>
        <div class="admin-list">
          <For each={skills()}>
            {(skill) => (
              <div class="admin-list-item">
                <input
                  class="neo-input"
                  value={edits()[skill.id] ?? skill.name}
                  onInput={(e) => setEdits({ ...edits(), [skill.id]: e.target.value })}
                />
                <button class="neo-btn btn-default" disabled={busy()} onClick={() => handleSave(skill.id)}>Simpan</button>
                <button class="neo-btn btn-accent" disabled={busy()} onClick={() => handleDelete(skill)}>Hapus</button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
