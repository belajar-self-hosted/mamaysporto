import { createSignal } from "solid-js";

// ---------- Toast notifications ----------
const [toasts, setToasts] = createSignal([]);
let nextToastId = 0;

export { toasts };

export function dismissToast(id) {
  setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 200);
}

export function pushToast(type, message, duration = 3500) {
  const id = ++nextToastId;
  setToasts((prev) => [...prev, { id, type, message, leaving: false }]);
  setTimeout(() => dismissToast(id), duration);
}

export const notifySuccess = (message) => pushToast("success", message);
export const notifyError = (message) => pushToast("error", message);

// ---------- Confirm dialog ----------
const [confirmState, setConfirmState] = createSignal(null);

export { confirmState };

/** Tampilkan modal konfirmasi. Resolve true jika admin menekan tombol konfirmasi. */
export function confirmAction(message, options = {}) {
  return new Promise((resolve) => {
    setConfirmState({
      title: options.title || "Konfirmasi",
      message,
      confirmLabel: options.confirmLabel || "Ya",
      cancelLabel: options.cancelLabel || "Batal",
      danger: options.danger ?? false,
      resolve,
    });
  });
}

export function settleConfirm(result) {
  const state = confirmState();
  if (!state) return;
  setConfirmState(null);
  state.resolve(result);
}

// ---------- Unsaved changes ("dirty") tracking ----------
const [dirty, setDirtyState] = createSignal(false);

export { dirty as isDirty };

export function setDirty(value) {
  setDirtyState(value);
}

/** Kalau ada perubahan belum tersimpan, minta konfirmasi sebelum admin pindah halaman/section. */
export function confirmDiscardIfDirty(message) {
  if (!dirty()) return Promise.resolve(true);
  return confirmAction(
    message ||
      "Ada perubahan yang belum disimpan pada halaman ini. Perubahan akan hilang jika kamu pindah sekarang. Lanjutkan?",
    {
      title: "Perubahan Belum Disimpan",
      confirmLabel: "Ya, Tinggalkan",
      cancelLabel: "Tetap di Sini",
      danger: true,
    }
  );
}
