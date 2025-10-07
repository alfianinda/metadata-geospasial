Saya akan jelaskan mengapa RAR file tidak bisa diekstrak otomatis di aplikasi ini:

## 🔧 **Alasan Teknis Mengapa RAR Tidak Bisa Diekstrak Otomatis**

### **1. Kompleksitas Format RAR**
- **Algoritma Proprietary**: RAR menggunakan algoritma kompresi proprietary yang kompleks
- **Multi-volume Support**: Mendukung file terpisah (part1.rar, part2.rar)
- **Enkripsi**: Mendukung password protection
- **Solid Archive**: File dikompresi sebagai satu kesatuan

### **2. Keterbatasan Serverless Environment (Vercel)**
Aplikasi ini di-deploy di **Vercel** (serverless), yang memiliki batasan:

- ❌ **Tidak ada akses filesystem persisten**
- ❌ **Tidak bisa install native libraries**
- ❌ **Function timeout (max 10 detik)**
- ❌ **Batasan memory dan CPU**

### **3. Library RAR untuk Node.js**
Library RAR untuk Node.js memiliki masalah:

```javascript
// Kebanyakan library RAR memerlukan:
npm install node-rar  // ❌ Gagal di Vercel
// Karena butuh:
// - Visual Studio Build Tools
// - Python
// - Native C++ compilation
// - System dependencies
```

### **4. Perbandingan ZIP vs RAR**

| Fitur | ZIP | RAR |
|-------|-----|-----|
| **Library JavaScript** | ✅ `yauzl` (pure JS) | ❌ Tidak ada pure JS |
| **Serverless Compatible** | ✅ Bekerja di Vercel | ❌ Butuh native code |
| **Dependencies** | ✅ Minimal | ❌ Berat (C++, Python) |
| **File Size** | ✅ Ringan | ❌ Berat |
| **Memory Usage** | ✅ Efisien | ❌ Boros |

### **5. Solusi Praktis**

**Untuk production web app**, solusi terbaik adalah:

1. **ZIP untuk otomatis**: Mendukung ekstraksi penuh
2. **RAR untuk upload saja**: File disimpan, metadata manual
3. **Konversi di client**: User bisa convert RAR ke ZIP sebelum upload

### **Alternatif Implementasi**

Jika ingin RAR extraction, perlu:

```javascript
// 1. Deploy ke VPS (bukan serverless)
const { exec } = require('child_process')
exec('unrar x file.rar', (error, stdout, stderr) => {
  // Butuh unrar binary terinstall di server
})

// 2. Atau gunakan service eksternal
// - AWS Lambda dengan layer native
// - Google Cloud Functions dengan custom runtime
// - VPS dengan Docker
```

### **Rekomendasi untuk User**

1. **Untuk ekstraksi otomatis**: Convert RAR ke ZIP dulu
2. **Tools konversi**: 7-Zip, WinRAR, atau online converter
3. **Format ZIP**: Lebih universal dan ringan

### **Kesimpulan**

RAR extraction tidak didukung karena **keterbatasan teknis serverless environment**. ZIP lebih praktis untuk web applications karena:
- ✅ Pure JavaScript libraries tersedia
- ✅ Compatible dengan serverless
- ✅ Tidak butuh native compilation
- ✅ Lebih efisien dalam resource usage

Untuk hasil terbaik, **gunakan format ZIP** untuk upload file geospatial dengan ekstraksi otomatis.