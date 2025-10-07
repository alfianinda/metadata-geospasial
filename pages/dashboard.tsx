'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import jwt from 'jsonwebtoken'

interface Metadata {
  id: string
  title: string
  abstract?: string
  purpose?: string
  status?: string
  updateFrequency?: string
  keywords?: string
  topicCategory?: string
  themeKeywords?: string
  coordinateSystem?: string
  geographicExtent?: string
  spatialResolution?: string
  temporalStart?: string
  temporalEnd?: string
  contactName?: string
  contactEmail?: string
  contactOrganization?: string
  contactRole?: string
  contactPhone?: string
  contactAddress?: string
  metadataContactName?: string
  metadataContactEmail?: string
  metadataContactOrganization?: string
  distributionFormat?: string
  onlineResource?: string
  lineage?: string
  accuracy?: string
  sniCompliant?: boolean
  sniVersion?: string
  sniStandard?: string
  bahasa?: string
  createdAt: string
  isPublished: boolean
  user: {
    role: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface MetadataResponse {
  data: Metadata[]
  pagination: PaginationInfo
}

interface User {
  userId: string
  email: string
  name: string
  role: string
}

interface MetadataStats {
  total: number
  byStatus: {
    published: number
    draft: number
  }
  byDataType: {
    vector: number
    raster: number
  }
  byFormat: {
    shapefile: number
    geopackage: number
    geotiff: number
    geojson: number
  }
  bySource: {
    internal: number
    external: number
  }
  byCategory: Record<string, number>
}

export default function Dashboard() {
  const [metadata, setMetadata] = useState<Metadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<MetadataStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    dataType: '',
    format: '',
    source: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [pendingFilters, setPendingFilters] = useState({
    category: '',
    dataType: '',
    format: '',
    source: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwt.decode(token) as User
        setUser(decoded)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }

    checkAuthAndFetchMetadata()

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats()
    }
  }, [user])

  const checkAuthAndFetchMetadata = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    await fetchMetadata()
  }

  const fetchMetadata = async (page = currentPage, sort = sortBy, order = sortOrder) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Anda belum login. Silakan login terlebih dahulu.')
        router.push('/')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // 3x3 grid
        sortBy: sort,
        sortOrder: order
      })

      // Add search and filter parameters
      if (searchQuery && searchQuery.trim() !== '') params.append('search', searchQuery.trim())
      if (filters.category) params.append('category', filters.category)
      if (filters.dataType) params.append('dataType', filters.dataType)
      if (filters.format) params.append('format', filters.format)
      if (filters.source) params.append('source', filters.source)
      if (filters.status) params.append('status', filters.status)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/metadata?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: MetadataResponse = await response.json()
        setMetadata(data.data)
        setPagination(data.pagination)
        setError(null)
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        router.push('/')
      } else {
        setError('Gagal memuat metadata. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      setError('Terjadi kesalahan jaringan. Silakan periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus metadata ini?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/metadata/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMetadata(currentPage, sortBy, sortOrder) // Refresh the list
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Gagal menghapus metadata')
      }
    } catch (error) {
      console.error('Error deleting metadata:', error)
      setError('Terjadi kesalahan saat menghapus metadata')
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/metadata/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchMetadata(page, sortBy, sortOrder)
  }

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)

    if (newSortBy === 'title') {
      // For title sorting, sort client-side for better control
      const sortedMetadata = [...metadata].sort((a, b) => {
        const titleA = (a.title || '').toLowerCase()
        const titleB = (b.title || '').toLowerCase()
        if (newSortOrder === 'asc') {
          return titleA.localeCompare(titleB, 'id', { sensitivity: 'base' })
        } else {
          return titleB.localeCompare(titleA, 'id', { sensitivity: 'base' })
        }
      })
      setMetadata(sortedMetadata)
    } else {
      fetchMetadata(1, newSortBy, newSortOrder)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    // If search is cleared, reset filters to show all metadata
    if (query.trim() === '') {
      setFilters({
        category: '',
        dataType: '',
        format: '',
        source: '',
        status: '',
        dateFrom: '',
        dateTo: ''
      })
      setPendingFilters({
        category: '',
        dataType: '',
        format: '',
        source: '',
        status: '',
        dateFrom: '',
        dateTo: ''
      })
    }
    // Debounce search to avoid too many API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      fetchMetadata(1, sortBy, sortOrder)
    }, 300)
  }

  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }))
    // Also update filters immediately for instant filtering
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    // Debounce the API call to avoid too many requests
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      fetchMetadata(1, sortBy, sortOrder)
    }, 300)
  }

  const applyFilters = async () => {
    if (isApplying) return // Prevent multiple clicks

    setIsApplying(true)
    setApplyingFilters(true)

    try {
      // Clear any pending search timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
        searchTimeout.current = null
      }

      // Apply pending filters and fetch data immediately
      setFilters(pendingFilters)
      setCurrentPage(1)
      await fetchMetadata(1, sortBy, sortOrder)

      // Add a small delay to ensure UI updates before re-enabling
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsApplying(false)
      setApplyingFilters(false)
    }
  }

  const clearFilters = () => {
    // Clear any pending search timeout to prevent conflicts
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
      searchTimeout.current = null
    }

    // Immediately clear all states
    setSearchQuery('')
    const emptyFilters = {
      category: '',
      dataType: '',
      format: '',
      source: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
    setCurrentPage(1)

    // Force immediate fetch without any debounce or delay
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const params = new URLSearchParams({
      page: '1',
      limit: '9',
      sortBy: sortBy,
      sortOrder: sortOrder
    })

    // No search or filter parameters - show all data
    fetch(`/api/metadata?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        router.push('/')
        return null
      } else {
        throw new Error('Failed to fetch metadata')
      }
    })
    .then(data => {
      if (data) {
        setMetadata(data.data)
        setPagination(data.pagination)
        setError(null)
      }
    })
    .catch(error => {
      console.error('Error clearing filters:', error)
      setError('Terjadi kesalahan saat menghapus filter')
    })
    .finally(() => {
      setLoading(false)
    })
  }

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/metadata/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
          publishedAt: !currentStatus ? new Date() : null
        })
      })

      if (response.ok) {
        await fetchMetadata(currentPage, sortBy, sortOrder) // Refresh the list
        await fetchStats() // Refresh stats
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Gagal mengubah status publikasi')
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      setError('Terjadi kesalahan saat mengubah status publikasi')
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Kelola metadata geospasial Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {user?.role === 'ADMIN' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Metadata</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus.published}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus.draft}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0V1m10 3V1m0 3l1 1v16a2 2 0 01-2 2H6a2 2 0 01-2-2V5l1-1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vector Data</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byDataType.vector}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Metadata Anda
            </h3>
            <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Baru
            </Link>
          </div>

          {/* Status Information */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tentang Status Metadata:</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Draft:</strong> Metadata hanya dapat dilihat oleh Anda (pembuat) dan admin</li>
                  <li><strong>Published:</strong> Metadata dapat dilihat oleh semua pengguna yang mengakses aplikasi</li>
                  <li>Admin dapat mengubah status publikasi kapan saja</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari metadata berdasarkan judul, abstrak, atau kata kunci..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter {showFilters ? '▲' : '▼'}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={pendingFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="boundaries">Boundaries</option>
                    <option value="biota">Biota</option>
                    <option value="climatology">Climatology</option>
                    <option value="economy">Economy</option>
                    <option value="elevation">Elevation</option>
                    <option value="environment">Environment</option>
                    <option value="geoscientific">Geoscientific</option>
                    <option value="health">Health</option>
                    <option value="imagery">Imagery</option>
                    <option value="oceans">Oceans</option>
                    <option value="planning">Planning</option>
                    <option value="society">Society</option>
                    <option value="transportation">Transportation</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Data</label>
                  <select
                    value={pendingFilters.dataType}
                    onChange={(e) => handleFilterChange('dataType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="vector">Vector</option>
                    <option value="grid">Grid</option>
                    <option value="textTable">Text Table</option>
                    <option value="tin">TIN</option>
                    <option value="stereoModel">Stereo Model</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={pendingFilters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Semua Format</option>
                    <option value="GeoJSON">GeoJSON</option>
                    <option value="Shapefile">Shapefile</option>
                    <option value="GeoTIFF">GeoTIFF</option>
                    <option value="GeoPackage">GeoPackage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={pendingFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Semua Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dari</label>
                  <input
                    type="date"
                    value={pendingFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Sampai</label>
                  <input
                    type="date"
                    value={pendingFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={applyFilters}
                    disabled={isApplying}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingFilters ? 'Menerapkan...' : 'Terapkan Filter'}
                  </button>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Hapus Filter
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() => handleSortChange('title')}
                className={`text-sm px-3 py-1 rounded ${sortBy === 'title' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`text-sm px-3 py-1 rounded ${sortBy === 'createdAt' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto"></div>
              </div>
            ) : metadata.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Belum ada metadata</h3>
                <p className="text-gray-500 mb-6">Belum ada file metadata yang diupload. Mulai dengan mengupload file geospasial pertama Anda.</p>
                <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload File Pertama
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metadata.map((item) => (
                  <div
                    key={item.id}
                    className="card animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isPublished ? 'status-published' : 'status-draft'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handlePublishToggle(item.id, item.isPublished)}
                            className={`text-xs px-2 py-1 rounded ${
                              item.isPublished
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={item.isPublished ? 'Unpublish metadata' : 'Publish metadata'}
                          >
                            {item.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Dibuat: <span className="font-medium">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                    </p>

                    <div className="space-y-2">
                      <Link
                        href={`/metadata/${item.id}`}
                        className="btn-primary w-full inline-flex justify-center items-center gap-2"
                      >
                        Lihat Detail
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <div className="flex gap-2">
                          <Link
                            href={`/edit/${item.id}`}
                            className="btn-secondary flex-1 inline-flex justify-center items-center gap-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn-danger flex-1 inline-flex justify-center items-center gap-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                    if (pageNum > pagination.totalPages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pageNum === pagination.page
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
  
      </div>
    )
  }