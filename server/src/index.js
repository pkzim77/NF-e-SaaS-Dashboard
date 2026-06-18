import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { serializeCompany, serializeNfe } from './serialize.js';

const app = express();
app.use(cors());
app.use(express.json());

const nfeInclude = { supplier: true, itens: true };

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/company', async (req, res) => {
  const company = await prisma.company.findFirst({
    include: { certificate: true, certHistory: true, categories: true, monthly: true },
  });
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
  res.json({
    ...serializeCompany(company),
    certificate: company.certificate,
    certHistory: company.certHistory.map((h) => ({ title: h.title, desc: h.desc, date: h.date, dot: h.dot })),
    categories: company.categories.map((c) => ({ nome: c.nome, v: c.valor, color: c.color })),
    monthly: company.monthly.map((m) => ({ m: m.mes, v: m.valor })),
  });
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
