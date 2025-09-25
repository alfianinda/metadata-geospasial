import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { generateMetadataXML } from '@/lib/xmlGenerator'
import { emailService } from '@/lib/emailService'
import jwt from 'jsonwebtoken'

// Test email endpoint for debugging
export async function testEmail(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { testEmail: recipientEmail } = req.body

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return res.status(400).json({ message: 'Valid email address is required' })
  }

  try {
    const testResult = await emailService.sendEmail({
      to: recipientEmail,
      subject: 'Test Email from Geospatial Metadata App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from your Geospatial Metadata Application.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('id-ID')}</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <br>
          <p>Best regards,<br>Geospatial Metadata Application</p>
        </div>
      `,
      attachments: []
    })

    if (testResult.success) {
      res.status(200).json({
        message: 'Test email sent successfully!',
        recipient: recipientEmail,
        note: testResult.message
      })
    } else {
      res.status(500).json({
        message: 'Test email failed',
        error: testResult.message
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Test email error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const { recipientEmail, format = 'iso19139' } = req.body

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return res.status(400).json({ message: 'Valid email address is required' })
  }

  try {
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userId = null

    console.log('Email API - Authorization header:', req.headers.authorization ? 'Present' : 'Missing')
    console.log('Email API - Token extracted:', token ? 'Present' : 'Missing')

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
        console.log('Email API - User authenticated:', userId)
      } catch (error) {
        console.log('Email API - JWT verification failed:', error)
        // Invalid token, treat as unauthenticated
      }
    } else {
      console.log('Email API - No token provided')
    }

    // Get metadata from database
    const metadata = await prisma.metadata.findUnique({
      where: { id },
      include: {
        files: true,
        user: { select: { id: true, email: true, name: true, role: true } }
      }
    })

    if (!metadata) {
      return res.status(404).json({ message: 'Metadata tidak ditemukan' })
    }

    // Check if user has permission to access this metadata
    if (!metadata.isPublished && metadata.userId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    // Convert null values to undefined for compatibility with MetadataData interface
    const metadataData = {
      ...metadata,
      abstract: metadata.abstract || undefined,
      purpose: metadata.purpose || undefined,
      status: metadata.status || undefined,
      updateFrequency: metadata.updateFrequency || undefined,
      keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : undefined,
      topicCategory: metadata.topicCategory || undefined,
      themeKeywords: metadata.themeKeywords ? metadata.themeKeywords.split(',').map(k => k.trim()) : undefined,
      boundingBox: metadata.boundingBox as any || undefined,
      spatialResolution: metadata.spatialResolution || undefined,
      coordinateSystem: metadata.coordinateSystem || undefined,
      geographicExtent: metadata.geographicExtent || undefined,
      temporalStart: metadata.temporalStart || undefined,
      temporalEnd: metadata.temporalEnd || undefined,
      dateType: metadata.dateType || undefined,
      dateStamp: metadata.dateStamp || undefined,
      contactName: metadata.contactName || undefined,
      contactEmail: metadata.contactEmail || undefined,
      contactOrganization: metadata.contactOrganization || undefined,
      contactRole: metadata.contactRole || undefined,
      contactPhone: metadata.contactPhone || undefined,
      contactAddress: metadata.contactAddress || undefined,
      metadataContactName: metadata.metadataContactName || undefined,
      metadataContactEmail: metadata.metadataContactEmail || undefined,
      metadataContactOrganization: metadata.metadataContactOrganization || undefined,
      distributionFormat: metadata.distributionFormat || undefined,
      onlineResource: metadata.onlineResource || undefined,
      transferOptions: metadata.transferOptions as any || undefined,
      lineage: metadata.lineage || undefined,
      accuracy: metadata.accuracy || undefined,
      completeness: metadata.completeness || undefined,
      consistency: metadata.consistency || undefined,
      useConstraints: metadata.useConstraints || undefined,
      accessConstraints: metadata.accessConstraints || undefined,
      otherConstraints: metadata.otherConstraints || undefined,
      featureCount: metadata.featureCount || undefined,
      fileSize: metadata.fileSize || undefined,
      geometryType: metadata.geometryType || undefined,
      dataFormat: metadata.dataFormat || undefined,
      processingLevel: metadata.processingLevel || undefined,
      sniCompliant: metadata.sniCompliant || undefined,
      sniVersion: metadata.sniVersion || undefined,
      sniStandard: metadata.sniStandard || undefined,
      bahasa: metadata.bahasa || undefined,
      fileIdentifier: metadata.id
    }

    // Generate XML
    const xmlContent = generateMetadataXML(metadataData, format as 'iso19139' | 'sni')

    // Send email
    const emailResult = await emailService.sendMetadataXML(
      recipientEmail,
      metadata.title,
      xmlContent,
      format as 'iso19139' | 'sni'
    )

    if (emailResult.success) {
      console.log('✅ Email API - Email sent successfully to:', recipientEmail)
      res.status(200).json({
        message: 'XML metadata sent successfully via email',
        recipient: recipientEmail,
        format: format,
        note: emailResult.message.includes('simulated') ? 'TEST MODE - Configure real SMTP credentials for actual delivery' : 'Email sent - check inbox and spam folder'
      })
    } else {
      console.log('❌ Email API - Failed to send email:', emailResult.message)
      res.status(500).json({
        message: 'Failed to send email',
        error: emailResult.message
      })
    }

  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({
      message: 'Failed to send XML via email',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}