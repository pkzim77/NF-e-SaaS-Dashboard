// Manifestação do Destinatário (eventos da NF-e, NT 2012.002).
// Evento assinado e enviado ao Ambiente Nacional via NFeRecepcaoEvento4.
// Implementados: Ciência (210210) e Confirmação (210200); os demais ficam prontos no mapa.
import { ENDPOINTS } from './endpoints.js';
import { postSoap, config } from './client.js';
import { assinarEvento } from './sign.js';

const NS = 'http://www.portalfiscal.inf.br/nfe';
const WSDL_NS = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4';
const C_ORGAO = '91'; // 91 = Ambiente Nacional (manifestação do destinatário)

// descEvento precisa bater exatamente com o texto definido pela SEFAZ.
export const EVENTOS = {
  ciencia:         { tpEvento: '210210', desc: 'Ciencia da Operacao' },
  confirmacao:     { tpEvento: '210200', desc: 'Confirmacao da Operacao' },
  desconhecimento: { tpEvento: '210220', desc: 'Desconhecimento da Operacao' },
  naoRealizada:    { tpEvento: '210240', desc: 'Operacao nao Realizada' },
};

const tag = (xml, name) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim() ?? null;

// Data/hora local de Fortaleza (UTC-3, sem horário de verão) no formato exigido pela SEFAZ.
function dhEventoNow() {
  const s = new Date().toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' });
  return s.replace(' ', 'T') + '-03:00';
}

function envelope(inner) {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeRecepcaoEvento xmlns="${WSDL_NS}"><nfeDadosMsg>${inner}</nfeDadosMsg></nfeRecepcaoEvento>` +
    `</soap12:Body></soap12:Envelope>`
  );
}

function montarEvento(chNFe, tpEvento, descEvento, nSeqEvento, xJust) {
  const seq = String(nSeqEvento).padStart(2, '0');
  const id = `ID${tpEvento}${chNFe}${seq}`;
  const det =
    `<detEvento versao="1.00">` +
    `<descEvento>${descEvento}</descEvento>` +
    (xJust ? `<xJust>${xJust}</xJust>` : '') +
    `</detEvento>`;
  return (
    `<evento xmlns="${NS}" versao="1.00">` +
    `<infEvento Id="${id}">` +
    `<cOrgao>${C_ORGAO}</cOrgao>` +
    `<tpAmb>${config.tpAmb}</tpAmb>` +
    `<CNPJ>${config.cnpj}</CNPJ>` +
    `<chNFe>${chNFe}</chNFe>` +
    `<dhEvento>${dhEventoNow()}</dhEvento>` +
    `<tpEvento>${tpEvento}</tpEvento>` +
    `<nSeqEvento>${nSeqEvento}</nSeqEvento>` +
    `<verEvento>1.00</verEvento>` +
    det +
    `</infEvento>` +
    `</evento>`
  );
}

// Envia um evento de manifestação para a chave informada.
//   tipo: 'ciencia' | 'confirmacao' | 'desconhecimento' | 'naoRealizada'
//   opts.xJust é obrigatório para 'naoRealizada' (15 a 255 caracteres).
export async function manifestar(chNFe, tipo = 'ciencia', { nSeqEvento = 1, xJust, idLote = 1 } = {}) {
  const chave = String(chNFe || '').replace(/\D/g, '');
  if (chave.length !== 44) throw new Error('Chave da NF-e inválida (precisa 44 dígitos).');
  if (!config.cnpj || config.cnpj.length !== 14) throw new Error('SEFAZ_CNPJ inválido no .env.');

  const ev = EVENTOS[tipo];
  if (!ev) throw new Error(`Tipo de evento inválido: ${tipo}. Use: ${Object.keys(EVENTOS).join(', ')}`);
  if (tipo === 'naoRealizada' && (!xJust || xJust.length < 15 || xJust.length > 255))
    throw new Error('Operação não Realizada exige justificativa (xJust) de 15 a 255 caracteres.');

  const eventoXml = montarEvento(chave, ev.tpEvento, ev.desc, nSeqEvento, xJust);
  const assinado = assinarEvento(eventoXml);
  const envEvento = `<envEvento xmlns="${NS}" versao="1.00"><idLote>${idLote}</idLote>${assinado}</envEvento>`;

  const url = ENDPOINTS.recepcaoEvento[config.tpAmb];
  const { status, body } = await postSoap(url, envelope(envEvento));

  // O retorno traz o status do lote (retEnvEvento) e o status do evento (retEvento/infEvento).
  const retEvento = body.match(/<retEvento[\s\S]*?<\/retEvento>/)?.[0] || body;
  return {
    httpStatus: status,
    cStatLote: tag(body, 'cStat'),   // 128 = lote processado com sucesso
    cStat: tag(retEvento, 'cStat'),  // 135 = registrado e vinculado; 136 = registrado; 573 = duplicidade
    xMotivo: tag(retEvento, 'xMotivo'),
    nProt: tag(retEvento, 'nProt'),
    chNFe: chave,
    tpEvento: ev.tpEvento,
    raw: body,
  };
}
