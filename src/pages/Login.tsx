import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'staff' | 'manager'>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (!email || !password) {
      setErrorMsg('Email dan Password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal terdiri dari 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (!fullName) {
          setErrorMsg('Nama Lengkap wajib diisi.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          setErrorMsg(error.message || 'Pendaftaran gagal.');
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk.');
          setIsRegistering(false);
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Email atau Password salah.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Kurnia Buku</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
            Management System
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fda4af',
            color: '#be123c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontWeight: 'bold' }}>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #6ee7b7',
            color: '#047857',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontWeight: 'bold' }}>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ahmad Fauzi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Role Jabatan</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'staff' | 'manager')}
                  style={{ paddingLeft: '2.5rem', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="staff">Staff Karyawan</option>
                  <option value="manager">Manager / Administrator</option>
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '0.8rem' }}>▼</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
            style={{ padding: '0.75rem', fontSize: '1rem', background: '#1e293b' }}
          >
            {loading ? 'Memproses...' : isRegistering ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          {isRegistering ? (
            <span>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMsg(null);
                }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Masuk di sini
              </button>
            </span>
          ) : (
            <span>
              Belum terdaftar?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMsg(null);
                }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Buat akun baru
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
