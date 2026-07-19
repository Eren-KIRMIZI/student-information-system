import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const schema = z
  .object({
    newPassword:     z.string()
      .min(8, 'En az 8 karakter')
      .regex(/[A-Z]/, 'En az bir büyük harf')
      .regex(/[0-9]/, 'En az bir rakam'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı zorunludur'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ color: '#ef4444', fontSize: 14 }}>Geçersiz veya eksik sıfırlama bağlantısı.</p>
      </div>
    );
  }

  const onSubmit = async ({ newPassword }) => {
    try {
      await axiosInstance.post('/auth/reset-password', { token, newPassword });
      toast.success('Şifreniz güncellendi, giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Şifre sıfırlama başarısız');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
        Yeni Şifre Belirle
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        En az 8 karakter, büyük harf ve rakam içermelidir.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-wrapper">
          <label className="input-label">Yeni Şifre</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('newPassword')}
              type={showPwd ? 'text' : 'password'}
              className={`input ${errors.newPassword ? 'error' : ''}`}
              placeholder="••••••••"
              style={{ paddingRight: 42 }}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && <span className="input-error">{errors.newPassword.message}</span>}
        </div>

        <div className="input-wrapper">
          <label className="input-label">Şifre Tekrarı</label>
          <input
            {...register('confirmPassword')}
            type={showPwd ? 'text' : 'password'}
            className={`input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <span className="input-error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          {isSubmitting ? <span className="spinner" /> : <Lock size={17} />}
          {isSubmitting ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
