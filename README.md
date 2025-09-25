# Geospatial Metadata Generator

Aplikasi web untuk generate metadata geospasial otomatis sesuai standar SNI dan ISO 19115/19139 untuk portal Satu Data Indonesia.

## Fitur Utama

- ✅ Upload file GeoJSON dan Shapefile
- ✅ Ekstrak informasi geospasial (bounding box, jumlah fitur)
- ✅ Generate metadata XML sesuai ISO 19115/19139
- ✅ Validasi schema metadata
- ✅ Authentication JWT dengan role-based access
- ✅ UI responsif dengan TailwindCSS
- ✅ Preview dan edit XML metadata
- ✅ Integrasi dengan CKAN API
- ✅ Download metadata XML
- ✅ Edit dan delete metadata

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan PostGIS
- **Authentication**: JWT
- **Container**: Docker & Docker Compose
- **Geospatial Processing**: GDAL/OGR

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL dengan PostGIS

## Installation

1. Clone repository:
```bash
git clone <repository-url>
cd geospatial-metadata-app
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database dan JWT
```

4. Setup database:
```bash
# Jalankan Docker Compose
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Jalankan migration
npx prisma migrate dev
```

5. Run development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user

### Metadata
- `GET /api/metadata` - Get all metadata
- `GET /api/metadata/[id]` - Get metadata by ID
- `POST /api/metadata` - Create metadata
- `PUT /api/metadata/[id]` - Update metadata
- `DELETE /api/metadata/[id]` - Delete metadata

### Upload
- `POST /api/upload` - Upload geospatial files

## Database Schema

### Users
- id, email, password, name, role, timestamps

### Metadata
- id, title, abstract, keywords, spatial info, temporal info, contact info, XML content, etc.

### Files
- id, filename, path, size, metadata relation

## Deployment

1. Build aplikasi:
```bash
npm run build
```

2. Jalankan dengan Docker:
```bash
docker-compose -f docker-compose.yml up -d
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/geospatial_metadata?schema=public"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
CKAN_BASE_URL="https://data.go.id/api/3/action"
CKAN_API_KEY="your-ckan-api-key"
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
