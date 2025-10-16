import React from 'react';
import './ImageAdjusterPreview.css';

interface Props {
  image: string;
  size?: number;
}

const ImageAdjusterPreview: React.FC<Props> = ({ image, size = 64 }) => (
  <div className='image-adjuster-preview' style={{ width: size, height: size }}>
    <img src={image} alt='Vista previa' className='image-adjuster-preview-img' />
  </div>
);

export default ImageAdjusterPreview;
