# 🌍 Geospatial Metadata Generator

Aplikasi web modern untuk menghasilkan metadata geospasial secara otomatis sesuai standar **SNI ISO 19115:2019** dan **ISO 19115/19139** untuk DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara.

## ✨ Fitur Utama

### 📤 Upload & Processing
- ✅ **Multi-format Support**: Upload GeoJSON, Shapefile (compressed/uncompressed), dan format geospasial lainnya
- ✅ **Client-side Processing**: Ekstraksi metadata real-time di browser menggunakan Turf.js dan Shapefile.js
- ✅ **Server-side Fallback**: Processing dengan GDAL/OGR untuk format kompleks
- ✅ **Batch Upload**: Support multiple files dengan validasi otomatis

### 🔍 Metadata Extraction
- ✅ **Auto-extraction**: Bounding box, jumlah fitur, sistem koordinat, tipe geometri
- ✅ **Smart Inference**: Title, abstract, keywords, topic category dari data
- ✅ **Attribute Analysis**: Analisis struktur atribut dan tipe data
- ✅ **Quality Assessment**: Completeness, consistency, accuracy metrics

### 📋 Metadata Management
- ✅ **ISO 19115 Compliance**: Full compliance dengan standar internasional
- ✅ **SNI ISO 19115:2019**: Support standar nasional Indonesia
- ✅ **XML Generation**: Generate metadata XML valid untuk berbagai format
- ✅ **Preview & Edit**: Interface user-friendly untuk review dan edit metadata

### 🔐 Security & Access
- ✅ **JWT Authentication**: Secure authentication dengan role-based access
- ✅ **Rate Limiting**: Protection terhadap brute force attacks dan abuse
- ✅ **Input Validation**: Sanitasi dan validasi semua user inputs
- ✅ **File Security**: Validasi tipe file, ukuran, dan content inspection
- ✅ **Security Headers**: Comprehensive HTTP security headers
- ✅ **CORS Protection**: Configurable cross-origin resource sharing
- ✅ **Data Privacy**: Enkripsi data sensitif dan kontrol akses
- ✅ **Audit Logging**: Comprehensive security event logging

### 🎨 User Experience
- ✅ **Responsive UI**: Design modern dengan TailwindCSS v4
- ✅ **Real-time Feedback**: Progress indicators dan error handling
- ✅ **Interactive Help**: Panduan lengkap untuk setiap field metadata
- ✅ **Multi-language**: Support bahasa Indonesia dan English

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS v4
- **State Management**: React Hooks + Context
- **UI Components**: Custom components dengan accessibility

### Backend
- **Runtime**: Next.js API Routes (Node.js)
- **Database ORM**: Prisma 6.15.0
- **Authentication**: JSON Web Tokens (JWT)
- **File Processing**: Multer untuk upload handling

### Database
- **Production**: PostgreSQL 15 + PostGIS 3.3 (spatial extensions)
- **Development**: SQLite untuk kemudahan setup
- **Migration**: Prisma Migrate untuk schema management

### Geospatial Processing
- **Client-side**: Turf.js, Shapefile.js, GeoTIFF.js
- **Server-side**: GDAL/OGR (via Docker)
- **Format Support**: GeoJSON, Shapefile, KML, GeoTIFF, dan lainnya

### DevOps & Tools
- **Container**: Docker & Docker Compose
- **Linting**: ESLint 9.x
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Turbopack untuk development
- **Email**: Nodemailer untuk notifications

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (comes with Node.js)
- **Docker**: 20.10+ (recommended for database)
- **Docker Compose**: 2.0+ (for container orchestration)

### Optional but Recommended
- **Git**: For version control
- **VS Code**: With TypeScript and React extensions
- **PostGIS**: For full geospatial capabilities (auto-setup via Docker)

## 🚀 Quick Start

### 1. Clone & Setup
```bash
# Clone repository
git clone <repository-url>
cd geospatial-metadata-app

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**
```env
# Database (choose one)
DATABASE_URL="file:./dev.db"                    # SQLite (development)
DATABASE_URL="postgresql://user:password@localhost:5432/geospatial_metadata?schema=public"  # PostgreSQL (production)

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Email (optional)
EMAIL_FROM="noreply@dkb.go.id"
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASS="your-app-password"
```

### 3. Database Setup

#### Option A: SQLite (Recommended for Development)
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

#### Option B: PostgreSQL + PostGIS (Production/Full Features)
```bash
# Start database container
docker-compose up -d db

# Wait for database to be ready
sleep 10

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 4. Development Server
```bash
# Start development server
npm run dev

# Or with Turbopack (faster)
npm run dev
```

**Access the application:**
- 🌐 **Frontend**: http://localhost:3000
- 📊 **Database**: localhost:5432 (if using Docker)
- 📧 **Email**: Check console for test emails

### 5. Build for Production
```bash
# Build application
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Full Stack Deployment
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Services Included
- **app**: Next.js application (port 3000)
- **db**: PostgreSQL + PostGIS (port 5432)

### Docker Commands
```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build app
```

## 📚 API Documentation

### 🔐 Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/register
```

**Request Body (Login):**
```json
{
  "email": "user@dkb.go.id",
  "password": "password123"
}
```

**Request Body (Register):**
```json
{
  "name": "John Doe",
  "email": "john@dkb.go.id",
  "password": "password123"
}
```

### 📄 Metadata Management
```http
GET    /api/metadata              # List all metadata (paginated)
GET    /api/metadata/[id]         # Get specific metadata
POST   /api/metadata              # Create new metadata
PUT    /api/metadata/[id]         # Update metadata
DELETE /api/metadata/[id]         # Delete metadata
GET    /api/metadata/stats        # Get metadata statistics
```

**Metadata Object Structure:**
```json
{
  "id": "uuid",
  "title": "Dataset Title",
  "abstract": "Dataset description...",
  "status": "completed",
  "extent": "95.0,141.0,-11.0,6.0",
  "contactName": "John Doe",
  "contactEmail": "john@dkb.go.id",
  "spatialRepresentationType": "vector",
  "referenceSystemIdentifier": "EPSG:4326",
  "xmlContent": "<gmd:MD_Metadata>...</gmd:MD_Metadata>",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 📤 File Upload & Processing
```http
POST /api/upload                  # Upload geospatial files
POST /api/extract-geospatial      # Extract metadata from files
GET  /api/download/[id]           # Download metadata XML
GET  /api/download/file/[filename] # Download original file
```

**Upload Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

# Form fields:
files: [File] (GeoJSON, Shapefile, etc.)
title: string
abstract: string
# ... other metadata fields
```

### 📧 Email Integration
```http
POST /api/email/[id]              # Send metadata via email
```

**Email Request:**
```json
{
  "recipient": "recipient@example.com",
  "format": "iso19139"
}
```

### 🛠️ Development & Testing
```http
GET  /api/debug                   # Debug information
GET  /api/test-db                 # Database connection test
GET  /api/check-data              # Data validation
POST /api/seed                    # Seed database
POST /api/register-test           # Test user registration
```

### 📊 Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null
}
```

### 🔒 Authentication
Include JWT token in Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
- id: String (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- role: String (admin/user)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Metadata
```sql
- id: String (Primary Key)
- title: String
- abstract: String
- status: String (completed/ongoing/planned/deprecated)
- purpose: String
- topicCategory: String
- spatialResolution: String
- temporalResolution: String
- extent: String (bounding box)
- additionalDocumentation: String
- processingLevel: String
- resourceMaintenance: String
- graphicOverview: String
- resourceFormat: String
- descriptiveKeywords: String
- resourceSpecificUsage: String
- resourceConstraints: String
- spatialRepresentationType: String
- axisDimensionProperties: String
- cellGeometry: String
- georectified: Boolean
- georeferenceable: Boolean
- referenceSystemIdentifier: String
- referenceSystemType: String
- attributeDescription: String
- contentType: String
- distributionFormat: String
- distributor: String
- onlineResource: String
- transferOptions: String
- scope: String
- lineage: String
- accuracy: String
- completeness: String
- consistency: String
- useConstraints: String
- accessConstraints: String
- otherConstraints: String
- sniCompliant: Boolean
- sniVersion: String
- sniStandard: String
- bahasa: String
- fileIdentifier: String
- language: String
- characterSet: String
- parentIdentifier: String
- hierarchyLevel: String
- hierarchyLevelName: String
- contactName: String
- contactEmail: String
- dateStamp: String
- metadataStandardName: String
- metadataStandardVersion: String
- dataSetURI: String
- locale: String
- xmlContent: String (XML metadata)
- isPublished: Boolean
- createdAt: DateTime
- updatedAt: DateTime
- userId: String (Foreign Key)
```

#### Files
```sql
- id: String (Primary Key)
- originalName: String
- size: Int
- mimetype: String
- url: String
- metadataId: String (Foreign Key)
- createdAt: DateTime
```

## 📁 Project Structure

```
geospatial-metadata-app/
├── 📂 components/           # React components
│   ├── Navbar.tsx          # Navigation component
│   ├── XmlPreview.tsx      # XML preview component
│   └── ...
├── 📂 lib/                 # Utility libraries
│   ├── auth.ts            # Authentication helpers
│   ├── db.ts              # Database connection
│   ├── clientGeospatialExtractor.ts  # Client-side processing
│   ├── ogrExtractor.ts    # Server-side GDAL processing
│   └── ...
├── 📂 pages/               # Next.js pages & API routes
│   ├── _app.tsx           # App wrapper
│   ├── index.tsx          # Homepage
│   ├── login.tsx          # Login page
│   ├── upload.tsx         # File upload page
│   ├── dashboard.tsx      # User dashboard
│   ├── metadata-examples.tsx  # Field documentation
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication
│   │   ├── metadata/      # Metadata CRUD
│   │   ├── upload.ts      # File upload
│   │   └── ...
│   ├── edit/[id].tsx      # Edit metadata
│   └── metadata/[id].tsx  # View metadata
├── 📂 prisma/              # Database schema & migrations
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts           # Database seeding
├── 📂 public/             # Static assets
│   ├── file.svg
│   ├── globe.svg
│   └── ...
├── 📂 uploads/            # Uploaded files directory
├── 🐳 docker-compose.yml  # Docker services
├── 🐳 Dockerfile         # Container configuration
├── 📦 package.json       # Dependencies & scripts
├── ⚙️ next.config.ts     # Next.js configuration
├── 🎨 tailwind.config.js # TailwindCSS configuration
├── 🔧 eslint.config.mjs  # ESLint configuration
└── 📖 README.md          # This file
```

## ⚙️ Environment Variables

### Required
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@db:5432/geospatial_metadata?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="another-secret-key"
```

### Optional
```env
# Email Configuration (for notifications)
EMAIL_FROM="noreply@dkb.go.id"
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASS="your-app-password"

# External APIs (future integration)
CKAN_BASE_URL="https://data.go.id/api/3/action"
CKAN_API_KEY="your-ckan-api-key"

# Development
NODE_ENV="development"
DEBUG="true"
```

## 🔒 Security

### Security Features Implemented

#### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication with configurable expiration
- **Role-based Access Control**: Admin and User roles with different permissions
- **Password Security**: bcrypt hashing with salt rounds, complexity requirements
- **Session Management**: Secure token handling and validation

#### Rate Limiting & Abuse Prevention
- **Authentication Rate Limiting**: 5 attempts per 15 minutes for login/register
- **API Rate Limiting**: 100 requests per 15 minutes per IP
- **File Upload Limiting**: 10 uploads per hour per IP
- **Request Size Limits**: 10MB general limit, 100MB for file uploads

#### Input Validation & Sanitization
- **Email Validation**: RFC-compliant email format validation
- **Password Complexity**: Minimum 8 characters, uppercase, lowercase, numbers, special characters
- **Input Sanitization**: XSS prevention, HTML tag removal, length limits
- **File Type Validation**: Extension and MIME type checking

#### File Security
- **Content Validation**: Magic number checking for file signatures
- **Size Limits**: Configurable upload size restrictions
- **Path Traversal Protection**: Secure file path handling
- **Directory Traversal Prevention**: Upload directory isolation

#### Network Security
- **CORS Configuration**: Configurable allowed origins
- **Security Headers**: Comprehensive HTTP security headers
- **HTTPS Enforcement**: SSL/TLS requirement in production
- **Request Validation**: Content-Type and request size validation

#### Data Protection
- **Database Encryption**: Secure credential storage
- **Environment Variables**: Sensitive data in environment files
- **Audit Logging**: Security event logging and monitoring
- **Error Handling**: Secure error responses without information leakage

### Security Configuration

#### Environment Variables for Security
```env
# Authentication Security
JWT_SECRET="change-this-to-a-very-long-random-string-in-production-at-least-64-characters"
JWT_EXPIRES_IN="7d"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window
AUTH_RATE_LIMIT_MAX=5                # Max auth attempts per window
UPLOAD_RATE_LIMIT_MAX=10             # Max uploads per hour

# CORS Security
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# File Security
MAX_FILE_SIZE=104857600              # 100MB in bytes

# Database Security
POSTGRES_USER="secure_db_user"
POSTGRES_PASSWORD="very-strong-password-here"
```

#### Security Headers Applied
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts device access
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Content-Security-Policy` - API endpoint CSP restrictions

### Security Best Practices

#### Production Deployment
1. **Change Default Secrets**: Never use default JWT secrets or passwords
2. **Use HTTPS**: Always deploy behind HTTPS with valid SSL certificates
3. **Environment Separation**: Use different secrets for each environment
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Monitoring**: Implement logging and monitoring for security events

#### Password Policy
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords allowed

#### File Upload Security
- Validate file types by content, not just extension
- Scan for malware (recommended: integrate with antivirus service)
- Store uploads outside web root
- Use random filenames to prevent enumeration
- Implement upload quotas per user

#### Database Security
- Use strong, unique passwords
- Restrict database user permissions
- Enable database encryption at rest
- Regular backup with encryption
- Monitor for suspicious queries

### Security Monitoring

#### Audit Logs
The application logs security events including:
- Failed login attempts
- Rate limit violations
- File upload attempts
- CORS violations
- Input validation failures

#### Monitoring Recommendations
- Implement centralized logging (ELK stack, etc.)
- Set up alerts for security events
- Regular security audits and penetration testing
- Monitor for unusual patterns (brute force, etc.)

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Docker Production Deployment
```bash
# Full production stack
docker-compose -f docker-compose.yml up --build -d

# Scale application containers
docker-compose up -d --scale app=3
```

### Environment-Specific Deployment

#### Development
```bash
cp .env.example .env.local
# Edit .env.local for development settings
npm run dev
```

#### Staging
```bash
cp .env.example .env.staging
# Configure staging environment variables
docker-compose -f docker-compose.staging.yml up -d
```

#### Production
```bash
cp .env.example .env.production
# Configure production environment variables
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Development Guidelines

### Code Style
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if prettier is configured)
npm run format
```

### Database Operations
```bash
# Create new migration
npx prisma migrate dev --name your-migration-name

# Reset database (development only)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate

# View database
npx prisma studio
```


### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add new geospatial processing feature"

# Push to branch
git push origin feature/your-feature-name

# Create Pull Request
# Use conventional commits: feat, fix, docs, style, refactor, test, chore
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Test database connection
npx prisma db push --preview-feature
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/

# Check file size limits in next.config.js
# Check multer configuration in upload API
```

#### Authentication Issues
```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify token expiration
# Check database user records
npx prisma studio
```

### Performance Optimization
```bash
# Analyze bundle size
npm run build --analyze

# Check for unused dependencies
npx depcheck

# Optimize images
# Use next/image component for all images
```

## 🤝 Contributing

### Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/geospatial-metadata-app.git`
3. **Create** feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`
5. **Setup** database: Follow installation steps above
6. **Make** your changes
7. **Test** thoroughly: `npm run lint && npm test`
8. **Commit** changes: `git commit -m 'feat: add amazing feature'`
9. **Push** to branch: `git push origin feature/amazing-feature`
10. **Create** Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Use semantic commit messages
- **Testing**: Write tests for new features

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Examples:
- feat: add shapefile upload support
- fix: resolve authentication token issue
- docs: update API documentation
- test: add unit tests for metadata validation
```

## 📈 Roadmap

### Version 1.1.0 (Planned)
- [ ] Enhanced metadata validation against SNI ISO 19115:2019 standards
- [ ] Advanced search and filtering capabilities
- [ ] Bulk metadata operations and batch processing
- [ ] Integration with national geospatial data portals

### Version 1.2.0 (Future)
- [ ] API rate limiting and advanced security features
- [ ] Webhook notifications for metadata updates
- [ ] Advanced geospatial analysis and processing tools
- [ ] Enhanced mobile responsiveness and PWA features

### Future Enhancements
- [ ] Machine learning for intelligent metadata categorization
- [ ] Real-time collaborative editing features
- [ ] Integration with cloud storage providers (AWS S3, Google Cloud)
- [ ] Advanced data visualization and mapping tools
- [ ] Automated metadata quality scoring

## 📞 Support

### Getting Help
- 📧 **Email**: support@dkb.go.id
- 💬 **Issues**: GitHub Issues
- 📖 **Documentation**: This README and inline code comments

### Community
- 🌐 **Website**: https://dkb.go.id
- 📱 **LinkedIn**: DKB Otorita Ibu Kota Nusantara
- 🐦 **Twitter**: @DKBOIKN

## 📄 License

**MIT License** - see [LICENSE](LICENSE) file for details

```
Copyright (c) 2024 DKB Otorita Ibu Kota Nusantara

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**Built with ❤️ for DKB Otorita Ibu Kota Nusantara**

[🌐 Website](https://dkb.go.id) • [📧 Contact](mailto:info@dkb.go.id) • [🐛 Report Bug](https://github.com/dkb-oikn/geospatial-metadata-app/issues)

</div>
