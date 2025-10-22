const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyFirebaseToken } = require('../controllers/auth.controller');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configurar multer para usar memoria (compatible con Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para Remove.bg
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
    }
  },
});

// Obtener clave API de Remove.bg con rotación automática
function getRemoveBgApiKey() {
  const keys = [
    process.env.REMOVEBG_API_KEY_0,
    process.env.REMOVEBG_API_KEY_1,
    process.env.REMOVEBG_API_KEY_2,
  ].filter((key) => key && key.trim() !== '');

  if (keys.length === 0) {
    throw new Error('No hay claves API de Remove.bg configuradas');
  }

  // Rotar claves basado en el timestamp (simple rotación)
  const keyIndex = Math.floor(Date.now() / (1000 * 60 * 60)) % keys.length;
  return keys[keyIndex];
}

// Endpoint para remover fondo de imagen
router.post('/remove-background', verifyFirebaseToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📸 [Remove.bg] Procesando solicitud de remoción de fondo');

    // Validación: archivo requerido
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo de imagen.',
      });
    }

    // Validación: tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).',
      });
    }

    // Validación: tamaño máximo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB.',
      });
    }

    // Obtener clave API
    const apiKey = getRemoveBgApiKey();
    console.log('🔑 [Remove.bg] Usando clave API (rotada)');

    // Preparar FormData para Remove.bg
    const formData = new FormData();
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('size', 'auto');

    // Llamar a Remove.bg API
    console.log('🌐 [Remove.bg] Enviando solicitud a Remove.bg API');
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [Remove.bg] Error de API:', response.status, errorData);

      return res.status(response.status).json({
        success: false,
        error: 'Error al procesar la imagen con Remove.bg',
        details: errorData,
      });
    }

    // Obtener imagen procesada
    const imageBuffer = await response.arrayBuffer();
    console.log('✅ [Remove.bg] Imagen procesada exitosamente');

    // Devolver imagen como base64 para el frontend
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      message: 'Fondo removido exitosamente',
      image_url: dataUrl,
      original_filename: req.file.originalname,
      processed_size: imageBuffer.byteLength,
    });
  } catch (error) {
    console.error('❌ [Remove.bg] Error interno:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al procesar la imagen',
      details: error.message,
    });
  }
});

// Endpoint para obtener información de la cuenta Remove.bg
router.get('/account-info', verifyFirebaseToken, async (req, res) => {
  try {
    const apiKey = getRemoveBgApiKey();

    const response = await fetch('https://api.remove.bg/v1.0/account', {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: 'Error al obtener información de la cuenta',
      });
    }

    const accountData = await response.json();

    res.json({
      success: true,
      account: accountData,
    });
  } catch (error) {
    console.error('❌ [Remove.bg] Error al obtener info de cuenta:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al obtener información de la cuenta',
    });
  }
});

module.exports = router;
