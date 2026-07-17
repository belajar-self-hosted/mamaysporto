import { createSignal } from "solid-js";
import Button from "../components/Button";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = createSignal({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with Formspree or EmailJS endpoint
    console.log("Form submitted:", formData());
    alert("Thanks for reaching out! (This is a demo, please check the console or configure an endpoint)");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" class="section contact-section">
      <div class="contact-container neo-box">
        <h2 class="section-title">GET IN TOUCH</h2>
        <p class="contact-desc">
          Whether you have a question, a project idea, or just want to say hi, my inbox is always open.
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
    </section>
  );
}
