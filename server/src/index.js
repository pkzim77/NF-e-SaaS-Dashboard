import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { serializeCompany, serializeNfe } from './serialize.js';
import { sincronizarEntrada } from './sefaz/sync-entrada.js';

const app = express();
app.use(cors());
app.use(express.json());

const nfeInclude = { supplier: true, itens: true };

app.get('/api/health', (req, res) => res.json({ ok: true }));

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

app.get('/api/company', async (req, res) => {
  const company = await prisma.company.findFirst({ include: { certificate: true } });
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  const nfes = await prisma.nfe.findMany({ where: { companyId: company.id, situacao: { not: 'cancelada' } } });
  const monthlyMap = {};
  nfes.forEach((n) => {
    const ym = n.data.slice(0, 7);
    monthlyMap[ym] = (monthlyMap[ym] || 0) + n.valor;
  });
  const monthly = Object.keys(monthlyMap)
    .sort()
    .map((ym) => ({ ym, m: MESES[+ym.slice(5, 7) - 1], v: +monthlyMap[ym].toFixed(2) }));

  const sync = await prisma.sefazSync.findUnique({ where: { cnpj: company.cnpj.replace(/\D/g, '') } });

  res.json({
    ...serializeCompany(company),
    certificate: company.certificate,
    monthly,
    sync: sync ? { ultNSU: sync.ultNSU, maxNSU: sync.maxNSU, lastSync: sync.lastSync } : null,
  });
});

app.post('/api/sync', async (req, res) => {
  try {
    const result = await sincronizarEntrada();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/company', async (req, res) => {
  const { scheduleFrequency } = req.body;
  const company = await prisma.company.findFirst();
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { scheduleFrequency },
  });
  res.json(serializeCompany(updated));
});

app.get('/api/suppliers', async (req, res) => {
  const suppliers = await prisma.supplier.findMany();
  res.json(suppliers.map((s) => ({ id: s.id, nome: s.nome, cnpj: s.cnpj, ie: s.ie, cidade: s.cidade })));
});

app.get('/api/nfes', async (req, res) => {
  const nfes = await prisma.nfe.findMany({ include: nfeInclude, orderBy: { data: 'desc' } });
  res.json(nfes.map(serializeNfe));
});

app.get('/api/nfes/:id', async (req, res) => {
  const nfe = await prisma.nfe.findUnique({ where: { id: req.params.id }, include: nfeInclude });
  if (!nfe) return res.status(404).json({ error: 'Nota fiscal não encontrada' });
  res.json(serializeNfe(nfe));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FiscalFlow API rodando em http://localhost:${PORT}`));
