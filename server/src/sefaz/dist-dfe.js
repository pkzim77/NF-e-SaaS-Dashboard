// Distribuição DFe — baixa NF-e/resumos/eventos de interesse do CNPJ (notas de ENTRADA).
// NT 2014.002. Sincronização incremental por NSU.
import zlib from 'node:zlib';
import { ENDPOINTS, CUF } from './endpoints.js';
import { postSoap, config } from './client.js';

const NS = 'http://www.portalfiscal.inf.br/nfe';
const WSDL_NS = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe';

function envelope(inner) {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDistDFeInteresse xmlns="${WSDL_NS}"><nfeDadosMsg>${inner}</nfeDadosMsg></nfeDistDFeInteresse>` +
    `</soap12:Body></soap12:Envelope>`
  );
}

// Consulta a partir do último NSU lido (modo de sincronização).
function distByUltNSU(ultNSU) {
  const nsu = String(ultNSU).padStart(15, '0');
  return (
    `<distDFeInt versao="1.01" xmlns="${NS}">` +
    `<tpAmb>${config.tpAmb}</tpAmb>` +
    `<cUFAutor>${CUF.CE}</cUFAutor>` +
    `<CNPJ>${config.cnpj}</CNPJ>` +
    `<distNSU><ultNSU>${nsu}</ultNSU></distNSU>` +
    `</distDFeInt>`
  );
}

const tag = (xml, name) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? null;

// Faz uma chamada à Distribuição DFe e devolve o resultado já parseado.
export async function distribuirPorUltNSU(ultNSU = 0) {
  if (!config.cnpj || config.cnpj.length !== 14)
    throw new Error('SEFAZ_CNPJ inválido no .env (precisa 14 dígitos).');

  const url = ENDPOINTS.distribuicaoDFe[config.tpAmb];
  const { status, body } = await postSoap(url, envelope(distByUltNSU(ultNSU)));

  const ret = {
    httpStatus: status,
    cStat: tag(body, 'cStat'),
    xMotivo: tag(body, 'xMotivo'),
    ultNSU: tag(body, 'ultNSU'),
    maxNSU: tag(body, 'maxNSU'),
    docs: [],
    raw: body,
  };

  // <docZip NSU="..." schema="...">BASE64(GZIP(xml))</docZip>
  const re = /<docZip\b([^>]*)>([\s\S]*?)<\/docZip>/g;
  let m;
  while ((m = re.exec(body))) {
    const attrs = m[1];
    const nsu = attrs.match(/NSU="(\d+)"/)?.[1] ?? null;
    const schema = attrs.match(/schema="([^"]*)"/)?.[1] ?? null;
    let xml;
    try {
      xml = zlib.gunzipSync(Buffer.from(m[2].trim(), 'base64')).toString('utf8');
    } catch (e) {
      xml = `<erroDescompactacao>${e.message}</erroDescompactacao>`;
    }
    ret.docs.push({ nsu, schema, xml });
  }
  return ret;
}
