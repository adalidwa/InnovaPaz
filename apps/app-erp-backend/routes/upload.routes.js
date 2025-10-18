const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinaryConfig');

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Ruta para subir imagen
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen',
      });
    }

    // Convertir buffer a base64 para Cloudinary
    const base64String = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64String}`;

    // Configurar opciones de upload
    const uploadOptions = {
      folder: 'innovapaz/products',
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      ],
      resource_type: 'image',
    };

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      },
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);

    // Manejo específico de errores
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({
        success: false,
        message: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)',
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al subir la imagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Ruta para eliminar imagen (opcional)
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    // Eliminar de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada',
      });
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
