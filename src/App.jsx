import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UploadItem from './pages/user/UploadItem';
import ClaimItem from './pages/user/ClaimItem';
import Profile from './pages/user/Profile';
import Dashboard from './pages/admin/Dashboard';
import NotFound from './pages/public/NotFound'; // Import NotFound

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/claim/:itemId"
            element={
              <ProtectedRoute>
                <ClaimItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route untuk 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;