// Mostra os dados do certificado A1 (titular, CNPJ, validade) sem expor a senha.
// Lê o .pfx com node-forge (não depende de openssl no PATH).
//
//   node scripts/cert-info.js
//
import 'dotenv/config';
import fs from 'node:fs';
import forge from 'node-forge';

const certPath = process.env.CERT_PATH;
const certPassword = process.env.CERT_PASSWORD;

if (!certPath || !certPassword) {
  console.error('✗ Configure CERT_PATH e CERT_PASSWORD no server/.env.');
  process.exit(1);
}

const der = fs.readFileSync(certPath, 'binary');
const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), certPassword);
const certBag = (p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [])[0];
if (!certBag?.cert) {
  console.error('✗ Não consegui ler o certificado do .pfx (senha incorreta?).');
  process.exit(1);
}

const cert = certBag.cert;
const subjectAttrs = cert.subject.attributes.map((a) => `${a.shortName || a.name}=${a.value}`).join(', ');
const cn = cert.subject.getField('CN')?.value || '';

// O CNPJ aparece no CN como "NOME:CNPJ" ou no subjectAltName (otherName OID 2.16.76.1.3.3).
let cnpj = (cn.match(/:(\d{14})\b/) || [])[1] || null;
if (!cnpj) {
  const alt = cert.getExtension('subjectAltName');
  const der2 = alt ? JSON.stringify(alt) : '';
  cnpj = (der2.match(/(\d{14})/) || [])[1] || null;
}

console.log('Subject :', subjectAttrs);
console.log('CN      :', cn);
console.log('Válido de :', cert.validity.notBefore.toISOString());
console.log('Válido até:', cert.validity.notAfter.toISOString());
if (cnpj) {
  const fmt = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  console.log(`\n✓ CNPJ do titular: ${cnpj}  (${fmt})`);
  console.log('  → coloque em SEFAZ_CNPJ no server/.env');
} else {
  console.log('\n⚠ Não consegui extrair o CNPJ automaticamente. Veja o CN acima.');
}
