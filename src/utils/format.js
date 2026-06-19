export function brl(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function brlShort(v) {
  if (v >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'M';
  if (v >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + 'k';
  return 'R$ ' + v;
}

export function num(n) {
  return n.toLocaleString('pt-BR');
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateLong(iso) {
  const [y, m, d] = iso.split('-');
  const ms = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${ms[+m - 1]} ${y}`;
}

export function initials(nome) {
  return nome
    .replace(/\b(LTDA|S\/A|de|da|do|e|&|Comércio|Indústria|Produtos|Materiais|Distribuidora)\b/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function shortName(nome) {
  return nome.replace(/ (LTDA|S\/A).*/, '');
}

export function formatTodayLong(date = new Date()) {
  const s = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseBrDate(d) {
  if (!d) return null;
  const [day, month, year] = d.split('/');
  return new Date(+year, +month - 1, +day);
}

export function daysUntil(d) {
  const date = parseBrDate(d);
  if (!date) return null;
  return Math.round((date - new Date()) / 86400000);
}

export function timeAgo(iso) {
  if (!iso) return null;
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return `há ${Math.round(diffH / 24)}d`;
}

export function monthYearLabel(ym) {
  const [y, m] = ym.split('-');
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(+y, +m - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
