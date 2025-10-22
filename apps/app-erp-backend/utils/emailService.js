/**
 * ================================================================
 * SERVICIO DE ENVÍO DE CORREOS
 * ================================================================
 *
 * Configuración flexible para desarrollo y producción:
 * - Desarrollo: MailDev (localhost:1025)
 * - Producción: Brevo/Resend/SendGrid
 *
 * Variables de entorno requeridas:
 * - EMAIL_PROVIDER: 'maildev' | 'brevo' | 'resend' | 'sendgrid'
 * - Para producción también:
 *   - EMAIL_API_KEY o SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

const nodemailer = require('nodemailer');

// Configuración según el proveedor
const EMAIL_PROVIDERS = {
  // Desarrollo local con MailDev
  maildev: {
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true,
    auth: false,
  },

  // Brevo (Sendinblue) - Recomendado para producción
  brevo: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    requiresAuth: true,
  },

  // Resend - Moderno y simple
  resend: {
    host: 'smtp.resend.com',
    port: 587,
    secure: false,
    requiresAuth: true,
  },

  // SendGrid - Opción alternativa
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    requiresAuth: true,
  },
};

/**
 * Crear transporter según configuración
 */
function createTransporter() {
  const provider = process.env.EMAIL_PROVIDER || 'maildev';
  const config = EMAIL_PROVIDERS[provider];

  if (!config) {
    throw new Error(`Proveedor de email no soportado: ${provider}`);
  }

  const transportConfig = {
    host: config.host,
    port: config.port,
    secure: config.secure,
  };

  // Agregar autenticación solo si es necesaria
  if (config.requiresAuth) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(`⚠️ ${provider} requiere SMTP_USER y SMTP_PASS en variables de entorno`);
    }

    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  if (config.ignoreTLS) {
    transportConfig.ignoreTLS = true;
  }

  console.log(`📧 Configurando transporter de correo: ${provider}`);

  return nodemailer.createTransport(transportConfig);
}

// Crear transporter al cargar el módulo
let transporter;
try {
  transporter = createTransporter();
} catch (error) {
  console.error('❌ Error al crear transporter de correo:', error.message);
}

/**
 * Enviar correo de invitación a un usuario
 */
async function sendInvitationEmail(email, invitationData) {
  const { token, empresaNombre, rolNombre, invitadoPor, frontendUrl } = invitationData;

  const invitationLink = `${frontendUrl}/invitation/accept?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Has sido invitado!</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p><strong>${invitadoPor}</strong> te ha invitado a unirte a <strong>${empresaNombre}</strong> en nuestro sistema ERP.</p>
          
          <div class="info-box">
            <p><strong>📋 Detalles de la invitación:</strong></p>
            <ul>
              <li><strong>Empresa:</strong> ${empresaNombre}</li>
              <li><strong>Rol asignado:</strong> ${rolNombre}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
          </div>

          <p>Para aceptar la invitación y configurar tu cuenta, haz clic en el siguiente botón:</p>
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Aceptar Invitación</a>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${invitationLink}">${invitationLink}</a>
          </p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
            ⏰ Este enlace expirará en 7 días por seguridad.
          </p>
        </div>
        <div class="footer">
          <p>Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
          <p>&copy; ${new Date().getFullYear()} ${empresaNombre}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    ¡Has sido invitado!
    
    ${invitadoPor} te ha invitado a unirte a ${empresaNombre} en nuestro sistema ERP.
    
    Detalles:
    - Empresa: ${empresaNombre}
    - Rol: ${rolNombre}
    - Email: ${email}
    
    Para aceptar, visita: ${invitationLink}
    
    Este enlace expirará en 7 días.
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@innovapaz.com',
    to: email,
    subject: `Invitación a ${empresaNombre} - Sistema ERP`,
    text: textContent,
    html: htmlContent,
  };

  try {
    if (!transporter) {
      throw new Error('Transporter de correo no inicializado');
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo de invitación enviado:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info), // Solo para MailDev/Ethereal
    };
  } catch (error) {
    console.error('❌ Error al enviar correo de invitación:', error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
}

/**
 * Enviar correo de bienvenida tras aceptar invitación
 */
async function sendWelcomeEmail(email, userData) {
  const { nombre, empresaNombre, rolNombre, frontendUrl } = userData;

  const loginLink = `${frontendUrl}/login`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 ¡Bienvenido a ${empresaNombre}!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Tu cuenta ha sido configurada exitosamente en nuestro sistema ERP.</p>
          
          <p><strong>📋 Información de tu cuenta:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Empresa:</strong> ${empresaNombre}</li>
            <li><strong>Rol:</strong> ${rolNombre}</li>
          </ul>

          <p>Ya puedes iniciar sesión y comenzar a trabajar:</p>
          
          <div style="text-align: center;">
            <a href="${loginLink}" class="button">Iniciar Sesión</a>
          </div>

          <p style="margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactar a tu administrador.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${empresaNombre}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@innovapaz.com',
    to: email,
    subject: `¡Bienvenido a ${empresaNombre}!`,
    html: htmlContent,
  };

  try {
    if (!transporter) {
      throw new Error('Transporter de correo no inicializado');
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo de bienvenida enviado:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error al enviar correo de bienvenida:', error);
    // No fallar si el correo de bienvenida falla
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verificar configuración de correo
 */
async function verifyEmailConfig() {
  try {
    if (!transporter) {
      return {
        status: 'error',
        message: 'Transporter no inicializado',
      };
    }

    await transporter.verify();

    return {
      status: 'ok',
      provider: process.env.EMAIL_PROVIDER || 'maildev',
      message: 'Configuración de correo válida',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      provider: process.env.EMAIL_PROVIDER || 'maildev',
    };
  }
}

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  verifyEmailConfig,
};
