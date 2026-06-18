// Teste da Distribuição DFe (notas de ENTRADA): faz UMA consulta a partir de um NSU
// e mostra o resumo da resposta da SEFAZ. Ainda não grava no banco.
//
//   node scripts/test-entrada.js [nsuInicial]
//
import 'dotenv/config';
import { distribuirPorUltNSU } from '../src/sefaz/dist-dfe.js';
import { config } from '../src/sefaz/client.js';

const startNSU = Number(process.argv[2] || 0);
const ambiente = config.tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO';

console.log(`→ Distribuição DFe · ${ambiente} · CNPJ ${config.cnpj} · a partir do NSU ${startNSU}\n`);

const r = await distribuirPorUltNSU(startNSU);

console.log(`HTTP ${r.httpStatus}`);
console.log(`cStat:   ${r.cStat}  ${r.xMotivo ? '— ' + r.xMotivo : ''}`);
console.log(`ultNSU:  ${r.ultNSU}   (último NSU lido)`);
console.log(`maxNSU:  ${r.maxNSU}   (último NSU disponível na SEFAZ)`);
console.log(`Documentos neste lote: ${r.docs.length}`);

if (r.docs.length) {
  console.log('\nDocumentos:');
  const byType = {};
  for (const d of r.docs) {
    const tipo = (d.schema || '').split('_')[0] || 'desconhecido';
    byType[tipo] = (byType[tipo] || 0) + 1;
  }
  for (const [t, n] of Object.entries(byType)) console.log(`  ${t}: ${n}`);

  const first = r.docs[0];
  console.log(`\nExemplo (NSU ${first.nsu}, schema ${first.schema}):`);
  console.log(first.xml.slice(0, 600).replace(/></g, '>\n<'));
}

if (r.cStat === '137') console.log('\nℹ cStat 137 = nenhum documento novo (normal em homologação ou já sincronizado).');
if (r.cStat === '656') console.log('\n⚠ cStat 656 = consumo indevido: aguarde ~1h antes de consultar de novo.');
if (!r.cStat) console.log('\n⚠ Sem cStat — resposta bruta:\n' + r.raw.slice(0, 800));
