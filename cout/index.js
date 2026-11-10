// index.js
// ==========================================
// CONFIGURATION
// ==========================================
// Set your target date here!
// Format: new Date("YYYY-MM-DDTHH:mm:ss").getTime()
// For testing, we are setting it to 5 seconds from page load.
const TARGET_DATE = new Date().getTime() + 5000; 
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const countdownWrapper = document.getElementById('countdown-wrapper');
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');
    const countdownHint = document.querySelector('.countdown-hint');
    
    if (countdownWrapper) {
        let isUnlocked = false;
        
        function handleSuccess() {
            isUnlocked = true;
            
            // Hide countdown smoothly and add scale effect
            countdownWrapper.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            countdownWrapper.style.opacity = '0';
            countdownWrapper.style.transform = 'scale(0.95)';
            countdownWrapper.style.pointerEvents = 'none';
            
            if(countdownHint) countdownHint.style.opacity = '0';
            
            // Show Happy Birthday text immediately to crossfade
            const hbText = document.getElementById('happy-birthday-text');
            if(hbText) {
                // trigger reflow
                void hbText.offsetWidth;
                hbText.style.opacity = '1';
                hbText.style.transform = 'translate(-50%, -50%) scale(1)';
            }
            
            // Fire continuous massive glitter pop effect
            if (typeof confetti === 'function') {
                const duration = 3500;
                const end = Date.now() + duration;

                // Big center pop instantly
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.6 },
                    colors: ['#e2b4eb', '#b886c5', '#ffffff', '#764b8e'],
                    zIndex: 1000
                });

                // Continuous cannons from edges
                (function frame() {
                    confetti({
                        particleCount: 7,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.8 },
                        colors: ['#e2b4eb', '#b886c5', '#ffffff', '#764b8e'],
                        zIndex: 1000
                    });
                    confetti({
                        particleCount: 7,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.8 },
                        colors: ['#e2b4eb', '#b886c5', '#ffffff', '#764b8e'],
                        zIndex: 1000
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }
            
            const heroSection = document.getElementById('hero');
            const surpriseSection = document.getElementById('surprise-section');

            // Smoothly crossfade to the surprise section without reloading the page
            setTimeout(() => {
                if(heroSection) {
                    heroSection.style.transition = 'opacity 1.5s ease-in-out';
                    heroSection.style.opacity = '0';
                    heroSection.style.pointerEvents = 'none';
                }
                
                if(surpriseSection) {
                    surpriseSection.style.opacity = '1';
                    surpriseSection.style.pointerEvents = 'auto';
                    surpriseSection.style.zIndex = '10';
                    
                    // Trigger reflow for scratch canvases after showing
                    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
                }
            }, 3000); // Wait 3.0s (during confetti and Happy Birthday text) before crossfading
        }

        function updateCountdown() {
            if (isUnlocked) return;
            
            const now = new Date().getTime();
            const distance = TARGET_DATE - now;

            if (distance <= 0) {
                clearInterval(countdownInterval);
                cdDays.textContent = "00";
                cdHours.textContent = "00";
                cdMinutes.textContent = "00";
                cdSeconds.textContent = "00";
                handleSuccess();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            cdDays.textContent = days < 10 ? "0" + days : days;
            cdHours.textContent = hours < 10 ? "0" + hours : hours;
            cdMinutes.textContent = minutes < 10 ? "0" + minutes : minutes;
            cdSeconds.textContent = seconds < 10 ? "0" + seconds : seconds;
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Call immediately to avoid initial delay
    }
});
