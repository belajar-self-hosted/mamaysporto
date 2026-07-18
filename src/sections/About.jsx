import "./About.css";

export default function About() {
  return (
    <section id="about" class="section about-section">
      <div class="about-container neo-box">
        <h2 class="section-title">ABOUT ME</h2>
        <div class="about-content">
          <div class="about-text">
            <p>
              Halo! Asalku dari Jogja. Saat ini aku adalah mahasiswa semester 5 prodi Teknik Informasi, Fakultas Teknik di Universitas Muhammadiyah Yogyakarta (UMY). Aku punya ketertarikan besar di bidang <strong>Programming</strong> dan <strong>Web Development</strong>, serta suka mengeksplorasi hal-hal baru di dunia teknologi termasuk pengembangan Mobile App.
            </p>
            <p>
              Selain fokus dalam Web Development (terutama Node.js, React.js, dan PostgreSQL) serta optimasi AI, aku juga memiliki skill di bidang <strong>Computer Networking</strong> (Cisco, VLAN, Routing Protocols). Bahasa yang kugunakan sehari-hari adalah Bahasa Indonesia dan Jawa, tapi aku juga bisa berbahasa Inggris!
            </p>
            <p>
              Di luar perkuliahan, aku sangat menyukai olahraga, musik, dan tentunya teknologi. Oh ya, aku juga suka banget <strong>mendaki gunung</strong>! Kalo mau ngajak ndaki bisa langsung DM ke Instagramku ya, tapi jangan lupa ajak temen-temen yang lain biar makin rame!
            </p>
          </div>
          <div class="about-stats">
            <div class="stat-box neo-box">
              <span class="stat-number">3.58</span>
              <span class="stat-label">IPK Saat Ini</span>
            </div>
            <div class="stat-box neo-box">
              <span class="stat-number">2+</span>
              <span class="stat-label">Sertifikasi IT (TLab, AI Singapore)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
