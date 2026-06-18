export function buildXml(n) {
  const it = n.itens
    .map(
      (p, i) =>
        `    <det nItem="${i + 1}">\n      <prod>\n        <cProd>${p.codigo}</cProd>\n        <xProd>${p.descricao}</xProd>\n        <NCM>${p.ncm}</NCM>\n        <CFOP>${p.cfop}</CFOP>\n        <qCom>${p.qtd.toFixed(4)}</qCom>\n        <vUnCom>${p.vUnit.toFixed(2)}</vUnCom>\n        <vProd>${p.vTotal.toFixed(2)}</vProd>\n      </prod>\n    </det>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<nfeProc versao="4.00">\n  <NFe>\n    <infNFe Id="NFe${n.chave.replace(/\s/g, '')}">\n      <ide>\n        <cUF>35</cUF>\n        <natOp>VENDA DE MERCADORIA</natOp>\n        <mod>55</mod>\n        <serie>${n.serie}</serie>\n        <nNF>${n.numero}</nNF>\n        <dhEmi>${n.data}T14:32:00-03:00</dhEmi>\n      </ide>\n      <emit>\n        <CNPJ>${n.fornCnpj.replace(/\D/g, '')}</CNPJ>\n        <xNome>${n.fornecedor}</xNome>\n        <IE>${n.fornIe.replace(/\D/g, '')}</IE>\n      </emit>\n      <dest>\n        <CNPJ>45678901000123</CNPJ>\n        <xNome>MERCADO CENTRAL COMERCIO DE ALIMENTOS LTDA</xNome>\n      </dest>\n${it}\n      <total>\n        <ICMSTot>\n          <vProd>${n.totalProd.toFixed(2)}</vProd>\n          <vFrete>${n.frete.toFixed(2)}</vFrete>\n          <vNF>${n.valor.toFixed(2)}</vNF>\n        </ICMSTot>\n      </total>\n    </infNFe>\n  </NFe>\n</nfeProc>`;
}
