// Motor de sincronização das notas de ENTRADA via Distribuição DFe.
// Lê do último NSU salvo, percorre os lotes e grava os resumos no banco.
import { prisma } from '../db.js';
import { distribuirPorUltNSU } from './dist-dfe.js';
import { config } from './client.js';
import { parseResNFe } from './parse.js';

async function upsertFornecedor(companyId, cnpj, nome, ie) {
  const existing = await prisma.supplier.findFirst({ where: { companyId, cnpj } });
  if (existing) return existing;
  return prisma.supplier.create({ data: { companyId, cnpj, nome, ie, cidade: '' } });
}

async function gravarResumo(companyId, res, nsu) {
  const fornecedor = await upsertFornecedor(companyId, res.emitCnpj, res.emitNome, res.emitIe);
  const existed = await prisma.nfe.findUnique({ where: { chave: res.chave } });
  await prisma.nfe.upsert({
    where: { chave: res.chave },
    update: { nsu, situacao: res.situacao },
    create: {
      chave: res.chave,
      numero: res.numero,
      serie: res.serie,
      data: res.data,
      situacao: res.situacao,
      valor: res.valor,
      totalProd: res.valor,
      frete: 0,
      modelo: res.modelo,
      tipo: 'entrada',
      origem: 'distribuicao',
      resumo: true,
      nsu,
      companyId,
      supplierId: fornecedor.id,
    },
  });
  return !existed;
}

// reset=true recomeça do NSU 0 (cuidado: pode disparar consumo indevido se abusado).
export async function sincronizarEntrada({ maxLotes = 50, reset = false } = {}) {
  if (!config.cnpj || config.cnpj.length !== 14)
    throw new Error('SEFAZ_CNPJ inválido no .env.');

  const company = await prisma.company.findFirst();
  if (!company) throw new Error('Nenhuma empresa no banco (rode o seed antes).');

  let sync = await prisma.sefazSync.findUnique({ where: { cnpj: config.cnpj } });
  if (!sync) sync = await prisma.sefazSync.create({ data: { cnpj: config.cnpj } });

  let ultNSU = reset ? '0' : sync.ultNSU;
  let novos = 0, resumos = 0, outros = 0, lotes = 0, lastCStat = null, lastMotivo = null;

  while (lotes < maxLotes) {
    const r = await distribuirPorUltNSU(ultNSU);
    lotes++;
    lastCStat = r.cStat;
    lastMotivo = r.xMotivo;
    if (r.cStat !== '138') break; // 137 = nada novo; 656 = consumo indevido; etc.

    for (const doc of r.docs) {
      if ((doc.schema || '').startsWith('resNFe')) {
        if (await gravarResumo(company.id, parseResNFe(doc.xml), doc.nsu)) novos++;
        resumos++;
      } else {
        outros++; // procNFe / eventos: tratados em etapa futura (manifestação)
      }
    }

    ultNSU = r.ultNSU;
    await prisma.sefazSync.update({
      where: { cnpj: config.cnpj },
      data: { ultNSU, maxNSU: r.maxNSU, lastSync: new Date().toISOString() },
    });

    if (r.ultNSU === r.maxNSU) break; // sincronizado até o fim
  }

  return { novos, resumos, outros, lotes, ultNSU, lastCStat, lastMotivo };
}
