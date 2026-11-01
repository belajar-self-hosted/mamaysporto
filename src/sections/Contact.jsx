import { createResource, createSignal, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import Button from "../components/Button";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { accessibleDialog } from "../lib/modalA11y";
import { reveal } from "../lib/scrollReveal";
import { burst } from "../lib/clickBurst";
import "./Contact.css";

export default function Contact() {
  const [settings] = createResource(() => fetchCollection("site_settings"));
  const [formData, setFormData] = createSignal({ name: "", email: "", message: "" });
  const [showAlert, setShowAlert] = createSignal(false);
  const [alertMessage, setAlertMessage] = createSignal("");
  const [whatsAppLink, setWhatsAppLink] = createSignal("");

  const handleSubmit = (e) => {
    e.preventDefault();
    burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    const { name, email, message } = formData();
    const text = [
      "Halo, saya ingin menghubungi Anda melalui website.",
      "",
      `Nama: ${name.trim()}`,
      `Email: ${email.trim()}`,
      "Pesan:",
      message.trim(),
    ].join("\n");
    const link = buildWhatsAppLink(settings()?.report_whatsapp_number, text);
    if (!link) {
      setWhatsAppLink("");
      setAlertMessage("Nomor WhatsApp kontak belum tersedia. Pesan Anda tetap tersimpan di formulir ini.");
      setShowAlert(true);
      return;
    }

    setWhatsAppLink(link);
    setAlertMessage("WhatsApp akan terbuka untuk meninjau dan mengirim pesan Anda. Formulir tetap tersimpan sampai Anda mengosongkannya sendiri.");
    setShowAlert(true);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact" class="section contact-section">
      <div class="contact-container neo-box" use:reveal>
        <Show when={settings()?.contact_image}>
          <img class="contact-figure neo-collage-mask-alt" src={settings().contact_image} alt="" loading="lazy" decoding="async" />
        </Show>
        <h2 class="section-title">{settings()?.contact_title || "GET IN TOUCH"}</h2>
        <p class="contact-desc">
          {settings()?.contact_desc || "Whether you have a question, a project idea, or just want to say hi, my inbox is always open."}
        </p>
        <p class="contact-handoff-note">Pesan akan dibuka di WhatsApp agar Anda dapat meninjau dan mengirimkannya sendiri.</p>
        
        <form class="contact-form" onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="name">Name</label>
            <input 
              type="text" 
              id="name" 
              class="neo-input" 
              required 
              maxLength={120}
              value={formData().name}
              onInput={(e) => setFormData({...formData(), name: e.target.value})}
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              class="neo-input" 
              required 
              maxLength={254}
              value={formData().email}
              onInput={(e) => setFormData({...formData(), email: e.target.value})}
            />
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea 
              id="message" 
              rows="5" 
              class="neo-input" 
              required
              maxLength={2000}
              value={formData().message}
              onInput={(e) => setFormData({...formData(), message: e.target.value})}
            />
          </div>
          <Button type="submit" variant="primary" class="submit-btn">Send Message</Button>
        </form>
      </div>

      {/* Custom MessageBox Overlay */}
      <Show when={showAlert()}>
        <div class="modal-overlay">
          <div class="modal-box neo-box" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" tabindex="-1" use:accessibleDialog={() => setShowAlert(false)}>
            {/* Title Bar ala Windows Form C# */}
            <div class="modal-header">
              <span id="contact-modal-title">Information</span>
              <button type="button" class="modal-close" aria-label="Close message" onClick={() => setShowAlert(false)}>×</button>
            </div>
            
            {/* Message Body */}
            <div class="modal-body">
              <p>{alertMessage()}</p>
              <Show when={whatsAppLink()}>
                <p>If WhatsApp did not open, <a href={whatsAppLink()} target="_blank" rel="noopener noreferrer">open the prepared message here</a>.</p>
              </Show>
            </div>
            
            {/* Footer dengan tombol OK */}
            <div class="modal-footer">
              <Button variant="primary" onClick={() => setShowAlert(false)}>OK</Button>
            </div>
          </div>
        </div>
      </Show>
    </section>
  );
}
