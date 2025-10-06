# 📚 Dokumentasi Lengkap Web Metadata Geospasial DKB Otorita Ibu Kota Nusantara

## 🎯 **Pendahuluan**

Web Metadata Geospasial adalah platform digital yang dikembangkan oleh DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara untuk mengelola, menyimpan, dan mendistribusikan metadata geospasial sesuai dengan standar ISO 19115 dan SNI ISO 19115:2019.

### **🔐 Tingkat Akses Pengguna**

| Fitur | User Biasa (Tanpa Login) | Admin (Dengan Login) |
|-------|-------------------------|---------------------|
| Melihat metadata | ✅ | ✅ |
| Mencari metadata | ✅ | ✅ |
| Download metadata | ✅ | ✅ |
| Upload file | ❌ | ✅ |
| Edit metadata | ❌ | ✅ |
| Hapus metadata | ❌ | ✅ |
| Manajemen user | ❌ | ✅ |
| Statistik sistem | ❌ | ✅ |

---

## 👤 **Panduan untuk User Biasa (Tanpa Login)**

### **1. Mengakses Website**

#### **Cara Mengakses:**
1. Kunjungi website: `https://metadata-geospasial.dkb.go.id`
2. **Tidak perlu registrasi atau login**
3. Langsung dapat melihat semua metadata yang tersedia

### **2. Melihat Metadata**

#### **Halaman Utama:**
- Lihat daftar semua metadata geospasial
- Informasi yang ditampilkan:
  - 📝 Judul dataset
  - 📄 Abstrak singkat
  - 👤 Pembuat/Kontak
  - 📅 Tanggal pembuatan
  - 🏷️ Kata kunci
  - 📊 Status dataset

#### **Pencarian Metadata:**
1. Gunakan **search box** di halaman utama
2. Cari berdasarkan:
   - Kata kunci judul
   - Kata kunci abstrak
   - Nama pembuat
   - Kategori topik

#### **Filter Metadata:**
- **Berdasarkan Kategori**: Boundaries, Planning, Environment, dll
- **Berdasarkan Status**: Completed, Ongoing, Planned
- **Berdasarkan Tanggal**: Rentang waktu pembuatan

### **3. Melihat Detail Metadata**

#### **Cara Melihat Detail Lengkap:**
1. Klik pada judul metadata dari daftar
2. Akan diarahkan ke halaman detail: `/metadata/[id]`
3. Informasi lengkap yang tersedia:
   - 📋 **Informasi Dasar**: File ID, bahasa, kontak
   - 🗺️ **Informasi Geografis**: Extent, sistem koordinat, resolusi
   - 📊 **Informasi Teknis**: Format file, ukuran, geometri
   - ✅ **Informasi Kualitas**: Akurasi, kelengkapan, konsistensi
   - 📄 **Informasi Distribusi**: Cara mendapatkan data

### **4. Download Metadata**

#### **Download Format XML:**
1. Di halaman detail metadata
2. Klik tombol **"Download Metadata XML"**
3. File akan terdownload dalam format ISO 19115 XML

#### **Download File Asli (jika tersedia):**
1. Di halaman detail metadata
2. Klik tombol **"Download File Asli"**
3. File geospasial asli akan terdownload

### **5. Memahami Field Metadata**

#### **Field Utama yang Bisa Dilihat:**
- **Title**: Judul dataset
- **Abstract**: Ringkasan lengkap isi dataset
- **Topic Category**: Kategori tema (Boundaries, Planning, dll)
- **Extent**: Cakupan geografis dalam koordinat
- **Spatial Resolution**: Tingkat detail data
- **Coordinate System**: Sistem koordinat (EPSG:4326, UTM, dll)
- **Data Format**: Format file (GeoJSON, Shapefile)
- **File Size**: Ukuran file
- **Feature Count**: Jumlah fitur dalam dataset
- **Geometry Type**: Tipe geometri (Point, Line, Polygon)

---

## 🔧 **Panduan untuk Admin (Dengan Login)**

### **1. Login Admin**

#### **Cara Login:**
1. Kunjungi halaman login: `/login`
2. Masukkan **email admin** (@dkb.go.id)
3. Masukkan **password admin**
4. Klik **"Masuk"**
5. Akan diarahkan ke **dashboard admin**

#### **Dashboard Admin:**
- 📊 **Statistik Sistem**: Total metadata, upload hari ini, user aktif
- 📋 **Metadata Terbaru**: List metadata yang baru diupload
- 👥 **Manajemen User**: Daftar user terdaftar
- ⚙️ **Pengaturan Sistem**: Konfigurasi aplikasi

### **2. Upload File Geospasial**

#### **Proses Upload Lengkap:**
1. **Login** sebagai admin
2. **Akses halaman upload**: `/upload`
3. **Pilih file** dengan cara:
   - Klik **"Pilih File"** atau
   - Drag & drop file ke area upload
4. **Tunggu ekstraksi otomatis** - Sistem akan mengisi 19 field metadata otomatis
5. **Periksa field terisi** - Klik "Tampilkan Field Manual Metadata"
6. **Lengkapi field wajib** jika belum terisi:
   - Title, Abstract, Status, Extent, Contact Name, Contact Email, Spatial Representation Type, Reference System Identifier, Scope
7. **Klik "Upload File"** untuk menyelesaikan

#### **Format File yang Didukung:**
- ✅ **GeoJSON** - File tunggal
- ✅ **Shapefile** - Minimal .shp + .shx + .dbf
- ✅ **Shapefile ZIP/RAR** - File terkompresi
- ⚠️ **Max 10MB per file**

### **3. Mengelola Metadata**

#### **Melihat Semua Metadata:**
1. Dari dashboard, klik **"Lihat Semua Metadata"**
2. Atau akses `/metadata`
3. Filter dan cari seperti user biasa
4. **Tambahan fitur admin**: Edit dan Hapus

#### **Edit Metadata:**
1. Di halaman detail metadata, klik **"Edit"**
2. Atau dari dashboard admin
3. Ubah field yang diperlukan
4. Klik **"Simpan Perubahan"**

#### **Hapus Metadata:**
1. Di halaman detail, klik **"Hapus"**
2. Konfirmasi penghapusan
3. File dan metadata akan dihapus permanen

### **4. Manajemen User**

#### **Melihat Daftar User:**
1. Dari dashboard, klik **"Manajemen User"**
2. Lihat semua user terdaftar
3. Informasi: Nama, Email, Tanggal Registrasi, Status

#### **Mengaktifkan/Nonaktifkan User:**
1. Pilih user dari daftar
2. Klik **"Edit Status"**
3. Pilih **Aktif** atau **Non-aktif**
4. Simpan perubahan

#### **Reset Password User:**
1. Pilih user yang lupa password
2. Klik **"Reset Password"**
3. Sistem kirim email reset ke user

### **5. Statistik dan Laporan**

#### **Melihat Statistik:**
- **Total Metadata**: Jumlah keseluruhan
- **Upload per Hari**: Aktivitas harian
- **Metadata per Kategori**: Distribusi berdasarkan topik
- **User Aktif**: Jumlah user yang login bulan ini

#### **Generate Laporan:**
1. Akses menu **"Laporan"**
2. Pilih tipe laporan:
   - Laporan Metadata Bulanan
   - Laporan User Aktivitas
   - Laporan Kualitas Data
3. Pilih format: PDF atau Excel
4. Klik **"Generate"**

### **6. Pengaturan Sistem**

#### **Konfigurasi Email:**
- Setup SMTP server untuk notifikasi
- Template email registrasi/reset password
- Pengaturan auto-email untuk admin

#### **Manajemen Database:**
- **Backup**: Export database lengkap
- **Restore**: Import dari backup file
- **Cleanup**: Hapus data temporary
- **Optimize**: Perbaikan performa database

---

## 🔌 **API Documentation (untuk Developer)**

### **Public Endpoints (Tanpa Auth):**
```
GET /api/metadata - List semua metadata publik
GET /api/metadata/[id] - Detail metadata publik
GET /api/download/[id] - Download metadata XML
GET /api/download/file/[filename] - Download file publik
```

### **Admin Endpoints (Dengan Auth):**
```
POST /api/auth/login - Login admin
POST /api/upload - Upload file (admin only)
PUT /api/metadata/[id] - Edit metadata (admin only)
DELETE /api/metadata/[id] - Hapus metadata (admin only)
GET /api/admin/stats - Statistik sistem (admin only)
GET /api/admin/users - List users (admin only)
```

### **Response Format:**
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "error": null
}
```

---

## 🛠️ **Troubleshooting**

### **Untuk User Biasa:**

#### **Tidak Bisa Melihat Metadata:**
- **Solusi**: Refresh halaman atau clear cache browser
- **Cek**: Pastikan koneksi internet stabil

#### **Download Gagal:**
- **Solusi**: Coba lagi nanti atau gunakan browser lain
- **Cek**: File mungkin sudah dihapus admin

#### **Pencarian Tidak Berfungsi:**
- **Solusi**: Gunakan kata kunci yang lebih spesifik
- **Cek**: Pastikan ejaan kata kunci benar

### **Untuk Admin:**

#### **Upload Gagal:**
- **Cek**: Ukuran file max 10MB
- **Cek**: Format file didukung (GeoJSON/Shapefile)
- **Cek**: Kuota storage server

#### **Tidak Bisa Login:**
- **Solusi**: Reset password via email
- **Cek**: Pastikan menggunakan email @dkb.go.id

#### **Database Error:**
- **Solusi**: Restart aplikasi
- **Cek**: Koneksi database dan disk space

---

## 📋 **Field Metadata Lengkap (19 Field Auto-fill)**

Sistem akan mengisi otomatis **19 field metadata** saat upload:

1. **title** - Judul dataset dari layer name
2. **abstract** - Ringkasan lengkap isi dataset
3. **purpose** - Tujuan penggunaan berdasarkan tipe data
4. **topicCategory** - Kategori tema (boundaries, planning, dll)
5. **descriptiveKeywords** - Kata kunci dari atribut
6. **extent** - Cakupan geografis (bounding box)
7. **spatialResolution** - Estimasi resolusi spasial
8. **resourceFormat** - Format file (GeoJSON, Shapefile)
9. **spatialRepresentationType** - Tipe representasi (vector)
10. **referenceSystemIdentifier** - Kode EPSG sistem koordinat
11. **referenceSystemType** - Tipe sistem referensi (geodetic/projected)
12. **attributeDescription** - Deskripsi atribut lengkap
13. **contentType** - Tipe konten (thematicClassification, dll)
14. **processingLevel** - Tingkat pengolahan (processed)
15. **hierarchyLevelName** - Nama hierarki dataset
16. **lineage** - Riwayat pengumpulan dan pemrosesan
17. **accuracy** - Tingkat akurasi posisional
18. **completeness** - Tingkat kelengkapan data
19. **consistency** - Tingkat konsistensi data

---

## 📞 **Kontak dan Dukungan**

### **Untuk User Biasa:**
- **Email Support**: support@dkb.go.id
- **Help Desk**: helpdesk@dkb.go.id
- **Jam Operasional**: Senin-Jumat, 08:00-17:00 WIB

### **Untuk Admin:**
- **Email Admin**: admin@dkb.go.id
- **Technical Support**: dev@dkb.go.id
- **Emergency Hotline**: +62-21-XXXXXXX (24/7)

### **Website Resmi:**
- **DKB Otorita IKN**: https://dkb.go.id
- **Portal Metadata Geospasial**: https://metadata-geospasial.dkb.go.id

---

## 🔄 **Versi dan Update**

### **Versi 1.0.0 (Current):**
- ✅ **User Biasa**: View & download metadata tanpa login
- ✅ **Admin**: Full CRUD operations dengan login
- ✅ **Auto-extraction**: 19 field metadata otomatis
- ✅ **Multi-format**: GeoJSON, Shapefile, ZIP/RAR
- ✅ **ISO 19115**: Validasi standar internasional
- ✅ **Search & Filter**: Pencarian advanced
- ✅ **XML Export**: Download metadata dalam format XML
- ✅ **Admin Dashboard**: Statistik dan manajemen lengkap

### **Fitur Mendatang:**
- 🔄 **Public API** untuk integrasi sistem eksternal
- 🔄 **Mobile App** untuk akses mobile
- 🔄 **Bulk Operations** untuk admin
- 🔄 **Data Visualization** preview peta
- 🔄 **Advanced Analytics** untuk admin
- 🔄 **Integration** dengan software GIS populer

---

## 📖 **Referensi Teknis**

1. **ISO 19115:2014** - Geographic information -- Metadata
2. **SNI ISO 19115:2019** - Standar Nasional Indonesia
3. **RFC 7946** - The GeoJSON Format
4. **ESRI Shapefile** - Technical Description
5. **EPSG Geodetic Parameter Dataset**
6. **OGC Standards** - Open Geospatial Consortium

---

## ⚖️ **Kebijakan Privasi & Penggunaan**

### **Privasi Data:**
- User biasa: Tidak ada data pribadi yang dikumpul
- Admin: Data login untuk keamanan sistem
- Metadata: Data publik untuk akses terbuka

### **Ketentuan Penggunaan:**
- Data metadata bersifat publik dan bebas digunakan
- Cantumkan sumber saat menggunakan data
- Dilarang penyalahgunaan untuk kepentingan komersial tanpa izin
- Admin bertanggung jawab atas keakuratan data yang diupload

---

*📄 Dokumen ini dibuat oleh Tim DKB Otorita Ibu Kota Nusantara*  
*🗓️ Terakhir diperbarui: Oktober 2024*  
*👥 Versi: 1.0.0*