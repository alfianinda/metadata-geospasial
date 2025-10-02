import { create } from 'xmlbuilder2'

interface MetadataData {
  // Basic Information
  title: string
  abstract?: string
  purpose?: string
  status?: string
  updateFrequency?: string

  // Identification Information
  parentIdentifier?: string
  hierarchyLevel?: string
  hierarchyLevelName?: string
  characterSet?: string
  supplementalInfo?: string

  // Keywords and Topics
  keywords?: string[]
  topicCategory?: string
  themeKeywords?: string[]

  // Spatial Information
  boundingBox?: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    crs?: string
  }
  spatialResolution?: string
  coordinateSystem?: string
  geographicExtent?: string

  // Temporal Information
  temporalStart?: Date
  temporalEnd?: Date
  dateType?: string
  dateStamp?: Date

  // Responsible Parties
  contactName?: string
  contactEmail?: string
  contactOrganization?: string
  contactRole?: string
  contactPhone?: string
  contactAddress?: string

  metadataContactName?: string
  metadataContactEmail?: string
  metadataContactOrganization?: string

  // Distribution
  distributionFormat?: string
  distributor?: string
  onlineResource?: string
  transferOptions?: Array<{
    protocol: string
    name: string
    description: string
    url: string
  }>

  // Quality
  scope?: string
  lineage?: string
  accuracy?: string
  completeness?: string
  consistency?: string
  conformity?: any

  // Constraints
  useConstraints?: string
  accessConstraints?: string
  otherConstraints?: string

  // Technical
  featureCount?: number
  fileSize?: number
  geometryType?: string
  dataFormat?: string
  processingLevel?: string

  // Spatial Representation
  spatialRepresentationType?: string
  axisDimensionProperties?: string
  cellGeometry?: string
  georectified?: boolean
  georeferenceable?: boolean

  // Reference System
  referenceSystemIdentifier?: string
  referenceSystemType?: string

  // Content Info
  attributeDescription?: string
  contentType?: string

  // Additional Identification Info
  pointOfContact?: string
  descriptiveKeywords?: string
  additionalDocumentation?: string
  resourceMaintenance?: string
  graphicOverview?: string
  resourceFormat?: string
  resourceSpecificUsage?: string
  resourceConstraints?: string

  // File Info
  originalFileName?: string

  // SNI Specific
  sniCompliant?: boolean
  sniVersion?: string
  sniStandard?: string
  bahasa?: string

  // Identifiers
  fileIdentifier?: string
}

export function generateISO19139XML(metadata: MetadataData): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('gmd:MD_Metadata', {
      'xmlns:gmd': 'http://www.isotc211.org/2005/gmd',
      'xmlns:gco': 'http://www.isotc211.org/2005/gco',
      'xmlns:gml': 'http://www.opengis.net/gml',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    })

  // File Identifier
  root.ele('gmd:fileIdentifier')
    .ele('gco:CharacterString')
    .txt(metadata.fileIdentifier || `urn:uuid:${Date.now()}`)

  // Language
  root.ele('gmd:language')
    .ele('gco:CharacterString')
    .txt(metadata.bahasa === 'EN' ? 'eng' : 'ind')

  // Character Set
  root.ele('gmd:characterSet')
    .ele('gmd:MD_CharacterSetCode', { codeListValue: 'utf8' })
    .txt('utf8')

  // Parent Identifier (if exists)
  if (metadata.parentIdentifier) {
    root.ele('gmd:parentIdentifier')
      .ele('gco:CharacterString')
      .txt(metadata.parentIdentifier)
  }

  // Hierarchy Level
  root.ele('gmd:hierarchyLevel')
    .ele('gmd:MD_ScopeCode', { codeListValue: 'dataset' })
    .txt('dataset')

  // Hierarchy Level Name
  root.ele('gmd:hierarchyLevelName')
    .ele('gco:CharacterString')
    .txt('Dataset')

  // Contact (Data Owner) - Always generate for valid XML
  const contact = root.ele('gmd:contact')
    .ele('gmd:CI_ResponsibleParty')

  if (metadata.contactName) {
    contact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt(metadata.contactName)
  } else {
    // Fallback for draft metadata
    contact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt('Unknown Contact')
  }

  if (metadata.contactOrganization) {
    contact.ele('gmd:organisationName')
      .ele('gco:CharacterString')
      .txt(metadata.contactOrganization)
  }

  // Contact Info - Always generate with fallback
  const contactInfo = contact.ele('gmd:contactInfo')
    .ele('gmd:CI_Contact')

  const address = contactInfo.ele('gmd:address')
    .ele('gmd:CI_Address')

  if (metadata.contactEmail) {
    address.ele('gmd:electronicMailAddress')
      .ele('gco:CharacterString')
      .txt(metadata.contactEmail)
  } else {
    // Fallback for draft metadata
    address.ele('gmd:electronicMailAddress')
      .ele('gco:CharacterString')
      .txt('contact@example.com')
  }

  if (metadata.contactAddress) {
    address.ele('gmd:deliveryPoint')
      .ele('gco:CharacterString')
      .txt(metadata.contactAddress)
  }

  contact.ele('gmd:role')
    .ele('gmd:CI_RoleCode', { codeListValue: metadata.contactRole || 'pointOfContact' })
    .txt(metadata.contactRole || 'pointOfContact')

  // Date Stamp
  root.ele('gmd:dateStamp')
    .ele('gco:DateTime')
    .txt((metadata.dateStamp || new Date()).toISOString())

  // Metadata Standard
  root.ele('gmd:metadataStandardName')
    .ele('gco:CharacterString')
    .txt('ISO 19115:2003/19139')

  root.ele('gmd:metadataStandardVersion')
    .ele('gco:CharacterString')
    .txt('1.0')

  // Reference System Info
  if (metadata.coordinateSystem) {
    const referenceSystem = root.ele('gmd:referenceSystemInfo')
      .ele('gmd:MD_ReferenceSystem')

    referenceSystem.ele('gmd:referenceSystemIdentifier')
      .ele('gmd:RS_Identifier')
      .ele('gmd:code')
      .ele('gco:CharacterString')
      .txt(metadata.coordinateSystem)
  }

  // Identification Info
  const identification = root.ele('gmd:identificationInfo')
    .ele('gmd:MD_DataIdentification')

  // Citation
  const citation = identification.ele('gmd:citation')
    .ele('gmd:CI_Citation')

  citation.ele('gmd:title')
    .ele('gco:CharacterString')
    .txt(metadata.title || 'Untitled Dataset')

  // Citation Date
  const citationDate = citation.ele('gmd:date')
    .ele('gmd:CI_Date')

  citationDate.ele('gmd:date')
    .ele('gco:Date')
    .txt((metadata.dateStamp || new Date()).toISOString().split('T')[0])

  citationDate.ele('gmd:dateType')
    .ele('gmd:CI_DateTypeCode', { codeListValue: metadata.dateType || 'creation' })
    .txt(metadata.dateType || 'creation')

  // Abstract
  if (metadata.abstract) {
    identification.ele('gmd:abstract')
      .ele('gco:CharacterString')
      .txt(metadata.abstract)
  }

  // Purpose
  if (metadata.purpose) {
    identification.ele('gmd:purpose')
      .ele('gco:CharacterString')
      .txt(metadata.purpose)
  }

  // Status
  if (metadata.status) {
    identification.ele('gmd:status')
      .ele('gmd:MD_ProgressCode', { codeListValue: metadata.status.toLowerCase() })
      .txt(metadata.status.toLowerCase())
  }

  // Point of Contact
  if (metadata.pointOfContact) {
    const pointOfContact = identification.ele('gmd:pointOfContact')
      .ele('gmd:CI_ResponsibleParty')

    pointOfContact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt(metadata.pointOfContact)

    pointOfContact.ele('gmd:role')
      .ele('gmd:CI_RoleCode', { codeListValue: 'pointOfContact' })
      .txt('pointOfContact')
  }

  // Keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    const descriptiveKeywords = identification.ele('gmd:descriptiveKeywords')
      .ele('gmd:MD_Keywords')

    metadata.keywords.forEach(keyword => {
      descriptiveKeywords.ele('gmd:keyword')
        .ele('gco:CharacterString')
        .txt(keyword)
    })

    descriptiveKeywords.ele('gmd:type')
      .ele('gmd:MD_KeywordTypeCode', { codeListValue: 'theme' })
      .txt('theme')
  }

  // Descriptive Keywords (additional keywords field)
  if (metadata.descriptiveKeywords) {
    const descriptiveKeywords = identification.ele('gmd:descriptiveKeywords')
      .ele('gmd:MD_Keywords')

    metadata.descriptiveKeywords.split(',').forEach(keyword => {
      descriptiveKeywords.ele('gmd:keyword')
        .ele('gco:CharacterString')
        .txt(keyword.trim())
    })

    descriptiveKeywords.ele('gmd:type')
      .ele('gmd:MD_KeywordTypeCode', { codeListValue: 'theme' })
      .txt('theme')
  }

  // Topic Category
  if (metadata.topicCategory) {
    identification.ele('gmd:topicCategory')
      .ele('gmd:MD_TopicCategoryCode')
      .txt(metadata.topicCategory.toLowerCase())
  }

  // Spatial Resolution
  if (metadata.spatialResolution) {
    identification.ele('gmd:spatialResolution')
      .ele('gmd:MD_Resolution')
      .ele('gmd:distance')
      .ele('gco:Distance', { uom: 'meter' })
      .txt(metadata.spatialResolution)
  }

  // Language
  identification.ele('gmd:language')
    .ele('gco:CharacterString')
    .txt(metadata.bahasa === 'EN' ? 'eng' : 'ind')

  // Character Set
  identification.ele('gmd:characterSet')
    .ele('gmd:MD_CharacterSetCode', { codeListValue: 'utf8' })
    .txt('utf8')

  // Extent
  if (metadata.boundingBox) {
    const extent = identification.ele('gmd:extent')
      .ele('gmd:EX_Extent')

    if (metadata.geographicExtent) {
      extent.ele('gmd:description')
        .ele('gco:CharacterString')
        .txt(metadata.geographicExtent)
    }

    const bbox = extent.ele('gmd:geographicElement')
      .ele('gmd:EX_GeographicBoundingBox')

    bbox.ele('gmd:westBoundLongitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.minX.toString())

    bbox.ele('gmd:eastBoundLongitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.maxX.toString())

    bbox.ele('gmd:southBoundLatitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.minY.toString())

    bbox.ele('gmd:northBoundLatitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.maxY.toString())
  }

  // Temporal Extent
  if (metadata.temporalStart || metadata.temporalEnd) {
    const extent = identification.ele('gmd:extent')
      .ele('gmd:EX_Extent')

    const temporalElement = extent.ele('gmd:temporalElement')
      .ele('gmd:EX_TemporalExtent')

    const timePeriod = temporalElement.ele('gmd:extent')
      .ele('gml:TimePeriod', { 'gml:id': `TP${Date.now()}` })

    if (metadata.temporalStart) {
      timePeriod.ele('gml:beginPosition')
        .txt(metadata.temporalStart.toISOString())
    }

    if (metadata.temporalEnd) {
      timePeriod.ele('gml:endPosition')
        .txt(metadata.temporalEnd.toISOString())
    }
  }

  // Additional Documentation
  if (metadata.additionalDocumentation) {
    identification.ele('gmd:supplementalInformation')
      .ele('gco:CharacterString')
      .txt(metadata.additionalDocumentation)
  }

  // Processing Level
  if (metadata.processingLevel) {
    identification.ele('gmd:processingLevel')
      .ele('gmd:MD_Identifier')
      .ele('gmd:code')
      .ele('gco:CharacterString')
      .txt(metadata.processingLevel)
  }

  // Resource Maintenance
  if (metadata.resourceMaintenance) {
    const maintenance = identification.ele('gmd:resourceMaintenance')
      .ele('gmd:MD_MaintenanceInformation')

    maintenance.ele('gmd:maintenanceAndUpdateFrequency')
      .ele('gmd:MD_MaintenanceFrequencyCode', { codeListValue: 'asNeeded' })
      .txt('asNeeded')

    maintenance.ele('gmd:maintenanceNote')
      .ele('gco:CharacterString')
      .txt(metadata.resourceMaintenance)
  }

  // Graphic Overview
  if (metadata.graphicOverview) {
    const graphicOverview = identification.ele('gmd:graphicOverview')
      .ele('gmd:MD_BrowseGraphic')

    graphicOverview.ele('gmd:fileName')
      .ele('gco:CharacterString')
      .txt(metadata.graphicOverview)

    graphicOverview.ele('gmd:fileDescription')
      .ele('gco:CharacterString')
      .txt('Graphic overview of the dataset')
  }

  // Resource Format
  if (metadata.resourceFormat) {
    identification.ele('gmd:resourceFormat')
      .ele('gmd:MD_Format')
      .ele('gmd:name')
      .ele('gco:CharacterString')
      .txt(metadata.resourceFormat)
  }

  // Resource Specific Usage
  if (metadata.resourceSpecificUsage) {
    const usage = identification.ele('gmd:resourceSpecificUsage')
      .ele('gmd:MD_Usage')

    usage.ele('gmd:specificUsage')
      .ele('gco:CharacterString')
      .txt(metadata.resourceSpecificUsage)

    usage.ele('gmd:userContactInfo')
      .ele('gmd:CI_ResponsibleParty')
      .ele('gmd:role')
      .ele('gmd:CI_RoleCode', { codeListValue: 'user' })
      .txt('user')
  }

  // Resource Constraints
  if (metadata.resourceConstraints) {
    const constraints = identification.ele('gmd:resourceConstraints')
      .ele('gmd:MD_LegalConstraints')

    constraints.ele('gmd:useLimitation')
      .ele('gco:CharacterString')
      .txt(metadata.resourceConstraints)
  }

  // Content Info
  if (metadata.attributeDescription || metadata.contentType) {
    const contentInfo = root.ele('gmd:contentInfo')
      .ele('gmd:MD_FeatureCatalogueDescription')

    if (metadata.attributeDescription) {
      contentInfo.ele('gmd:attributeDescription')
        .ele('gco:CharacterString')
        .txt(metadata.attributeDescription)
    }

    if (metadata.contentType) {
      contentInfo.ele('gmd:contentType')
        .ele('gmd:MD_CoverageContentTypeCode', { codeListValue: metadata.contentType })
        .txt(metadata.contentType)
    }
  }

  // Distribution Info
  if (metadata.distributionFormat || metadata.distributor || metadata.onlineResource || metadata.transferOptions) {
    const distribution = root.ele('gmd:distributionInfo')
      .ele('gmd:MD_Distribution')

    // Distribution Format
    if (metadata.distributionFormat) {
      distribution.ele('gmd:distributionFormat')
        .ele('gmd:MD_Format')
        .ele('gmd:name')
        .ele('gco:CharacterString')
        .txt(metadata.distributionFormat)
    }

    // Distributor
    if (metadata.distributor) {
      const distributor = distribution.ele('gmd:distributor')
        .ele('gmd:MD_Distributor')

      distributor.ele('gmd:distributorContact')
        .ele('gmd:CI_ResponsibleParty')
        .ele('gmd:organisationName')
        .ele('gco:CharacterString')
        .txt(metadata.distributor)
    }

    // Transfer Options
    if (metadata.transferOptions && metadata.transferOptions.length > 0) {
      metadata.transferOptions.forEach(option => {
        const transferOption = distribution.ele('gmd:transferOptions')
          .ele('gmd:MD_DigitalTransferOptions')

        if (option.url) {
          transferOption.ele('gmd:onLine')
            .ele('gmd:CI_OnlineResource')
            .ele('gmd:linkage')
            .ele('gmd:URL')
            .txt(option.url)
        }
      })
    }
  }

  // Data Quality Info
  if (metadata.scope || metadata.lineage || metadata.accuracy || metadata.completeness || metadata.consistency) {
    const dataQuality = root.ele('gmd:dataQualityInfo')
      .ele('gmd:DQ_DataQuality')

    // Scope
    dataQuality.ele('gmd:scope')
      .ele('gmd:DQ_Scope')
      .ele('gmd:level')
      .ele('gmd:MD_ScopeCode', { codeListValue: metadata.scope || 'dataset' })
      .txt(metadata.scope || 'dataset')

    // Lineage
    if (metadata.lineage) {
      dataQuality.ele('gmd:lineage')
        .ele('gmd:LI_Lineage')
        .ele('gmd:statement')
        .ele('gco:CharacterString')
        .txt(metadata.lineage)
    }

    // Accuracy
    if (metadata.accuracy) {
      const accuracyReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_AbsoluteExternalPositionalAccuracy')

      accuracyReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.accuracy)
    }

    // Completeness
    if (metadata.completeness) {
      const completenessReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_Completeness')

      completenessReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.completeness)
    }

    // Consistency
    if (metadata.consistency) {
      const consistencyReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_LogicalConsistency')

      consistencyReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.consistency)
    }
  }

  // Metadata Constraints
  if (metadata.useConstraints || metadata.accessConstraints || metadata.otherConstraints) {
    const constraints = root.ele('gmd:metadataConstraints')
      .ele('gmd:MD_LegalConstraints')

    if (metadata.useConstraints) {
      constraints.ele('gmd:useConstraints')
        .ele('gmd:MD_RestrictionCode', { codeListValue: 'copyright' })
        .txt('copyright')

      constraints.ele('gmd:useLimitation')
        .ele('gco:CharacterString')
        .txt(metadata.useConstraints)
    }

    if (metadata.accessConstraints) {
      constraints.ele('gmd:accessConstraints')
        .ele('gmd:MD_RestrictionCode', { codeListValue: 'otherRestrictions' })
        .txt('otherRestrictions')

      constraints.ele('gmd:accessLimitation')
        .ele('gco:CharacterString')
        .txt(metadata.accessConstraints)
    }

    if (metadata.otherConstraints) {
      constraints.ele('gmd:otherConstraints')
        .ele('gco:CharacterString')
        .txt(metadata.otherConstraints)
    }
  }

  return root.end({ prettyPrint: true })
}

export function generateSNIMetadata(metadata: MetadataData): string {
  // SNI specific mapping - comprehensive version
  const sni = {
    'sni_metadata': {
      'sni_standard': metadata.sniStandard || 'SNI ISO 19115:2019',
      'sni_version': metadata.sniVersion || '1.0',
      'sni_compliant': metadata.sniCompliant || true,
      'bahasa': metadata.bahasa || 'id',
      'metadata': {
        'identifier': metadata.fileIdentifier || `urn:sni:${Date.now()}`,
        'title': metadata.title,
        'abstract': metadata.abstract || '',
        'purpose': metadata.purpose || '',
        'status': metadata.status || 'completed',
        'update_frequency': metadata.updateFrequency || 'asNeeded',

        'keywords': {
          'theme': metadata.keywords || [],
          'topic_category': metadata.topicCategory || '',
          'theme_keywords': metadata.themeKeywords || []
        },

        'spatial': {
          'bounding_box': metadata.boundingBox ? {
            'west': metadata.boundingBox.minX,
            'east': metadata.boundingBox.maxX,
            'south': metadata.boundingBox.minY,
            'north': metadata.boundingBox.maxY,
            'crs': metadata.boundingBox.crs || metadata.coordinateSystem || 'WGS84'
          } : null,
          'coordinate_system': metadata.coordinateSystem || 'WGS84',
          'spatial_resolution': metadata.spatialResolution || '',
          'geographic_extent': metadata.geographicExtent || ''
        },

        'temporal': {
          'start_date': metadata.temporalStart?.toISOString(),
          'end_date': metadata.temporalEnd?.toISOString(),
          'date_type': metadata.dateType || 'creation',
          'date_stamp': (metadata.dateStamp || new Date()).toISOString()
        },

        'responsible_party': {
          'contact': {
            'name': metadata.contactName || '',
            'email': metadata.contactEmail || '',
            'organization': metadata.contactOrganization || '',
            'role': metadata.contactRole || 'pointOfContact',
            'phone': metadata.contactPhone || '',
            'address': metadata.contactAddress || ''
          },
          'metadata_contact': {
            'name': metadata.metadataContactName || '',
            'email': metadata.metadataContactEmail || '',
            'organization': metadata.metadataContactOrganization || ''
          }
        },

        'technical': {
          'feature_count': metadata.featureCount || 0,
          'file_size': metadata.fileSize || 0,
          'geometry_type': metadata.geometryType || '',
          'data_format': metadata.dataFormat || '',
          'processing_level': metadata.processingLevel || '',
          'original_file_name': metadata.originalFileName || ''
        },

        'spatial_representation': {
          'spatial_representation_type': metadata.spatialRepresentationType || '',
          'axis_dimension_properties': metadata.axisDimensionProperties || '',
          'cell_geometry': metadata.cellGeometry || '',
          'georectified': metadata.georectified || false,
          'georeferenceable': metadata.georeferenceable || false
        },

        'reference_system': {
          'reference_system_identifier': metadata.referenceSystemIdentifier || metadata.coordinateSystem || '',
          'reference_system_type': metadata.referenceSystemType || ''
        },

        'content': {
          'attribute_description': metadata.attributeDescription || '',
          'content_type': metadata.contentType || ''
        },

        'distribution': {
          'distribution_format': metadata.distributionFormat || '',
          'distributor': metadata.distributor || '',
          'online_resource': metadata.onlineResource || '',
          'transfer_options': metadata.transferOptions || []
        },

        'data_quality': {
          'scope': metadata.scope || '',
          'lineage': metadata.lineage || '',
          'accuracy': metadata.accuracy || '',
          'completeness': metadata.completeness || '',
          'consistency': metadata.consistency || ''
        },

        'constraints': {
          'use_constraints': metadata.useConstraints || '',
          'access_constraints': metadata.accessConstraints || '',
          'other_constraints': metadata.otherConstraints || ''
        },

        'identification': {
          'point_of_contact': metadata.pointOfContact || '',
          'descriptive_keywords': metadata.descriptiveKeywords || '',
          'additional_documentation': metadata.additionalDocumentation || '',
          'resource_maintenance': metadata.resourceMaintenance || '',
          'graphic_overview': metadata.graphicOverview || '',
          'resource_format': metadata.resourceFormat || '',
          'resource_specific_usage': metadata.resourceSpecificUsage || '',
          'resource_constraints': metadata.resourceConstraints || ''
        }
      }
    }
  }

  // Custom replacer function to handle BigInt serialization
  const replacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }

  return JSON.stringify(sni, replacer, 2)
}

/**
 * Generate XML metadata in multiple formats
 */
export function generateSNIXML(metadata: MetadataData): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('gmd:MD_Metadata', {
      'xmlns:gmd': 'http://www.isotc211.org/2005/gmd',
      'xmlns:gco': 'http://www.isotc211.org/2005/gco',
      'xmlns:gml': 'http://www.opengis.net/gml',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'xmlns:sni': 'http://sni.go.id/19115'
    })

  // File Identifier
  root.ele('gmd:fileIdentifier')
    .ele('gco:CharacterString')
    .txt(metadata.fileIdentifier || `urn:sni:${Date.now()}`)

  // Language
  root.ele('gmd:language')
    .ele('gco:CharacterString')
    .txt(metadata.bahasa === 'EN' ? 'eng' : 'ind')

  // Character Set
  root.ele('gmd:characterSet')
    .ele('gmd:MD_CharacterSetCode', { codeListValue: 'utf8' })
    .txt('utf8')

  // Parent Identifier (if exists)
  if (metadata.parentIdentifier) {
    root.ele('gmd:parentIdentifier')
      .ele('gco:CharacterString')
      .txt(metadata.parentIdentifier)
  }

  // Hierarchy Level
  root.ele('gmd:hierarchyLevel')
    .ele('gmd:MD_ScopeCode', { codeListValue: 'dataset' })
    .txt('dataset')

  // Hierarchy Level Name
  root.ele('gmd:hierarchyLevelName')
    .ele('gco:CharacterString')
    .txt('Dataset')

  // SNI Specific Elements
  root.ele('sni:sniCompliant')
    .ele('gco:Boolean')
    .txt(metadata.sniCompliant ? 'true' : 'false')

  root.ele('sni:sniStandard')
    .ele('gco:CharacterString')
    .txt(metadata.sniStandard || 'SNI ISO 19115:2019')

  root.ele('sni:sniVersion')
    .ele('gco:CharacterString')
    .txt(metadata.sniVersion || '1.0')

  root.ele('sni:bahasa')
    .ele('gco:CharacterString')
    .txt(metadata.bahasa || 'id')

  // Contact (Data Owner) - Always generate for valid XML
  const contact = root.ele('gmd:contact')
    .ele('gmd:CI_ResponsibleParty')

  if (metadata.contactName) {
    contact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt(metadata.contactName)
  } else {
    // Fallback for draft metadata
    contact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt('Unknown Contact')
  }

  if (metadata.contactOrganization) {
    contact.ele('gmd:organisationName')
      .ele('gco:CharacterString')
      .txt(metadata.contactOrganization)
  }

  // Contact Info - Always generate with fallback
  const contactInfo = contact.ele('gmd:contactInfo')
    .ele('gmd:CI_Contact')

  const address = contactInfo.ele('gmd:address')
    .ele('gmd:CI_Address')

  if (metadata.contactEmail) {
    address.ele('gmd:electronicMailAddress')
      .ele('gco:CharacterString')
      .txt(metadata.contactEmail)
  } else {
    // Fallback for draft metadata
    address.ele('gmd:electronicMailAddress')
      .ele('gco:CharacterString')
      .txt('contact@example.com')
  }

  if (metadata.contactAddress) {
    address.ele('gmd:deliveryPoint')
      .ele('gco:CharacterString')
      .txt(metadata.contactAddress)
  }

  contact.ele('gmd:role')
    .ele('gmd:CI_RoleCode', { codeListValue: metadata.contactRole || 'pointOfContact' })
    .txt(metadata.contactRole || 'pointOfContact')

  // Metadata Contact (SNI Specific)
  if (metadata.metadataContactName || metadata.metadataContactEmail || metadata.metadataContactOrganization) {
    const metadataContact = root.ele('sni:metadataContact')
      .ele('gmd:CI_ResponsibleParty')

    if (metadata.metadataContactName) {
      metadataContact.ele('gmd:individualName')
        .ele('gco:CharacterString')
        .txt(metadata.metadataContactName)
    }

    if (metadata.metadataContactOrganization) {
      metadataContact.ele('gmd:organisationName')
        .ele('gco:CharacterString')
        .txt(metadata.metadataContactOrganization)
    }

    if (metadata.metadataContactEmail) {
      const contactInfo = metadataContact.ele('gmd:contactInfo')
        .ele('gmd:CI_Contact')
        .ele('gmd:address')
        .ele('gmd:CI_Address')

      contactInfo.ele('gmd:electronicMailAddress')
        .ele('gco:CharacterString')
        .txt(metadata.metadataContactEmail)
    }

    metadataContact.ele('gmd:role')
      .ele('gmd:CI_RoleCode', { codeListValue: 'pointOfContact' })
      .txt('pointOfContact')
  }

  // Date Stamp
  root.ele('gmd:dateStamp')
    .ele('gco:DateTime')
    .txt((metadata.dateStamp || new Date()).toISOString())

  // Metadata Standard (SNI)
  root.ele('gmd:metadataStandardName')
    .ele('gco:CharacterString')
    .txt('SNI ISO 19115:2019')

  root.ele('gmd:metadataStandardVersion')
    .ele('gco:CharacterString')
    .txt('1.0')

  // Spatial Representation Info
  if (metadata.spatialRepresentationType) {
    const spatialRepresentation = root.ele('gmd:spatialRepresentationInfo')
      .ele('gmd:MD_VectorSpatialRepresentation') // or appropriate type based on spatialRepresentationType

    if (metadata.spatialRepresentationType) {
      spatialRepresentation.ele('gmd:topologyLevel')
        .ele('gmd:MD_TopologyLevelCode', { codeListValue: metadata.spatialRepresentationType })
        .txt(metadata.spatialRepresentationType)
    }

    if (metadata.axisDimensionProperties) {
      const axisDimension = spatialRepresentation.ele('gmd:axisDimensionProperties')
        .ele('gmd:MD_Dimension')

      axisDimension.ele('gmd:dimensionName')
        .ele('gmd:MD_DimensionNameTypeCode', { codeListValue: 'row' })
        .txt('row')

      axisDimension.ele('gmd:dimensionSize')
        .ele('gco:Integer')
        .txt('1') // placeholder

      axisDimension.ele('gmd:resolution')
        .ele('gco:Measure', { uom: 'meter' })
        .txt(metadata.axisDimensionProperties)
    }

    if (metadata.georectified !== undefined) {
      spatialRepresentation.ele('gmd:georectified')
        .ele('gco:Boolean')
        .txt(metadata.georectified ? 'true' : 'false')
    }

    if (metadata.georeferenceable !== undefined) {
      spatialRepresentation.ele('gmd:georeferenceable')
        .ele('gco:Boolean')
        .txt(metadata.georeferenceable ? 'true' : 'false')
    }
  }

  // Reference System Info
  if (metadata.coordinateSystem || metadata.referenceSystemIdentifier) {
    const referenceSystem = root.ele('gmd:referenceSystemInfo')
      .ele('gmd:MD_ReferenceSystem')

    referenceSystem.ele('gmd:referenceSystemIdentifier')
      .ele('gmd:RS_Identifier')
      .ele('gmd:code')
      .ele('gco:CharacterString')
      .txt(metadata.referenceSystemIdentifier || metadata.coordinateSystem || 'EPSG:4326')
  }

  // Identification Info
  const identification = root.ele('gmd:identificationInfo')
    .ele('gmd:MD_DataIdentification')

  // Citation
  const citation = identification.ele('gmd:citation')
    .ele('gmd:CI_Citation')

  citation.ele('gmd:title')
    .ele('gco:CharacterString')
    .txt(metadata.title || 'Untitled Dataset')

  // Citation Date
  const citationDate = citation.ele('gmd:date')
    .ele('gmd:CI_Date')

  citationDate.ele('gmd:date')
    .ele('gco:Date')
    .txt((metadata.dateStamp || new Date()).toISOString().split('T')[0])

  citationDate.ele('gmd:dateType')
    .ele('gmd:CI_DateTypeCode', { codeListValue: metadata.dateType || 'creation' })
    .txt(metadata.dateType || 'creation')

  // Abstract
  if (metadata.abstract) {
    identification.ele('gmd:abstract')
      .ele('gco:CharacterString')
      .txt(metadata.abstract)
  }

  // Purpose
  if (metadata.purpose) {
    identification.ele('gmd:purpose')
      .ele('gco:CharacterString')
      .txt(metadata.purpose)
  }

  // Status
  if (metadata.status) {
    identification.ele('gmd:status')
      .ele('gmd:MD_ProgressCode', { codeListValue: metadata.status.toLowerCase() })
      .txt(metadata.status.toLowerCase())
  }

  // Keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    const descriptiveKeywords = identification.ele('gmd:descriptiveKeywords')
      .ele('gmd:MD_Keywords')

    metadata.keywords.forEach(keyword => {
      descriptiveKeywords.ele('gmd:keyword')
        .ele('gco:CharacterString')
        .txt(keyword)
    })

    descriptiveKeywords.ele('gmd:type')
      .ele('gmd:MD_KeywordTypeCode', { codeListValue: 'theme' })
      .txt('theme')
  }

  // Topic Category
  if (metadata.topicCategory) {
    identification.ele('gmd:topicCategory')
      .ele('gmd:MD_TopicCategoryCode')
      .txt(metadata.topicCategory.toLowerCase())
  }

  // Spatial Resolution
  if (metadata.spatialResolution) {
    identification.ele('gmd:spatialResolution')
      .ele('gmd:MD_Resolution')
      .ele('gmd:distance')
      .ele('gco:Distance', { uom: 'meter' })
      .txt(metadata.spatialResolution)
  }

  // Language
  identification.ele('gmd:language')
    .ele('gco:CharacterString')
    .txt(metadata.bahasa === 'EN' ? 'eng' : 'ind')

  // Character Set
  identification.ele('gmd:characterSet')
    .ele('gmd:MD_CharacterSetCode', { codeListValue: 'utf8' })
    .txt('utf8')

  // Extent
  if (metadata.boundingBox) {
    const extent = identification.ele('gmd:extent')
      .ele('gmd:EX_Extent')

    if (metadata.geographicExtent) {
      extent.ele('gmd:description')
        .ele('gco:CharacterString')
        .txt(metadata.geographicExtent)
    }

    const bbox = extent.ele('gmd:geographicElement')
      .ele('gmd:EX_GeographicBoundingBox')

    bbox.ele('gmd:westBoundLongitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.minX.toString())

    bbox.ele('gmd:eastBoundLongitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.maxX.toString())

    bbox.ele('gmd:southBoundLatitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.minY.toString())

    bbox.ele('gmd:northBoundLatitude')
      .ele('gco:Decimal')
      .txt(metadata.boundingBox.maxY.toString())
  }

  // Temporal Extent
  if (metadata.temporalStart || metadata.temporalEnd) {
    const extent = identification.ele('gmd:extent')
      .ele('gmd:EX_Extent')

    const temporalElement = extent.ele('gmd:temporalElement')
      .ele('gmd:EX_TemporalExtent')

    const timePeriod = temporalElement.ele('gmd:extent')
      .ele('gml:TimePeriod', { 'gml:id': `TP${Date.now()}` })

    if (metadata.temporalStart) {
      timePeriod.ele('gml:beginPosition')
        .txt(metadata.temporalStart.toISOString())
    }

    if (metadata.temporalEnd) {
      timePeriod.ele('gml:endPosition')
        .txt(metadata.temporalEnd.toISOString())
    }
  }

  // Distribution Info
  if (metadata.distributionFormat || metadata.onlineResource || metadata.transferOptions) {
    const distribution = root.ele('gmd:distributionInfo')
      .ele('gmd:MD_Distribution')

    // Distribution Format
    if (metadata.distributionFormat) {
      distribution.ele('gmd:distributionFormat')
        .ele('gmd:MD_Format')
        .ele('gmd:name')
        .ele('gco:CharacterString')
        .txt(metadata.distributionFormat)
    }

    // Transfer Options
    if (metadata.transferOptions && metadata.transferOptions.length > 0) {
      metadata.transferOptions.forEach(option => {
        const transferOption = distribution.ele('gmd:transferOptions')
          .ele('gmd:MD_DigitalTransferOptions')

        if (option.url) {
          transferOption.ele('gmd:onLine')
            .ele('gmd:CI_OnlineResource')
            .ele('gmd:linkage')
            .ele('gmd:URL')
            .txt(option.url)
        }
      })
    }
  }

  // Content Info
  if (metadata.attributeDescription || metadata.contentType) {
    const contentInfo = root.ele('gmd:contentInfo')
      .ele('gmd:MD_FeatureCatalogueDescription')

    if (metadata.attributeDescription) {
      contentInfo.ele('gmd:attributeDescription')
        .ele('gco:CharacterString')
        .txt(metadata.attributeDescription)
    }

    if (metadata.contentType) {
      contentInfo.ele('gmd:contentType')
        .ele('gmd:MD_CoverageContentTypeCode', { codeListValue: metadata.contentType })
        .txt(metadata.contentType)
    }
  }

  // Identification Info additional fields
  // Point of Contact
  if (metadata.pointOfContact) {
    const pointOfContact = identification.ele('gmd:pointOfContact')
      .ele('gmd:CI_ResponsibleParty')

    pointOfContact.ele('gmd:individualName')
      .ele('gco:CharacterString')
      .txt(metadata.pointOfContact)

    pointOfContact.ele('gmd:role')
      .ele('gmd:CI_RoleCode', { codeListValue: 'pointOfContact' })
      .txt('pointOfContact')
  }

  // Descriptive Keywords (additional keywords field)
  if (metadata.descriptiveKeywords) {
    const descriptiveKeywords = identification.ele('gmd:descriptiveKeywords')
      .ele('gmd:MD_Keywords')

    metadata.descriptiveKeywords.split(',').forEach(keyword => {
      descriptiveKeywords.ele('gmd:keyword')
        .ele('gco:CharacterString')
        .txt(keyword.trim())
    })

    descriptiveKeywords.ele('gmd:type')
      .ele('gmd:MD_KeywordTypeCode', { codeListValue: 'theme' })
      .txt('theme')
  }

  // Additional Documentation
  if (metadata.additionalDocumentation) {
    identification.ele('gmd:supplementalInformation')
      .ele('gco:CharacterString')
      .txt(metadata.additionalDocumentation)
  }

  // Processing Level
  if (metadata.processingLevel) {
    identification.ele('gmd:processingLevel')
      .ele('gmd:MD_Identifier')
      .ele('gmd:code')
      .ele('gco:CharacterString')
      .txt(metadata.processingLevel)
  }

  // Resource Maintenance
  if (metadata.resourceMaintenance) {
    const maintenance = identification.ele('gmd:resourceMaintenance')
      .ele('gmd:MD_MaintenanceInformation')

    maintenance.ele('gmd:maintenanceAndUpdateFrequency')
      .ele('gmd:MD_MaintenanceFrequencyCode', { codeListValue: 'asNeeded' })
      .txt('asNeeded')

    maintenance.ele('gmd:maintenanceNote')
      .ele('gco:CharacterString')
      .txt(metadata.resourceMaintenance)
  }

  // Graphic Overview
  if (metadata.graphicOverview) {
    const graphicOverview = identification.ele('gmd:graphicOverview')
      .ele('gmd:MD_BrowseGraphic')

    graphicOverview.ele('gmd:fileName')
      .ele('gco:CharacterString')
      .txt(metadata.graphicOverview)

    graphicOverview.ele('gmd:fileDescription')
      .ele('gco:CharacterString')
      .txt('Graphic overview of the dataset')
  }

  // Resource Format
  if (metadata.resourceFormat) {
    identification.ele('gmd:resourceFormat')
      .ele('gmd:MD_Format')
      .ele('gmd:name')
      .ele('gco:CharacterString')
      .txt(metadata.resourceFormat)
  }

  // Resource Specific Usage
  if (metadata.resourceSpecificUsage) {
    const usage = identification.ele('gmd:resourceSpecificUsage')
      .ele('gmd:MD_Usage')

    usage.ele('gmd:specificUsage')
      .ele('gco:CharacterString')
      .txt(metadata.resourceSpecificUsage)

    usage.ele('gmd:userContactInfo')
      .ele('gmd:CI_ResponsibleParty')
      .ele('gmd:role')
      .ele('gmd:CI_RoleCode', { codeListValue: 'user' })
      .txt('user')
  }

  // Resource Constraints
  if (metadata.resourceConstraints) {
    const constraints = identification.ele('gmd:resourceConstraints')
      .ele('gmd:MD_LegalConstraints')

    constraints.ele('gmd:useLimitation')
      .ele('gco:CharacterString')
      .txt(metadata.resourceConstraints)
  }

  // Distribution Info
  if (metadata.distributionFormat || metadata.distributor || metadata.onlineResource || metadata.transferOptions) {
    const distribution = root.ele('gmd:distributionInfo')
      .ele('gmd:MD_Distribution')

    // Distribution Format
    if (metadata.distributionFormat) {
      distribution.ele('gmd:distributionFormat')
        .ele('gmd:MD_Format')
        .ele('gmd:name')
        .ele('gco:CharacterString')
        .txt(metadata.distributionFormat)
    }

    // Distributor
    if (metadata.distributor) {
      const distributor = distribution.ele('gmd:distributor')
        .ele('gmd:MD_Distributor')

      distributor.ele('gmd:distributorContact')
        .ele('gmd:CI_ResponsibleParty')
        .ele('gmd:organisationName')
        .ele('gco:CharacterString')
        .txt(metadata.distributor)
    }

    // Transfer Options
    if (metadata.transferOptions && metadata.transferOptions.length > 0) {
      metadata.transferOptions.forEach(option => {
        const transferOption = distribution.ele('gmd:transferOptions')
          .ele('gmd:MD_DigitalTransferOptions')

        if (option.url) {
          transferOption.ele('gmd:onLine')
            .ele('gmd:CI_OnlineResource')
            .ele('gmd:linkage')
            .ele('gmd:URL')
            .txt(option.url)
        }
      })
    }
  }

  // Data Quality Info
  if (metadata.scope || metadata.lineage || metadata.accuracy || metadata.completeness || metadata.consistency) {
    const dataQuality = root.ele('gmd:dataQualityInfo')
      .ele('gmd:DQ_DataQuality')

    // Scope
    dataQuality.ele('gmd:scope')
      .ele('gmd:DQ_Scope')
      .ele('gmd:level')
      .ele('gmd:MD_ScopeCode', { codeListValue: metadata.scope || 'dataset' })
      .txt(metadata.scope || 'dataset')

    // Lineage
    if (metadata.lineage) {
      dataQuality.ele('gmd:lineage')
        .ele('gmd:LI_Lineage')
        .ele('gmd:statement')
        .ele('gco:CharacterString')
        .txt(metadata.lineage)
    }

    // Accuracy
    if (metadata.accuracy) {
      const accuracyReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_AbsoluteExternalPositionalAccuracy')

      accuracyReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.accuracy)
    }

    // Completeness
    if (metadata.completeness) {
      const completenessReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_Completeness')

      completenessReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.completeness)
    }

    // Consistency
    if (metadata.consistency) {
      const consistencyReport = dataQuality.ele('gmd:report')
        .ele('gmd:DQ_LogicalConsistency')

      consistencyReport.ele('gmd:result')
        .ele('gmd:DQ_QuantitativeResult')
        .ele('gmd:value')
        .ele('gco:Record')
        .txt(metadata.consistency)
    }
  }

  // SNI Constraints (Legal Constraints)
  if (metadata.useConstraints || metadata.accessConstraints || metadata.otherConstraints) {
    const constraints = root.ele('sni:constraints')
      .ele('gmd:MD_LegalConstraints')

    if (metadata.useConstraints) {
      constraints.ele('gmd:useConstraints')
        .ele('gmd:MD_RestrictionCode', { codeListValue: 'copyright' })
        .txt('copyright')

      constraints.ele('gmd:useLimitation')
        .ele('gco:CharacterString')
        .txt(metadata.useConstraints)
    }

    if (metadata.accessConstraints) {
      constraints.ele('gmd:accessConstraints')
        .ele('gmd:MD_RestrictionCode', { codeListValue: 'otherRestrictions' })
        .txt('otherRestrictions')

      constraints.ele('gmd:accessLimitation')
        .ele('gco:CharacterString')
        .txt(metadata.accessConstraints)
    }

    if (metadata.otherConstraints) {
      constraints.ele('gmd:otherConstraints')
        .ele('gco:CharacterString')
        .txt(metadata.otherConstraints)
    }
  }

  return root.end({ prettyPrint: true })
}

export function generateMetadataXML(metadata: MetadataData, format: 'iso19139' | 'sni-json' | 'sni-xml' = 'iso19139'): string {
  switch (format) {
    case 'iso19139':
      return generateISO19139XML(metadata)
    case 'sni-json':
      return generateSNIMetadata(metadata)
    case 'sni-xml':
      return generateSNIXML(metadata)
    default:
      return generateISO19139XML(metadata)
  }
}

/**
 * Validate metadata against ISO 19115 requirements
 */
export function validateMetadata(metadata: MetadataData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Mandatory fields for ISO 19115
  if (!metadata.title?.trim()) {
    errors.push('Title is required')
  }

  if (!metadata.abstract?.trim()) {
    errors.push('Abstract is required')
  }

  if (!metadata.contactName?.trim() && !metadata.contactOrganization?.trim()) {
    errors.push('Contact name or organization is required')
  }

  if (!metadata.contactEmail?.trim()) {
    errors.push('Contact email is required')
  }

  // Spatial information validation
  if (metadata.boundingBox) {
    const { minX, minY, maxX, maxY } = metadata.boundingBox
    if (minX >= maxX) {
      errors.push('West bound longitude must be less than east bound longitude')
    }
    if (minY >= maxY) {
      errors.push('South bound latitude must be less than north bound latitude')
    }
  }

  // Temporal validation
  if (metadata.temporalStart && metadata.temporalEnd) {
    if (metadata.temporalStart > metadata.temporalEnd) {
      errors.push('Start date must be before end date')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}