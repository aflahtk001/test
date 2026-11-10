document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // --- Bokeh Particles ---
    const bokehParticles = [];
    const numBokeh = 60;
    
    for (let i = 0; i < numBokeh; i++) {
        bokehParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 30 + 5,
            speedY: Math.random() * -0.5 - 0.1,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            time: Math.random() * Math.PI * 2
        });
    }

    // --- Heart Stems ---
    const stems = [];
    const numStems = 40;
    
    for (let i = 0; i < numStems; i++) {
        // Stems originate mostly from bottom right, but spread out
        const startX = width * 0.85 + (Math.random() - 0.5) * (width * 0.4);
        const startY = height + 20;
        
        // They grow upwards and curve slightly left
        const length = height * (0.3 + Math.random() * 0.5);
        const curve = (Math.random() - 0.9) * 300; 
        
        const isDark = Math.random() > 0.4;
        
        stems.push({
            startXOffset: startX / width, // Store relative position for resize
            startY: startY,
            length: length,
            curve: curve,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.0005 + Math.random() * 0.001,
            isDark: isDark,
            hearts: generateHearts(length)
        });
    }
    
    function generateHearts(stemLength) {
        const hearts = [];
        const numHearts = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < numHearts; i++) {
            // Position along the stem (0 to 1)
            const t = 0.2 + (i / numHearts) * 0.8 + (Math.random() - 0.5) * 0.1;
            hearts.push({
                t: Math.min(1, Math.max(0, t)),
                size: Math.random() * 12 + 8,
                angleOffset: (Math.random() - 0.5) * Math.PI / 1.5,
                isDark: Math.random() > 0.3 // More dark hearts
            });
        }
        return hearts;
    }

    const baseHeartSize = 20;
    
    function preRenderHeart(isDark) {
        const cvs = document.createElement('canvas');
        const padding = 15;
        cvs.width = baseHeartSize * 2 + padding * 2;
        cvs.height = baseHeartSize * 2 + padding * 2;
        const oCtx = cvs.getContext('2d');
        
        oCtx.translate(cvs.width/2, cvs.height/2 - baseHeartSize * 0.2);
        
        if (isDark) {
            oCtx.fillStyle = '#220b2e';
            oCtx.shadowColor = '#000';
            oCtx.shadowBlur = 4;
        } else {
            oCtx.fillStyle = '#ffebf0';
            oCtx.shadowColor = '#fff';
            oCtx.shadowBlur = 8;
        }
        
        oCtx.beginPath();
        const topCurveHeight = baseHeartSize * 0.3;
        oCtx.moveTo(0, topCurveHeight);
        oCtx.bezierCurveTo(-baseHeartSize / 2, -topCurveHeight, -baseHeartSize, topCurveHeight, 0, baseHeartSize);
        oCtx.bezierCurveTo(baseHeartSize, topCurveHeight, baseHeartSize / 2, -topCurveHeight, 0, topCurveHeight);
        oCtx.fill();
        
        return cvs;
    }

    const darkHeartImg = preRenderHeart(true);
    const lightHeartImg = preRenderHeart(false);

    function drawHeart(ctx, x, y, size, angle, isDark) {
        const img = isDark ? darkHeartImg : lightHeartImg;
        const scale = size / baseHeartSize;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        
        ctx.drawImage(img, -img.width/2, -img.height/2 + baseHeartSize * 0.2);
        
        ctx.restore();
    }

    let lastTime = 0;
    
    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime;
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, width, height);
        
        // 1. Draw Bokeh
        for (const b of bokehParticles) {
            b.y += b.speedY * (dt / 16);
            b.x += b.speedX * (dt / 16);
            b.time += b.pulseSpeed * (dt / 16);
            
            if (b.y < -b.radius) b.y = height + b.radius;
            if (b.x < -b.radius) b.x = width + b.radius;
            if (b.x > width + b.radius) b.x = -b.radius;
            
            const currentOpacity = b.opacity + Math.sin(b.time) * 0.15;
            
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 230, 250, ${Math.max(0, currentOpacity)})`;
            ctx.fill();
        }
        
        // 2. Draw Stems & Hearts
        for (const stem of stems) {
            const actualStartX = stem.startXOffset * width;
            const actualStartY = height + 20;
            
            const sway = Math.sin(timestamp * stem.swaySpeed + stem.swayOffset) * 80;
            
            const endX = actualStartX + stem.curve + sway;
            const endY = actualStartY - stem.length;
            
            const cp1X = actualStartX;
            const cp1Y = actualStartY - stem.length * 0.4;
            const cp2X = endX - stem.curve * 0.5;
            const cp2Y = endY + stem.length * 0.2;
            
            // Draw Stem
            ctx.beginPath();
            ctx.moveTo(actualStartX, actualStartY);
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
            
            ctx.strokeStyle = stem.isDark ? '#220b2e' : '#5e326b';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            
            // Draw Hearts on Stem
            for (const heart of stem.hearts) {
                const t = heart.t;
                
                // Calculate position along bezier curve
                const invT = 1 - t;
                const x = invT*invT*invT*actualStartX + 3*invT*invT*t*cp1X + 3*invT*t*t*cp2X + t*t*t*endX;
                const y = invT*invT*invT*actualStartY + 3*invT*invT*t*cp1Y + 3*invT*t*t*cp2Y + t*t*t*endY;
                
                // Calculate tangent angle for rotation
                const tx = 3*invT*invT*(cp1X - actualStartX) + 6*invT*t*(cp2X - cp1X) + 3*t*t*(endX - cp2X);
                const ty = 3*invT*invT*(cp1Y - actualStartY) + 6*invT*t*(cp2Y - cp1Y) + 3*t*t*(endY - cp2Y);
                let angle = Math.atan2(ty, tx) + Math.PI/2 + heart.angleOffset;
                
                // Add a little extra sway to the heart itself
                angle += Math.sin(timestamp * stem.swaySpeed * 2 + heart.angleOffset) * 0.15;
                
                drawHeart(ctx, x, y, heart.size, angle, heart.isDark);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
});
