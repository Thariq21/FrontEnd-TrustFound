import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Tag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl, formatDate } from '../../utils/helpers';

const Home = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 4 : 8);
  
  // State untuk filter
  const [filters, setFilters] = useState({
    category_id: '',
    search: '',
  });
  
  const navigate = useNavigate();

  // Resize listener for responsive pagination
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 4 : 8);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page to 1 when items array length changes (e.g. after search)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, itemsPerPage]);

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchItems()]);
      } catch (err) {
        console.error("Initial data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      // Default tampilkan yang statusnya 'secured'
      params.append('status', 'secured'); 
      if (filters.category_id) params.append('category_id', filters.category_id);

      const response = await api.get(`/items?${params.toString()}`);
      let itemsData = response.data.data || [];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        itemsData = itemsData.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.found_location?.toLowerCase().includes(searchLower)
        );
      }

      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Gagal memuat data barang.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchItems();
  };

  const handleClaimClick = (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    navigate(`/claim/${itemId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Trust<span className="text-blue-200">Found</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Pusat informasi barang hilang dan temuan di lingkungan kampus yang aman, transparan, dan terpercaya.
          </p>
        </div>
      </div>

      {/* Search & Filter Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama barang, lokasi, atau ciri-ciri..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="md:col-span-4">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.category_id || cat.id} value={cat.category_id || cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 flex items-center gap-2 border border-red-200">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Tidak ada barang ditemukan</h3>
            <p className="text-gray-500 mt-1">Coba ubah kata kunci atau kategori pencarian Anda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentItems.map(item => (
                <div key={item.item_id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {/* PERBAIKAN: Menggunakan item.image_path sesuai response API */}
                    <img
                      src={getImageUrl(item.image_path)}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        item.is_sensitive === 1 ? 'blur-md scale-110' : ''
                      }`}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                    
                    {item.is_sensitive === 1 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                          Barang Sensitif
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 line-clamp-1 max-w-[150px]">
                        {item.category_name || 'Umum'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>

                    <div className="space-y-2.5 text-sm text-gray-600 mb-4 flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{item.found_location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400 shrink-0" />
                        <span>{formatDate(item.found_date)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimClick(item.item_id)}
                      className="w-full bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white border border-gray-200 hover:border-blue-600 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      Lihat Detail & Klaim
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai <span className="font-medium">{Math.min(startIndex + itemsPerPage, items.length)}</span> dari <span className="font-medium">{items.length}</span> barang
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                              ${currentPage === pageNum 
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile Pagination */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 font-medium">
                    Hal {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  );
};

export default Home;