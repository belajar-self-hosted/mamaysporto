import { createSignal, onMount, Show } from "solid-js";
import Button from "./Button";
import { accessibleDialog } from "../lib/modalA11y";

export default function WelcomeModal() {
  const [show, setShow] = createSignal(false);

  onMount(() => {
    // Mengecek session storage, sehingga peringatan hanya muncul 1x per sesi browser
    const hasVisited = sessionStorage.getItem("hasVisited");
    
    if (!hasVisited) {
      // Jika belum mengunjungi dalam sesi ini, tampilkan modal
      setShow(true);
      sessionStorage.setItem("hasVisited", "true");
    }
  });

  return (
    <Show when={show()}>
      <div class="modal-overlay">
        <div class="modal-box neo-box" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title" tabindex="-1" use:accessibleDialog={() => setShow(false)}>
          <div class="modal-header">
            <span id="welcome-modal-title">Information</span>
            <button type="button" class="modal-close" aria-label="Close information" onClick={() => setShow(false)}>
              ×
            </button>
          </div>
          <div class="modal-body">
            <p>
              🚧 Website ini masih dalam tahap pengembangan. Kalau kamu
              menemukan bug, celah keamanan, atau punya ide untuk membuatnya
              lebih baik, jangan ragu untuk menggunakan tombol "Report" di
              menu. Semua feedback sangat diapresiasi—terima kasih sudah ikut
              membantu mengembangkan website ini!
            </p>
          </div>
          <div class="modal-footer">
            <Button variant="primary" onClick={() => setShow(false)}>
              OK
            </Button>
          </div>
        </div>
      </div>
    </Show>
  );
}
