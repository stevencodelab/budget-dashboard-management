// auth.js - Sistem Autentikasi Lengkap dengan Fitur Ganti Username dan Kata Sandi (DIPERBAIKI)

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

    // Memuat pengguna dari memori
    loadUsers() {
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
                    displayName: 'Admin',
                    password: 'admin123',
                    email: 'admin@budgetdashboard.com',
                    role: 'administrator',
                    lastLogin: null,
                    createdAt: new Date().toISOString()
                },
                'user': {
                    username: 'user',
                    displayName: 'User',
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
            console.log('Users berhasil disimpan ke localStorage:', this.users);
        } catch (e) {
            console.error("Gagal menyimpan pengguna ke localStorage:", e);
        }
    }

    // Membuat pengguna default jika belum ada
    createDefaultUser() {
        if (!this.users['admin']) {
            this.users['admin'] = {
                username: 'admin',
                displayName: 'Admin',
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
        
        if (window.location.pathname.includes('login_page.html')) {
            this.addCredentialManagementLinks();
            
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

    // Menambahkan tautan manajemen kredensial
    addCredentialManagementLinks() {
        const loginBox = document.querySelector('.login-box');
        if (loginBox && !document.getElementById('credentialLinks')) {
            const credentialLinksHTML = `
                <div id="credentialLinks" style="margin-top: 20px; text-align: center;">
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px;">
                        <a href="#" id="changePasswordLink" style="color: #667eea; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease;">
                            <i class="fas fa-key"></i> Ganti Password
                        </a>
                        <a href="#" id="changeUsernameLink" style="color: #667eea; text-decoration: none; font-size: 14px; opacity: 0.8; transition: opacity 0.3s ease;">
                            <i class="fas fa-user-edit"></i> Ganti Username
                        </a>
                    </div>
                </div>
            `;
            loginBox.insertAdjacentHTML('beforeend', credentialLinksHTML);
            
            document.getElementById('changePasswordLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            });

            document.getElementById('changeUsernameLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showChangeUsernameModal();
            });
        }
    }

    // PERBAIKAN: Menangani proses login dengan pencarian yang lebih robust
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

            // PERBAIKAN: Reload users dari localStorage untuk memastikan data terbaru
            this.users = this.loadUsers();

            // Otentikasi pengguna dengan pencarian yang lebih robust
            const user = this.authenticateUser(username, password);
            
            if (user) {
                // Perbarui login terakhir
                user.lastLogin = new Date().toISOString();
                this.currentUser = user;
                this.saveUsers();

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUsername', user.displayName || user.username);
                localStorage.setItem('currentUserLogin', user.username);
                
                // Umpan balik sukses
                this.showAlert('success', `Selamat datang kembali, ${user.displayName || user.username}!`);
                
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

    // PERBAIKAN: Fungsi autentikasi yang lebih robust
    authenticateUser(inputUsername, password) {
        console.log('Mencoba login dengan username:', inputUsername);
        console.log('Data users saat ini:', this.users);
        
        // Cari user berdasarkan username (key dalam object users)
        const userKey = inputUsername.toLowerCase();
        let user = this.users[userKey];
        
        // Jika tidak ditemukan dengan key langsung, cari berdasarkan field username
        if (!user) {
            user = Object.values(this.users).find(u => 
                u.username.toLowerCase() === inputUsername.toLowerCase()
            );
        }
        
        // Jika masih tidak ditemukan, cari berdasarkan displayName
        if (!user) {
            user = Object.values(this.users).find(u => 
                u.displayName && u.displayName.toLowerCase() === inputUsername.toLowerCase()
            );
        }
        
        console.log('User ditemukan:', user);
        
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    // LEGACY: Fungsi authenticate lama (tetap dipertahankan untuk kompatibilitas)
    authenticate(username, password) {
        return this.authenticateUser(username, password);
    }

    // Menampilkan modal ganti kata sandi
    showChangePasswordModal() {
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

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('changePasswordModal');
        setTimeout(() => modal.classList.add('active'), 10);

        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            this.handleChangePassword(e);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeChangePasswordModal();
            }
        });
    }

    // Menampilkan modal ganti username
    showChangeUsernameModal() {
        const modalHTML = `
            <div class="modal-overlay" id="changeUsernameModal">
                <div class="modal-content">
                    <button class="modal-close" onclick="window.authSystem.closeChangeUsernameModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <h3 class="modal-title">Ganti Username</h3>
                        <p class="modal-subtitle">Perbarui username akun Anda</p>
                    </div>
                    <form id="changeUsernameForm">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Username Saat Ini" id="currentUsername" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Kata Sandi" id="usernameChangePassword" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Username Baru" id="newUsername" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user-edit"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Konfirmasi Username Baru" id="confirmUsername" required>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user-check"></span>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary btn-block">Perbarui Username</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('changeUsernameModal');
        setTimeout(() => modal.classList.add('active'), 10);

        document.getElementById('changeUsernameForm').addEventListener('submit', (e) => {
            this.handleChangeUsername(e);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeChangeUsernameModal();
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

    // Menutup modal ganti username
    closeChangeUsernameModal() {
        const modal = document.getElementById('changeUsernameModal');
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

        this.setLoadingState(submitBtn, true);

        try {
            await this.delay(1000);

            // PERBAIKAN: Reload users dan gunakan authenticateUser
            this.users = this.loadUsers();
            const user = this.authenticateUser(username, currentPassword);
            
            if (user) {
                // Update password di object users dengan key yang benar
                const userKey = Object.keys(this.users).find(key => 
                    this.users[key] === user
                );
                
                if (userKey) {
                    this.users[userKey].password = newPassword;
                    this.saveUsers();
                    
                    this.showAlert('success', 'Kata sandi berhasil diperbarui!');
                    
                    setTimeout(() => {
                        this.closeChangePasswordModal();
                    }, 1500);
                } else {
                    this.showAlert('error', 'Terjadi kesalahan saat memperbarui kata sandi.');
                }
                
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

    // PERBAIKAN UTAMA: Menangani ganti username dengan sinkronisasi localStorage yang benar
    async handleChangeUsername(e) {
        e.preventDefault();

        const currentUsername = document.getElementById('currentUsername').value.trim();
        const password = document.getElementById('usernameChangePassword').value;
        const newUsername = document.getElementById('newUsername').value.trim();
        const confirmUsername = document.getElementById('confirmUsername').value.trim();
        const submitBtn = document.querySelector('#changeUsernameForm .btn-primary');

        if (!currentUsername || !password || !newUsername || !confirmUsername) {
            this.showAlert('error', 'Silakan isi semua bidang.');
            return;
        }

        if (newUsername !== confirmUsername) {
            this.showAlert('error', 'Username baru tidak cocok.');
            return;
        }

        if (newUsername.length < 3) {
            this.showAlert('error', 'Username baru harus minimal 3 karakter.');
            return;
        }

        if (newUsername === currentUsername) {
            this.showAlert('error', 'Username baru harus berbeda dari username saat ini.');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            this.showAlert('error', 'Username hanya boleh mengandung huruf, angka, dan underscore.');
            return;
        }

        // PERBAIKAN: Cek apakah username baru sudah ada dengan pencarian yang lebih robust
        const existingUser = this.users[newUsername.toLowerCase()] || 
                           Object.values(this.users).find(u => 
                               u.username.toLowerCase() === newUsername.toLowerCase() ||
                               (u.displayName && u.displayName.toLowerCase() === newUsername.toLowerCase())
                           );

        if (existingUser) {
            this.showAlert('error', 'Username baru sudah digunakan. Pilih username lain.');
            return;
        }

        this.setLoadingState(submitBtn, true);

        try {
            await this.delay(1000);

            // PERBAIKAN: Reload users dan gunakan authenticateUser
            this.users = this.loadUsers();
            const user = this.authenticateUser(currentUsername, password);
            
            if (user) {
                // PERBAIKAN: Temukan key lama untuk user ini
                const oldUserKey = Object.keys(this.users).find(key => 
                    this.users[key] === user
                );
                
                if (oldUserKey) {
                    // Buat data user baru dengan username yang diupdate
                    const newUserData = {
                        ...user,
                        username: newUsername.toLowerCase(),
                        displayName: newUsername
                    };

                    // PERBAIKAN: Hapus entry lama dan tambah entry baru
                    delete this.users[oldUserKey];
                    this.users[newUsername.toLowerCase()] = newUserData;
                    
                    // Simpan perubahan ke localStorage
                    this.saveUsers();
                    
                    // PERBAIKAN: Update localStorage session jika user sedang login
                    const currentLoginUser = localStorage.getItem('currentUserLogin');
                    if (currentLoginUser === oldUserKey || currentLoginUser === user.username) {
                        localStorage.setItem('currentUsername', newUsername);
                        localStorage.setItem('currentUserLogin', newUsername.toLowerCase());
                        this.currentUser = newUserData; // Update current user object
                    }
                    
                    this.showAlert('success', `Username berhasil diubah dari "${currentUsername}" ke "${newUsername}"!`);
                    
                    setTimeout(() => {
                        this.closeChangeUsernameModal();
                        // Refresh halaman untuk update UI
                        if (localStorage.getItem('isLoggedIn') === 'true') {
                            window.location.reload();
                        }
                    }, 1500);
                } else {
                    this.showAlert('error', 'Terjadi kesalahan saat memperbarui username.');
                }
                
            } else {
                this.showAlert('error', 'Username atau kata sandi saat ini tidak valid.');
            }
            
        } catch (error) {
            this.showAlert('error', 'Gagal memperbarui username. Silakan coba lagi.');
            console.error('Change username error:', error);
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
            if (button.id === 'loginBtn') {
                button.innerHTML = 'Login <i class="fas fa-arrow-right"></i>';
            } else if (button.id === 'registerBtn') {
                button.innerHTML = 'Daftar <i class="fas fa-user-plus"></i>';
            } else if (button.textContent.includes('Loading...')) {
                if (button.closest('#changePasswordForm')) {
                    button.innerHTML = 'Perbarui Kata Sandi';
                } else if (button.closest('#changeUsernameForm')) {
                    button.innerHTML = 'Perbarui Username';
                }
            }
        }
    }

    // Menampilkan peringatan
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
        if (localStorage.getItem('isLoggedIn') === 'true') {
            // Optional redirect logic
        } else {
            console.log('Pengguna demo yang tersedia:', Object.keys(this.users));
            console.log('Kredensial demo:');
            Object.values(this.users).forEach(user => {
                console.log(`Username: ${user.username}, Password: ${user.password}, Display: ${user.displayName}`);
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
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUsername');
        localStorage.removeItem('currentUserLogin');
        console.log('Pengguna telah logout');
        this.showAlert('success', 'Anda telah berhasil logout.');
        setTimeout(() => {
            window.location.href = 'pages/login_page.html';
        }, 1000);
    }

    // Menambahkan pengguna baru
    addUser(userData) {
        if (this.users[userData.username.toLowerCase()]) {
            throw new Error('Username sudah ada.');
        }
        
        this.users[userData.username.toLowerCase()] = {
            ...userData,
            username: userData.username.toLowerCase(),
            displayName: userData.displayName || userData.username,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        this.saveUsers();
        return true;
    }

    // Mendapatkan semua pengguna
    getAllUsers() {
        return Object.values(this.users).map(user => ({
            ...user,
            password: '***'
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

    if (window.location.pathname.includes('login_page.html')) {
        console.log('%cKredensial Login Demo:', 'color: #667eea; font-size: 16px; font-weight: bold;');
        console.log('%cAdmin: username="admin", password="admin123"', 'color: #28a745; font-size: 14px;');
        console.log('%cUser: username="user", password="user123"', 'color: #28a745; font-size: 14px;');
        console.log('%cGanti Password: Klik tautan "Ganti Password" di bawah formulir login', 'color: #ffc107; font-size: 14px;');
        console.log('%cGanti Username: Klik tautan "Ganti Username" di bawah formulir login', 'color: #ffc107; font-size: 14px;');
    }
});