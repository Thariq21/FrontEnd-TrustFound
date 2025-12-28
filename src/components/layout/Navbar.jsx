import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Upload, Home, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Helper untuk mengecek apakah user adalah admin atau satpam
  const isAdmin = userRole === 'admin' || userRole === 'satpam';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('nim');
    localStorage.removeItem('nip');
    navigate('/auth/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center">
            {/* Jika admin, klik logo ke Dashboard. Jika user biasa/guest, ke Home */}
            <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <img 
                src="/Logo-TrustFound2.0.png" 
                alt="TrustFound Logo"
                className="w-70 h-70" />
              </div>
              <span className="text-xl font-bold text-gray-900">TrustFound</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* PERUBAHAN: Menu Home sekarang tampil untuk semua role (User & Admin) */}
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            {token && (
              <>
                <Link
                  to="/upload"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition"
                >
                  <Upload size={18} />
                  <span>Lapor Barang</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Menu Profile: Hanya tampil jika BUKAN Admin/Satpam */}
                {!isAdmin && (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!token && (
              <Link
                to="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* PERUBAHAN: Menu Home Mobile sekarang tampil untuk semua role */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md transition"
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            {token && (
              <>
                <Link
                  to="/upload"
                  className="flex items-center space-x-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md transition"
                  onClick={() => setIsOpen(false)}
                >
                  <Upload size={18} />
                  <span>Lapor Barang</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                )}

                {!isAdmin && (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition w-full"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!token && (
              <Link
                to="/auth/login"
                className="block text-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;