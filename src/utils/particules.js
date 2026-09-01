const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

const pointer = { x: -9999, y: -9999 };
let scrollForce = 0;
let particles = [];

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
}

function createParticles() {
    // Pocas partículas: cambia 18 si quieres un poco más o menos
    particles = Array.from({ length: 18 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.8,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.35 + 0.12
    }));
}

window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

window.addEventListener("scroll", () => {
    scrollForce = Math.min(scrollForce + 1.5, 8);
}, { passive: true });

function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        // El cursor las desplaza suavemente si se acerca.
        if (distance < 180) {
            const force = (180 - distance) / 180;
            particle.x += (dx / distance) * force * 1.2;
            particle.y += (dy / distance) * force * 1.2;
        }

        // El scroll las empuja un poco hacia arriba.
        particle.y -= scrollForce * 0.12;

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Reaparecen al cruzar los bordes.
        if (particle.x < -10) particle.x = window.innerWidth + 10;
        if (particle.x > window.innerWidth + 10) particle.x = -10;
        if (particle.y < -10) particle.y = window.innerHeight + 10;
        if (particle.y > window.innerHeight + 10) particle.y = -10;

        // Punto con brillo tenue, acorde al fondo oscuro.
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 185, 255, ${particle.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(151, 111, 255, 0.7)";
        ctx.fill();
    });

    scrollForce *= 0.92; // el efecto de scroll se desvanece
    requestAnimationFrame(animate);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
animate();
