import { createResource, createSignal, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow, uploadProjectImage } from "../../lib/api";
import { normalizeUrl } from "../../lib/url";

const EMPTY = { title: "", description: "", image: "", link: "", github: "", tags: [] };

function ProjectForm(props) {
  const [form, setForm] = createSignal({ ...EMPTY, ...props.initial });
  const [tagsText, setTagsText] = createSignal((props.initial?.tags || []).join(", "));
  const [busy, setBusy] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [error, setError] = createSignal("");

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadProjectImage(file);
      setForm({ ...form(), image: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const tags = tagsText().split(",").map((t) => t.trim()).filter(Boolean);
      await props.onSubmit({
        ...form(),
        link: normalizeUrl(form().link),
        github: normalizeUrl(form().github),
        tags,
      });
      if (!props.initial) {
        setForm({ ...EMPTY });
        setTagsText("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
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
        <label>Gambar (maks 1 MB)</label>
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
        <label>Tags (pisahkan dengan koma)</label>
        <input class="neo-input" value={tagsText()} onInput={(e) => setTagsText(e.target.value)} />
      </div>

      <Show when={error()}>
        <p class="admin-error">{error()}</p>
      </Show>

      <div class="admin-form-actions">
        <button type="submit" class="neo-btn btn-primary" disabled={busy() || uploading()}>
          {props.submitLabel || "Simpan"}
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

  return (
    <div class="admin-panel">
      <h2>Projects</h2>

      <div class="admin-card neo-box">
        <h3>Tambah Project</h3>
        <ProjectForm
          submitLabel="Tambah"
          onSubmit={async (data) => {
            await insertRow("projects", data);
            refetch();
          }}
        />
      </div>

      <Show when={!items.loading} fallback={<p>Memuat...</p>}>
        <For each={items()}>
          {(item) => (
            <div class="admin-card neo-box">
              <ProjectForm
                initial={item}
                submitLabel="Simpan"
                onSubmit={async (data) => {
                  await updateRow("projects", item.id, data);
                  refetch();
                }}
                onDelete={async () => {
                  await deleteRow("projects", item.id);
                  refetch();
                }}
              />
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
