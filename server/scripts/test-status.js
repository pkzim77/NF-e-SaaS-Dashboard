// Teste de conexão com a SEFAZ usando o certificado A1.
// Chama o serviço de Status do Serviço (NfeStatusServico4) — é o "ping" oficial.
// Se isso funcionar, o handshake TLS com o certificado está provado.
//
//   node scripts/test-status.js
//
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import { ENDPOINTS, CUF } from '../src/sefaz/endpoints.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Cadeia ICP-Brasil do servidor SEFAZ (o Node não a traz por padrão).
const CA_PATH = path.join(__dirname, '..', 'certs', 'svrs-chain.pem');
const ca = fs.existsSync(CA_PATH) ? fs.readFileSync(CA_PATH) : undefined;

const tpAmb = process.env.SEFAZ_TP_AMB || '2';
const certPath = process.env.CERT_PATH;
const certPassword = process.env.CERT_PASSWORD;
const cUF = CUF.CE;

if (!certPath || !certPassword) {
  console.error('✗ Configure CERT_PATH e CERT_PASSWORD no server/.env primeiro.');
  process.exit(1);
}
if (!fs.existsSync(certPath)) {
  console.error(`✗ Certificado não encontrado em: ${certPath}`);
  process.exit(1);
}

const url = ENDPOINTS.statusServico[tpAmb];
const ambiente = tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO';

const consStatServ =
  `<consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
  `<tpAmb>${tpAmb}</tpAmb><cUF>${cUF}</cUF><xServ>STATUS</xServ></consStatServ>`;

const soap =
  `<?xml version="1.0" encoding="utf-8"?>` +
  `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
  `<soap12:Body>` +
  `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">` +
  `${consStatServ}</nfeDadosMsg></soap12:Body></soap12:Envelope>`;

console.log(`→ Ambiente: ${ambiente} (tpAmb=${tpAmb})  UF: CE (cUF=${cUF})`);
console.log(`→ Endpoint: ${url}\n`);

const req = https.request(
  url,
  {
    method: 'POST',
    pfx: fs.readFileSync(certPath),
    passphrase: certPassword,
    ca,
    minVersion: 'TLSv1.2',
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(soap),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log(`✓ Conexão TLS OK — HTTP ${res.statusCode}\n`);
      const get = (tag) => data.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1];
      const cStat = get('cStat');
      const xMotivo = get('xMotivo');
      if (cStat) {
        console.log(`  cStat:   ${cStat}`);
        console.log(`  xMotivo: ${xMotivo}`);
        console.log(cStat === '107' ? '\n✓ Serviço SEFAZ em operação. Certificado autenticado!' : '');
      } else {
        console.log('Resposta bruta:\n', data.slice(0, 1500));
      }
    });
  }
);

req.on('error', (e) => {
  console.error('✗ Falha na conexão:', e.message);
  if (e.message.includes('mac verify') || e.message.includes('PKCS12'))
    console.error('  → Senha do certificado provavelmente incorreta.');
  process.exit(1);
});

req.write(soap);
req.end();
