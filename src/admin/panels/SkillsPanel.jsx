import { createResource, createSignal, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow } from "../../lib/api";

export default function SkillsPanel() {
  const [skills, { refetch }] = createResource(() => fetchCollection("skills"));
  const [newSkill, setNewSkill] = createSignal("");
  const [edits, setEdits] = createSignal({});
  const [status, setStatus] = createSignal({ type: "", message: "" });
  const [busy, setBusy] = createSignal(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSkill().trim()) return;
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      await insertRow("skills", { name: newSkill().trim() });
      setNewSkill("");
      refetch();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (id) => {
    const value = edits()[id];
    if (value === undefined) return;
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      await updateRow("skills", id, { name: value });
      refetch();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      await deleteRow("skills", id);
      refetch();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
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

      <Show when={status().message}>
        <p class="admin-error">{status().message}</p>
      </Show>

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
                <button class="neo-btn btn-accent" disabled={busy()} onClick={() => handleDelete(skill.id)}>Hapus</button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
