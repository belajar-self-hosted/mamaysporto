import { createSignal, onMount, Show } from "solid-js";
import Button from "./Button";

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
        <div class="modal-box neo-box">
          <div class="modal-header">
            <span>Information</span>
            <button class="modal-close" onClick={() => setShow(false)}>
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
