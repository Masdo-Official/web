/**
 * app.js - MASDO OFFICIAL [XI-9] Frontend Logic
 * Vercel All-in-One Architecture
 */

// ==================== GLOBAL STATE ====================
const APP_STATE = {
  currentPage: 'home',
  isLoggedIn: false,
  user: null,
  config: null,
  theme: localStorage.getItem('theme') || 'light',
  carouselIndex: 0,
  carouselAutoplay: null
};

// ==================== API UTILITIES ====================
const API_BASE = '/api';

async function apiCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== UI UTILITIES ====================
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  const page = document.getElementById(`${pageId}Page`);
  if (page) {
    page.classList.add('active');
    APP_STATE.currentPage = pageId;
  }

  // Update menu active state
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');

  // Close sidebar on mobile
  closeSidebar();
}

// ==================== HAMBURGER MENU ====================
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const closeSidebarBtn = document.getElementById('closeSidebar');

  function openSidebar() {
    sidebar.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  // Menu navigation
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      if (page) {
        showPage(page);
      }
    });
  });

  // Make closeSidebar global
  window.closeSidebar = closeSidebar;
}

// ==================== THEME TOGGLE ====================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');

  function setTheme(theme) {
    APP_STATE.theme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Set initial theme
  setTheme(APP_STATE.theme);

  themeToggle.addEventListener('click', () => {
    const newTheme = APP_STATE.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

// ==================== CONFIG LOADING ====================
async function loadConfig() {
  try {
    const response = await apiCall('/config');
    APP_STATE.config = response.data;
    renderHomePage();
    renderPortofolioPage();
    renderSkillsPage();
    renderSocialPage();
    renderAboutPage();
    renderFAQPage();
  } catch (error) {
    showToast('Gagal memuat konfigurasi', 'error');
    console.error(error);
  }
}

// ==================== HOME PAGE ====================
function renderHomePage() {
  const { profil, projects, sosmed } = APP_STATE.config;

  document.getElementById('heroAvatar').src = profil.foto;
  document.getElementById('heroName').textContent = profil.nama;
  document.getElementById('heroTagline').textContent = profil.tagline;
  document.getElementById('heroDescription').textContent = profil.deskripsi;

  document.getElementById('statProjects').textContent = projects?.length || 0;
  document.getElementById('statSkills').textContent = profil.skills?.length || 0;
  document.getElementById('statSocial').textContent = sosmed?.length || 0;
}

// ==================== PORTOFOLIO CAROUSEL ====================
function renderPortofolioPage() {
  const { projects } = APP_STATE.config;
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');

  if (!projects || projects.length === 0) {
    track.innerHTML = '<p>Tidak ada project tersedia</p>';
    return;
  }

  // Render slides
  track.innerHTML = projects.map((project, index) => `
    <div class="carousel-slide ${index === 0 ? 'active' : ''}">
      <div class="project-card glass-card">
        <img src="${project.image}" alt="${project.title}" class="project-image">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">
          ${project.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
        </div>
        <div class="project-status status-${project.status.toLowerCase()}">
          ${project.status}
        </div>
        ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">View Project →</a>` : ''}
      </div>
    </div>
  `).join('');

  // Render dots
  dotsContainer.innerHTML = projects.map((_, index) => `
    <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
  `).join('');

  initCarousel();
}

function initCarousel() {
  const { projects } = APP_STATE.config;
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  function goToSlide(index) {
    APP_STATE.carouselIndex = index;
    
    // Update slides
    const slides = track.querySelectorAll('.carousel-slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    // Update dots
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Transform track
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    const newIndex = (APP_STATE.carouselIndex + 1) % projects.length;
    goToSlide(newIndex);
  }

  function prevSlide() {
    const newIndex = (APP_STATE.carouselIndex - 1 + projects.length) % projects.length;
    goToSlide(newIndex);
  }

  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Dots navigation
  dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'));
      goToSlide(index);
      resetAutoplay();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (APP_STATE.currentPage === 'portofolio') {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) prevSlide();
  }

  // Autoplay
  function startAutoplay() {
    APP_STATE.carouselAutoplay = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (APP_STATE.carouselAutoplay) {
      clearInterval(APP_STATE.carouselAutoplay);
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Start autoplay
  startAutoplay();
}

// ==================== SKILLS PAGE ====================
function renderSkillsPage() {
  const { profil } = APP_STATE.config;
  const skillsGrid = document.getElementById('skillsGrid');

  if (!profil.skills || profil.skills.length === 0) {
    skillsGrid.innerHTML = '<p>Tidak ada skills tersedia</p>';
    return;
  }

  skillsGrid.innerHTML = profil.skills.map(skill => `
    <div class="skill-card glass-card">
      <div class="skill-icon">${skill.icon}</div>
      <h3 class="skill-name">${skill.name}</h3>
      <div class="skill-bar">
        <div class="skill-progress" style="width: ${skill.level}%">
          <span class="skill-percent">${skill.level}%</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== SOCIAL MEDIA PAGE ====================
function renderSocialPage() {
  const { sosmed } = APP_STATE.config;
  const socialGrid = document.getElementById('socialGrid');

  if (!sosmed || sosmed.length === 0) {
    socialGrid.innerHTML = '<p>Tidak ada social media tersedia</p>';
    return;
  }

  socialGrid.innerHTML = sosmed.map(social => `
    <a href="${social.url}" target="_blank" class="social-card glass-card" style="background: ${social.gradient}">
      <div class="social-info">
        <h3 class="social-platform">${social.platform}</h3>
        <p class="social-username">${social.username}</p>
        <p class="social-followers">${social.followers} followers</p>
      </div>
      <div class="social-icon">
        <span class="social-icon-text">${social.icon === 'instagram' ? '📷' : 
          social.icon === 'github' ? '🐙' :
          social.icon === 'whatsapp' ? '💬' :
          social.icon === 'tiktok' ? '🎵' :
          social.icon === 'linkedin' ? '💼' :
          social.icon === 'twitter' ? '🐦' : '🌐'}</span>
      </div>
    </a>
  `).join('');
}

// ==================== ABOUT PAGE ====================
function renderAboutPage() {
  const { profil } = APP_STATE.config;
  const aboutContent = document.getElementById('aboutContent');

  aboutContent.innerHTML = `
    <div class="about-info">
      <div class="about-row">
        <span class="about-label">Nama:</span>
        <span class="about-value">${profil.nama}</span>
      </div>
      <div class="about-row">
        <span class="about-label">Kelas:</span>
        <span class="about-value">${profil.kelas}</span>
      </div>
      <div class="about-row">
        <span class="about-label">Sekolah:</span>
        <span class="about-value">${profil.sekolah}</span>
      </div>
      <div class="about-row">
        <span class="about-label">Tahun Ajaran:</span>
        <span class="about-value">${profil.tahunAjaran}</span>
      </div>
    </div>
    
    ${profil.achievements && profil.achievements.length > 0 ? `
      <div class="achievements-section">
        <h3 class="section-title">🏆 Achievements</h3>
        <div class="achievements-grid">
          ${profil.achievements.map(ach => `
            <div class="achievement-card">
              <div class="achievement-icon">${ach.icon}</div>
              <h4 class="achievement-title">${ach.title}</h4>
              <p class="achievement-description">${ach.description}</p>
              <span class="achievement-date">${ach.date}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// ==================== FAQ PAGE ====================
function renderFAQPage() {
  const faqList = document.getElementById('faqList');

  const faqs = [
    {
      question: "Bagaimana cara login ke sistem?",
      answer: `
        <p><strong>Untuk Siswa:</strong></p>
        <ol>
          <li>Klik menu "🔐 Login" di sidebar</li>
          <li>Pilih tab "Siswa"</li>
          <li>Masukkan kode siswa Anda (format: XI9XXX)</li>
          <li>Masukkan password yang diberikan</li>
          <li>Klik "Login Siswa"</li>
        </ol>
        <p><strong>Untuk Admin:</strong></p>
        <ol>
          <li>Klik menu "🔐 Login" di sidebar</li>
          <li>Pilih tab "Admin"</li>
          <li>Masukkan username dan password admin</li>
          <li>Klik "Login Admin"</li>
        </ol>
        <p><em>Jika lupa password, hubungi admin untuk reset.</em></p>
      `
    },
    {
      question: "Apakah data absensi disimpan dengan aman?",
      answer: `
        <p>Ya, sangat aman! Sistem ini menggunakan beberapa layer keamanan:</p>
        <ul>
          <li><strong>Google Sheets API:</strong> Data disimpan di Google Sheets dengan enkripsi end-to-end</li>
          <li><strong>Password Hashing:</strong> Password di-hash menggunakan bcrypt (tidak disimpan plain text)</li>
          <li><strong>JWT Authentication:</strong> Token login berlaku 8 jam dan auto-expired</li>
          <li><strong>HTTPS Only:</strong> Semua komunikasi terenkripsi dengan SSL/TLS</li>
          <li><strong>Privacy Policy:</strong> Data hanya diakses oleh siswa yang bersangkutan dan admin</li>
        </ul>
        <p><em>Sistem ini mematuhi standar keamanan modern untuk melindungi data pribadi Anda.</em></p>
      `
    },
    {
      question: "Bagaimana cara admin menginput absensi?",
      answer: `
        <p><strong>Langkah-langkah input absensi:</strong></p>
        <ol>
          <li>Login sebagai admin</li>
          <li>Masuk ke Dashboard Admin</li>
          <li>Pilih menu "Input Absensi"</li>
          <li>Pilih tanggal absensi</li>
          <li>Tandai status setiap siswa:
            <ul>
              <li><strong>H</strong> = Hadir</li>
              <li><strong>I</strong> = Izin</li>
              <li><strong>S</strong> = Sakit</li>
              <li><strong>A</strong> = Alpha (tanpa keterangan)</li>
            </ul>
          </li>
          <li>Tambahkan keterangan jika diperlukan</li>
          <li>Klik "Simpan Absensi"</li>
        </ol>
        <p><em>Data akan langsung tersinkronisasi ke Google Sheets.</em></p>
      `
    },
    {
      question: "Apakah bisa export data absensi?",
      answer: `
        <p>Ya, admin dapat mengexport data absensi dengan mudah:</p>
        <ul>
          <li><strong>Format CSV:</strong> Kompatibel dengan Excel, Google Sheets, dan aplikasi spreadsheet lainnya</li>
          <li><strong>Filter by Date:</strong> Export data untuk rentang tanggal tertentu</li>
          <li><strong>Download Instant:</strong> File langsung terdownload ke perangkat Anda</li>
        </ul>
        <p><strong>Cara export:</strong></p>
        <ol>
          <li>Login sebagai admin</li>
          <li>Masuk ke menu "Export Data"</li>
          <li>Pilih rentang tanggal (opsional)</li>
          <li>Klik "Download CSV"</li>
        </ol>
        <p><em>File CSV dapat dibuka dan diedit di Microsoft Excel atau Google Sheets.</em></p>
      `
    },
    {
      question: "Apa yang harus dilakukan jika sistem error?",
      answer: `
        <p><strong>Troubleshooting langkah pertama:</strong></p>
        <ol>
          <li><strong>Refresh halaman:</strong> Tekan Ctrl+F5 (Windows) atau Cmd+Shift+R (Mac)</li>
          <li><strong>Clear cache browser:</strong> Hapus cache dan cookies browser Anda</li>
          <li><strong>Coba browser lain:</strong> Gunakan Chrome, Firefox, atau Edge versi terbaru</li>
          <li><strong>Periksa koneksi internet:</strong> Pastikan koneksi stabil</li>
          <li><strong>Logout & Login ulang:</strong> Kadang token expired, coba login kembali</li>
        </ol>
        <p><strong>Jika masih error:</strong></p>
        <ul>
          <li>Screenshot error message yang muncul</li>
          <li>Hubungi admin melalui WhatsApp</li>
          <li>Sertakan informasi: browser, waktu error, dan apa yang sedang dilakukan</li>
        </ul>
        <p><em>Admin akan segera membantu menyelesaikan masalah Anda.</em></p>
      `
    },
    {
      question: "Apakah sistem ini bisa diakses dari HP?",
      answer: `
        <p>Tentu saja! Sistem ini <strong>fully responsive</strong> dan dioptimalkan untuk semua perangkat:</p>
        <ul>
          <li><strong>Mobile:</strong> HP Android & iOS (Chrome, Safari, Firefox)</li>
          <li><strong>Tablet:</strong> iPad, Android tablet</li>
          <li><strong>Desktop:</strong> PC & laptop (Windows, Mac, Linux)</li>
        </ul>
        <p><strong>Fitur mobile-friendly:</strong></p>
        <ul>
          <li>Hamburger menu untuk navigasi mudah</li>
          <li>Touch & swipe support untuk carousel</li>
          <li>Layout otomatis menyesuaikan ukuran layar</li>
          <li>Tombol dan form mudah diakses dengan jari</li>
        </ul>
        <p><strong>Browser yang didukung:</strong></p>
        <ul>
          <li>Chrome (recommended)</li>
          <li>Safari</li>
          <li>Firefox</li>
          <li>Edge</li>
        </ul>
        <p><em>Untuk pengalaman terbaik, gunakan browser versi terbaru.</em></p>
      `
    },
    {
      question: "Berapa lama token login berlaku?",
      answer: `
        <p><strong>Durasi Token:</strong> Token login berlaku selama <strong>8 jam</strong> sejak login.</p>
        <p><strong>Perilaku Auto-logout:</strong></p>
        <ul>
          <li>Setelah 8 jam, token akan expired otomatis</li>
          <li>Anda akan diminta login ulang saat mencoba akses data</li>
          <li>Session persistence: Token tersimpan di browser (tidak hilang saat refresh)</li>
          <li>Logout manual: Token langsung dihapus dari browser</li>
        </ul>
        <p><strong>Tips keamanan:</strong></p>
        <ul>
          <li>Selalu logout jika menggunakan komputer publik</li>
          <li>Jangan share token dengan orang lain</li>
          <li>Gunakan password yang kuat dan unik</li>
        </ul>
        <p><em>Sistem akan otomatis logout Anda untuk menjaga keamanan akun.</em></p>
      `
    },
    {
      question: "Bagaimana cara mengubah password?",
      answer: `
        <p>Saat ini, <strong>perubahan password hanya bisa dilakukan oleh admin</strong>.</p>
        <p><strong>Langkah-langkah reset password:</strong></p>
        <ol>
          <li>Hubungi admin melalui WhatsApp</li>
          <li>Berikan kode siswa Anda untuk verifikasi</li>
          <li>Admin akan mereset password Anda</li>
          <li>Admin akan memberikan password baru secara pribadi</li>
          <li>Login dengan password baru tersebut</li>
        </ol>
        <p><strong>Future feature:</strong></p>
        <p>Fitur <em>self-service change password</em> sedang dalam pengembangan dan akan tersedia di update berikutnya. Fitur ini akan memungkinkan siswa mengubah password sendiri dengan verifikasi nomor telepon.</p>
        <p><em>Untuk keamanan, pastikan Anda mengganti password default yang diberikan admin.</em></p>
      `
    }
  ];

  faqList.innerHTML = faqs.map((faq, index) => `
    <div class="faq-item">
      <button class="faq-question" data-index="${index}">
        <span class="faq-question-text">${faq.question}</span>
        <span class="faq-icon">▼</span>
      </button>
      <div class="faq-answer">
        ${faq.answer}
      </div>
    </div>
  `).join('');

  // FAQ accordion functionality
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(faqItem => {
        faqItem.classList.remove('active');
      });

      // Toggle current FAQ
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ==================== LOGIN ====================
function initLogin() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const siswaForm = document.getElementById('siswaLoginForm');
  const adminForm = document.getElementById('adminLoginForm');

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (tab === 'siswa') {
        siswaForm.classList.add('active');
        adminForm.classList.remove('active');
      } else {
        adminForm.classList.add('active');
        siswaForm.classList.remove('active');
      }
    });
  });

  // Siswa login
  siswaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const kode_siswa = document.getElementById('siswaKode').value.trim();
    const password = document.getElementById('siswaPassword').value;

    if (!kode_siswa || !password) {
      showToast('Kode siswa dan password wajib diisi', 'error');
      return;
    }

    showLoading();
    try {
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ kode_siswa, password })
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      APP_STATE.isLoggedIn = true;
      APP_STATE.user = response.data.user;

      showToast('Login berhasil! Selamat datang ' + response.data.user.nama, 'success');
      
      updateMenuAfterLogin();
      showPage('dashboard');
      loadDashboard();

      siswaForm.reset();
    } catch (error) {
      showToast(error.message || 'Login gagal', 'error');
    } finally {
      hideLoading();
    }
  });

  // Admin login
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!username || !password) {
      showToast('Username dan password wajib diisi', 'error');
      return;
    }

    showLoading();
    try {
      const response = await apiCall('/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      APP_STATE.isLoggedIn = true;
      APP_STATE.user = response.data.user;

      showToast('Login admin berhasil!', 'success');
      
      updateMenuAfterLogin();
      showPage('dashboard');
      loadDashboard();

      adminForm.reset();
    } catch (error) {
      showToast(error.message || 'Login admin gagal', 'error');
    } finally {
      hideLoading();
    }
  });
}

function updateMenuAfterLogin() {
  // Change Login menu to Dashboard
  const loginMenu = document.querySelector('[data-page="login"]');
  loginMenu.textContent = '📊 Dashboard';
  loginMenu.setAttribute('data-page', 'dashboard');
  loginMenu.classList.remove('login-menu');
  loginMenu.classList.add('dashboard-menu');

  // Show logout menu
  document.getElementById('logoutMenuBtn').style.display = 'block';
}

function updateMenuAfterLogout() {
  // Change Dashboard back to Login
  const dashboardMenu = document.querySelector('[data-page="dashboard"]');
  if (dashboardMenu) {
    dashboardMenu.textContent = '🔐 Login';
    dashboardMenu.setAttribute('data-page', 'login');
    dashboardMenu.classList.add('login-menu');
    dashboardMenu.classList.remove('dashboard-menu');
  }

  // Hide logout menu
  document.getElementById('logoutMenuBtn').style.display = 'none';
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  if (!APP_STATE.user) {
    dashboardContent.innerHTML = '<p>Silakan login terlebih dahulu</p>';
    return;
  }

  showLoading();
  try {
    if (APP_STATE.user.role === 'siswa') {
      await loadSiswaDashboard();
    } else if (APP_STATE.user.role === 'admin') {
      await loadAdminDashboard();
    }
  } catch (error) {
    showToast('Gagal memuat dashboard: ' + error.message, 'error');
    dashboardContent.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
  } finally {
    hideLoading();
  }
}

async function loadSiswaDashboard() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  const response = await apiCall('/absensi');
  const { absensi, stats, siswa } = response.data;

  dashboardContent.innerHTML = `
    <div class="dashboard-header glass-card">
      <h3>Selamat Datang, ${siswa.nama}!</h3>
      <p>Kode Siswa: ${siswa.kode_siswa}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h4>Hadir</h4>
          <p class="stat-number">${stats.hadir}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <h4>Izin</h4>
          <p class="stat-number">${stats.izin}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">🤒</div>
        <div class="stat-info">
          <h4>Sakit</h4>
          <p class="stat-number">${stats.sakit}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <h4>Alpha</h4>
          <p class="stat-number">${stats.alpha}</p>
        </div>
      </div>
    </div>

    <div class="attendance-card glass-card">
      <h4>Persentase Kehadiran: <span class="percentage">${stats.persentaseKehadiran}%</span></h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stats.persentaseKehadiran}%"></div>
      </div>
    </div>

    <div class="absensi-table-container glass-card">
      <h4>Riwayat Absensi</h4>
      ${absensi.length > 0 ? `
        <table class="absensi-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${absensi.slice(0, 10).map(item => `
              <tr>
                <td>${item.tanggal}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                <td>${item.keterangan || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${absensi.length > 10 ? `<p class="table-note">Menampilkan 10 data terbaru dari ${absensi.length} total</p>` : ''}
      ` : '<p>Belum ada data absensi</p>'}
    </div>
  `;
}

async function loadAdminDashboard() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  const response = await apiCall('/admin-stats');
  const { totalSiswa, absensiHariIni, absensiKeseluruhan } = response.data;

  dashboardContent.innerHTML = `
    <div class="dashboard-header glass-card">
      <h3>Admin Dashboard</h3>
      <p>Kelola data siswa dan absensi</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h4>Total Siswa</h4>
          <p class="stat-number">${totalSiswa}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <h4>Absensi Hari Ini</h4>
          <p class="stat-number">${absensiHariIni.total}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h4>Hadir Hari Ini</h4>
          <p class="stat-number">${absensiHariIni.hadir}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h4>Total Keseluruhan</h4>
          <p class="stat-number">${absensiKeseluruhan.total}</p>
        </div>
      </div>
    </div>

    <div class="admin-actions glass-card">
      <h4>Quick Actions</h4>
      <div class="action-buttons">
        <button class="btn btn-primary" onclick="alert('Fitur input absensi dalam pengembangan')">
          ➕ Input Absensi
        </button>
        <button class="btn btn-secondary" onclick="alert('Fitur kelola siswa dalam pengembangan')">
          👥 Kelola Siswa
        </button>
        <button class="btn btn-info" onclick="exportData()">
          📥 Export Data
        </button>
      </div>
    </div>

    <div class="stats-detail glass-card">
      <h4>Statistik Kehadiran Keseluruhan</h4>
      <div class="stats-bars">
        <div class="stat-bar-item">
          <span class="stat-label">Hadir (H)</span>
          <div class="stat-bar">
            <div class="stat-bar-fill status-h" style="width: ${(absensiKeseluruhan.hadir / absensiKeseluruhan.total * 100).toFixed(1)}%"></div>
          </div>
          <span class="stat-value">${absensiKeseluruhan.hadir}</span>
        </div>
        <div class="stat-bar-item">
          <span class="stat-label">Izin (I)</span>
          <div class="stat-bar">
            <div class="stat-bar-fill status-i" style="width: ${(absensiKeseluruhan.izin / absensiKeseluruhan.total * 100).toFixed(1)}%"></div>
          </div>
          <span class="stat-value">${absensiKeseluruhan.izin}</span>
        </div>
        <div class="stat-bar-item">
          <span class="stat-label">Sakit (S)</span>
          <div class="stat-bar">
            <div class="stat-bar-fill status-s" style="width: ${(absensiKeseluruhan.sakit / absensiKeseluruhan.total * 100).toFixed(1)}%"></div>
          </div>
          <span class="stat-value">${absensiKeseluruhan.sakit}</span>
        </div>
        <div class="stat-bar-item">
          <span class="stat-label">Alpha (A)</span>
          <div class="stat-bar">
            <div class="stat-bar-fill status-a" style="width: ${(absensiKeseluruhan.alpha / absensiKeseluruhan.total * 100).toFixed(1)}%"></div>
          </div>
          <span class="stat-value">${absensiKeseluruhan.alpha}</span>
        </div>
      </div>
    </div>
  `;
}

async function exportData() {
  showLoading();
  try {
    // Redirect to CSV download
    window.location.href = '/api/admin-export?format=csv';
    showToast('Data berhasil diexport!', 'success');
  } catch (error) {
    showToast('Gagal export data: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

// ==================== LOGOUT ====================
function initLogout() {
  const logoutMenuBtn = document.getElementById('logoutMenuBtn');
  const logoutModal = document.getElementById('logoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');
  const kritikSaranTextarea = document.getElementById('kritikSaran');
  const charCount = document.getElementById('charCount');

  // Open logout modal
  logoutMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logoutModal.classList.add('active');
    kritikSaranTextarea.value = '';
    charCount.textContent = '0';
  });

  // Cancel logout
  cancelLogout.addEventListener('click', () => {
    logoutModal.classList.remove('active');
  });

  // Character counter
  kritikSaranTextarea.addEventListener('input', () => {
    charCount.textContent = kritikSaranTextarea.value.length;
  });

  // Confirm logout
  confirmLogout.addEventListener('click', () => {
    const kritikSaran = kritikSaranTextarea.value.trim();

    // If kritik/saran ada, buka WhatsApp
    if (kritikSaran.length >= 10) {
      const whatsappNumber = '6281234567890'; // GANTI dengan nomor WhatsApp yang benar
      const message = encodeURIComponent(
        `Kritik dan Saran untuk MASDO OFFICIAL:\n\n${kritikSaran}\n\nDikirim dari sistem absensi`
      );
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      window.open(whatsappUrl, '_blank');
    }

    // Logout
    performLogout();
  });

  // Close modal on backdrop click
  logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
      logoutModal.classList.remove('active');
    }
  });
}

function performLogout() {
  // Clear storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Reset state
  APP_STATE.isLoggedIn = false;
  APP_STATE.user = null;

  // Update menu
  updateMenuAfterLogout();

  // Close modal
  document.getElementById('logoutModal').classList.remove('active');

  // Show toast
  showToast('Logout berhasil. Terima kasih!', 'success');

  // Redirect to home
  showPage('home');
}

// ==================== CHECK AUTH ====================
function checkAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      APP_STATE.user = JSON.parse(userStr);
      APP_STATE.isLoggedIn = true;
      updateMenuAfterLogin();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

// ==================== INITIALIZATION ====================
async function init() {
  showLoading();
  
  try {
    // Check if already logged in
    checkAuth();

    // Load configuration
    await loadConfig();

    // Initialize UI components
    initHamburgerMenu();
    initThemeToggle();
    initLogin();
    initLogout();

    // Show home page
    showPage('home');

    showToast('Sistem siap digunakan!', 'success');
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Gagal menginisialisasi aplikasi', 'error');
  } finally {
    hideLoading();
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
