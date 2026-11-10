
document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Page Transition ---
    // Fade in page smoothly on load
    document.body.style.opacity = '1';
    



    // --- 2. Background Generator ---
    const floatingBgContainer = document.getElementById('floating-hearts-container');

    if (floatingBgContainer) {
        const elementsCount = 35;
        
        // Types of elements
        const elementTypes = [
            { icon: 'fa-heart', style: 'bg-heart-dark' },
            { icon: 'fa-heart', style: 'bg-heart-dark' }, // More dark hearts
            { icon: 'fa-heart', style: 'bg-heart-light' },
            { icon: 'fa-gift', style: 'bg-gift' },
            { icon: 'fa-cloud', style: 'bg-cloud' }
        ];

        function createFloatingElement() {
            const el = document.createElement('i');
            const type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
            
            el.classList.add('fa-solid', type.icon, 'bg-element', type.style);
            
            // Randomize size based on type
            let size;
            if (type.icon === 'fa-cloud') {
                size = Math.random() * 60 + 80; // 80px to 140px
            } else {
                size = Math.random() * 40 + 30; // 30px to 70px
            }
            
            const leftPos = Math.random() * 100;
            const animationDuration = Math.random() * 25 + 20; // 20s to 45s
            const animationDelay = Math.random() * -30; // Negative delay to start immediately populated
            
            el.style.fontSize = `${size}px`;
            el.style.left = `${leftPos}vw`;
            el.style.animationDuration = `${animationDuration}s`;
            el.style.animationDelay = `${animationDelay}s`;
            
            floatingBgContainer.appendChild(el);
        }

        for (let i = 0; i < elementsCount; i++) {
            createFloatingElement();
        }
    }


    // --- Inline Music Player (Surprise Page) ---
    const inlinePlayBtn = document.getElementById('inline-play-btn');
    const bgMusic = document.getElementById('bg-music');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    if (bgMusic) {
        bgMusic.volume = 0.4;
    }

    if (inlinePlayBtn && bgMusic && progressBar) {
        // Format time in M:SS
        const formatTime = (time) => {
            if (isNaN(time)) return "0:00";
            const min = Math.floor(time / 60);
            const sec = Math.floor(time % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        // When metadata loads, set duration
        bgMusic.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(bgMusic.duration);
            progressBar.max = bgMusic.duration;
        });

        // Update progress bar as music plays
        bgMusic.addEventListener('timeupdate', () => {
            progressBar.value = bgMusic.currentTime;
            currentTimeEl.textContent = formatTime(bgMusic.currentTime);
            // In case loadedmetadata didn't fire (some browsers/CDNs)
            if (durationEl.textContent === "0:00" && !isNaN(bgMusic.duration)) {
                durationEl.textContent = formatTime(bgMusic.duration);
                progressBar.max = bgMusic.duration;
            }
        });

        // Seek music when user changes progress bar
        progressBar.addEventListener('input', () => {
            bgMusic.currentTime = progressBar.value;
        });

        // Play/Pause
        inlinePlayBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Audio play failed", e));
                inlinePlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                bgMusic.pause();
                inlinePlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        });
    }




    // --- 6. Surprise Reveal & Confetti ---
    const finalGift = document.getElementById('final-gift');

    if (finalGift) {
        finalGift.addEventListener('click', function() {
            if (!this.classList.contains('opened')) {
                this.classList.add('opened');
                
                // Update text
                const title = document.getElementById('gift-title');
                const instruction = document.getElementById('gift-instruction');
                if (title) title.style.opacity = '0'; // hide title
                if (instruction) instruction.style.opacity = '0'; // hide instruction
                
                // Fire Confetti!
                var duration = 3 * 1000;
                var animationEnd = Date.now() + duration;
                var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

                function randomInRange(min, max) {
                    return Math.random() * (max - min) + min;
                }

                var interval = setInterval(function() {
                    var timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    var particleCount = 50 * (timeLeft / duration);
                    confetti({
                        ...defaults, particleCount,
                        origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 },
                        colors: ['#e2b4eb', '#b886c5', '#ffffff', '#764b8e']
                    });
                }, 250);
            }
        });
    }

    // --- 7. Scratch Cards Logic ---
    setTimeout(() => {
        const canvases = document.querySelectorAll('.scratch-canvas');
        canvases.forEach(canvas => {
            const rect = canvas.parentElement.getBoundingClientRect();
            // Only initialize if visible (rect.width > 0)
            if (rect.width === 0) return;

            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Draw Doodle Style Cover
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#e2b4eb');
            gradient.addColorStop(1, '#5e326b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Text
            ctx.font = "bold 40px 'Caveat'";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Scratch Me!", canvas.width/2, canvas.height/2 - 10);
            
            // Sparkles
            ctx.font = "24px 'Caveat'";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("", canvas.width/2, canvas.height/2 + 30);

            let isDrawing = false;
            let isRevealed = false;
            let scratchCount = 0;

            function getPos(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }

            function scratch(e) {
                if (!isDrawing || isRevealed) return;
                if (e.cancelable) e.preventDefault(); // Prevent scrolling on touch
                
                const pos = getPos(e);
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 35, 0, 2 * Math.PI);
                ctx.fill();

                scratchCount++;
                if (scratchCount % 5 === 0) {
                    checkReveal();
                }
            }

            function checkReveal() {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imgData.data;
                let transparent = 0;
                
                // check every 16th pixel for performance (stride of 64 bytes)
                for (let i = 3; i < pixels.length; i += 64) {
                    if (pixels[i] < 128) {
                        transparent++;
                    }
                }
                
                const total = pixels.length / 64;
                if (transparent / total >= 0.4) {
                    isRevealed = true;
                    isDrawing = false;
                    
                    // Fade out canvas completely
                    canvas.style.transition = 'opacity 0.6s ease';
                    canvas.style.opacity = '0';
                    
                    // Pop glitter effect
                    const canvasRect = canvas.getBoundingClientRect();
                    const x = (canvasRect.left + canvasRect.width / 2) / window.innerWidth;
                    const y = (canvasRect.top + canvasRect.height / 2) / window.innerHeight;
                    
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 70,
                            spread: 80,
                            origin: { x: x, y: y },
                            colors: ['#e2b4eb', '#b886c5', '#ffffff', '#764b8e'],
                            zIndex: 1000
                        });
                    }
                    
                    // Remove canvas from DOM after fade out
                    setTimeout(() => canvas.remove(), 600);
                }
            }

            // Mouse Events
            canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('mouseup', () => { isDrawing = false; });
            canvas.addEventListener('mouseleave', () => { isDrawing = false; });

            // Touch Events
            canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
            canvas.addEventListener('touchmove', scratch, { passive: false });
            canvas.addEventListener('touchend', () => { isDrawing = false; });
        });
    }, 500); // Small delay to ensure layout is computed

    // --- 8. Slideshow Logic (Surprise Page) ---
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const indicator = document.getElementById('slide-indicator');
    
    if (slides.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        
        function updateSlides() {
            slides.forEach((slide, index) => {
                if (index === currentSlide) {
                    slide.classList.add('active-slide');
                } else {
                    slide.classList.remove('active-slide');
                }
            });
            
            // Update indicator
            if (indicator) {
                indicator.textContent = `${currentSlide + 1} / ${slides.length}`;
            }
            
            // Update buttons
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === slides.length - 1;
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlides();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateSlides();
            }
        });
    }

    // Envelope Animation Logic
    const envelope = document.querySelector('.envelope-wrapper');
    if (envelope) {
        envelope.addEventListener('click', function() {
            if (this.classList.contains('open')) {
                this.classList.remove('open');
                this.classList.add('close');
            } else {
                this.classList.remove('close');
                this.classList.add('open');
            }
        });
    }


});
