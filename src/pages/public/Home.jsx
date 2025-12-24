import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Tag } from 'lucide-react';
import api from '../../services/api';

const Home = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    status: '',
    search: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchItems();
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
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/items?${params.toString()}`);
      let itemsData = response.data.data || [];

      if (filters.search) {
        itemsData = itemsData.filter(item =>
          item.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TrustFound</h1>
          <p className="text-xl opacity-90">Sistem Lost & Found Kampus yang Aman dan Terpercaya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari barang..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Cari
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Tidak ada barang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={`https://api.thrqrhmn.my.id/uploads${item.image_url}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    {item.is_sensitive === 1 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Sensitif</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Tag size={14} className="mr-2" />
                      <span>{item.category_name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      <span>{item.found_location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      <span>{new Date(item.found_date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimClick(item.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Klaim Barang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
