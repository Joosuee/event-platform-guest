# Event Platform Guest (React + Vite)

Vista pública del invitado: el "sobre virtual" y toda la experiencia de la
invitación. Consume la misma API que el panel de organizador, pero solo usa
endpoints públicos por `token` de invitación (no requiere login).

## 1. Instalación

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu API no corre en localhost:4000
```

## 2. Ejecutar

Con la API corriendo y al menos un evento + una invitación ya creados desde el
panel de organizador:

```bash
npm run dev
```

Abre `http://localhost:5174/invite/<token>` (el token lo genera el panel de
organizador al crear una invitación).

## 3. Flujo

1. **Sobre cerrado** — primera vista siempre. Al tocarlo, se llama
   `POST /invitations/:token/open` y se revela el contenido.
2. **Hero + cuenta regresiva** — nombre del/los festejado(s), fecha, código de
   vestimenta, hashtag.
3. **Confirmación (RSVP)** — botones para confirmar/rechazar
   (`POST /invitations/:token/respond`), y una vez confirmada, un gestor de
   invitados que respeta el cupo (`total_slots`).
4. **Ubicaciones** y **Cronograma** — información logística y programa del evento.
5. **Sobre el festejado / personas involucradas** — bio y créditos.
6. **Galería — Instantáneas**: abre la cámara del dispositivo con un visor ya
   recortado a cuadrado (lo que ves es lo que se sube). Botón "Tomar
   instantánea" → captura → confirmar → sube directo a Cloudinary → se guarda
   pendiente de moderación.
7. **Galería — Recuerdos**: botón "Elegir de mi galería" abre el selector de
   fotos del dispositivo, el invitado elige horizontal o vertical, se recorta
   en el navegador y se sube igual que las instantáneas.
8. **Canciones** — recomendar canción y votar las existentes.
9. **Mesa de regalos** — ver disponibilidad y reservar.
10. **Muro de agradecimientos** — dejar un mensaje y ver los aprobados.

## 4. Personalización por evento (theme_json)

Cada evento puede traer un `theme_json` con algo como:

```json
{ "primaryColor": "#2f4b3c", "accentColor": "#b08d57", "backgroundColor": "#f6f3ea" }
```

`src/utils/applyTheme.js` lo aplica como variables CSS en tiempo de ejecución,
así que **el mismo código sirve para distintos festejados** solo cambiando esos
valores en la base de datos — coherente con la idea de vender la misma API con
un frontend con identidad propia por evento.

## 5. Cómo suben las fotos (Cloudinary)

La API nunca recibe el archivo binario. El flujo real es:

1. `src/api/interactivity.api.js` pide una firma a la API:
   `POST /events/:eventId/gallery/sign-upload`.
2. `src/api/uploadToCloudinary.js` sube el archivo **directo a Cloudinary**
   con esa firma (esta es la única función que arma un `FormData`, y va
   dirigida a Cloudinary, nunca a nuestra API).
3. Con la URL que devuelve Cloudinary, se llama a
   `POST /events/:eventId/gallery` con JSON normal (`file_url`,
   `cloudinary_public_id`, etc.) para guardar el registro.

`src/components/CameraCapture.jsx` maneja el acceso a la cámara
(`getUserMedia`) y el recorte cuadrado en vivo. `src/components/MemoryPhotoPicker.jsx`
maneja el selector de galería del dispositivo y el recorte horizontal/vertical.
Ambos requieren HTTPS en producción (los navegadores no dan acceso a la
cámara en HTTP salvo en `localhost`).

## 6. Pantalla de presentación (mural + instantáneas)

Ruta aparte, pensada para dejar abierta en una TV/laptop en la fiesta —
**no requiere token de invitación**, solo el `slug` del evento:

```
/pantalla/<slug-del-evento>
```

Alterna sola cada 45s entre **Mural** (contenido curado por el organizador,
`event_assets` tipo `mural`) e **Instantáneas en vivo** (aprobadas, se
actualiza sola cada 15s para que las fotos nuevas entren solas durante la
fiesta). También se puede cambiar de sección a mano con los botones de arriba.

## 7. Código de vestimenta

`DressCodeSection.jsx` muestra dos cosas juntas:
- El título general (`events.dress_code`, ej. "Formal", "Etiqueta rigurosa").
- Las imágenes de referencia que el organizador subió como `event_assets`
  tipo `dress_code` (puede haber varias — ej. el propio festejado modelando
  distintas opciones —, cada una con su propio título).

## 8. Notas

- El voto de canciones usa `localStorage` únicamente para no mostrar el botón
  ya presionado en el mismo navegador; la regla real que evita votos duplicados
  vive en el backend (`song_votes` con restricción única).
- Todas las acciones del invitado usan su `invitation_token`, nunca requieren
  crear una cuenta.
