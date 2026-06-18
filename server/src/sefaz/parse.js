// Parsers dos documentos da Distribuição DFe.

const tag = (xml, name) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim() ?? null;

export function formatCnpj(d) {
  const c = String(d || '').replace(/\D/g, '').padStart(14, '0');
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// A chave de acesso (44 dígitos) carrega UF, CNPJ, modelo, série e número.
export function parseChave(chNFe) {
  const c = String(chNFe || '').replace(/\D/g, '');
  return {
    chave: c,
    cUF: c.slice(0, 2),
    cnpjEmit: c.slice(6, 20),
    modelo: c.slice(20, 22),
    serie: String(parseInt(c.slice(22, 25), 10) || 0),
    numero: String(parseInt(c.slice(25, 34), 10) || 0),
  };
}

// cSitNFe do resumo → rótulo usado no app.
function situacaoFromCSit(cSit) {
  return { 1: 'autorizada', 2: 'denegada', 3: 'cancelada' }[Number(cSit)] || 'autorizada';
}

// resNFe (resumo): dados básicos da NF-e recebida, sem itens.
export function parseResNFe(xml) {
  const chNFe = tag(xml, 'chNFe');
  const { modelo, serie, numero } = parseChave(chNFe);
  const dhEmi = tag(xml, 'dhEmi');
  return {
    chave: String(chNFe || '').replace(/\D/g, ''),
    modelo,
    serie,
    numero,
    data: dhEmi ? dhEmi.slice(0, 10) : '',
    situacao: situacaoFromCSit(tag(xml, 'cSitNFe')),
    valor: Number(tag(xml, 'vNF') || 0),
    emitCnpj: formatCnpj(tag(xml, 'CNPJ')),
    emitNome: tag(xml, 'xNome') || 'Fornecedor não identificado',
    emitIe: tag(xml, 'IE') || '',
  };
}
