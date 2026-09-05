const DRESS_IMAGE_URL = 'https://res.cloudinary.com/dlu7i4umd/image/upload/v1788649719/vestido_referencia_hzhrqh.jpg';

export default function DressReferenceNotice() {
  return (
    <div className="dress-notice">
      <img
        src={DRESS_IMAGE_URL}
        alt="Vestido de referencia"
        className="dress-notice__image"
      />
      <p className="dress-notice__title">Vestido de referencia</p>
      <p className="dress-notice__text">
        Para que este look resalte en las fotos, te pedimos amablemente
        <strong> evitar vestir de este mismo color</strong> el día del evento.
        ¡Gracias por tu comprensión! 💛
      </p>
    </div>
  );
}