import { createResource, createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { fetchCollection, insertRow, updateRow, deleteRow } from "../../lib/api";
import { notifySuccess, notifyError, setDirty, confirmAction, confirmDiscardIfDirty } from "../adminStore";

const EMPTY = { role: "", company: "", period: "", description: "" };

function snapshotExperience(form) {
  return JSON.stringify({
    role: form.role,
    company: form.company,
    period: form.period,
    description: form.description,
  });
}

function ExperienceForm(props) {
  const [form, setForm] = createSignal({ ...EMPTY, ...props.initial });
  const [busy, setBusy] = createSignal(false);

  const initialSnapshot = snapshotExperience({ ...EMPTY, ...props.initial });

  createEffect(() => {
    setDirty(snapshotExperience(form()) !== initialSnapshot);
  });

  onCleanup(() => setDirty(false));

  const update = (key) => (e) => setForm({ ...form(), [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await props.onSubmit(form());
    } catch (err) {
      notifyError(err.message);
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
      <div class="admin-form-actions">
        <button type="submit" class="neo-btn btn-primary" disabled={busy()}>
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

export default function ExperiencePanel() {
  const [items, { refetch }] = createResource(() => fetchCollection("experience"));
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
    const ok = await confirmAction(`Hapus experience "${item.role}"? Tindakan ini tidak bisa dibatalkan.`, {
      title: "Hapus Experience",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteRow("experience", item.id);
      if (openId() === item.id) {
        setDirty(false);
        setOpenId(null);
      }
      notifySuccess("Experience berhasil dihapus.");
      refetch();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div class="admin-panel">
      <h2>Experience</h2>

      <button type="button" class="neo-btn btn-primary admin-add-toggle" onClick={() => toggle("new")}>
        {openId() === "new" ? "Batal Tambah" : "+ Tambah Experience Baru"}
      </button>

      <Show when={openId() === "new"}>
        <div class="admin-card neo-box">
          <h3>Tambah Experience</h3>
          <ExperienceForm
            submitLabel="Tambah"
            onCancel={() => setOpenId(null)}
            onSubmit={async (data) => {
              await insertRow("experience", data);
              setOpenId(null);
              notifySuccess("Experience berhasil ditambahkan.");
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
                      <div class="admin-row-info">
                        <strong>{item.role}</strong>
                        <span class="admin-row-sub">{item.company} · {item.period}</span>
                      </div>
                      <div class="admin-row-actions">
                        <button class="neo-btn btn-default" onClick={() => toggle(item.id)}>Edit</button>
                        <button class="neo-btn btn-accent" onClick={() => handleDelete(item)}>Hapus</button>
                      </div>
                    </div>
                  }
                >
                  <ExperienceForm
                    initial={item}
                    submitLabel="Simpan"
                    onCancel={() => setOpenId(null)}
                    onSubmit={async (data) => {
                      await updateRow("experience", item.id, data);
                      setOpenId(null);
                      notifySuccess("Experience berhasil disimpan.");
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
