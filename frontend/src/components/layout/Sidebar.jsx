import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  Award,
  GraduationCap,
  BookMarked,
  UserCheck,
  Megaphone,
  CalendarDays,
  Users,
  Building2,
  BookCopy,
  ScrollText,
  UserCog,
  ClipboardCheck,
  FileText,
  ChevronRight,
  Layers,
  UserSquare,
  LogOut,
  X,
  BarChart3,
  QrCode,
  AlertTriangle,
  PieChart,
  TrendingUp,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/schedule', icon: Calendar, label: 'Ders Programım' },
  { to: '/student/exams', icon: ClipboardList, label: 'Sınav Programım' },
  { to: '/student/courses', icon: BookCopy, label: 'Derslerim' },
  { to: '/student/grades', icon: Award, label: 'Notlarım' },
  { to: '/student/transcript', icon: ScrollText, label: 'Transkript' },
  { to: '/student/analytics', icon: BarChart3, label: 'Akademik Analizler' },
  { to: '/student/course-catalog', icon: BookOpen, label: 'Sunulan Dersler' },
  { to: '/student/course-selection', icon: BookMarked, label: 'Ders Seçme' },
  { to: '/student/qr-scan', icon: QrCode, label: 'QR Yoklama' },
  { to: '/student/schedule-analysis', icon: TrendingUp, label: 'Program Analizi' },
  { to: '/student/graduation', icon: GraduationCap, label: 'Mezuniyet Kontrolü' },
  { to: '/student/attendance', icon: UserCheck, label: 'Devamsızlığım' },
  { to: '/conversations', icon: MessageSquare, label: 'Mesajlar' },
  { to: '/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/academic-calendar', icon: CalendarDays, label: 'Akademik Takvim' },
];

const academicianNav = [
  { to: '/academician/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/academician/course-sections', icon: BookCopy, label: 'Verdiğim Dersler' },
  { to: '/academician/advisees', icon: Users, label: 'Danışmanlığım' },
  { to: '/academician/advisor-analytics', icon: BarChart3, label: 'Danışmanlık Analizi' },
  { to: '/academician/qr-generator', icon: QrCode, label: 'QR Yoklama' },
  { to: '/academician/my-schedule', icon: Calendar, label: 'Haftalık Programım' },
  { to: '/conversations', icon: MessageSquare, label: 'Mesajlar' },
  { to: '/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/academic-calendar', icon: CalendarDays, label: 'Akademik Takvim' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/dashboard-enhanced', icon: PieChart, label: 'Gelişmiş Dashboard' },
  { label: 'KULLANICI YÖNETİMİ', isGroup: true },
  { to: '/admin/users', icon: UserCog, label: 'Kullanıcılar' },
  { to: '/admin/roles', icon: UserSquare, label: 'Roller' },
  { label: 'AKADEMİK YAPI', isGroup: true },
  { to: '/admin/faculties', icon: Building2, label: 'Fakülteler' },
  { to: '/admin/departments', icon: Layers, label: 'Bölümler' },
  { to: '/admin/students', icon: GraduationCap, label: 'Öğrenciler' },
  { to: '/admin/lecturers', icon: Users, label: 'Akademisyenler' },
  { to: '/admin/courses', icon: BookOpen, label: 'Dersler' },
  { to: '/admin/course-sections', icon: BookCopy, label: 'Ders Şubeleri' },
  { to: '/admin/advisor-assignments', icon: UserCheck, label: 'Danışman Atamaları' },
  { label: 'İÇERİK & İLETİŞİM', isGroup: true },
  { to: '/conversations', icon: MessageSquare, label: 'Mesajlar' },
  { to: '/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/academic-calendar', icon: CalendarDays, label: 'Akademik Takvim' },
  { label: 'SİSTEM', isGroup: true },
  { to: '/admin/logs', icon: FileText, label: 'Sistem Logları' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit (Denetim İzi)' },
];

const navMap = { STUDENT: studentNav, ACADEMICIAN: academicianNav, ADMIN: adminNav };

const Sidebar = ({ role, isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const items = navMap[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 39,
          }}
          onClick={onClose}
        />
      )}

      <aside className={`layout-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div
          style={{
            padding: '20px 16px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/Uni-Photoroom.png" alt="Eren Teknik" style={{ height: 56, width: 56, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: 'var(--color-primary-600)',
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }}
              >
                EREN TEKNİK
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                ÜNİVERSİTESİ
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.map((item, i) => {
            if (item.isGroup) {
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 24px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none' }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
