const helloWorld = document.getElementById('helloWorld');
const cursor = document.getElementById('cursor');
const container = document.querySelector('.container');
const particleCanvas = document.getElementById('particleCanvas');
const waveCanvas = document.getElementById('waveCanvas');
const particleCtx = particleCanvas.getContext('2d');
const waveCtx = waveCanvas.getContext('2d');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let trails = [];
let particles = [];
let waves = [];
let animationId;

// Initialize canvas sizes
function resizeCanvases() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    waveCanvas.width = window.innerWidth;
    waveCanvas.height = window.innerHeight;
}

resizeCanvases();

// Initialize positions
cursor.style.left = mouseX + 'px';
cursor.style.top = mouseY + 'px';

// Particle System
class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.005;
        this.color = Math.random() > 0.7 ? '#00ff41' : '#ffffff';
        this.twinkle = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.twinkle += 0.1;
        
        // Bounce off edges
        if (this.x <= 0 || this.x >= window.innerWidth) this.vx *= -1;
        if (this.y <= 0 || this.y >= window.innerHeight) this.vy *= -1;
        
        // Keep in bounds
        this.x = Math.max(0, Math.min(window.innerWidth, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight, this.y));
    }
    
    draw() {
        const alpha = this.life * (0.5 + 0.5 * Math.sin(this.twinkle));
        particleCtx.save();
        particleCtx.globalAlpha = alpha;
        particleCtx.fillStyle = this.color;
        particleCtx.shadowBlur = 10;
        particleCtx.shadowColor = this.color;
        particleCtx.beginPath();
        particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        particleCtx.fill();
        particleCtx.restore();
    }
}

// Wave System
class Wave {
    constructor(index) {
        this.amplitude = 30 + Math.random() * 50;
        this.frequency = 0.01 + Math.random() * 0.02;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.02 + Math.random() * 0.03;
        this.yOffset = (index / 8) * window.innerHeight;
        this.color = `hsl(${120 + Math.random() * 60}, 70%, ${30 + Math.random() * 40}%)`;
        this.opacity = 0.3 + Math.random() * 0.4;
    }
    
    update() {
        this.phase += this.speed;
    }
    
    draw() {
        waveCtx.save();
        waveCtx.globalAlpha = this.opacity;
        waveCtx.strokeStyle = this.color;
        waveCtx.lineWidth = 2;
        waveCtx.shadowBlur = 15;
        waveCtx.shadowColor = this.color;
        waveCtx.beginPath();
        
        for (let x = 0; x <= window.innerWidth; x += 2) {
            const y = this.yOffset + 
                     this.amplitude * Math.sin(x * this.frequency + this.phase) +
                     this.amplitude * 0.5 * Math.sin(x * this.frequency * 2 + this.phase * 1.5);
            
            if (x === 0) {
                waveCtx.moveTo(x, y);
            } else {
                waveCtx.lineTo(x, y);
            }
        }
        
        waveCtx.stroke();
        waveCtx.restore();
    }
}

// Initialize particles and waves
function initParticles() {
    particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }
}

function initWaves() {
    waves = [];
    for (let i = 0; i < 8; i++) {
        waves.push(new Wave(i));
    }
}

initParticles();
initWaves();

// Animation loop
function animate() {
    // Clear canvases
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    
    // Update and draw waves
    waves.forEach(wave => {
        wave.update();
        wave.draw();
    });
    
    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        // Remove dead particles and create new ones
        if (particle.life <= 0) {
            particles[index] = new Particle();
        }
    });
    
    animationId = requestAnimationFrame(animate);
}

animate();

// Mouse interaction
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    
    // Calculate distance from center for text offset
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const offsetX = (mouseX - centerX) * 0.1;
    const offsetY = (mouseY - centerY) * 0.1;
    
    // Move hello world text with easing
    helloWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // Add dither effect based on movement speed
    const intensity = Math.min(Math.abs(offsetX) + Math.abs(offsetY), 100) / 100;
    helloWorld.style.filter = `contrast(${1 + intensity * 0.5}) brightness(${1 + intensity * 0.3})`;
    
    // Create trail effect
    createTrail(mouseX, mouseY);
    
    // Create particles near mouse
    if (Math.random() > 0.8) {
        const newParticle = new Particle();
        newParticle.x = mouseX + (Math.random() - 0.5) * 100;
        newParticle.y = mouseY + (Math.random() - 0.5) * 100;
        newParticle.vx *= 2;
        newParticle.vy *= 2;
        particles.push(newParticle);
        
        // Remove excess particles
        if (particles.length > 200) {
            particles.shift();
        }
    }
});

function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    container.appendChild(trail);
    
    trails.push(trail);
    
    // Remove trail after animation
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
        trails = trails.filter(t => t !== trail);
    }, 500);
    
    // Limit number of trails for performance
    if (trails.length > 20) {
        const oldTrail = trails.shift();
        if (oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail);
        }
    }
}

// Add periodic glitch effects
setInterval(() => {
    const glitchIntensity = Math.random();
    if (glitchIntensity > 0.8) {
        helloWorld.style.textShadow = `
            ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 10px #ff0000,
            ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 20px #00ff41,
            ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 40px #0080ff
        `;
        
        setTimeout(() => {
            helloWorld.style.textShadow = `
                0 0 10px #00ff41,
                0 0 20px #00ff41,
                0 0 40px #00ff41
            `;
        }, 100);
    }
}, 200);

// Handle window resize
window.addEventListener('resize', () => {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    helloWorld.style.transform = 'translate(0px, 0px)';
    
    // Resize canvases and reinitialize
    resizeCanvases();
    initWaves();
    
    // Update existing particles to stay in bounds
    particles.forEach(particle => {
        particle.x = Math.min(particle.x, window.innerWidth);
        particle.y = Math.min(particle.y, window.innerHeight);
    });
});