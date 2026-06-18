// Mostra os dados do certificado A1 (titular, CNPJ, validade) sem expor a senha.
// Lê o .pfx pelo Node e usa o openssl só para parsear (via stdin).
//
//   node scripts/cert-info.js
//
import 'dotenv/config';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const certPath = process.env.CERT_PATH;
const certPassword = process.env.CERT_PASSWORD;

if (!certPath || !certPassword) {
  console.error('✗ Configure CERT_PATH e CERT_PASSWORD no server/.env.');
  process.exit(1);
}

const pfx = fs.readFileSync(certPath); // Node lê o caminho com acentos/espaços sem problema
const env = { ...process.env, CERT_PASSWORD: certPassword };

// pfx -> PEM (somente o certificado, sem a chave privada)
const pem = execFileSync(
  'openssl',
  ['pkcs12', '-nodes', '-clcerts', '-nokeys', '-passin', 'env:CERT_PASSWORD'],
  { input: pfx, env }
);

const subject = execFileSync('openssl', ['x509', '-noout', '-subject'], { input: pem }).toString().trim();
const dates = execFileSync('openssl', ['x509', '-noout', '-dates'], { input: pem }).toString().trim();

// O CNPJ aparece no subject como CN="NOME:CNPJ" ou no campo serialNumber
const cnpjMatch = subject.match(/:(\d{14})\b/) || subject.match(/serialNumber\s*=\s*(\d{14})/i);
const cnpj = cnpjMatch ? cnpjMatch[1] : null;

console.log('Subject :', subject);
console.log(dates);
if (cnpj) {
  const fmt = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  console.log(`\n✓ CNPJ do titular: ${cnpj}  (${fmt})`);
  console.log('  → coloque em SEFAZ_CNPJ no server/.env');
} else {
  console.log('\n⚠ Não consegui extrair o CNPJ automaticamente do subject acima.');
}
