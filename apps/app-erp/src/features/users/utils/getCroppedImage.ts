export default async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: { width: number; height: number; x: number; y: number }
): Promise<string> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto de canvas');

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return canvas.toDataURL('image/png');
}
