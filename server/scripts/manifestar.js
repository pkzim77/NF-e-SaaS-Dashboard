// Envia manifestação do destinatário para uma chave de NF-e.
//
//   npm run sefaz:manifestar -- <chave44> [tipo] [justificativa]
//   tipo: ciencia (padrão) | confirmacao | desconhecimento | naoRealizada
//   justificativa: obrigatória para naoRealizada (15 a 255 caracteres)
//
import 'dotenv/config';
import { manifestar, EVENTOS } from '../src/sefaz/manifestacao.js';
import { config } from '../src/sefaz/client.js';

const [, , chaveArg, tipoArg = 'ciencia'] = process.argv;
const xJust = process.argv.slice(4).join(' ') || undefined;
const ambiente = config.tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO';

if (!chaveArg) {
  console.error('Uso: npm run sefaz:manifestar -- <chave44> [ciencia|confirmacao|desconhecimento|naoRealizada] [justificativa]');
  process.exit(1);
}
if (!EVENTOS[tipoArg]) {
  console.error(`Tipo inválido: ${tipoArg}. Use: ${Object.keys(EVENTOS).join(', ')}`);
  process.exit(1);
}

console.log(`→ Manifestação (${EVENTOS[tipoArg].desc}) · ${ambiente} · CNPJ ${config.cnpj}`);
console.log(`  Chave: ${chaveArg}\n`);

try {
  const r = await manifestar(chaveArg, tipoArg, { xJust });
  console.log(`HTTP ${r.httpStatus}`);
  console.log(`Lote:   cStat ${r.cStatLote}`);
  console.log(`Evento: cStat ${r.cStat}${r.xMotivo ? ' — ' + r.xMotivo : ''}`);
  if (r.nProt) console.log(`Protocolo: ${r.nProt}`);
} catch (e) {
  console.error('✗ Erro:', e.message);
  process.exitCode = 1;
}
