import { useState } from 'react';
import { galleryApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';
import CameraCapture from './CameraCapture';
import MemoryPhotoPicker from './MemoryPhotoPicker';

function PhotoGrid({ photos }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="gallery-grid">
      {photos.map((p) => (
        <img key={p.media_id} src={p.file_url} alt={p.caption || 'Foto del evento'} loading="lazy" />
      ))}
    </div>
  );
}

export default function GallerySection({ eventId, token, guestName }) {
  const { data: instantPhotos, loading: loadingInstant, reload: reloadInstant } =
    useApi(() => galleryApi.listApproved(eventId, 'instantanea'), [eventId]);
  const { data: memoryPhotos, loading: loadingMemory, reload: reloadMemory } =
    useApi(() => galleryApi.listApproved(eventId, 'recuerdo'), [eventId]);

  const [showCamera, setShowCamera] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleInstantCapture(blob) {
    setShowCamera(false);
    setUploading(true);
    setError(null);
    try {
      await galleryApi.upload(eventId, blob, {
        category: 'instantanea',
        invitation_token: token,
        uploaded_by_name: guestName,
      });
      setSuccess('instant');
      reloadInstant();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleMemoryCapture(blob, orientation) {
    setShowPicker(false);
    setUploading(true);
    setError(null);
    try {
      await galleryApi.upload(eventId, blob, {
        category: 'recuerdo',
        orientation,
        invitation_token: token,
        uploaded_by_name: guestName,
      });
      setSuccess('memory');
      reloadMemory();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* ---------- Instantáneas ---------- */}
      <section className="section">
        <p className="section-eyebrow">En vivo</p>
        <h2 className="section-title">Instantáneas</h2>
        <p className="section-lead">
          Toma una foto ahora mismo con tu cámara — se recorta cuadrada y aparece aquí
          en cuanto sea aprobada.
        </p>

        {error && <div className="banner-error">{error}</div>}
        {success === 'instant' && <div className="banner-success">¡Instantánea enviada! 📸</div>}

        <div className="btn-row">
          <button className="btn btn--primary" onClick={() => setShowCamera(true)} disabled={uploading}>
            📷 Tomar instantánea
          </button>
        </div>

        {!loadingInstant && <PhotoGrid photos={instantPhotos} />}
      </section>

      {/* ---------- Recuerdos ---------- */}
      <section className="section">
        <p className="section-eyebrow">De antes</p>
        <h2 className="section-title">Recuerdos</h2>
        <p className="section-lead">
          Comparte una foto de antes con el/la festejado/a — elige si va horizontal o vertical.
        </p>

        {success === 'memory' && <div className="banner-success">¡Recuerdo compartido! 💛</div>}

        <div className="btn-row">
          <button className="btn btn--outline" onClick={() => setShowPicker(true)} disabled={uploading}>
            🖼️ Elegir de mi galería
          </button>
        </div>

        {!loadingMemory && <PhotoGrid photos={memoryPhotos} />}
      </section>

      {showCamera && (
        <CameraCapture onCapture={handleInstantCapture} onClose={() => setShowCamera(false)} />
      )}
      {showPicker && (
        <MemoryPhotoPicker onCapture={handleMemoryCapture} onClose={() => setShowPicker(false)} />
      )}
    </>
  );
}
