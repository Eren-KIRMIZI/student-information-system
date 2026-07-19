import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password);
      toast.success('Hoş geldiniz!');
      navigate(roleRedirectMap[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'E-posta veya şifre hatalı');
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
