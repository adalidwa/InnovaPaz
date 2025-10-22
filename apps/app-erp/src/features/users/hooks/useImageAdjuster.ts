import { useState, useCallback, useEffect } from 'react';

export function useImageAdjuster(imageSrc: string, aspect: number = 1) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageSrc, aspect]);

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const resetAdjuster = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  return {
    crop,
    zoom,
    croppedAreaPixels,
    setCrop,
    setZoom,
    onCropComplete,
    setCroppedAreaPixels,
    resetAdjuster,
  };
}
