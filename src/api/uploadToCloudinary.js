// Sube un archivo DIRECTO a Cloudinary (nunca pasa por nuestra API) usando
// una firma ya generada por el backend (ver api de sign-upload).
// Devuelve { url, publicId } — eso es lo único que se manda después a
// nuestra API como JSON normal.
export async function uploadToCloudinary(file, signature) {
  const { cloud_name, api_key, timestamp, signature: sig, folder, transformation } = signature;

  const body = new FormData();
  body.append('file', file, file.name || 'upload.jpg');
  body.append('api_key', api_key);
  body.append('timestamp', timestamp);
  body.append('signature', sig);
  body.append('folder', folder);
  if (transformation) body.append('transformation', transformation);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`, {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`No se pudo subir la imagen a Cloudinary. ${errText}`);
  }

  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id };
}
