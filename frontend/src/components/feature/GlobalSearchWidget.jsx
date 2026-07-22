import React, { useState } from 'react';
import { Search, GraduationCap, Users, BookOpen, Layers, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GlobalSearchWidget = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // In a real app, this would go to a global search results page.
      // For now, let's pretend it filters in admin space.
      // alert('Aranıyor: ' + query);
    }
  };

  const quickLinks = [
    { label: 'Öğrenci', icon: GraduationCap, path: '/admin/students' },
    { label: 'Akademisyen', icon: Users, path: '/admin/lecturers' },
    { label: 'Ders', icon: BookOpen, path: '/admin/courses' },
    { label: 'Bölüm', icon: Layers, path: '/admin/departments' },
    { label: 'Sınıf/Şube', icon: Building, path: '/admin/course-sections' },
  ];

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={18} color="var(--color-text-muted)" />
        Hızlı Arama
      </div>

      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 16 }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Sistemde bir şey arayın..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button type="submit" style={{ display: 'none' }}>
          Ara
        </button>
      </form>

      <div
        style={{
          fontSize: 12,
          color: 'var(--color-text-muted)',
          marginBottom: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        Hızlı Yönlendirmeler
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {quickLinks.map((link, idx) => {
          const Icon = link.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(link.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 16,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-400)';
                e.currentTarget.style.color = 'var(--color-primary-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Icon size={14} /> {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
