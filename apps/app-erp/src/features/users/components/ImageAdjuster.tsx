import React from 'react';
import Cropper from 'react-easy-crop';
import { useImageAdjuster } from '../hooks/useImageAdjuster';
import getCroppedImage from '../utils/getCroppedImage';
import './ImageAdjuster.css';

interface Props {
  imageSrc: string;
  aspect?: number;
  onSave: (croppedImage: string) => void;
  onReset?: () => void;
}

const ImageAdjuster: React.FC<Props> = ({ imageSrc, aspect = 16 / 9, onSave, onReset }) => {
  const { crop, zoom, croppedAreaPixels, setCrop, setZoom, onCropComplete, resetAdjuster } =
    useImageAdjuster(imageSrc, aspect);

  const handleSave = async () => {
    const cropped = await getCroppedImage(imageSrc, croppedAreaPixels);
    onSave(cropped);
  };

  return (
    <div className='image-adjuster-container'>
      <div className='image-adjuster-cropper'>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape='rect'
          showGrid={true}
        />
      </div>
      <div className='image-adjuster-controls'>
        <label>
          Zoom
          <input
            type='range'
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
        <div className='image-adjuster-actions'>
          <button type='button' onClick={handleSave}>
            Guardar
          </button>
          {onReset && (
            <button
              type='button'
              onClick={() => {
                resetAdjuster();
                onReset();
              }}
            >
              Reajustar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAdjuster;
