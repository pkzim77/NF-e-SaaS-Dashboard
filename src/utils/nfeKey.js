export function makeKey(cnpj, num, serie, salt) {
  const cn = cnpj.replace(/\D/g, '').padStart(14, '0');
  const cNF = String((num * 7919 + salt * 131 + 10000037) % 100000000).padStart(8, '0');
  const raw = '35' + '2606' + cn + '55' + String(serie).padStart(3, '0') + String(num).padStart(9, '0') + '1' + cNF;
  const dv = String(raw.split('').reduce((a, c) => (a + +c) % 10, 0));
  return (raw + dv).replace(/(.{4})/g, '$1 ').trim();
}
