import { For, Show } from "solid-js";
import { toasts, dismissToast, confirmState, settleConfirm } from "./adminStore";
import { accessibleDialog } from "../lib/modalA11y";

/** Toast stack + confirm dialog global untuk seluruh admin panel. Mount sekali di AdminLayout. */
export default function AdminOverlays() {
  return (
    <>
      <div class="admin-toast-stack">
        <For each={toasts()}>
          {(toast) => (
            <div
              class={`admin-toast admin-toast-${toast.type} ${toast.leaving ? "admin-toast-leaving" : ""}`}
            >
              <span class="admin-toast-icon">{toast.type === "error" ? "✕" : "✓"}</span>
              <span class="admin-toast-message">{toast.message}</span>
              <button
                type="button"
                class="admin-toast-close"
                onClick={() => dismissToast(toast.id)}
              >
                ×
              </button>
            </div>
          )}
        </For>
      </div>

      <Show when={confirmState()}>
        {(state) => (
          <div class="modal-overlay">
            <div class="modal-box neo-box" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" tabindex="-1" use:accessibleDialog={() => settleConfirm(false)}>
              <div class="modal-header">
                <span id="admin-confirm-title">{state().title}</span>
                <button type="button" class="modal-close" aria-label="Close confirmation" onClick={() => settleConfirm(false)}>
                  ×
                </button>
              </div>
              <div class="modal-body">
                <p>{state().message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="neo-btn btn-default" onClick={() => settleConfirm(false)}>
                  {state().cancelLabel}
                </button>
                <button
                  type="button"
                  class={`neo-btn ${state().danger ? "btn-accent" : "btn-primary"}`}
                  onClick={() => settleConfirm(true)}
                >
                  {state().confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </>
  );
}
