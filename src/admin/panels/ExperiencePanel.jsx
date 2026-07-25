import { createResource, createSignal, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow } from "../../lib/api";

const EMPTY = { role: "", company: "", period: "", description: "" };

function ExperienceForm(props) {
  const [form, setForm] = createSignal({ ...EMPTY, ...props.initial });
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal("");

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await props.onSubmit(form());
      if (!props.initial) setForm({ ...EMPTY });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form class="admin-form" onSubmit={handleSubmit}>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Role / Jabatan</label>
          <input class="neo-input" required value={form().role} onInput={update("role")} />
        </div>
        <div class="admin-form-group">
          <label>Perusahaan / Instansi</label>
          <input class="neo-input" required value={form().company} onInput={update("company")} />
        </div>
      </div>
      <div class="admin-form-group">
        <label>Periode</label>
        <input class="neo-input" required value={form().period} onInput={update("period")} />
      </div>
      <div class="admin-form-group">
        <label>Deskripsi</label>
        <textarea class="neo-input" rows="2" value={form().description} onInput={update("description")} />
      </div>
      <Show when={error()}>
        <p class="admin-error">{error()}</p>
      </Show>
      <div class="admin-form-actions">
        <button type="submit" class="neo-btn btn-primary" disabled={busy()}>
          {props.submitLabel || "Simpan"}
        </button>
        <Show when={props.onDelete}>
          <button type="button" class="neo-btn btn-accent" disabled={busy()} onClick={props.onDelete}>Hapus</button>
        </Show>
      </div>
    </form>
  );
}

export default function ExperiencePanel() {
  const [items, { refetch }] = createResource(() => fetchCollection("experience"));

  return (
    <div class="admin-panel">
      <h2>Experience</h2>

      <div class="admin-card neo-box">
        <h3>Tambah Experience</h3>
        <ExperienceForm
          submitLabel="Tambah"
          onSubmit={async (data) => {
            await insertRow("experience", data);
            refetch();
          }}
        />
      </div>

      <Show when={!items.loading} fallback={<p>Memuat...</p>}>
        <For each={items()}>
          {(item) => (
            <div class="admin-card neo-box">
              <ExperienceForm
                initial={item}
                submitLabel="Simpan"
                onSubmit={async (data) => {
                  await updateRow("experience", item.id, data);
                  refetch();
                }}
                onDelete={async () => {
                  await deleteRow("experience", item.id);
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
