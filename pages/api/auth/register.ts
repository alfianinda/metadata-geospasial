import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { authRateLimit, validateEmail, validatePassword, sanitizeInput, logSecurityEvent } from '@/lib/security'

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

  const { email, password, name } = req.body

  // Input validation and sanitization
  if (!email || !password) {
    logSecurityEvent('REGISTER_FAILED_MISSING_CREDENTIALS', { ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const sanitizedEmail = sanitizeInput(email)
  const sanitizedPassword = sanitizeInput(password)
  const sanitizedName = name ? sanitizeInput(name) : null

  if (!validateEmail(sanitizedEmail)) {
    logSecurityEvent('REGISTER_FAILED_INVALID_EMAIL', { email: sanitizedEmail, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
    return res.status(400).json({ message: 'Invalid email format' })
  }

  const passwordValidation = validatePassword(sanitizedPassword)
  if (!passwordValidation.isValid) {
    logSecurityEvent('REGISTER_FAILED_WEAK_PASSWORD', { email: sanitizedEmail, errors: passwordValidation.errors, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
    return res.status(400).json({
      message: 'Password does not meet requirements',
      errors: passwordValidation.errors
    })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      logSecurityEvent('REGISTER_FAILED_USER_EXISTS', { email: sanitizedEmail, ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
      return res.status(409).json({ message: 'User already exists' })
    }

    const hashedPassword = await hashPassword(sanitizedPassword)

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: sanitizedName
      }
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    logSecurityEvent('REGISTER_SUCCESSFUL', { email: sanitizedEmail, userId: user.id, name: sanitizedName })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    logSecurityEvent('REGISTER_ERROR', { email: sanitizedEmail, error: error instanceof Error ? error.message : 'Unknown error' })
    res.status(500).json({ message: 'Internal server error' })
  }
}