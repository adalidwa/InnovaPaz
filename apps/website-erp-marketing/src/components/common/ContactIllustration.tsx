import React from 'react';
import './ContactIllustration.css';
import contacto from '../../assets/images/contacto.svg';
interface ContactIllustrationProps {
  className?: string;
}

const ContactIllustration: React.FC<ContactIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`contact-illustration ${className}`}>
      <img
        src={contacto}
        alt='Ilustración de contacto - Persona señalando redes sociales'
        className='contact-illustration__image'
      />
    </div>
  );
};

export default ContactIllustration;
