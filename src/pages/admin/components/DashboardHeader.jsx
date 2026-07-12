// src/pages/admin/components/DashboardHeader.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Shield, RefreshCw, FileText, Menu, X, Home } from 'lucide-react';

export default function DashboardHeader({ onRefresh }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth/login');
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title & User Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Logo TrustFound */}
            <Link to="/admin/dashboard" className="flex items-center space-x-2 border-r border-gray-300 pr-3 sm:pr-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/Logo-TrustFound2.0.png" 
                  alt="TrustFound Logo"
                  className="w-70 h-70" 
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden md:block">TrustFound</span>
            </Link>

            {/* Title Admin */}
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Selamat datang, <span className="font-medium">{user.name || 'Admin'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Right: Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </button>

            {/* Laporan Button - Download Reports */}
            <button
              onClick={() => navigate('/admin/reports')}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Laporan Bulanan
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            )}

            {/* Logout Button */}
            <button
               onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-3">
             <button
               onClick={() => { navigate('/'); setIsMenuOpen(false); }}
               className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
             >
               <Home className="h-4 w-4 mr-2" />
               Home
             </button>

             <button
               onClick={() => { navigate('/admin/reports'); setIsMenuOpen(false); }}
               className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
             >
               <FileText className="h-4 w-4 mr-2" />
               Laporan Bulanan
             </button>

             {onRefresh && (
               <button
                 onClick={() => { onRefresh(); setIsMenuOpen(false); }}
                 className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
               >
                 <RefreshCw className="h-4 w-4 mr-2" />
                 Refresh Data
               </button>
             )}

             <button
               onClick={() => { handleLogout(); setIsMenuOpen(false); }}
               className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
             >
               <LogOut className="h-4 w-4 mr-2" />
               Logout
             </button>
          </div>
        )}
      </div>
    </div>
  );
}