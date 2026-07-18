import "./About.css";

export default function About() {
  return (
    <section id="about" class="section about-section">
      <div class="about-container neo-box">
        <h2 class="section-title">ABOUT ME</h2>
        <div class="about-content">
          <div class="about-text">
            <p>
              Hola Buddy! Asalku dari Jogja. Saat ini aku adalah mahasiswa
              semester 5 prodi Teknik Informasi, Fakultas Teknik di Universitas
              Muhammadiyah Yogyakarta (UMY). Aku punya ketertarikan besar di
              bidang <strong>Programming</strong> dan{" "}
              <strong>Web Development</strong>, serta suka mengeksplorasi
              hal-hal baru di dunia teknologi termasuk pengembangan Mobile App.
              btw, kalo kamu punya info magang di bidang Web Development, atau
              apapun itu di bidang teknologi, infokan ke aku ya! Aku lagi nyari
              pengalaman magang nih, hehe.
            </p>
            <p>
              Selain fokus dalam Web Development serta optimasi AI, aku juga
              memiliki skill di bidang <strong>Computer Networking</strong>{" "}
              (Cisco, VLAN, Routing Protocols). dan aku juga sedang
              mengembangkan <strong>Home Server</strong> (ubuntu server) pribadi
              untuk keperluan belajar dan eksperimen di bidang DevOps,
              Networking, dan Web Development.
            </p>
            <p>
              Di luar perkuliahan? aku suka olahraga, musik tentang (iem), yaa
              bisa dikategorikan audiophile entry level lah wkwk, dan tentunya
              teknologi. apa ngajak <strong>ndaki gunung</strong>? ayok aja gw
              mah😁, dm instagram ajaa{" "}
              <a
                href="https://www.instagram.com/sutanfannandya/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @sutanfannandya
              </a>{" "}
              kalo mau ngajak ndaki gunung bareng, muehehe.
            </p>
          </div>
          <div class="about-stats">
            <div class="stat-box neo-box">
              <span class="stat-number">3.58</span>
              <span class="stat-label">IPK Saat Ini</span>
            </div>
            <div class="stat-box neo-box">
              <span class="stat-number">2+</span>
              <span class="stat-label">
                Sertifikasi IT (TLab, AI Singapore)
              </span>
            </div>
            <div class="stat-box neo-box">
              <span class="stat-number">5+</span>
              <span class="stat-label">Projek yang telah dikerjakan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
