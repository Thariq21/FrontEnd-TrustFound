import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn, AlertCircle, GraduationCap, ShieldCheck } from 'lucide-react';
// Import path yang benar (relatif dari src/pages/auth/ ke src/services/)
import api from '../../services/api'; 

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  // State untuk membedakan tipe user: mahasiswa atau staff
  const [userType, setUserType] = useState('mahasiswa'); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- LOGIKA DETEKSI TIPE INPUT & USER ---
      // Cek apakah input hanya angka
      const isNumeric = /^\d+$/.test(formData.identifier);
      
      const payload = {
        password: formData.password,
      };

      // Tentukan Endpoint berdasarkan userType
      // Jika userType == 'staff', gunakan endpoint admin login
      // Jika userType == 'mahasiswa', gunakan endpoint default login
      const loginEndpoint = userType === 'staff' ? '/auth/admin/login' : '/auth/login';

      if (isNumeric) {
        // PERBAIKAN 1: Konversi ke Integer untuk memastikan backend menerima angka
        const numericId = parseInt(formData.identifier, 10);

        if (userType === 'staff') {
            payload.nip = numericId; // Kirim sebagai number (untuk admin & satpam)
        } else {
            payload.nim = numericId; // Kirim sebagai number (untuk mahasiswa)
        }
      } else {
        payload.email = formData.identifier;
      }

      console.log(`Mengirim Payload Login ke ${loginEndpoint}:`, payload); 

      // Request ke endpoint yang sesuai
      const response = await api.post(loginEndpoint, payload);
      
      console.log("Response Server:", response.data);

      // Ambil data dari response.data.data sesuai struktur API Anda
      const responseData = response.data.data; 
      
      if (!responseData) {
        throw new Error("Format response server tidak valid: Data user tidak ditemukan.");
      }

      const { token, role, name, nim, nip } = responseData;

      // PERBAIKAN 2: Normalisasi Role ke huruf kecil (lowercase) untuk konsistensi
      const normalizedRole = role ? role.toLowerCase() : 'user';

      // Simpan data sesi
      localStorage.setItem('token', token);
      localStorage.setItem('role', normalizedRole); 
      localStorage.setItem('name', name);
      
      if (nim) localStorage.setItem('nim', nim);
      if (nip) localStorage.setItem('nip', nip);

      // Redirect berdasarkan role yang sudah dinormalisasi
      // Admin dan Satpam diarahkan ke Dashboard
      if (['admin', 'satpam', 'staff'].includes(normalizedRole)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Tangani berbagai format error response, termasuk status 401 dan 500
      let errorMessage = 'Terjadi kesalahan pada server.';
      
      if (err.response) {
          // Server merespon dengan status code selain 2xx
          if (err.response.status === 401) {
              errorMessage = 'Akses Ditolak (401). NIP/NIM atau Password salah.';
          } else if (err.response.status === 404) {
              errorMessage = 'User tidak ditemukan (404). Periksa kembali NIP/NIM Anda.';
          } else if (err.response.status === 500) {
              errorMessage = 'Server Error (500). Mohon coba lagi nanti atau hubungi admin.';
          } else if (err.response.data && err.response.data.message) {
              errorMessage = err.response.data.message;
          } else {
              errorMessage = `Request failed with status code ${err.response.status}`;
          }
      } else if (err.request) {
          // Request dibuat tapi tidak ada respon
          errorMessage = 'Tidak ada respon dari server. Cek koneksi internet Anda.';
      } else {
          // Terjadi error saat setup request
          errorMessage = err.message;
      }

      // Pesan error default yang lebih ramah user jika error spesifik tidak tertangkap
      if (errorMessage === 'Terjadi kesalahan pada server.') {
          if (userType === 'staff') {
            errorMessage = 'Login Gagal. Pastikan NIP dan Password benar.';
          } else {
            errorMessage = 'Login Gagal. Pastikan NIM dan Password benar.';
          }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30 transform rotate-3">
            <span className="text-white font-extrabold text-2xl">TF</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">TrustFound</h1>
          <p className="text-gray-600">Sistem Lost & Found Terintegrasi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm overflow-hidden">
          
          {/* TABS SELECTOR TIPE USER */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => { setUserType('mahasiswa'); setError(''); }}
              className={`py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                userType === 'mahasiswa' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <GraduationCap size={18} />
              Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => { setUserType('staff'); setError(''); }}
              className={`py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                userType === 'staff' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck size={18} />
              Staf / Admin
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Masuk sebagai {userType === 'mahasiswa' ? 'Mahasiswa' : 'Staf (Admin/Satpam)'}
            </h2>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start text-sm animate-pulse">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {userType === 'mahasiswa' ? 'NIM / Email' : 'NIP / Email'}
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                    placeholder={userType === 'mahasiswa' ? "Contoh: 12345678" : "Contoh: 1980xxxx..."}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2 transform active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Memproses...
                  </div>
                ) : (
                  <>
                    <LogIn size={20} className="mr-2" />
                    <span>Masuk Sekarang</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                {userType === 'mahasiswa' ? 'Mahasiswa baru?' : 'Staf baru?'} {' '}
                <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                  Aktivasi Akun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;