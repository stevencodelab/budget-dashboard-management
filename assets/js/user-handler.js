// user-handler.js - Mengelola tampilan informasi pengguna di UI

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi display username
    initializeUserDisplay();
    
    // Update display setiap kali halaman dimuat ulang
    updateUserDisplay();
});

// Fungsi untuk menginisialisasi tampilan pengguna
function initializeUserDisplay() {
    // Cek apakah pengguna sudah login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn !== 'true') {
        // Jika belum login, redirect ke halaman login
        window.location.href = 'pages/login_page.html';
        return;
    }
    
    // Update tampilan username
    updateUserDisplay();
}

// Fungsi untuk memperbarui tampilan username di navbar
function updateUserDisplay() {
    const username = localStorage.getItem('currentUsername');
    const navbarGreeting = document.getElementById('navbarGreeting');
    const navbarUsername = document.getElementById('navbarUsername');

    // Default values jika username tidak ditemukan
    const defaultUsername = 'Pengguna';
    const displayUsername = username || defaultUsername;

    // Update greeting dengan username
    if (navbarGreeting) {
        // Buat pesan greeting berdasarkan waktu
        const currentHour = new Date().getHours();
        let greeting = '';
        
        if (currentHour >= 5 && currentHour < 12) {
            greeting = 'Selamat Pagi';
        } else if (currentHour >= 12 && currentHour < 15) {
            greeting = 'Selamat Siang';
        } else if (currentHour >= 15 && currentHour < 18) {
            greeting = 'Selamat Sore';
        } else {
            greeting = 'Selamat Malam';
        }
        
        navbarGreeting.textContent = `${greeting}, ${displayUsername}!`;
    }

    // Update navbar username dengan icon
    if (navbarUsername) {
        navbarUsername.innerHTML = `<i class="fas fa-user"></i> ${displayUsername}`;
    }

    // Debug log untuk membantu troubleshooting
    console.log('Username display updated:', {
        storedUsername: username,
        displayUsername: displayUsername,
        navbarGreeting: navbarGreeting?.textContent,
        navbarUsername: navbarUsername?.textContent
    });
}

// Fungsi untuk mengkapitalisasi nama (opsional)
function capitalizeUsername(username) {
    if (!username) return 'Pengguna';
    
    return username
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Fungsi untuk memperbarui username setelah perubahan
function refreshUserDisplay() {
    updateUserDisplay();
}

// Export fungsi untuk digunakan di file lain jika diperlukan
window.userHandler = {
    updateUserDisplay,
    refreshUserDisplay,
    capitalizeUsername
};

// Event listener untuk perubahan localStorage (jika username diubah di tab lain)
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUsername' || e.key === 'isLoggedIn') {
        updateUserDisplay();
    }
});

// Tambahan: Update tampilan saat fokus kembali ke halaman
window.addEventListener('focus', function() {
    // Verifikasi ulang status login saat fokus kembali
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'pages/login_page.html';
    } else {
        updateUserDisplay();
    }
});