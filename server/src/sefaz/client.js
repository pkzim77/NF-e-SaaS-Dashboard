// Cliente SOAP da SEFAZ: faz POST com o certificado A1 (TLS mútuo) e a cadeia ICP-Brasil.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import { rootCertificates } from 'node:tls';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CA_PATH = path.join(__dirname, '..', '..', 'certs', 'svrs-chain.pem');

export const config = {
  tpAmb: process.env.SEFAZ_TP_AMB || '2',
  cnpj: (process.env.SEFAZ_CNPJ || '').replace(/\D/g, ''),
  certPath: process.env.CERT_PATH,
  certPassword: process.env.CERT_PASSWORD,
};

let tlsMaterial;
function getTls() {
  if (!tlsMaterial) {
    if (!config.certPath || !config.certPassword)
      throw new Error('CERT_PATH/CERT_PASSWORD ausentes no server/.env');
    // Mescla as raízes padrão do Node (cobrem os hosts com CA pública, ex.: ambiente
    // nacional via Sectigo) com a cadeia ICP-Brasil (necessária para a SVRS).
    const ca = [...rootCertificates];
    if (fs.existsSync(CA_PATH)) ca.push(fs.readFileSync(CA_PATH, 'utf8'));
    tlsMaterial = {
      pfx: fs.readFileSync(config.certPath),
      passphrase: config.certPassword,
      ca,
      minVersion: 'TLSv1.2',
    };
  }
  return tlsMaterial;
}

// POST de um envelope SOAP 1.2. Resolve com { status, body }.
export function postSoap(url, soapBody) {
  const tls = getTls();
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        ...tls,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(soapBody),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(soapBody);
    req.end();
  });
}
