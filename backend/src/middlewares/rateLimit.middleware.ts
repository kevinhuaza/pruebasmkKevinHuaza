import rateLimit from 'express-rate-limit';

// Limite general aplicado a toda la API: mitiga abuso/DoS basico por IP.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones, intenta de nuevo mas tarde' },
});

// Limite estricto para login/registro: dificulta fuerza bruta de credenciales.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de autenticacion, intenta mas tarde' },
});

// Limite especifico para carga de archivos: operacion costosa en CPU/disco.
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas cargas de archivos, intenta mas tarde' },
});
