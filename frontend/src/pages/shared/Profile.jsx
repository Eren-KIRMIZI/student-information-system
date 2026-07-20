import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe, uploadPhoto } from '../../api/system.api';
import { PageHeader, ErrorState } from '../../components/ui/index';
import { User, Mail, Shield, Save, Camera, Lock, Phone, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (data) {
      reset({ email: data.email, phone: data.student?.phone || data.lecturer?.phone || '', address: data.student?.address || '' });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      toast.success('Profil bilgileriniz güncellendi');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Güncellenemedi'),
  });

  const photoMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('photo', file);
      return uploadPhoto(fd);
    },
    onSuccess: () => {
      toast.success('Profil fotoğrafı güncellendi');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Fotoğraf yüklenemedi'),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) photoMutation.mutate(file);
    e.target.value = '';
  };

  const onSubmit = (d) => {
    const payload = {};
    if (d.email && d.email !== data?.email) payload.email = d.email;
    if (d.password) payload.password = d.password;
    if (d.phone) payload.phone = d.phone;
    if (d.address !== undefined) payload.address = d.address;
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
          <div style={{ position: 'relative' }}>
            {(data.student?.photoUrl || data.lecturer?.photoUrl) ? (
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/${data.student?.photoUrl || data.lecturer?.photoUrl}`}
                alt={name} style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 800 }}>
                {name.charAt(0)}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary-600)', border: '2px solid var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              title="Fotoğraf değiştir">
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
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
              <label className="input-label"><Mail size={14} /> E-Posta Adresi</label>
              <input type="email" className={`input ${errors.email ? 'error' : ''}`} {...register('email', { required: true })} />
            </div>

            {(data.student || data.lecturer) && (
              <div className="input-wrapper">
                <label className="input-label"><Phone size={14} /> Telefon</label>
                <input type="tel" placeholder="Telefon numaranız" className="input"
                  {...register('phone')} defaultValue={data.student?.phone || data.lecturer?.phone || ''} />
              </div>
            )}

            {data.student && (
              <div className="input-wrapper">
                <label className="input-label"><MapPin size={14} /> Adres</label>
                <textarea placeholder="Adresiniz" className="input" rows={2}
                  {...register('address')} defaultValue={data.student?.address || ''} />
              </div>
            )}

            <div className="input-wrapper">
              <label className="input-label"><Lock size={14} /> Yeni Şifre</label>
              <input type="password" placeholder="Değiştirmek istemiyorsanız boş bırakın" className={`input ${errors.password ? 'error' : ''}`}
                {...register('password', { minLength: 8, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/ })} />
              {errors.password?.type === 'minLength' && <span className="input-error">Şifre en az 8 karakter olmalıdır</span>}
              {errors.password?.type === 'pattern' && <span className="input-error">Büyük harf, küçük harf, rakam ve özel karakter içermelidir</span>}
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
