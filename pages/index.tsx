import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDefSlide, setCurrentDefSlide] = useState(0);

  const slides = [
    {
      title: "Pengelolaan Data Andal",
      description: "Langkah strategis untuk memastikan pengelolaan data geospasial yang andal, terintegrasi, dan dapat dipertanggungjawabkan.",
      icon: (
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Integrasi Sistem",
      description: "Memahami konten, cakupan, dan validitas data sehingga memudahkan integrasi antar sistem informasi geospasial.",
      icon: (
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Dokumentasi Teknis",
      description: "Untuk mendokumentasikan informasi teknis dan administratif dari data geospasial secara lengkap.",
      icon: (
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Interoperabilitas Data",
      description: "Dengan pemberlakuan standar ini, metadata geospasial mendukung interoperabilitas data di berbagai sektor untuk meningkatkan akurasi dan kualitas informasi.",
      icon: (
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: "Sistem Nasional",
      description: "Meningkatkan efisiensi tata kelola data di tingkat nasional dan memperkuat Sistem Informasi Geospasial Nasional (SIGN) sebagai fondasi Satu Data Indonesia.",
      icon: (
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const definitionSlides = [
    {
      title: "Data Geospasial",
      subtitle: "Menurut Peraturan BIG No. 3 Tahun 2023",
      description: "Data Geospasial merupakan data tentang lokasi geografis, dimensi atau ukuran, dan/atau karakteristik objek alam dan/atau buatan manusia yang berada di bawah, pada, atau di atas permukaan bumi.",
      icon: (
        <svg className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Metadata",
      subtitle: "Menurut Peraturan BIG No. 3 Tahun 2023",
      description: "Metadata merupakan data yang menjelaskan riwayat dan karakteristik Data Geospasial.",
      icon: (
        <svg className="h-16 w-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Metadata",
      subtitle: "Menurut Perpres 39 Tahun 2019 tentang SDI",
      description: "Metadata adalah informasi dalam bentuk struktur dan format yang baku untuk menggambarkan data, menjelaskan data, serta memudahkan pencarian, penggunaan, dan pengelolaan informasi data.",
      icon: (
        <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDefSlide((prev) => (prev + 1) % definitionSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [definitionSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextDefSlide = () => {
    setCurrentDefSlide((prev) => (prev + 1) % definitionSlides.length);
  };

  const prevDefSlide = () => {
    setCurrentDefSlide((prev) => (prev - 1 + definitionSlides.length) % definitionSlides.length);
  };

  const goToDefSlide = (index: number) => {
    setCurrentDefSlide(index);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-8">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
              Sistem Metadata Geospasial
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform terintegrasi untuk mengelola metadata geospasial yang mematuhi standar SNI ISO 19115:2019,
              memastikan interoperabilitas dan kualitas data geospasial Indonesia
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/metadata"
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                Jelajahi Metadata
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Definitions Slider */}
          <div className="mb-16">
            <div className="relative w-full overflow-hidden rounded-lg shadow-lg bg-white">
              <div className="relative h-100 md:h-80">
                {definitionSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                      index === currentDefSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      <div className="flex-shrink-0 mb-6">
                        {slide.icon}
                      </div>
                      <div className="text-center max-w-4xl">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{slide.subtitle}</p>
                        <blockquote className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-6 leading-relaxed">
                          {slide.description}
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Slider indicators */}
              <div className="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
                {definitionSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-3 h-3 rounded-full ${
                      index === currentDefSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-current={index === currentDefSlide ? 'true' : 'false'}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => goToDefSlide(index)}
                  ></button>
                ))}
              </div>
              {/* Slider controls */}
              <button
                type="button"
                className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={prevDefSlide}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                  <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="hidden">Previous</span>
                </span>
              </button>
              <button
                type="button"
                className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={nextDefSlide}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                  <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span className="hidden">Next</span>
                </span>
              </button>
            </div>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Mengapa Metadata Geospasial Penting?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Metadata geospasial adalah fondasi untuk pengelolaan data geospasial yang efektif dan berkualitas
            </p>
          </div>
          {/* Benefits Slider - Full Width */}
          <div className="mb-16">
            <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-70 md:h-50">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700"></div>
                    <div className="absolute top-8 left-8 flex items-center">
                      {slide.icon}
                      <div className="ml-6 text-white">
                        <h5 className="text-2xl font-bold mb-3">{slide.title}</h5>
                        <p className="text-base leading-relaxed max-w-2xl">{slide.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Slider indicators */}
              <div className="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-current={index === currentSlide ? 'true' : 'false'}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => goToSlide(index)}
                  ></button>
                ))}
              </div>
              {/* Slider controls */}
              <button
                type="button"
                className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={prevSlide}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                  <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="hidden">Previous</span>
                </span>
              </button>
              <button
                type="button"
                className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                onClick={nextSlide}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                  <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span className="hidden">Next</span>
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="card">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Interoperabilitas Data
                </h3>
                <p className="text-gray-600 mb-4">
                  Memastikan data geospasial dapat diakses dan digunakan oleh berbagai sistem dan aplikasi
                  dengan standar yang seragam.
                </p>
                <blockquote className="text-sm text-gray-500 italic border-l-4 border-indigo-500 pl-4">
                  "Metadata memungkinkan interoperabilitas data geospasial antar sistem yang berbeda"
                  <footer className="text-xs text-gray-400 mt-2">- SNI ISO 19115:2019</footer>
                </blockquote>
              </div>
            </div>

            <div className="card">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Kualitas dan Keandalan
                </h3>
                <p className="text-gray-600 mb-4">
                  Menjamin kualitas, akurasi, dan keandalan data geospasial melalui dokumentasi yang lengkap
                  dan terstruktur.
                </p>
                <blockquote className="text-sm text-gray-500 italic border-l-4 border-green-500 pl-4">
                  "Metadata yang baik adalah kunci untuk menjaga kualitas data geospasial"
                  <footer className="text-xs text-gray-400 mt-2">- ISO 19157:2013</footer>
                </blockquote>
              </div>
            </div>

            <div className="card">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Kepatuhan Standar
                </h3>
                <p className="text-gray-600 mb-4">
                  Memenuhi standar internasional dan nasional untuk data geospasial, memastikan
                  konsistensi dan keberlanjutan.
                </p>
                <blockquote className="text-sm text-gray-500 italic border-l-4 border-purple-500 pl-4">
                  "Standar metadata memastikan konsistensi dan interoperabilitas data geospasial"
                  <footer className="text-xs text-gray-400 mt-2">- SNI ISO 19115:2019</footer>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Standards Quote */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Standar SNI ISO 19115:2019
              </h3>
              <blockquote className="text-lg text-gray-700 italic mb-6">
                "Metadata geospasial menyediakan informasi yang diperlukan untuk memahami, mengevaluasi,
                dan menggunakan data geospasial secara efektif. Metadata yang lengkap dan akurat
                adalah prasyarat untuk pengelolaan data geospasial yang baik."
              </blockquote>
              <p className="text-sm text-gray-500">
                — SNI ISO 19115:2019 Geographic information — Metadata
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Contoh Metadata yang Sesuai Standar
            </h2>
            <p className="text-lg text-gray-600">
              Lihat bagaimana metadata geospasial yang baik dapat meningkatkan kualitas dan kegunaan data
  
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Metadata Lengkap
              </h3>
              <p className="text-gray-600 mb-4">
                Contoh: Peta Administrasi Indonesia dengan metadata lengkap termasuk
                sistem koordinat WGS84, skala 1:25000, dan informasi kontak yang jelas.
              </p>
              <div className="text-left bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">Elemen Metadata:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Judul: Peta Administrasi Indonesia</li>
                  <li>• Abstrak: Peta batas administrasi lengkap</li>
                  <li>• Sistem Koordinat: WGS84 UTM Zone 49S</li>
                  <li>• Skala: 1:25000</li>
                  <li>• Kontak: Badan Geospasial Indonesia</li>
                </ul>
              </div>
            </div>

            <div className="card text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Data Statistik Penduduk
              </h3>
              <p className="text-gray-600 mb-4">
                Contoh: Dataset statistik penduduk dengan metadata temporal yang lengkap,
                memungkinkan analisis tren demografi dari waktu ke waktu.
              </p>
              <div className="text-left bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">Informasi Temporal:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Periode: 2010 - 2023</li>
                  <li>• Frekuensi Update: Tahunan</li>
                  <li>• Tanggal Pembaruan Terakhir: 2023-12-31</li>
                  <li>• Sumber: DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara</li>
                  <li>• Cakupan: Seluruh Indonesia</li>
                </ul>
              </div>
            </div>

            <div className="card text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Data Iklim dan Cuaca
              </h3>
              <p className="text-gray-600 mb-4">
                Contoh: Dataset curah hujan dengan metadata spasial yang akurat,
                memungkinkan integrasi dengan sistem peringatan dini bencana.
              </p>
              <div className="text-left bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">Informasi Spasial:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Cakupan: 6°S - 11°N, 95°E - 141°E</li>
                  <li>• Resolusi: 0.25° x 0.25°</li>
                  <li>• Sistem Koordinat: WGS84</li>
                  <li>• Format: NetCDF + GeoTIFF</li>
                  <li>• Sumber: BMKG (Badan Meteorologi)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold gradient-text mb-6">
            Manfaat Metadata Geospasial untuk Indonesia
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Dengan metadata yang sesuai standar SNI ISO 19115:2019, data geospasial Indonesia
            menjadi lebih dapat diandalkan, dapat diakses, dan siap untuk mendukung pembangunan nasional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/metadata"
              className="btn-primary px-8 py-4 text-lg font-semibold"
            >
              Jelajahi Metadata
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}