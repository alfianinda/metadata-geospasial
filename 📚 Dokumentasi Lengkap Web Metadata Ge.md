# 📚 Dokumentasi Web Metadata Geospasial DKB Otorita Ibu Kota Nusantara

## 🎯 **Pendahuluan**

Web Metadata Geospasial adalah platform digital yang dikembangkan Nur Inna Alfianinda, Perekayasa di Direktorat Data dan Kecerdasan Buatan, Otorita Ibu Kota Nusantara, untuk mengelola, menyimpan, dan mendistribusikan metadata geospasial sesuai dengan standar ISO 19115 dan SNI ISO 19115:2019.

### **🔐 Tingkat Akses Pengguna**

| Fitur | User Biasa (Tanpa Login) | Admin (Dengan Login) |
|-------|-------------------------|---------------------|
| Melihat metadata | ✅ | ✅ |
| Mencari metadata | ✅ | ✅ |
| Download metadata | ✅ | ✅ |
| Upload file | ❌ | ✅ |
| Edit metadata | ❌ | ✅ |
| Hapus metadata | ❌ | ✅ |
| Statistik sistem | ❌ | ✅ |

---

## 👤 **Panduan untuk User (Non-Admin)**

### **1. Mengakses Website**

#### **Cara Mengakses:**
1. Kunjungi website: `https://geospatial-metadata-app.vercel.app/`
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

### **3. Melihat Detail Metadata**

#### **Cara Melihat Detail Lengkap:**
1. Klik pada `view details` metadata dari daftar
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
2. Klik tombol **"ISO XML, SNI JSON, dan SNI ISO XML"**
3. File akan terdownload dalam format ISO 19115 XML

#### **Download File Asli (jika tersedia):**
1. Di halaman detail metadata bagian `Associated Files`
2. Klik tombol **"Download"**
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
2. Masukkan **email admin** 
3. Masukkan **password admin**
4. Klik **"Masuk"**
5. Akan diarahkan ke **dashboard admin**

#### **Dashboard Admin:**
- 📊 **Statistik Sistem**: Total metadata, upload hari ini, user aktif
- 📋 **Metadata Terbaru**: List metadata yang baru diupload
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
1. Dari halaman dashboard atau akses `/metadata`
2. Filter dan cari seperti user biasa
3. **Tambahan fitur admin**: Edit dan Hapus

#### **Edit Metadata:**
1. Di halaman detail metadata, klik **"Edit"**
2. Atau dari dashboard admin
3. Ubah field yang diperlukan
4. Klik **"Simpan Perubahan"**

#### **Hapus Metadata:**
1. Di halaman detail, klik **"Hapus"**
2. Konfirmasi penghapusan
3. File dan metadata akan dihapus permanen

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
- **Email Support**: ni.alfianinda@gmail.com
- **Help Desk**: ni.alfianinda@gmail.com
- **Jam Operasional**: Senin-Jumat, 08:00-17:00 WIB

### **Untuk Admin:**
- **Email Admin**: ni.alfianinda@gmail.com
- **Technical Support**: ni.alfianinda@gmail.com

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

*📄 Dokumen ini dibuat oleh Nur Inna Alfianinda, Staff Perekayasa di Direktorat Data dan Kecerdasan Buatan, Otorita Ibu Kota Nusantara*  
*🗓️ Terakhir diperbarui: Oktober 2024*  
*👥 Versi: 1.0.0*