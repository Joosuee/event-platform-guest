import { useRef, useState } from 'react';

export default function MemoryPhotoPicker({ onCapture, onClose }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleConfirm() {
    if (file) onCapture(file);
  }

  return (
    <div className="memory-picker-overlay">
      <div className="camera-overlay__header" style={{ color: 'var(--color-ink)' }}>
        <span>Recuerdo</span>
        <button className="camera-overlay__close" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }} onClick={onClose}>✕</button>
      </div>

      {!previewUrl ? (
        <div className="section" style={{ textAlign: 'center', paddingTop: 40 }}>
          <p className="section-lead">Elige una foto de tu galería para recordar este momento.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="btn btn--primary" onClick={() => inputRef.current?.click()}>
            Elegir de mi galería
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 12 }}>
          <div className="memory-preview">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img src={previewUrl} alt="Foto seleccionada" />
          </div>

          <div className="btn-row">
            <button className="btn btn--outline" onClick={() => { setFile(null); setPreviewUrl(null); }}>
              Elegir otra
            </button>
            <button className="btn btn--primary" onClick={handleConfirm}>Usar esta foto</button>
          </div>
        </div>
      )}
    </div>
  );
}