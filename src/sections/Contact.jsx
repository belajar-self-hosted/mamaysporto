import { createResource, createSignal, Show } from "solid-js";
import { fetchCollection } from "../lib/api";
import Button from "../components/Button";
import "./Contact.css";

export default function Contact() {
  const [settings] = createResource(() => fetchCollection("site_settings"));
  const [formData, setFormData] = createSignal({ name: "", email: "", message: "" });
  const [showAlert, setShowAlert] = createSignal(false);
  const [alertMessage, setAlertMessage] = createSignal("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with Formspree or EmailJS endpoint
    console.log("Form submitted:", formData());
    setAlertMessage("Terima kasih sudah menghubungi saya! Fitur ini masih berupa demo karena website ini masih dalam tahap pengembangan. Jika kamu memiliki saran atau menemukan bug, silakan gunakan tombol \"Report\".");
    setShowAlert(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" class="section contact-section">
      <div class="contact-container neo-box">
        <h2 class="section-title">{settings()?.contact_title || "GET IN TOUCH"}</h2>
        <p class="contact-desc">
          {settings()?.contact_desc || "Whether you have a question, a project idea, or just want to say hi, my inbox is always open."}
        </p>
        
        <form class="contact-form" onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="name">Name</label>
            <input 
              type="text" 
              id="name" 
              class="neo-input" 
              required 
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
              value={formData().message}
              onInput={(e) => setFormData({...formData(), message: e.target.value})}
            ></textarea>
          </div>
          <Button type="submit" variant="primary" class="submit-btn">Send Message</Button>
        </form>
      </div>

      {/* Custom MessageBox Overlay */}
      <Show when={showAlert()}>
        <div class="modal-overlay">
          <div class="modal-box neo-box">
            {/* Title Bar ala Windows Form C# */}
            <div class="modal-header">
              <span>Information</span>
              <button class="modal-close" onClick={() => setShowAlert(false)}>×</button>
            </div>
            
            {/* Message Body */}
            <div class="modal-body">
              <p>{alertMessage()}</p>
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
