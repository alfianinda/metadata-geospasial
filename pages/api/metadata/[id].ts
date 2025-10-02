import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid metadata ID' })
      }

      const token = req.headers.authorization?.replace('Bearer ', '')
      let userId: string | null = null
      let currentUser: any = null

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
          userId = decoded.userId
          // Get current user details
          if (userId) {
            currentUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { id: true, role: true }
            })
          }
        } catch {
          // Invalid token, continue without user context
        }
      }

      const metadata = await prisma.metadata.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          files: true,
          vocabularies: {
            include: {
              vocabulary: true
            }
          }
        }
      })

      if (!metadata) {
        return res.status(404).json({ message: 'Metadata tidak ditemukan' })
      }

      // Check if user can access this metadata
      // Allow access if: metadata is published OR user is authenticated
      if (!metadata.isPublished && !userId) {
        return res.status(403).json({ message: 'Anda tidak memiliki akses ke metadata ini' })
      }

      // Serialize BigInt fields to strings for JSON response
      const serializedMetadata = {
        ...metadata,
        fileSize: metadata.fileSize ? metadata.fileSize.toString() : null,
        files: metadata.files.map(file => ({
          ...file,
          size: file.size.toString()
        }))
      }

      return res.status(200).json(serializedMetadata)
    } catch (error) {
      console.error('Error fetching metadata:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid metadata ID' })
      }

      let decoded: any
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      } catch {
        return res.status(401).json({ message: 'Invalid token' })
      }

      const existingMetadata = await prisma.metadata.findUnique({
        where: { id },
        include: { user: true }
      })

      if (!existingMetadata) {
        return res.status(404).json({ message: 'Metadata tidak ditemukan' })
      }

      // Check if user can edit this metadata
      if (existingMetadata.userId !== decoded.userId && decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Anda tidak memiliki akses untuk mengedit metadata ini' })
      }

      const {
        // MD_Metadata Root
        fileIdentifier,
        language,
        characterSet,
        parentIdentifier,
        hierarchyLevel,
        hierarchyLevelName,
        contactName,
        contactEmail,
        dateStamp,
        metadataStandardName,
        metadataStandardVersion,
        dataSetURI,
        locale,

        // Basic Information
        title,
        abstract,
        purpose,
        status,
        updateFrequency,
        supplementalInfo,

        // Keywords and Topics
        keywords,
        topicCategory,
        themeKeywords,

        // Spatial Information
        coordinateSystem,
        geographicExtent,
        spatialResolution,

        // Temporal Information
        temporalStart,
        temporalEnd,

        // Responsible Parties
        contactOrganization,
        contactRole,
        contactPhone,
        contactAddress,
        metadataContactName,
        metadataContactEmail,
        metadataContactOrganization,

        // Distribution Information
        distributionFormat,
        distributor,
        onlineResource,
        transferOptions,
        graphicOverview,
        resourceFormat,
        resourceSpecificUsage,
        resourceConstraints,
        referenceSystemType,
        attributeDescription,

        // Data Quality
        scope,
        lineage,
        accuracy,
        completeness,
        consistency,

        // Constraints
        useConstraints,
        accessConstraints,
        otherConstraints,

        // Spatial Representation Information
        spatialRepresentationType,
        axisDimensionProperties,
        cellGeometry,
        georectified,
        georeferenceable,

        // Content Information
        contentType,

        // SNI Specific
        sniCompliant,
        sniVersion,
        sniStandard,
        bahasa,

        // Status
        isPublished,
        publishedAt
      } = req.body

      // Check if this is a publish status toggle (only isPublished and publishedAt provided)
      const isPublishToggle = Object.keys(req.body).length === 2 &&
                              'isPublished' in req.body &&
                              'publishedAt' in req.body

      // Validate required fields only if not a publish toggle
      // Skip title validation when unpublishing (isPublished = false)
      if (!isPublishToggle) {
        const missingFields = []
        if (!(isPublished === false && publishedAt === null) && !title?.trim()) {
          missingFields.push('Judul')
        }
        if (!abstract?.trim()) {
          missingFields.push('Abstrak')
        }
        if (!status?.trim()) {
          missingFields.push('Status')
        }
        if (!geographicExtent?.trim()) {
          missingFields.push('Extent')
        }
        if (!contactName?.trim()) {
          missingFields.push('Nama Kontak')
        }
        if (!contactEmail?.trim()) {
          missingFields.push('Email Kontak')
        }
        if (!spatialRepresentationType?.trim()) {
          missingFields.push('Spatial Representation Type')
        }
        if (!coordinateSystem?.trim()) {
          missingFields.push('Reference System Identifier')
        }
        if (!scope?.trim()) {
          missingFields.push('Scope')
        }

        if (missingFields.length > 0) {
          return res.status(400).json({
            message: `Lengkapi field berikut: ${missingFields.join(', ')}`,
            missingFields: missingFields
          })
        }
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date()
      }

      // For publish toggle, only update publish-related fields
      if (isPublishToggle) {
        updateData.isPublished = isPublished
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
      } else {
        // For full metadata update, include all fields
        // MD_Metadata Root
        updateData.fileIdentifier = fileIdentifier?.trim()
        updateData.language = language?.trim() || 'ind'
        updateData.characterSet = characterSet || 'utf8'
        updateData.parentIdentifier = parentIdentifier?.trim()
        updateData.hierarchyLevel = hierarchyLevel || 'dataset'
        updateData.hierarchyLevelName = hierarchyLevelName?.trim()
        updateData.contactName = contactName?.trim()
        updateData.contactEmail = contactEmail?.trim()
        updateData.dateStamp = dateStamp ? new Date(dateStamp) : null
        updateData.metadataStandardName = metadataStandardName?.trim() || 'ISO 19115'
        updateData.metadataStandardVersion = metadataStandardVersion?.trim() || '2003/Cor.1:2006'
        updateData.dataSetURI = dataSetURI?.trim()
        updateData.locale = locale?.trim() || 'id'

        // Basic Information
        updateData.title = title?.trim()
        updateData.abstract = abstract?.trim()
        updateData.purpose = purpose?.trim()
        updateData.status = status || 'completed'
        updateData.updateFrequency = updateFrequency || 'asNeeded'
        updateData.supplementalInfo = supplementalInfo?.trim()

        // Keywords and Topics
        updateData.keywords = keywords?.trim()
        updateData.topicCategory = topicCategory?.trim()
        updateData.themeKeywords = themeKeywords?.trim()

        // Spatial Information
        updateData.coordinateSystem = coordinateSystem?.trim() || 'WGS84'
        updateData.geographicExtent = geographicExtent?.trim()
        updateData.spatialResolution = spatialResolution?.trim()

        // Temporal Information
        updateData.temporalStart = temporalStart ? new Date(temporalStart) : null
        updateData.temporalEnd = temporalEnd ? new Date(temporalEnd) : null

        // Responsible Parties
        updateData.contactOrganization = contactOrganization?.trim()
        updateData.contactRole = contactRole?.trim() || 'pointOfContact'
        updateData.contactPhone = contactPhone?.trim()
        updateData.contactAddress = contactAddress?.trim()
        updateData.metadataContactName = metadataContactName?.trim()
        updateData.metadataContactEmail = metadataContactEmail?.trim()
        updateData.metadataContactOrganization = metadataContactOrganization?.trim()

        // Distribution Information
        updateData.distributionFormat = distributionFormat?.trim()
        updateData.dataFormat = req.body.dataFormat?.trim() || resourceFormat?.trim()
        updateData.distributor = distributor?.trim()
        updateData.onlineResource = onlineResource?.trim()
        updateData.transferOptions = transferOptions
        updateData.graphicOverview = graphicOverview?.trim()
        updateData.resourceSpecificUsage = resourceSpecificUsage?.trim()

        // Data Quality
        updateData.scope = scope || 'dataset'
        updateData.lineage = lineage?.trim()
        updateData.accuracy = accuracy?.trim()
        updateData.completeness = completeness?.trim()
        updateData.consistency = consistency?.trim()

        // Constraints
        updateData.useConstraints = useConstraints?.trim()
        updateData.accessConstraints = accessConstraints?.trim()
        updateData.otherConstraints = otherConstraints?.trim()
        updateData.resourceConstraints = resourceConstraints?.trim()

        // Spatial Representation Information
        updateData.spatialRepresentationType = spatialRepresentationType?.trim()
        updateData.axisDimensionProperties = axisDimensionProperties?.trim()
        updateData.cellGeometry = cellGeometry?.trim()
        updateData.georectified = georectified !== undefined ? georectified : false
        updateData.georeferenceable = georeferenceable !== undefined ? georeferenceable : false

        // Content Information
        updateData.contentType = contentType?.trim()

        // SNI Specific
        updateData.sniCompliant = sniCompliant !== undefined ? sniCompliant : true
        updateData.sniVersion = sniVersion?.trim() || '1.0'
        updateData.sniStandard = sniStandard?.trim() || 'SNI-ISO-19115-2019'
        updateData.bahasa = bahasa || 'id'

        // Additional fields that may be missing
        updateData.dateStamp = req.body.dateStamp ? new Date(req.body.dateStamp) : null
        updateData.dateType = req.body.dateType?.trim()
        updateData.verticalExtent = req.body.verticalExtent
        updateData.positionalAccuracy = req.body.positionalAccuracy?.trim()
        updateData.conformity = req.body.conformity
        updateData.referenceSystem = req.body.referenceSystem?.trim()
        updateData.referenceSystemType = referenceSystemType?.trim()
        updateData.projection = req.body.projection?.trim()
        updateData.featureTypes = req.body.featureTypes?.trim()
        updateData.attributeInfo = (() => {
          if (req.body.attributeInfo) {
            try {
              return JSON.parse(req.body.attributeInfo);
            } catch {
              return req.body.attributeInfo;
            }
          }
          if (attributeDescription) {
            try {
              return JSON.parse(attributeDescription);
            } catch {
              return { description: attributeDescription };
            }
          }
          return null;
        })()
        updateData.processingLevel = req.body.processingLevel?.trim()
        updateData.processingHistory = req.body.processingHistory?.trim()
        updateData.xmlContent = req.body.xmlContent?.trim()
        updateData.xmlSchema = req.body.xmlSchema?.trim()
        updateData.reviewStatus = req.body.reviewStatus?.trim() || 'draft'
        updateData.approvalDate = req.body.approvalDate ? new Date(req.body.approvalDate) : null
        updateData.ckanId = req.body.ckanId?.trim()
        updateData.ckanUrl = req.body.ckanUrl?.trim()
      }

      const updatedMetadata = await prisma.metadata.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          files: true
        }
      })

      // Serialize BigInt fields to strings for JSON response
      const serializedUpdatedMetadata = {
        ...updatedMetadata,
        fileSize: updatedMetadata.fileSize ? updatedMetadata.fileSize.toString() : null,
        files: updatedMetadata.files.map(file => ({
          ...file,
          size: file.size.toString()
        }))
      }

      return res.status(200).json(serializedUpdatedMetadata)
    } catch (error) {
      console.error('Error updating metadata:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid metadata ID' })
      }

      let decoded: any
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      } catch {
        return res.status(401).json({ message: 'Invalid token' })
      }

      const existingMetadata = await prisma.metadata.findUnique({
        where: { id },
        include: {
          user: true,
          files: true
        }
      })

      if (!existingMetadata) {
        return res.status(404).json({ message: 'Metadata tidak ditemukan' })
      }

      // Only admins can delete metadata
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Hanya admin yang dapat menghapus metadata' })
      }

      // Delete associated files from filesystem
      for (const file of existingMetadata.files) {
        try {
          const filePath = path.join(process.cwd(), 'uploads', file.path)
          await fs.unlink(filePath)
        } catch (error) {
          console.warn(`Failed to delete file ${file.path}:`, error)
        }
      }

      // Delete metadata (cascade will handle related records)
      await prisma.metadata.delete({
        where: { id }
      })

      return res.status(200).json({ message: 'Metadata berhasil dihapus' })
    } catch (error) {
      console.error('Error deleting metadata:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}