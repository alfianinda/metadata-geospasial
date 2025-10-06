import rateLimit from 'express-rate-limit'
import cors from 'cors'

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'), // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiting for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '10'), // limit each IP to 10 uploads per hour
  message: {
    error: 'Upload rate limit exceeded',
    message: 'Too many file uploads from this IP, please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// CORS configuration
export const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.NEXTAUTH_URL,
      // Add production domains from environment
      ...(process.env.CORS_ORIGINS?.split(',') || [])
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logSecurityEvent('CORS_BLOCKED', { origin, allowedOrigins })
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
}

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

// File type validation with magic number checking
export const validateFileContent = (buffer: Buffer, mimetype: string, filename: string): boolean => {
  // Check file signatures (magic numbers)
  const signatures = {
    'application/json': [[0x7B]], // {
    'application/zip': [[0x50, 0x4B, 0x03, 0x04]], // PK..
    'application/x-rar-compressed': [[0x52, 0x61, 0x72, 0x21]], // Rar!
  }

  const expectedSignature = signatures[mimetype as keyof typeof signatures]
  if (!expectedSignature) return true // Skip validation for unknown types

  return expectedSignature.some(sig =>
    sig.every((byte, index) => buffer[index] === byte)
  )
}

// Security logging
export const logSecurityEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString()
  console.log(`[SECURITY ${timestamp}] ${event}:`, details)
}

// Request size validation
export const validateRequestSize = (contentLength: string | undefined, maxSize: number = 10 * 1024 * 1024): boolean => {
  if (!contentLength) return true

  const size = parseInt(contentLength, 10)
  return size <= maxSize
}