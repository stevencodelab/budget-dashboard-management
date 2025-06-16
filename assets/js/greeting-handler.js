// greeting-handler.js - Menangani tampilan greeting berdasarkan waktu

class GreetingHandler {
    constructor() {
        this.init();
    }

    init() {
        this.updateGreeting();
        // Update greeting setiap menit
        setInterval(() => this.updateGreeting(), 60000);
    }

    getGreeting() {
        const hour = new Date().getHours();
        
        if (hour >= 3 && hour < 11) {
            return 'Selamat Pagi';
        } else if (hour >= 11 && hour < 15) {
            return 'Selamat Siang';
        } else if (hour >= 15 && hour < 18) {
            return 'Selamat Sore';
        } else {
            return 'Selamat Malam';
        }
    }

    updateGreeting() {
        const greetingElement = document.getElementById('navbarGreeting');
        if (greetingElement) {
            greetingElement.textContent = this.getGreeting();
        }
    }
}

// Inisialisasi handler saat dokumen dimuat
document.addEventListener('DOMContentLoaded', () => {
    window.greetingHandler = new GreetingHandler();
});