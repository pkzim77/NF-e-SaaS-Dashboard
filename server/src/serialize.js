export function serializeNfe(n) {
  return {
    id: n.id,
    tipo: n.tipo,
    modelo: n.modelo,
    origem: n.origem,
    resumo: n.resumo,
    supId: n.supplierId,
    fornecedor: n.supplier.nome,
    fornCnpj: n.supplier.cnpj,
    fornIe: n.supplier.ie,
    fornCidade: n.supplier.cidade,
    numero: n.numero,
    serie: n.serie,
    data: n.data,
    sit: n.situacao,
    frete: n.frete,
    totalProd: n.totalProd,
    valor: n.valor,
    chave: n.chave,
    xml: n.xml,
    itens: n.itens.map((it) => ({
      codigo: it.codigo,
      descricao: it.descricao,
      ncm: it.ncm,
      cfop: it.cfop,
      qtd: it.qtd,
      vUnit: it.vUnit,
      vTotal: it.vTotal,
    })),
  };
}

export function serializeCompany(c) {
  return {
    id: c.id,
    initials: c.initials,
    nome: c.nome,
    razaoSocial: c.razaoSocial,
    nomeFantasia: c.nomeFantasia,
    segmento: c.segmento,
    cnpj: c.cnpj,
    ie: c.ie,
    endereco: c.endereco,
    cidadeUf: c.cidadeUf,
    telefone: c.telefone,
    email: c.email,
    situacao: c.situacao,
    dataCadastro: c.dataCadastro,
    scheduleFrequency: c.scheduleFrequency,
  };
}
