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
    let user = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
        console.log('Decoded userId from token:', userId)
        // Get user details
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true }
        })
        console.log('User found:', user ? { id: user.id, role: user.role } : 'null')
      } catch (error) {
        console.error('Token verification failed:', error)
        // Invalid token, treat as unauthenticated
      }
    } else {
      console.log('No token provided in request headers')
    }

    // Get metadata from database
    console.log('Looking up metadata with id:', id)
    const metadata = await prisma.metadata.findUnique({
      where: { id },
      include: {
        files: true,
        user: { select: { id: true, email: true, name: true, role: true } }
      }
    })

    console.log('Metadata found:', metadata ? {
      id: metadata.id,
      title: metadata.title,
      isPublished: metadata.isPublished,
      userId: metadata.userId
    } : 'null')

    if (!metadata) {
      console.log('Metadata not found with id:', id)
      return res.status(404).json({ message: 'Metadata tidak ditemukan' })
    }

    // Check if user has permission to access this metadata
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
    console.log('Access control check:')
    console.log('- metadata.isPublished:', metadata.isPublished)
    console.log('- user?.role:', user?.role)
    console.log('- isAdmin:', isAdmin)
    console.log('- metadata.userId:', metadata.userId)
    console.log('- userId:', userId)
    console.log('- metadata.userId !== userId:', metadata.userId !== userId)

    // Allow access if: metadata is published OR user is admin OR user is the owner
    const hasAccess = metadata.isPublished || isAdmin || metadata.userId === userId
    console.log('- hasAccess:', hasAccess)

    if (!hasAccess) {
      console.log('Access denied: draft metadata, not admin, and not owner')
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    console.log('Access granted')

    // Convert null values to undefined for compatibility with MetadataData interface
     const metadataData = {
       ...metadata,
       // MD_Metadata (Root) fields
       fileIdentifier: metadata.fileIdentifier || metadata.id,
       language: metadata.language || undefined,
       characterSet: metadata.characterSet || undefined,
       parentIdentifier: metadata.parentIdentifier || undefined,
       hierarchyLevel: metadata.hierarchyLevel || undefined,
       hierarchyLevelName: metadata.hierarchyLevelName || undefined,
       contactName: metadata.contactName || undefined,
       contactEmail: metadata.contactEmail || undefined,
       dateStamp: metadata.dateStamp ? new Date(metadata.dateStamp) : undefined,
       metadataStandardName: metadata.metadataStandardName || undefined,
       metadataStandardVersion: metadata.metadataStandardVersion || undefined,
       dataSetURI: metadata.dataSetURI || undefined,
       locale: metadata.locale || undefined,

       // identificationInfo fields
       title: metadata.title,
       abstract: metadata.abstract || undefined,
       purpose: metadata.purpose || undefined,
       status: metadata.status || undefined,
       pointOfContact: metadata.pointOfContact || undefined,
       descriptiveKeywords: metadata.descriptiveKeywords || undefined,
       extent: metadata.geographicExtent || metadata.extent || undefined,
       additionalDocumentation: metadata.supplementalInfo || metadata.additionalDocumentation || undefined,
       processingLevel: metadata.processingLevel || undefined,
       resourceMaintenance: metadata.updateFrequency || metadata.resourceMaintenance || undefined,
       graphicOverview: metadata.graphicOverview || undefined,
       resourceFormat: metadata.dataFormat || metadata.resourceFormat || undefined,
       resourceSpecificUsage: metadata.resourceSpecificUsage || undefined,
       resourceConstraints: metadata.resourceConstraints || undefined,

       // spatialRepresentationInfo fields
       spatialRepresentationType: metadata.spatialRepresentationType || undefined,
       axisDimensionProperties: metadata.axisDimensionProperties || undefined,
       cellGeometry: metadata.cellGeometry || undefined,
       georectified: metadata.georectified || undefined,
       georeferenceable: metadata.georeferenceable || undefined,

       // referenceSystemInfo fields
       referenceSystemIdentifier: metadata.referenceSystemIdentifier || metadata.coordinateSystem || undefined,
       referenceSystemType: metadata.referenceSystemType || undefined,

       // contentInfo fields
       attributeDescription: (() => {
         if (metadata.attributeInfo) {
           if (typeof metadata.attributeInfo === 'string') {
             try {
               const parsed = JSON.parse(metadata.attributeInfo);
               return typeof parsed === 'object' && parsed.description ? parsed.description : JSON.stringify(parsed);
             } catch {
               return metadata.attributeInfo;
             }
           } else if (typeof metadata.attributeInfo === 'object') {
             return metadata.attributeInfo.description || JSON.stringify(metadata.attributeInfo);
           }
         }
         return metadata.attributeDescription || undefined;
       })(),
       contentType: metadata.contentType || undefined,

       // distributionInfo fields
       distributionFormat: metadata.distributionFormat || undefined,
       distributor: metadata.distributor || undefined,
       onlineResource: metadata.onlineResource || undefined,
       transferOptions: (() => {
         if (!metadata.transferOptions) return undefined;
         if (Array.isArray(metadata.transferOptions)) return metadata.transferOptions;
         if (typeof metadata.transferOptions === 'string') {
           try {
             const parsed = JSON.parse(metadata.transferOptions);
             return Array.isArray(parsed) ? parsed : undefined;
           } catch (e) {
             console.error('Failed to parse transferOptions:', metadata.transferOptions);
             return undefined;
           }
         }
         return undefined;
       })(),

       // dataQualityInfo fields
       scope: metadata.scope || undefined,
       lineage: metadata.lineage || undefined,
       accuracy: metadata.accuracy || undefined,
       completeness: metadata.completeness || undefined,
       consistency: metadata.consistency || undefined,

       // metadataConstraints fields
       useConstraints: metadata.useConstraints || undefined,
       accessConstraints: metadata.accessConstraints || undefined,
       otherConstraints: metadata.otherConstraints || undefined,

       // File info fields
       originalFileName: metadata.originalFileName || undefined,
       featureCount: metadata.featureCount || undefined,
       fileSize: metadata.fileSize ? Number(metadata.fileSize) : undefined,
       geometryType: metadata.geometryType || undefined,
       dataFormat: metadata.dataFormat || undefined,

       // SNI Specific
       sniCompliant: metadata.sniCompliant || undefined,
       sniVersion: metadata.sniVersion || undefined,
       sniStandard: metadata.sniStandard || undefined,
       bahasa: metadata.bahasa || undefined,

       // Legacy fields (keeping for backward compatibility)
       supplementalInfo: metadata.supplementalInfo || undefined,
       updateFrequency: metadata.updateFrequency || undefined,
       keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : undefined,
       topicCategory: metadata.topicCategory || undefined,
       themeKeywords: metadata.themeKeywords ? metadata.themeKeywords.split(',').map(k => k.trim()) : undefined,
       boundingBox: (() => {
         if (!metadata.boundingBox) return undefined;
         if (typeof metadata.boundingBox === 'object') return metadata.boundingBox;
         if (typeof metadata.boundingBox === 'string') {
           try {
             return JSON.parse(metadata.boundingBox);
           } catch (e) {
             console.error('Failed to parse boundingBox:', metadata.boundingBox);
             return undefined;
           }
         }
         return undefined;
       })(),
       spatialResolution: metadata.spatialResolution || undefined,
       coordinateSystem: metadata.coordinateSystem || undefined,
       geographicExtent: metadata.geographicExtent || undefined,
       temporalStart: metadata.temporalStart ? new Date(metadata.temporalStart) : undefined,
       temporalEnd: metadata.temporalEnd ? new Date(metadata.temporalEnd) : undefined,
       dateType: metadata.dateType || undefined,
       contactOrganization: metadata.contactOrganization || undefined,
       contactRole: metadata.contactRole || undefined,
       contactPhone: metadata.contactPhone || undefined,
       contactAddress: metadata.contactAddress || undefined,
       metadataContactName: metadata.metadataContactName || undefined,
       metadataContactEmail: metadata.metadataContactEmail || undefined,
       metadataContactOrganization: metadata.metadataContactOrganization || undefined,
       attributeInfo: (() => {
         if (!metadata.attributeInfo) return undefined;
         if (typeof metadata.attributeInfo === 'object') return metadata.attributeInfo;
         if (typeof metadata.attributeInfo === 'string') {
           try {
             return JSON.parse(metadata.attributeInfo);
           } catch (e) {
             console.error('Failed to parse attributeInfo:', metadata.attributeInfo);
             return undefined;
           }
         }
         return undefined;
       })()
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

    // For draft metadata, allow XML generation even with missing required fields for preview purposes
    const isDraft = !metadata.isPublished

    if (!isDraft) {
      // Validate required fields only for published metadata
      if (!metadataData.title?.trim()) {
        console.error('Validation error: Title is required for published metadata')
        return res.status(400).json({ message: 'Title is required for XML generation' })
      }

      if (!metadataData.contactEmail?.trim()) {
        console.error('Validation error: Contact email is required for published metadata')
        return res.status(400).json({ message: 'Contact email is required for XML generation' })
      }
    }

    console.log(`Generating metadata for format: ${format} -> ${contentFormat}`)
    console.log(`Metadata data:`, JSON.stringify(metadataData, null, 2))

    try {
      const xmlContent = generateMetadataXML(metadataData, contentFormat)
      console.log(`Generated content type: ${contentFormat}, length: ${xmlContent.length}`)
      console.log(`Content starts with: ${xmlContent.substring(0, 100)}...`)
    } catch (xmlError) {
      console.error('XML generation error:', xmlError)
      return res.status(500).json({ message: 'Failed to generate XML: ' + (xmlError as Error).message })
    }

    const xmlContent = generateMetadataXML(metadataData, contentFormat)

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