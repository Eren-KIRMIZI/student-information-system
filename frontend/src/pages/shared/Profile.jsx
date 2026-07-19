import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '../../api/system.api';
import { PageHeader, ErrorState } from '../../components/ui/index';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (data) {
      reset({ email: data.email });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      toast.success('Profil bilgileriniz güncellendi');
      qc.invalidateQueries({ queryKey: ['me'] });
      // Şifre güncellendiyse auth sıfırlamak veya tekrar login istemek gerekebilir ancak basit tutuyoruz.
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Güncellenemedi'),
  });

  const onSubmit = (d) => {
    const payload = {};
    if (d.email && d.email !== data?.email) payload.email = d.email;
    if (d.password) payload.password = d.password; // backend kabul ediyorsa
    
    if (Object.keys(payload).length > 0) {
      updateMutation.mutate(payload);
    } else {
      toast('Değişiklik yapmadınız', { icon: 'ℹ️' });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Profilim" />
        <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Profilim" />
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  // Kullanıcı detaylarını çıkaralım
  let name = 'Sistem Yöneticisi';
  let title = '';
  
  if (data.student) {
    name = `${data.student.firstName} ${data.student.lastName}`;
    title = 'Öğrenci';
  } else if (data.lecturer) {
    name = `${data.lecturer.firstName} ${data.lecturer.lastName}`;
    title = 'Akademisyen';
  } else if ((typeof user?.role === 'object' ? user.role?.name : user?.role) === 'ADMIN') {
    title = 'Yönetici (Admin)';
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Profilim"
        subtitle="Kişisel bilgilerinizi ve hesap ayarlarınızı görüntüleyin"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 800 }}>
        {/* Kullanıcı Kartı */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 800 }}>
            {name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
              {name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} /> {title}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={16} /> {data.email}
              </span>
            </div>
          </div>
        </div>

        {/* Hesap Ayarları */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
            Hesap Ayarları
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
            <div className="input-wrapper">
              <label className="input-label">E-Posta Adresi</label>
              <input type="email" className={`input ${errors.email ? 'error' : ''}`} {...register('email', { required: true })} />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Yeni Şifre</label>
              <input type="password" placeholder="Değiştirmek istemiyorsanız boş bırakın" className={`input ${errors.password ? 'error' : ''}`} {...register('password', { minLength: 6 })} />
              {errors.password && <span className="input-error">Şifre en az 6 karakter olmalıdır</span>}
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                <Save size={16} /> {updateMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
