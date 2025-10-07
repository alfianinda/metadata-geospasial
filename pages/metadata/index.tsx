'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import jwt from 'jsonwebtoken'

interface Metadata {
  id: string
  title: string
  abstract?: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  user: {
    id: string
    email: string
    name?: string
  }
  files: Array<{
    id: string
    filename: string
    originalName: string
    size: number
  }>
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

export default function MetadataList() {
  const [metadata, setMetadata] = useState<Metadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
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

  const checkAuthAndFetchMetadata = async () => {
    await fetchMetadata()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
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
    // Don't apply filters immediately - wait for user to click "Terapkan Filter"
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
      await fetchMetadataWithFilters(pendingFilters, 1, sortBy, sortOrder)

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
    // Clear any pending search timeout
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
      limit: '12',
      sortBy: sortBy,
      sortOrder: sortOrder
    })

    // No search or filter parameters - show all data
    fetch(`/api/metadata?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else if (response.status === 401) {
        // If unauthorized, try without token (public access)
        const publicResponse = fetch(`/api/metadata?${params}`)
        return publicResponse
      } else {
        throw new Error('Failed to fetch metadata')
      }
    })
    .then(data => {
      if (data && data.ok) {
        return data.json()
      } else if (data) {
        setMetadata(data.data)
        setPagination(data.pagination)
        setError(null)
      }
    })
    .then(publicData => {
      if (publicData) {
        setMetadata(publicData.data)
        setPagination(publicData.pagination)
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

  const fetchMetadataWithFilters = async (filterParams: typeof filters, page = currentPage, sort = sortBy, order = sortOrder) => {
    try {
      setLoading(true)
      setError(null)

      // Try to get token, but don't require it for viewing
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12', // Show 12 items per page for public view
        sortBy: sort,
        sortOrder: order
      })

      // Add search and filter parameters
      if (searchQuery && searchQuery.trim() !== '') params.append('search', searchQuery.trim())
      if (filterParams.category) params.append('category', filterParams.category)
      if (filterParams.dataType) params.append('dataType', filterParams.dataType)
      if (filterParams.format) params.append('format', filterParams.format)
      if (filterParams.source) params.append('source', filterParams.source)
      if (filterParams.status) params.append('status', filterParams.status)
      if (filterParams.dateFrom) params.append('dateFrom', filterParams.dateFrom)
      if (filterParams.dateTo) params.append('dateTo', filterParams.dateTo)

      const response = await fetch(`/api/metadata?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const responseData: MetadataResponse = await response.json()
        setMetadata(responseData.data || [])
        setPagination(responseData.pagination)
      } else if (response.status === 401) {
        // If unauthorized, try without token (public access)
        const publicResponse = await fetch(`/api/metadata?${params}`)
        if (publicResponse.ok) {
          const responseData: MetadataResponse = await publicResponse.json()
          setMetadata(responseData.data || [])
          setPagination(responseData.pagination)
        } else {
          setError('Unable to load metadata. Please try again later.')
        }
      } else {
        setError('Failed to load metadata')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
      console.error('Error fetching metadata:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetadata = async (page = currentPage, sort = sortBy, order = sortOrder) => {
    await fetchMetadataWithFilters(filters, page, sort, order)
  }

  // Remove client-side filtering since we now use server-side pagination

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Geospatial Metadata Repository
          </h1>
          <p className="text-lg text-gray-600">Browse and explore geospatial metadata from various sources</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari & Filter Metadata
            </h3>
          </div>

          <div className="flex items-center gap-4 mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">

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
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="planned">Planned</option>
                  <option value="deprecated">Deprecated</option>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading metadata...</span>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {metadata.length} metadata entries
                {pagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              </p>
            </div>

            {/* Metadata Grid */}
            {metadata.length === 0 ? (
              <div className="text-center py-20">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No metadata found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || Object.values(filters).some(v => v !== '')
                    ? 'Coba sesuaikan kriteria pencarian atau filter Anda.'
                    : 'Belum ada entri metadata yang tersedia saat ini.'}
                </p>
                {(searchQuery || Object.values(filters).some(v => v !== '')) && (
                  <button
                    onClick={() => {
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
                      fetchMetadata(1, sortBy, sortOrder)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    Hapus Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metadata.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isPublished ? 'status-published' : 'status-draft'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      {item.abstract && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {item.abstract}
                        </p>
                      )}

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.user.name || item.user.email}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-6">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {item.files.length} file{item.files.length !== 1 ? 's' : ''}
                      </div>

                      <Link
                        href={`/metadata/${item.id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200"
                      >
                        View Details
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
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
          </>
        )}
      </div>
    </div>
  )
}