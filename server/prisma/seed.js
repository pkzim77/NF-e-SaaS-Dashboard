import { prisma } from '../src/db.js';

function makeKey(cnpj, num, serie, salt) {
  const cn = cnpj.replace(/\D/g, '').padStart(14, '0');
  const cNF = String((num * 7919 + salt * 131 + 10000037) % 100000000).padStart(8, '0');
  const raw = '35' + '2606' + cn + '55' + String(serie).padStart(3, '0') + String(num).padStart(9, '0') + '1' + cNF;
  const dv = String(raw.split('').reduce((a, c) => (a + +c) % 10, 0));
  return (raw + dv).replace(/(.{4})/g, '$1 ').trim();
}

const SUPPLIERS = [
  { ref: 's1', nome: 'Distribuidora Sol Nascente LTDA', cnpj: '12.345.678/0001-90', ie: '114.220.880.117', cidade: 'Campinas / SP' },
  { ref: 's2', nome: 'Atacadão Verde Vale Comércio LTDA', cnpj: '27.901.443/0001-08', ie: '336.118.402.553', cidade: 'Ribeirão Preto / SP' },
  { ref: 's3', nome: 'Bebidas União Distribuidora S/A', cnpj: '44.512.336/0001-71', ie: '109.778.220.330', cidade: 'Jundiaí / SP' },
  { ref: 's4', nome: 'Higiene Total Produtos de Limpeza', cnpj: '18.660.902/0001-44', ie: '287.450.119.006', cidade: 'São Paulo / SP' },
  { ref: 's5', nome: 'Papelaria & Cia Materiais de Escritório', cnpj: '31.224.708/0001-93', ie: '401.330.557.221', cidade: 'Sorocaba / SP' },
  { ref: 's6', nome: 'EmbalaMais Indústria de Embalagens', cnpj: '09.882.150/0001-29', ie: '556.901.330.448', cidade: 'Limeira / SP' },
  { ref: 's7', nome: 'Frigorífico Boa Carne LTDA', cnpj: '52.117.609/0001-37', ie: '778.220.114.990', cidade: 'Barretos / SP' },
  { ref: 's8', nome: 'TecnoSuprimentos Brasil S/A', cnpj: '63.448.221/0001-55', ie: '220.665.901.118', cidade: 'São Paulo / SP' },
];

// [supplierRef, numero, serie, dataISO, situacao, frete, itens:[codigo, descricao, ncm, cfop, qtd, vUnit]]
const RAW_NFES = [
  ['s1', 48213, 1, '2026-06-18', 'autorizada', 180.0, [['ARZ-5', 'Arroz Tipo 1 Pacote 5kg', '10063021', '6102', 120, 24.9], ['FEJ-1', 'Feijão Carioca 1kg', '07133319', '6102', 90, 8.4], ['ACR-5', 'Açúcar Refinado 5kg', '17019900', '6102', 60, 18.5]]],
  ['s7', 12880, 2, '2026-06-18', 'autorizada', 95.0, [['BOV-KG', 'Carne Bovina Dianteiro kg', '02013000', '6102', 180, 28.9], ['FRG-KG', 'Frango Congelado kg', '02071200', '6102', 140, 11.2]]],
  ['s3', 90551, 1, '2026-06-17', 'autorizada', 220.0, [['REF-2L', 'Refrigerante Cola 2L', '22021000', '6102', 300, 5.8], ['AGM-500', 'Água Mineral 500ml cx/12', '22011000', '6102', 80, 14.4], ['SUC-1L', 'Suco Néctar 1L', '20098900', '6102', 120, 6.2]]],
  ['s2', 33712, 1, '2026-06-16', 'autorizada', 140.0, [['TOM-KG', 'Tomate Italiano kg', '07020000', '6102', 90, 5.9], ['BAT-KG', 'Batata Lavada kg', '07019000', '6102', 150, 3.4], ['CEB-KG', 'Cebola Nacional kg', '07031019', '6102', 80, 4.1]]],
  ['s4', 21097, 3, '2026-06-15', 'autorizada', 60.0, [['DET-500', 'Detergente Neutro 500ml', '34022000', '6102', 240, 1.85], ['SAB-1', 'Sabão em Pó 1kg', '34022000', '6102', 120, 9.3], ['DSF-2L', 'Desinfetante 2L', '38089419', '6102', 90, 7.6]]],
  ['s5', 5540, 1, '2026-06-12', 'autorizada', 35.0, [['PAP-A4', 'Papel Sulfite A4 500fl', '48025590', '6102', 40, 22.9], ['TNR-85', 'Toner Compatível 85A', '37079021', '6102', 8, 89.0]]],
  ['s1', 48010, 1, '2026-06-10', 'autorizada', 160.0, [['OLE-900', 'Óleo de Soja 900ml', '15071000', '6102', 180, 7.2], ['FAR-1', 'Farinha de Trigo 1kg', '11010010', '6102', 120, 4.8]]],
  ['s6', 77321, 1, '2026-06-09', 'autorizada', 75.0, [['SAC-40', 'Sacola Plástica 40x50 fardo', '39232990', '6102', 60, 32.0], ['CXP-G', 'Caixa Papelão Grande', '48191000', '6102', 200, 2.1]]],
  ['s3', 90120, 1, '2026-06-05', 'cancelada', 0.0, [['CRV-LT', 'Cerveja Lata 350ml cx/12', '22030000', '6102', 60, 28.8]]],
  ['s7', 12640, 2, '2026-06-03', 'autorizada', 110.0, [['LIN-KG', 'Linguiça Toscana kg', '16010000', '6102', 90, 16.4], ['BOV-KG', 'Carne Bovina Traseiro kg', '02013000', '6102', 120, 34.9]]],
  ['s2', 33401, 1, '2026-05-29', 'autorizada', 130.0, [['BAN-KG', 'Banana Prata kg', '08030010', '6102', 160, 4.2], ['MAC-KG', 'Maçã Gala kg', '08081000', '6102', 90, 7.8]]],
  ['s8', 4012, 1, '2026-05-27', 'autorizada', 45.0, [['BAL-DIG', 'Balança Digital 30kg', '84238190', '6102', 3, 420.0], ['IMP-TER', 'Impressora Térmica 80mm', '84433239', '6102', 2, 640.0]]],
  ['s4', 20880, 3, '2026-05-22', 'autorizada', 50.0, [['ASN-5', 'Água Sanitária 5L', '28281019', '6102', 80, 8.9], ['DET-500', 'Detergente Neutro 500ml', '34022000', '6102', 180, 1.85]]],
  ['s1', 47712, 1, '2026-05-18', 'autorizada', 175.0, [['ARZ-5', 'Arroz Tipo 1 Pacote 5kg', '10063021', '6102', 140, 23.8], ['ACR-5', 'Açúcar Refinado 5kg', '17019900', '6102', 70, 17.9]]],
  ['s3', 89740, 1, '2026-05-14', 'autorizada', 200.0, [['REF-2L', 'Refrigerante Cola 2L', '22021000', '6102', 360, 5.6], ['SUC-1L', 'Suco Néctar 1L', '20098900', '6102', 140, 6.1]]],
  ['s6', 76990, 1, '2026-05-08', 'autorizada', 80.0, [['FPV-30', 'Filme PVC 30cm rolo', '39204900', '6102', 48, 12.5], ['BDJ-ISO', 'Bandeja Isopor cx/400', '39231090', '6102', 20, 38.0]]],
];

const CATEGORIES = [
  { nome: 'Alimentos', valor: 642300, color: 'oklch(0.6 0.16 264)' },
  { nome: 'Bebidas', valor: 198400, color: 'oklch(0.66 0.13 215)' },
  { nome: 'Limpeza', valor: 142900, color: 'oklch(0.68 0.14 162)' },
  { nome: 'Embalagens', valor: 121300, color: 'oklch(0.7 0.15 60)' },
  { nome: 'Escritório', valor: 88600, color: 'oklch(0.64 0.15 320)' },
  { nome: 'Equipamentos', valor: 78200, color: 'oklch(0.6 0.15 28)' },
];

const MONTHLY = [
  { mes: 'Jan', valor: 184320 },
  { mes: 'Fev', valor: 201540 },
  { mes: 'Mar', valor: 178900 },
  { mes: 'Abr', valor: 223410 },
  { mes: 'Mai', valor: 241870 },
  { mes: 'Jun', valor: 142360 },
];

const CERT_HISTORY = [
  { title: 'Certificado A1 enviado', desc: 'cert_a1.pfx · válido até 26/07/2026', date: '26/07/25', dot: 'bg-pos' },
  { title: 'Coleta automática ativada', desc: 'Frequência definida: a cada hora', date: '26/07/25', dot: 'bg-accent-2' },
  { title: 'Alerta de vencimento gerado', desc: 'Faltam 38 dias para expirar', date: '18/06/26', dot: 'bg-warn' },
  { title: 'Certificado anterior expirado', desc: 'cert_2024.pfx · substituído', date: '25/07/25', dot: 'bg-text-3' },
];

async function main() {
  await prisma.nfeItem.deleteMany();
  await prisma.nfe.deleteMany();
  await prisma.certHistoryEntry.deleteMany();
  await prisma.categorySpend.deleteMany();
  await prisma.monthlySpend.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      initials: 'MC',
      nome: 'Mercado Central LTDA',
      razaoSocial: 'Mercado Central Comércio de Alimentos LTDA',
      nomeFantasia: 'Mercado Central',
      segmento: 'Comércio varejista de alimentos',
      cnpj: '45.678.901/0001-23',
      ie: '110.042.490.114',
      endereco: 'Av. Brasil, 1840 — Centro',
      cidadeUf: 'Campinas / SP',
      telefone: '(19) 3232-7700',
      email: 'fiscal@mercadocentral.com.br',
      situacao: 'Ativa',
      dataCadastro: '14/02/2024',
      scheduleFrequency: '1h',
      certificate: {
        create: {
          titular: 'Mercado Central LTDA',
          arquivo: 'cert_a1.pfx',
          emitidoEm: '26/07/2025',
          validoAte: '26/07/2026',
        },
      },
      certHistory: { create: CERT_HISTORY },
      categories: { create: CATEGORIES },
      monthly: { create: MONTHLY },
    },
  });

  const supplierByRef = {};
  for (const s of SUPPLIERS) {
    const created = await prisma.supplier.create({
      data: { nome: s.nome, cnpj: s.cnpj, ie: s.ie, cidade: s.cidade, companyId: company.id },
    });
    supplierByRef[s.ref] = created;
  }

  for (let i = 0; i < RAW_NFES.length; i++) {
    const [ref, numero, serie, data, situacao, frete, rawItens] = RAW_NFES[i];
    const supplier = supplierByRef[ref];
    const itens = rawItens.map(([codigo, descricao, ncm, cfop, qtd, vUnit]) => ({
      codigo,
      descricao,
      ncm,
      cfop,
      qtd,
      vUnit,
      vTotal: +(qtd * vUnit).toFixed(2),
    }));
    const totalProd = +itens.reduce((a, b) => a + b.vTotal, 0).toFixed(2);
    const valor = +(totalProd + frete).toFixed(2);

    await prisma.nfe.create({
      data: {
        numero: String(numero).padStart(6, '0'),
        serie: String(serie).padStart(3, '0'),
        data,
        situacao,
        frete,
        totalProd,
        valor,
        chave: makeKey(supplier.cnpj, numero, serie, i),
        companyId: company.id,
        supplierId: supplier.id,
        itens: { create: itens },
      },
    });
  }

  console.log(`Seed completo: 1 empresa, ${SUPPLIERS.length} fornecedores, ${RAW_NFES.length} notas fiscais.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
