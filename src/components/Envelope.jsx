import { useState } from 'react';

export default function Envelope({ representativeName, cupos, onOpen }) {
  const [opening, setOpening] = useState(false);

  function handleClick() {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, 650); // deja correr la animación antes de mostrar el contenido
  }

  return (
    <div className="envelope-screen">
      <p className="section-eyebrow color">XV de Fernanda</p>


      <button
        onClick={handleClick}
        className='btn'
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}>
        Abrir invitación</button>

      {representativeName && (
        <div>
          <p className="envelope-screen__to">Para: {representativeName}</p>
          <p className="envelope-screen__to">Cupos: {cupos}</p>
        </div>
      )}
    </div>
  );
}
