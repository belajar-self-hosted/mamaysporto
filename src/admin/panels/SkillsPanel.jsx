import { createResource, createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow, uploadSiteImage } from "../../lib/api";
import { notifySuccess, notifyError, setDirty, confirmAction } from "../adminStore";

export default function SkillsPanel() {
  const [skills, { refetch }] = createResource(() => fetchCollection("skills"));
  const [newSkill, setNewSkill] = createSignal("");
  const [newIcon, setNewIcon] = createSignal("");
  const [edits, setEdits] = createSignal({});
  const [busy, setBusy] = createSignal(false);
  const [uploadingNew, setUploadingNew] = createSignal(false);
  const [uploadingId, setUploadingId] = createSignal(null);

  const handleNewIconFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNew(true);
    try {
      setNewIcon(await uploadSiteImage(file));
    } catch (err) {
      notifyError(err.message);
    } finally {
      setUploadingNew(false);
      e.target.value = "";
    }
  };

  const handleRowIconFile = async (skill, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(skill.id);
    try {
      const url = await uploadSiteImage(file);
      await updateRow("skills", skill.id, { icon_url: url });
      notifySuccess("Icon skill berhasil diperbarui.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

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
      await insertRow("skills", { name: newSkill().trim(), icon_url: newIcon() });
      setNewSkill("");
      setNewIcon("");
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
        <Show when={newIcon()}>
          <img src={newIcon()} alt="preview" class="admin-skill-icon-preview" />
        </Show>
        <input type="file" accept="image/*" onChange={handleNewIconFile} disabled={uploadingNew()} />
        <span class="admin-ratio-tag">Rasio disarankan 1:1</span>
        <button type="submit" class="neo-btn btn-primary" disabled={busy() || uploadingNew()}>Tambah</button>
      </form>

      <Show when={!skills.loading} fallback={<p>Memuat...</p>}>
        <div class="admin-list">
          <For each={skills()}>
            {(skill) => (
              <div class="admin-list-item">
                <Show when={skill.icon_url}>
                  <img src={skill.icon_url} alt="" class="admin-skill-icon-preview" />
                </Show>
                <input
                  class="neo-input"
                  value={edits()[skill.id] ?? skill.name}
                  onInput={(e) => setEdits({ ...edits(), [skill.id]: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleRowIconFile(skill, e)}
                  disabled={uploadingId() === skill.id}
                />
                <span class="admin-ratio-tag">1:1</span>
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
