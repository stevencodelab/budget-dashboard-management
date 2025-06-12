// auth.js - Sistem Autentikasi Lengkap dengan Fitur Ganti Kata Sandi

// Pastikan SweetAlert2 dimuat di halaman login_page.html jika ingin menggunakan Swal.fire
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.createDefaultUser();
    }

    // Memuat pengguna dari memori (karena localStorage tidak didukung di beberapa lingkungan/untuk demo ini)
    loadUsers() {
        // Pengguna default - dalam produksi, ini akan berasal dari database atau penyimpanan yang aman
        // Untuk demo ini, kita akan menggunakan set yang di-hardcode atau memuat dari localStorage jika tersedia
        let storedUsers = {};
        try {
            storedUsers = JSON.parse(localStorage.getItem('budgetProUsers')) || {};
        } catch (e) {
            console.warn("Tidak dapat memuat pengguna dari localStorage, menggunakan default. Error:", e);
        }

        // Jika tidak ada pengguna yang dimuat atau pengguna default tidak ada, buatlah
        if (Object.keys(storedUsers).length === 0 || !storedUsers['admin']) {
            return {
                'admin': {
                    username: 'admin',
                    password: 'admin123',
                    email: 'admin@budgetdashboard.com',
                    role: 'administrator',
                    lastLogin: null,
                    createdAt: new Date().toISOString()
                },
                'user': {
                    username: 'user',
                    password: 'user123',
                    email: 'user@budgetdashboard.com',
                    role: 'user',
                    lastLogin: null,
                    createdAt: new Date().toISOString()
                }
            };
        }
        return storedUsers;
    }

    saveUsers() {
        try {
            localStorage.setItem('budgetProUsers', JSON.stringify(this.users));
        } catch (e) {
            console.error("Gagal menyimpan pengguna ke localStorage:", e);
        }
    }

    // Membuat pengguna default jika belum ada
    createDefaultUser() {
        if (!this.users['admin']) { // Memastikan admin ada
            this.users['admin'] = {
                username: 'admin',
                password: 'admin123',
                email: 'admin@budgetdashboard.com',
                role: 'administrator',
                lastLogin: null,
                createdAt: new Date().toISOString()
            };
            this.saveUsers();
        }
    }

    // Menyiapkan event listener
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Menambahkan tautan ganti kata sandi hanya jika di halaman login
        if (window.location.pathname.includes('login_page.html')) {
            this.addChangePasswordLink();
            
            // Menangani tombol Enter di bidang kata sandi di halaman login
            const passwordField = document.getElementById('password');
            if (passwordField) {
                passwordField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleLogin(e);
                    }
                });
            }
        }
    }

    // Menambahkan fungsionalitas ganti kata sandi
    addChangePasswordLink() {
        const loginBox = document.querySelector('.login-box');
        if (loginBox && !document.getElementById('changePasswordLink')) {
            const changePasswordHTML = `
                <div style="margin-top: 20px; text-align: center;">
                    <a href="#" id="changePasswordLink" style="color: #667eea; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease;">
                        <i class="fas fa-key"></i> Ganti Kata Sandi
                    </a>
                </div>
            `;
            loginBox.insertAdjacentHTML('beforeend', changePasswordHTML);
            
            document.getElementById('changePasswordLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });
        }
    }

    // Menangani proses login
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('.btn-primary');

        // Validasi
        if (!username || !password) {
            this.showAlert('error', 'Silakan isi semua bidang.');
            return;
        }

        // Tampilkan status loading
        this.setLoadingState(submitBtn, true);

        try {
            // Simulasi penundaan panggilan API
            await this.delay(1000);

            // Otentikasi pengguna
            const user = this.authenticate(username, password);
            
            if (user) {
                // Perbarui login terakhir
                user.lastLogin = new Date().toISOString();
                this.currentUser = user;
                this.saveUsers(); // Simpan data pengguna yang diperbarui

                localStorage.setItem('isLoggedIn', 'true'); // Set status login
                
                // Umpan balik sukses
                this.showAlert('success', `Selamat datang kembali, ${user.username}!`);
                
                // Arahkan setelah penundaan singkat
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
                
            } else {
                this.showAlert('error', 'Username atau kata sandi tidak valid.');
            }
            
        } catch (error) {
            this.showAlert('error', 'Login gagal. Silakan coba lagi.');
            console.error('Login error:', error);
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    // Mengotentikasi pengguna
    authenticate(username, password) {
        const user = this.users[username.toLowerCase()];
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    // Menampilkan modal ganti kata sandi
    showChangePasswordModal() {
        // Buat HTML modal
        const modalHTML = `
            <div class="modal-overlay" id="changePasswordModal">
                <div class="modal-content">
                    <button class="modal-close" onclick="window.authSystem.closeChangePasswordModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <h3 class="modal-title">Ganti Kata Sandi</h3>
                        <p class="modal-subtitle">Perbarui kata sandi akun Anda</p>
                    </div>
                    <form id="changePasswordForm">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Username" id="changeUsername" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Kata Sandi Saat Ini" id="currentPassword" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Kata Sandi Baru" id="newPassword" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-key"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Konfirmasi Kata Sandi Baru" id="confirmPassword" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-key"></span>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary btn-block">Perbarui Kata Sandi</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Tambahkan modal ke body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Tampilkan modal
        const modal = document.getElementById('changePasswordModal');
        setTimeout(() => modal.classList.add('active'), 10);

        // Siapkan penangan form
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            this.handleChangePassword(e);
        });

        // Tutup modal saat overlay diklik
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeChangePasswordModal();
            }
        });
    }

    // Menutup modal ganti kata sandi
    closeChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Menangani ganti kata sandi
    async handleChangePassword(e) {
        e.preventDefault();

        const username = document.getElementById('changeUsername').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = document.querySelector('#changePasswordForm .btn-primary');

        // Validasi
        if (!username || !currentPassword || !newPassword || !confirmPassword) {
            this.showAlert('error', 'Silakan isi semua bidang.');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showAlert('error', 'Kata sandi baru tidak cocok.');
            return;
        }

        if (newPassword.length < 6) {
            this.showAlert('error', 'Kata sandi baru harus minimal 6 karakter.');
            return;
        }

        if (newPassword === currentPassword) {
            this.showAlert('error', 'Kata sandi baru harus berbeda dari kata sandi saat ini.');
            return;
        }

        // Tampilkan status loading
        this.setLoadingState(submitBtn, true);

        try {
            // Simulasi penundaan panggilan API
            await this.delay(1000);

            // Verifikasi kredensial saat ini
            const user = this.authenticate(username, currentPassword);
            
            if (user) {
                // Perbarui kata sandi
                user.password = newPassword;
                this.saveUsers(); // Simpan pengguna yang diperbarui ke localStorage
                
                this.showAlert('success', 'Kata sandi berhasil diperbarui!');
                
                // Tutup modal setelah penundaan singkat
                setTimeout(() => {
                    this.closeChangePasswordModal();
                }, 1500);
                
            } else {
                this.showAlert('error', 'Username atau kata sandi saat ini tidak valid.');
            }
            
        } catch (error) {
            this.showAlert('error', 'Gagal memperbarui kata sandi. Silakan coba lagi.');
            console.error('Change password error:', error);
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    // Mengatur status loading untuk tombol
    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (button.id === 'loginBtn') { // Mengembalikan teks asli untuk tombol login
                button.innerHTML = 'Login <i class="fas fa-arrow-right"></i>';
            } else if (button.id === 'registerBtn') { // Mengembalikan teks asli untuk tombol register
                button.innerHTML = 'Daftar <i class="fas fa-user-plus"></i>';
            } else if (button.textContent.includes('Loading...')) { // Untuk tombol modal ganti kata sandi
                button.innerHTML = 'Perbarui Kata Sandi';
            }
        }
    }

    // Menampilkan peringatan menggunakan SweetAlert2 (disukai) atau fallback ke peringatan HTML kustom
    showAlert(type, message) {
        if (typeof Swal !== 'undefined') {
            const config = {
                title: type === 'success' ? 'Berhasil!' : 'Error!',
                text: message,
                icon: type,
                confirmButtonText: 'OK',
                confirmButtonColor: type === 'success' ? '#667eea' : '#e74c3c',
                timer: type === 'success' ? 3000 : null,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            };
            Swal.fire(config);
        } else {
            // Fallback ke peringatan HTML kustom jika SweetAlert2 tidak dimuat
            const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
            const alertHtml = `
                <div class="alert ${alertClass} alert-dismissible fade show animate__animated animate__fadeIn" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 1050; min-width: 250px;">
                    <strong>${type === 'success' ? 'Berhasil!' : 'Error!'}</strong> ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', alertHtml);
            setTimeout(() => {
                const alertElement = document.querySelector('.alert');
                if (alertElement) alertElement.remove();
            }, 5000);
        }
    }

    // Memeriksa sesi yang ada
    checkExistingSession() {
        // Dalam aplikasi nyata, ini akan memeriksa token sesi yang valid
        // Untuk tujuan demo, jika isLoggedIn bernilai true, maka diasumsikan sudah login
        if (localStorage.getItem('isLoggedIn') === 'true') {
            // Opsional, Anda mungkin ingin mengarahkan ke dashboard segera
            // jika sesi yang valid ada.
            // console.log("Sesi ada, mengarahkan ke dashboard...");
            // window.location.href = 'index.html';
        } else {
            console.log('Pengguna demo yang tersedia:', Object.keys(this.users));
            console.log('Kredensial demo:');
            Object.values(this.users).forEach(user => {
                console.log(`Username: ${user.username}, Password: ${user.password}`);
            });
        }
    }

    // Mengarahkan ke dashboard
    redirectToDashboard() {
        window.location.href = '../index.html';
    }

    // Fungsi utilitas untuk penundaan
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mendapatkan pengguna saat ini
    getCurrentUser() {
        return this.currentUser;
    }

    // Fungsionalitas logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('isLoggedIn'); // Hapus status login
        // Dalam aplikasi nyata, ini juga akan menghapus data sesi di server
        console.log('Pengguna telah logout');
        this.showAlert('success', 'Anda telah berhasil logout.');
        // Mengarahkan ke halaman login setelah penundaan singkat
        setTimeout(() => {
            window.location.href = 'pages/login_page.html';
        }, 1000);
    }

    // Menambahkan pengguna baru (untuk fungsionalitas admin)
    addUser(userData) {
        if (this.users[userData.username.toLowerCase()]) {
            throw new Error('Username sudah ada.');
        }
        
        this.users[userData.username.toLowerCase()] = {
            ...userData,
            username: userData.username.toLowerCase(),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        this.saveUsers();
        return true;
    }

    // Mendapatkan semua pengguna (untuk fungsionalitas admin)
    getAllUsers() {
        return Object.values(this.users).map(user => ({
            ...user,
            password: '***' // Sembunyikan kata sandi dalam daftar
        }));
    }
}

// Menginisialisasi sistem otentikasi
const authSystem = new AuthSystem();

// Mengekspos ke lingkup global untuk interaksi modal
window.authSystem = authSystem;

// Peningkatan visual tambahan dan log konsol untuk demo
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
        });
        
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.borderColor = '#28a745';
            } else {
                this.style.borderColor = '#f0f0f0';
            }
        });
    });

    // Hanya tampilkan info kredensial demo jika di halaman login
    if (window.location.pathname.includes('login_page.html')) {
        console.log('%cKredensial Login Demo:', 'color: #667eea; font-size: 16px; font-weight: bold;');
        console.log('%cAdmin: username="admin", password="admin123"', 'color: #28a745; font-size: 14px;');
        console.log('%cUser: username="user", password="user123"', 'color: #28a745; font-size: 14px;');
        console.log('%cGanti Kata Sandi: Klik tautan "Ganti Kata Sandi" di bawah formulir login', 'color: #ffc107; font-size: 14px;');
    }
});
