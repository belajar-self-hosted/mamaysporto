import { createResource, createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow, uploadProjectImage } from "../../lib/api";
import { normalizeUrl } from "../../lib/url";
import { notifySuccess, notifyError, setDirty, confirmAction, confirmDiscardIfDirty } from "../adminStore";

const EMPTY = { title: "", description: "", image: "", link: "", github: "", tags: [], category: "live" };

function snapshotProject(form) {
  return JSON.stringify({
    title: form.title,
    description: form.description,
    image: form.image,
    link: form.link,
    github: form.github,
    tags: form.tags,
    category: form.category,
  });
}

function ProjectForm(props) {
  const [form, setForm] = createSignal({ ...EMPTY, ...props.initial });
  const [availableTags] = createResource(() => fetchCollection("project_tags"));
  const [busy, setBusy] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  const initialSnapshot = snapshotProject({ ...EMPTY, ...props.initial });

  createEffect(() => {
    setDirty(snapshotProject(form()) !== initialSnapshot);
  });

  onCleanup(() => setDirty(false));

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  // Bangun ulang array tags dalam urutan tetap sesuai daftar master (project_tags),
  // bukan urutan klik — supaya snapshot dirty-check stabil.
  const toggleTag = (name) => {
    const selected = new Set(form().tags || []);
    if (selected.has(name)) selected.delete(name);
    else selected.add(name);
    const orderedNames = (availableTags() || []).map((t) => t.name);
    setForm({ ...form(), tags: orderedNames.filter((n) => selected.has(n)) });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProjectImage(file);
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
    setBusy(true);
    try {
      await props.onSubmit({
        ...form(),
        link: normalizeUrl(form().link),
        github: normalizeUrl(form().github),
      });
    } catch (err) {
      notifyError(err.message);
      setBusy(false);
    }
  };

  return (
    <form class="admin-form" onSubmit={handleSubmit}>
      <div class="admin-form-group">
        <label>Judul</label>
        <input class="neo-input" required value={form().title} onInput={update("title")} />
      </div>
      <div class="admin-form-group">
        <label>Deskripsi</label>
        <textarea class="neo-input" rows="3" value={form().description} onInput={update("description")} />
      </div>

      <div class="admin-form-group">
        <label>Gambar (maks 1 MB) <span class="admin-ratio-tag">Rasio disarankan 16:9</span></label>
        <Show when={form().image}>
          <img src={form().image} alt="preview" class="admin-image-preview" />
        </Show>
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading()} />
        {uploading() && <p class="admin-hint">Mengupload...</p>}
        <input
          class="neo-input"
          placeholder="atau paste URL gambar"
          value={form().image}
          onInput={update("image")}
        />
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Link Live Demo</label>
          <input class="neo-input" value={form().link} onInput={update("link")} />
        </div>
        <div class="admin-form-group">
          <label>Link GitHub</label>
          <input class="neo-input" value={form().github} onInput={update("github")} />
        </div>
      </div>

      <div class="admin-form-group">
        <label>Tags</label>
        <Show
          when={(availableTags() || []).length > 0}
          fallback={<p class="admin-hint">Belum ada tag, tambahkan dulu di tab Tags.</p>}
        >
          <div class="admin-checkbox-group">
            <For each={availableTags()}>
              {(tag) => (
                <label class="admin-checkbox-option">
                  <input
                    type="checkbox"
                    checked={(form().tags || []).includes(tag.name)}
                    onChange={() => toggleTag(tag.name)}
                  />
                  {tag.name}
                </label>
              )}
            </For>
          </div>
        </Show>
      </div>

      <div class="admin-form-group">
        <label>Status Deployment</label>
        <div class="admin-radio-group">
          <label class="admin-radio-option">
            <input
              type="radio"
              name="category"
              value="live"
              checked={form().category === "live"}
              onChange={() => setForm({ ...form(), category: "live" })}
            />
            Live
          </label>
          <label class="admin-radio-option">
            <input
              type="radio"
              name="category"
              value="localhost"
              checked={form().category === "localhost"}
              onChange={() => setForm({ ...form(), category: "localhost" })}
            />
            Localhost
          </label>
        </div>
      </div>

      <div class="admin-form-actions">
        <button type="submit" class="neo-btn btn-primary" disabled={busy() || uploading()}>
          {props.submitLabel || "Simpan"}
        </button>
        <button type="button" class="neo-btn btn-default" disabled={busy()} onClick={props.onCancel}>
          Batal
        </button>
        <Show when={props.onDelete}>
          <button type="button" class="neo-btn btn-accent" disabled={busy()} onClick={props.onDelete}>Hapus</button>
        </Show>
      </div>
    </form>
  );
}

export default function ProjectsPanel() {
  const [items, { refetch }] = createResource(() => fetchCollection("projects"));
  const [openId, setOpenId] = createSignal(null); // null | "new" | item.id

  const toggle = async (id) => {
    if (openId() === id) {
      setOpenId(null);
      return;
    }
    const ok = await confirmDiscardIfDirty(
      "Form ini punya perubahan yang belum disimpan. Pindah akan membuang perubahan tersebut. Lanjutkan?"
    );
    if (!ok) return;
    setDirty(false);
    setOpenId(id);
  };

  const handleDelete = async (item) => {
    const ok = await confirmAction(`Hapus project "${item.title}"? Tindakan ini tidak bisa dibatalkan.`, {
      title: "Hapus Project",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteRow("projects", item.id);
      if (openId() === item.id) {
        setDirty(false);
        setOpenId(null);
      }
      notifySuccess("Project berhasil dihapus.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Projects</h2>

      <button type="button" class="neo-btn btn-primary admin-add-toggle" onClick={() => toggle("new")}>
        {openId() === "new" ? "Batal Tambah" : "+ Tambah Project Baru"}
      </button>

      <Show when={openId() === "new"}>
        <div class="admin-card neo-box">
          <h3>Tambah Project</h3>
          <ProjectForm
            submitLabel="Tambah"
            onCancel={() => setOpenId(null)}
            onSubmit={async (data) => {
              await insertRow("projects", data);
              setOpenId(null);
              notifySuccess("Project berhasil ditambahkan.");
              refetch();
            }}
          />
        </div>
      </Show>

      <Show when={!items.loading} fallback={<p>Memuat...</p>}>
        <div class="admin-list">
          <For each={items()}>
            {(item) => (
              <div class="admin-card neo-box">
                <Show
                  when={openId() === item.id}
                  fallback={
                    <div class="admin-item-row">
                      <Show when={item.image}>
                        <img src={item.image} alt="" class="admin-row-thumb" />
                      </Show>
                      <div class="admin-row-info">
                        <strong>{item.title}</strong>
                        <span class="admin-row-sub">
                          {item.category === "localhost" ? "Localhost" : "Live"}
                          {(item.tags || []).length > 0 ? ` • ${(item.tags || []).join(", ")}` : ""}
                        </span>
                      </div>
                      <div class="admin-row-actions">
                        <button class="neo-btn btn-default" onClick={() => toggle(item.id)}>Edit</button>
                        <button class="neo-btn btn-accent" onClick={() => handleDelete(item)}>Hapus</button>
                      </div>
                    </div>
                  }
                >
                  <ProjectForm
                    initial={item}
                    submitLabel="Simpan"
                    onCancel={() => setOpenId(null)}
                    onSubmit={async (data) => {
                      await updateRow("projects", item.id, data);
                      setOpenId(null);
                      notifySuccess("Project berhasil disimpan.");
                      refetch();
                    }}
                    onDelete={() => handleDelete(item)}
                  />
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
