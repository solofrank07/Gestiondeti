export function formatDate(date: string | Date, locale: string = 'es-PE'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'es-PE'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} días`;
  return formatDate(date);
}

export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getRiskLevel(score: number): { level: string; color: string } {
  if (score <= 20) return { level: 'Muy Bajo', color: '#22c55e' };
  if (score <= 40) return { level: 'Bajo', color: '#84cc16' };
  if (score <= 60) return { level: 'Medio', color: '#eab308' };
  if (score <= 80) return { level: 'Alto', color: '#f97316' };
  return { level: 'Crítico', color: '#ef4444' };
}
