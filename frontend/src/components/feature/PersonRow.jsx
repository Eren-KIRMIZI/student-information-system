import { StatusBadge } from '../ui/index';
import { formatFullName } from '../../utils/helpers';

export const PersonRow = ({ firstName, lastName, email, subtitle }) => {
  const name = formatFullName(firstName, lastName);
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{name}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{subtitle}</div>}
      {email && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{email}</div>}
    </div>
  );
};
