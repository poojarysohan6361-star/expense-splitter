export function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₹0';
  const formatted = Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? '-' : ''}₹${formatted}`;
}

export function formatRelativeTime(iso) {
  if (!iso) return 'Recently';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'Recently';
  const diff = Math.max(0, Date.now() - then.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString();
}

export function apiErrorMessage(err, fallback = 'Request failed') {
  return err.response?.data?.error || err.message || fallback;
}
