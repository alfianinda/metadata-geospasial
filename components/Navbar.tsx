'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import jwt from 'jsonwebtoken'

interface User {
  userId: string
  email: string
  name: string
  role: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

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
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">GeoMeta</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/upload" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                    Upload
                  </Link>
                )}
                <Link href="/metadata" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                  Metadata
                </Link>
                {user && (
                  <Link href="/metadata-examples" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                    Panduan
                  </Link>
                )}
                {/* {isAdmin && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href="/login" className="btn-secondary">
                      Masuk
                    </Link>
                    <Link href="/register" className="btn-primary">
                      Daftar
                    </Link>
                  </div>
                )} */}
                <button
                  className="ml-4 btn-primary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                  Beranda
                </Link>
                <Link href="/metadata" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition duration-200 hover:bg-gray-50">
                  Metadata
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-50 transition duration-200"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/dashboard" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                      Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/upload" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                      Upload
                    </Link>
                  )}
                  <Link href="/metadata" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                    Metadata
                  </Link>
                  {user && (
                    <Link href="/metadata-examples" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                      Panduan
                    </Link>
                  )}
                  {/*isAdmin && (
                    <div className="mt-4 space-y-2">
                      <Link href="/login" className="block w-full btn-secondary text-center">
                        Masuk
                      </Link>
                      <Link href="/register" className="block w-full btn-primary text-center">
                        Daftar
                      </Link>
                    </div>
                  )*/}
                  <button
                    className="block w-full text-left btn-primary mt-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                    Beranda
                  </Link>
                  <Link href="/metadata" className="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition duration-200">
                    Metadata
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}