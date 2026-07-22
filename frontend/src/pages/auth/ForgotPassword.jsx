import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
});

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch {
      // Enumeration koruması: hata alsak da başarı gösteriyoruz
    } finally {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', animation: 'scaleIn 0.25s ease' }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#d1fae5',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <CheckCircle size={28} color="#059669" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Bağlantı Gönderildi</h3>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
          E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Geliştirme ortamında link sunucu
          konsolunda görünür.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: '#64748b',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Giriş sayfasına dön
      </Link>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Şifremi Unuttum</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-wrapper">
          <label className="input-label">E-posta Adresi</label>
          <input
            {...register('email')}
            type="email"
            className={`input ${errors.email ? 'error' : ''}`}
            placeholder="ornek@obs.edu.tr"
          />
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px' }}
        >
          {isSubmitting ? <span className="spinner" /> : <Mail size={17} />}
          {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
