import { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, CheckCircle2, XCircle, RotateCcw, Loader2, Package, User, ImagePlus } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode'; // Pastikan sudah menjalankan npm install html5-qrcode
import api from '../../../../services/api';

const SCANNER_ELEMENT_ID = 'qr-reader-box';

const ScanQR = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null); // { success: bool, data?: {...}, message?: string }
  const [cameraError, setCameraError] = useState('');

  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false); // Cegah scan berkali-kali saat masih memproses

  useEffect(() => {
    // Bersihkan kamera saat komponen unmount
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = async (decodedText) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    await stopScanner();
    setValidating(true);
    setResult(null);

    try {
      const response = await api.post('/v2/claims/validate-qr', {
        qr_token: decodedText,
      });

      const payload = response.data?.data || response.data;

      setResult({
        success: true,
        data: payload,
      });
    } catch (err) {
      console.error('Validasi QR gagal:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'QR Code tidak valid atau sudah kedaluwarsa.';

      setResult({
        success: false,
        message: msg,
      });
    } finally {
      setValidating(false);
      isProcessingRef.current = false;
    }
  };

  const startScanner = async () => {
    setCameraError('');
    setResult(null);
    setIsCameraOn(true); // Pastikan container visible sebelum start supaya dimensi kalkulasi html5-qrcode benar

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Callback error per-frame (biasanya "no QR found"), sengaja diabaikan
          }
        );
      } catch (err) {
        console.error('Gagal mengaktifkan kamera:', err);
        setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
        setIsCameraOn(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const state = scanner.getState();
        if (state === 2 /* SCANNING */) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        // Kamera mungkin sudah berhenti duluan, aman diabaikan
      }
      scannerRef.current = null;
    }
    setIsCameraOn(false);
  };

  const handleToggleCamera = () => {
    if (isCameraOn) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  const handleScanAgain = async () => {
    setResult(null);
    setCameraError('');
    await startScanner();
  };

  // Fitur manual upload/capture dari galeri atau kamera native
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (isProcessingRef.current) return;
    
    // Matikan kamera aktif jika ada untuk menghindari bentrok
    if (isCameraOn) {
      await stopScanner();
    }

    setValidating(true);
    setResult(null);
    setCameraError('');

    try {
      let html5QrCode = scannerRef.current;
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
      }
      
      const decodedText = await html5QrCode.scanFile(file, false);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error('Error scanning file:', err);
      setCameraError('Gambar tidak mengandung QR Code atau buram. Silakan coba lagi.');
      setValidating(false);
    } finally {
      // Reset input value supaya bisa pilih file yang sama lagi jika perlu
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <QrCode className="mr-3" size={28} />
              Area Validasi Serah Terima
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Scan QR Code mahasiswa untuk memvalidasi pengambilan barang.
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* Kotak kamera scanner, border putus-putus seperti area upload form */}
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-6 md:p-10">
              {/* Aksen sudut ala viewfinder */}
              <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gray-400 rounded-tl"></span>
              <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gray-400 rounded-tr"></span>
              <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gray-400 rounded-bl"></span>
              <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gray-400 rounded-br"></span>

              <div className="flex flex-col items-center justify-center min-h-[280px]">
                {!isCameraOn && !validating && !result && (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera size={48} className="mb-3" />
                    <p className="text-sm">Kamera belum aktif</p>
                  </div>
                )}

                {cameraError && (
                  <div className="text-center text-red-600 text-sm max-w-sm">
                    <XCircle size={32} className="mx-auto mb-2" />
                    {cameraError}
                  </div>
                )}

                {/* Elemen ini WAJIB selalu ada di DOM agar html5-qrcode bisa mount kamera */}
                <div
                  id={SCANNER_ELEMENT_ID}
                  className={`w-full max-w-md ${isCameraOn ? 'block' : 'hidden'}`}
                ></div>

                {validating && (
                  <div className="flex flex-col items-center text-blue-600">
                    <Loader2 size={40} className="animate-spin mb-3" />
                    <p className="text-sm font-medium">Memvalidasi QR Code...</p>
                  </div>
                )}

                {result && result.success && (
                  <div className="w-full max-w-md">
                    <div className="flex flex-col items-center text-center mb-4">
                      <CheckCircle2 size={48} className="text-green-600 mb-2" />
                      <p className="font-bold text-green-700">Klaim Tervalidasi</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-800">
                        <Package size={16} className="text-green-700 shrink-0" />
                        <span className="font-medium">{result.data?.item_name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-800">
                        <User size={16} className="text-green-700 shrink-0" />
                        <span>{result.data?.claimant_name || result.data?.user_name || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {result && !result.success && (
                  <div className="flex flex-col items-center text-center max-w-sm">
                    <XCircle size={48} className="text-red-600 mb-2" />
                    <p className="font-bold text-red-700 mb-1">Validasi Gagal</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol kontrol */}
            <div className="mt-6 flex justify-center">
              {result ? (
                <button
                  onClick={handleScanAgain}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
                >
                  <RotateCcw size={18} />
                  Scan Lagi
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleToggleCamera}
                    disabled={validating}
                    className={`inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-medium transition shadow-md disabled:opacity-60 ${
                      isCameraOn
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Camera size={18} />
                    {isCameraOn ? 'Matikan Kamera' : 'Aktifkan Kamera'}
                  </button>

                  {/* Tombol Upload / Ambil Foto dari galeri atau kamera asli */}
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-default"
                      disabled={validating}
                    />
                    <button 
                      type="button"
                      disabled={validating}
                      className="w-full inline-flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-60"
                    >
                      <ImagePlus size={18} />
                      Ambil / Upload Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;