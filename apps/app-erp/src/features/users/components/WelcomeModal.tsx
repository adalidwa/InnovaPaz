import React, { useEffect, useState } from 'react';
import './WelcomeModal.css';

const NUM_CONFETTI = 48;

const ConfettiRain = () => {
  function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const confettiElements = Array.from({ length: NUM_CONFETTI }).map((_, i) => {
    const left = getRandom(0, 98);
    const delay = getRandom(0, 4);
    const colors = [
      'var(--acc-600, #fb5a2e)',
      'var(--sec-700, #4ad0c9)',
      'var(--pri-500, #8d89ad)',
      'var(--var-700, #ccc433)',
      'var(--pri-900, #242231)',
      'var(--sec-900, #2ca8a1)',
      'var(--acc-100, #fee1d9)',
      'var(--sec-400, #bbedeb)',
    ];
    const color = colors[i % colors.length];
    return (
      <div
        key={i}
        className='confetti-piece'
        style={{
          left: `${left}vw`,
          background: color,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return <>{confettiElements}</>;
};

interface Props {
  user: { nombre_completo: string; nombre_empresa: string };
}

const WelcomeModal: React.FC<Props> = ({ user }) => {
  const [show, setShow] = useState(true);
  const [animateUp, setAnimateUp] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateUp(true), 7000);
    const t2 = setTimeout(() => setShow(false), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div className='bienvenida-modal-top-overlay'>
      <div className={`bienvenida-modal-group${animateUp ? ' animate-up' : ''}`}>
        <div className='confetti'>
          <ConfettiRain />
        </div>
        <div className='bienvenida-modal-float'>
          <div className='bienvenida-modal-content'>
            <h2 className='bienvenida-modal-title'>
              ¡Bienvenido,{' '}
              <span className='bienvenida-modal-highlight'>{user.nombre_completo}</span>!<br />
              Nos alegra tenerte en{' '}
              <span className='bienvenida-modal-highlight'>{user.nombre_empresa}</span>.
            </h2>
            <p className='bienvenida-modal-msg'>
              Esperamos que disfrutes la experiencia y aproveches todas las funcionalidades de
              INNOVAPAZ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
