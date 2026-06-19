// Lê os metadados reais do certificado A1 (.pfx) configurado no .env — titular, validade,
// nome do arquivo — e grava na tabela Certificate, substituindo qualquer dado fictício.
// Não expõe a senha: ela só é passada ao openssl via variável de ambiente.
//
//   node scripts/sync-certificate.js
//
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { prisma } from '../src/db.js';

const certPath = process.env.CERT_PATH;
const certPassword = process.env.CERT_PASSWORD;

if (!certPath || !certPassword) {
  console.error('✗ Configure CERT_PATH e CERT_PASSWORD no server/.env.');
  process.exit(1);
}

const company = await prisma.company.findFirst();
if (!company) {
  console.error('✗ Nenhuma empresa no banco.');
  process.exit(1);
}

const pfx = fs.readFileSync(certPath);
const env = { ...process.env, CERT_PASSWORD: certPassword };

const pem = execFileSync('openssl', ['pkcs12', '-nodes', '-clcerts', '-nokeys', '-passin', 'env:CERT_PASSWORD'], { input: pfx, env });
const subject = execFileSync('openssl', ['x509', '-noout', '-subject'], { input: pem }).toString().trim();
const datesRaw = execFileSync('openssl', ['x509', '-noout', '-dates'], { input: pem }).toString().trim();

const notBefore = datesRaw.match(/notBefore=(.+)/)?.[1]?.trim();
const notAfter = datesRaw.match(/notAfter=(.+)/)?.[1]?.trim();

// CN costuma vir como "NOME:CNPJ"; ficamos só com o nome do titular.
const cn = subject.match(/CN\s*=\s*([^,]+)/)?.[1]?.trim() || company.nome;
const titular = cn.split(':')[0].trim();

function brDate(opensslDate) {
  if (!opensslDate) return null;
  const d = new Date(opensslDate);
  return d.toLocaleDateString('pt-BR');
}

const data = {
  titular,
  arquivo: path.basename(certPath),
  emitidoEm: brDate(notBefore),
  validoAte: brDate(notAfter),
};

await prisma.certificate.upsert({
  where: { companyId: company.id },
  update: data,
  create: { ...data, companyId: company.id },
});

console.log('✓ Certificado real gravado:', data);

await prisma.$disconnect();
