import { useRef, useState } from 'react';

// Paleta de referencia (ajústala a tu gusto)
const COLORS = {
    bgTop: '#1a1433',
    bgBottom: '#0d0a1c',
    glow: 'rgba(242, 167, 216, 0.35)',
    ink: '#f2eef8',
    inkSoft: 'rgba(242, 238, 248, 0.72)',
    accent: '#f2a7d8',
    cream: '#eaddc0',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.14)',
    chipBg: '#171233',
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350; // 4:5, ideal para historias / WhatsApp

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
    const { align = 'center', maxLines } = options;
    const words = text.split(' ');
    let lines = [];
    let line = '';

    words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    });
    if (line) lines.push(line);

    if (maxLines && lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        let lastLine = lines[maxLines - 1];
        while (ctx.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 0) {
            lastLine = lastLine.slice(0, -1);
        }
        lines[maxLines - 1] = `${lastLine}…`;
    }

    ctx.textAlign = align;
    let cursorY = y;
    lines.forEach((l) => {
        ctx.fillText(l, x, cursorY);
        cursorY += lineHeight;
    });
    return cursorY;
}

function drawParticles(ctx, w, h) {
    const count = 90;
    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 1.6 + 0.4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.15})`;
        ctx.fill();
    }
}

function formatDate(dateStr) {
    return new Date(dateStr.replace(' ', 'T')).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(dateStr) {
    return new Date(dateStr.replace(' ', 'T')).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function InvitationCardGenerator({ event, locations, invitation, honorees }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [generating, setGenerating] = useState(false);
    const canvasRef = useRef(null);

    async function handleGenerate() {
        setGenerating(true);

        if (document.fonts?.ready) await document.fonts.ready;

        const canvas = canvasRef.current;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        const centerX = CANVAS_WIDTH / 2;

        // --- Fondo ---
        const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        bgGradient.addColorStop(0, COLORS.bgTop);
        bgGradient.addColorStop(1, COLORS.bgBottom);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const glow = ctx.createRadialGradient(centerX, 220, 20, centerX, 220, 420);
        glow.addColorStop(0, COLORS.glow);
        glow.addColorStop(1, 'rgba(242, 167, 216, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        drawParticles(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

        let y = 210;

        // --- Encabezado ---
        ctx.fillStyle = COLORS.accent;
        ctx.font = '700 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText((event.event_type_name || 'ESTÁS INVITADO').toUpperCase(), centerX, y);
        ctx.letterSpacing = '0px';

        y += 70;
        const honoreeNames = (honorees || []).map((h) => h.full_name).join(' & ') || event.name;
        ctx.fillStyle = COLORS.ink;
        ctx.font = '700 72px Fraunces, serif';
        y = wrapText(ctx, honoreeNames, centerX, y, 880, 78);

        y += 60;
        const phrase =
            honorees?.[0]?.bio ||
            honorees?.[0]?.title ||
            'Un día para recordar y compartir en familia.';
        ctx.fillStyle = COLORS.inkSoft;
        ctx.font = 'italic 400 30px Fraunces, serif';
        y = wrapText(ctx, `"${phrase}"`, centerX, y, 760, 40);

        y += 55;
        ctx.fillStyle = COLORS.cream;
        ctx.font = '500 26px Inter, sans-serif';
        ctx.fillText(formatDate(event.event_datetime), centerX, y);

        // --- Divisor ---
        y += 55;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 340, y);
        ctx.lineTo(centerX - 30, y);
        ctx.moveTo(centerX + 30, y);
        ctx.lineTo(centerX + 340, y);
        ctx.stroke();
        ctx.fillStyle = COLORS.accent;
        ctx.font = '24px serif';
        ctx.fillText('✦', centerX, y + 8);

        // --- Tarjetas de ubicación ---
        y += 70;
        const shownLocations = (locations || []).slice(0, 2);
        const cardW = shownLocations.length === 2 ? 460 : 760;
        const gap = 40;
        const totalW = shownLocations.length === 2 ? cardW * 2 + gap : cardW;
        let cardX = centerX - totalW / 2;
        const cardH = 215;

        shownLocations.forEach((loc) => {
            ctx.fillStyle = COLORS.cardBg;
            ctx.strokeStyle = COLORS.cardBorder;
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, cardX, y, cardW, cardH, 20);
            ctx.fill();
            ctx.stroke();

            let innerY = y + 50;
            ctx.fillStyle = COLORS.accent;
            ctx.font = '700 15px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📍 UBICACIÓN', cardX + cardW / 2, innerY);

            innerY += 42;
            ctx.fillStyle = COLORS.ink;
            ctx.font = '700 28px Fraunces, serif';
            innerY = wrapText(ctx, loc.name, cardX + cardW / 2, innerY, cardW - 60, 34, { maxLines: 2 });

            if (loc.location_datetime) {
                innerY += 38;
                ctx.fillStyle = COLORS.inkSoft;
                ctx.font = '400 22px Inter, sans-serif';
                ctx.fillText(formatTime(loc.location_datetime), cardX + cardW / 2, innerY);
            }

            cardX += cardW + gap;
        });

        y += cardH + 60;

        // --- Invitado y cupos ---
        if (invitation) {
            ctx.fillStyle = COLORS.cardBg;
            ctx.strokeStyle = COLORS.cardBorder;
            drawRoundedRect(ctx, centerX - 380, y, 760, 150, 20);
            ctx.fill();
            ctx.stroke();

            let innerY = y + 48;
            ctx.fillStyle = COLORS.accent;
            ctx.font = '700 15px Inter, sans-serif';
            ctx.fillText('INVITADO ESPECIAL', centerX, innerY);

            innerY += 42;
            ctx.fillStyle = COLORS.ink;
            ctx.font = '700 32px Fraunces, serif';
            ctx.fillText(invitation.representative_name, centerX, innerY);

            innerY += 38;
            ctx.fillStyle = COLORS.inkSoft;
            ctx.font = '400 20px Inter, sans-serif';
            const slots = invitation.total_slots;
            ctx.fillText(`${slots} ${slots === 1 ? 'lugar reservado' : 'lugares reservados'}`, centerX, innerY);

            y += 150 + 55;
        }

        // --- Hashtag / cierre ---
        if (event.hashtag) {
            const chipText = event.hashtag;
            ctx.font = '600 24px Fraunces, serif';
            const chipW = ctx.measureText(chipText).width + 70;
            drawRoundedRect(ctx, centerX - chipW / 2, y, chipW, 58, 29);
            ctx.fillStyle = COLORS.chipBg;
            ctx.strokeStyle = COLORS.cardBorder;
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = COLORS.ink;
            ctx.textAlign = 'center';
            ctx.fillText(chipText, centerX, y + 38);
            y += 90;
        }

        ctx.fillStyle = COLORS.inkSoft;
        ctx.font = 'italic 400 22px Fraunces, serif';
        ctx.fillText('Con cariño te esperamos ✦', centerX, CANVAS_HEIGHT - 60);

        setImageUrl(canvas.toDataURL('image/png'));
        setGenerating(false);
    }

    async function handleShare() {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'mi-invitacion.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mi invitación',
                });
                return;
            }
        } catch (err) {
            // Si el usuario cancela o hay algún error menor, no se interrumpe el flujo
        }

        // Respaldo para navegadores de escritorio o sin soporte para compartir archivos
        window.open(imageUrl, '_blank');
    }

    return (
        <section className="section" style={{ textAlign: 'center' }}>
            <p className="section-eyebrow">Para compartir</p>
            <h2 className="section-title">Tu invitación</h2>
            <p className="section-lead">
                Genera una imagen con todos los detalles para guardarla o compartirla por WhatsApp.
            </p>

            <button className="btn btn--primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generando…' : '🎉 Generar mi invitación'}
            </button>

            {/* Canvas oculto para pintar la imagen */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {imageUrl && (
                <div className="invitation-card-preview">
                    <img src={imageUrl} alt="Tu invitación" style={{ maxWidth: '100%', height: 'auto' }} />

                    <div
                        className="btn-row"
                        style={{
                            marginTop: 16,
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Botón de descarga directa */}
                        <a className="btn btn--outline" href={imageUrl} download="mi-invitacion.png" style={{ textDecoration: 'none' }}>
                            📥 Descargar
                        </a>

                        {/* Botón para compartir nativo (WhatsApp, apps, etc.) */}
                        <button className="btn btn--outline" onClick={handleShare}>
                            📤 Compartir
                        </button>
                    </div>

                    <p className="text-sm text-muted" style={{ marginTop: 10 }}>
                        Si estás en un celular, también puedes mantener presionada la imagen para guardarla en tu galería.
                    </p>
                </div>
            )}
        </section>
    );
}