import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, getTokenFromRequest } from './auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    userId: string
    email: string
    role: string
  }
}

export const withAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void, requiredRole?: string) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = getTokenFromRequest(req)

      if (!token) {
        return res.status(401).json({ message: 'No token provided' })
      }

      const decoded = verifyToken(token)

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      if (requiredRole && decoded.role !== requiredRole && decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Insufficient permissions' })
      }

      (req as AuthenticatedRequest).user = decoded

      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}