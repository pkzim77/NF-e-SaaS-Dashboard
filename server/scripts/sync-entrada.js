// Sincroniza as notas de ENTRADA reais e grava no banco.
//
//   npm run sefaz:sync           # do último NSU salvo (incremental)
//   npm run sefaz:sync -- --reset # recomeça do NSU 0 (use com parcimônia)
//
import 'dotenv/config';
import { sincronizarEntrada } from '../src/sefaz/sync-entrada.js';
import { config } from '../src/sefaz/client.js';
import { prisma } from '../src/db.js';

const reset = process.argv.includes('--reset');
const ambiente = config.tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO';

console.log(`→ Sincronizando ENTRADA · ${ambiente} · CNPJ ${config.cnpj}${reset ? ' · RESET (NSU 0)' : ''}\n`);

try {
  const r = await sincronizarEntrada({ reset });
  console.log(`cStat final: ${r.lastCStat}${r.lastMotivo ? ' — ' + r.lastMotivo : ''}`);
  console.log(`Lotes processados: ${r.lotes}`);
  console.log(`Resumos recebidos: ${r.resumos}  (novos: ${r.novos})`);
  if (r.outros) console.log(`Outros documentos (eventos/procNFe): ${r.outros}`);
  console.log(`Último NSU sincronizado: ${r.ultNSU}`);

  const total = await prisma.nfe.count({ where: { tipo: 'entrada', origem: 'distribuicao' } });
  console.log(`\nTotal de notas de entrada (distribuição) no banco: ${total}`);
} catch (e) {
  console.error('✗ Erro:', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
