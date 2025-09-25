import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { generateMetadataXML } from '@/lib/xmlGenerator'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const { format = 'iso19139', preview = 'false' } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  try {
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
      } catch (error) {
        // Invalid token, treat as unauthenticated
      }
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

    // Generate XML/JSON based on format
    let contentFormat: 'iso19139' | 'sni-json' | 'sni-xml'
    if (format === 'iso19139') {
      contentFormat = 'iso19139'
    } else if (format === 'sni') {
      contentFormat = 'sni-json'  // SNI JSON format
    } else if (format === 'sni-xml') {
      contentFormat = 'sni-xml'   // SNI XML format
    } else {
      contentFormat = 'iso19139'
    }

    console.log(`Generating metadata for format: ${format} -> ${contentFormat}`)
    const xmlContent = generateMetadataXML(metadataData, contentFormat)
    console.log(`Generated content type: ${contentFormat}, length: ${xmlContent.length}`)
    console.log(`Content starts with: ${xmlContent.substring(0, 100)}...`)

    // Check if this is a preview request (from detail page)
    if (preview === 'true') {
      // For preview, return content as text without download headers
      if (format === 'sni') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      } else {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      }
      res.status(200).send(xmlContent)
    } else {
      // For download, set appropriate headers
      if (format === 'sni') {
        const fileName = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.json`
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      } else {
        const fileName = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.xml`
        res.setHeader('Content-Type', 'application/xml')
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      }
      res.setHeader('Content-Length', Buffer.byteLength(xmlContent, 'utf8'))
      res.status(200).send(xmlContent)
    }

  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ message: 'Failed to generate XML for download' })
  }
}