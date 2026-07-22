import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Shield, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email:    z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
});

const roleRedirectMap = {
  ADMIN:       '/admin/dashboard',
  ACADEMICIAN: '/academician/dashboard',
  STUDENT:     '/student/dashboard',
};

const devAccounts = import.meta.env.DEV ? [
  { label: 'Admin', email: 'admin@obs.edu.tr', password: 'Admin123!', icon: Shield, color: '#dc2626' },
  { label: 'Akademisyen', email: 'ayse.kaya@obs.edu.tr', password: 'Academic123!', icon: GraduationCap, color: '#2563eb' },
  { label: 'Öğrenci', email: 'ali.veli@obs.edu.tr', password: 'Student123!', icon: BookOpen, color: '#16a34a' },
] : [];

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password);
      toast.success('Hoş geldiniz!');
      navigate(roleRedirectMap[user.role] || '/');
    } catch (err) {
      if (!err.response) {
        toast.error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        toast.error(err.response?.data?.message || 'Giriş yapılamadı, lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
        Giriş Yap
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        Hesabınıza erişmek için bilgilerinizi girin
      </p>

      {devAccounts.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {devAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => { setValue('email', acc.email); setValue('password', acc.password); }}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 6px', borderRadius: 8, border: `1.5px solid ${acc.color}20`,
                  background: `${acc.color}08`, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = acc.color; e.currentTarget.style.background = `${acc.color}15`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${acc.color}20`; e.currentTarget.style.background = `${acc.color}08`; }}
              >
                <acc.icon size={18} color={acc.color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: acc.color }}>{acc.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: '#cbd5e1', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span>veya elle girin</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email */}
        <div className="input-wrapper">
          <label className="input-label">E-posta Adresi</label>
          <input
            {...register('email')}
            type="email"
            className={`input ${errors.email ? 'error' : ''}`}
            placeholder="ornek@obs.edu.tr"
            autoComplete="email"
          />
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="input-wrapper">
          <label className="input-label">Şifre</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              className={`input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                display: 'flex',
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        {/* Forgot */}
        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Şifremi unuttum
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 4, padding: '12px', fontSize: 15 }}
        >
          {isSubmitting ? <span className="spinner" /> : <LogIn size={18} />}
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
};

export default Login;
