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
  return `${d} ${ms[+m - 1]} ${y}, 14:32`;
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
