const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
  } else {
    console.log('✅ Conexión exitosa con Cloudinary:', result.status);
  }
});

module.exports = cloudinary;
