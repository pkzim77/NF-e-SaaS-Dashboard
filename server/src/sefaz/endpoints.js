// Endpoints dos webservices da SEFAZ.
// CE migrou para a SVRS (Sefaz Virtual do RS) em 2025 — o status de serviço
// modelo 55 do CE é atendido pela SVRS. O Distribuição DFe é nacional (AN).

export const CUF = { CE: '23' }; // código IBGE da UF (usado nas requisições)

export const ENDPOINTS = {
  // tpAmb: 1 = produção, 2 = homologação
  statusServico: {
    1: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
    2: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
  },
  distribuicaoDFe: {
    1: 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
    2: 'https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  },
};
