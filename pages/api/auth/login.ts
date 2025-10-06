import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { authRateLimit, validateEmail, sanitizeInput, logSecurityEvent } from '@/lib/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting
  await new Promise<void>((resolve, reject) => {
    authRateLimit(req as any, res as any, (err: any) => {
      if (err) reject(err)
      else resolve()
    })
  })
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  // Input validation and sanitization
  if (!email || !password) {
    logSecurityEvent('LOGIN_FAILED_MISSING_CREDENTIALS', { ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const sanitizedEmail = sanitizeInput(email)
  const sanitizedPassword = sanitizeInput(password)

  if (!validateEmail(sanitizedEmail)) {
    logSecurityEvent('LOGIN_FAILED_INVALID_EMAIL', { email: sanitizedEmail, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
    return res.status(400).json({ message: 'Invalid email format' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (!user) {
      logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', { email: sanitizedEmail, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await verifyPassword(sanitizedPassword, user.password)

    if (!isValidPassword) {
      logSecurityEvent('LOGIN_FAILED_INVALID_PASSWORD', { email: sanitizedEmail, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    logSecurityEvent('LOGIN_SUCCESSFUL', { email: sanitizedEmail, userId: user.id, role: user.role })

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    logSecurityEvent('LOGIN_ERROR', { email: sanitizedEmail, error: error instanceof Error ? error.message : 'Unknown error' })
    res.status(500).json({ message: 'Internal server error' })
  }
}