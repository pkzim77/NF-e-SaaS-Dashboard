import { findSupplier } from './suppliers';
import { makeKey } from '../utils/nfeKey';

// [supplierId, numero, serie, dataISO, situacao, frete, itens:[codigo, descricao, ncm, cfop, qtd, vUnit]]
const RAW = [
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

export const nfes = RAW.map((r, i) => {
  const s = findSupplier(r[0]);
  const itens = r[6].map((it) => ({
    codigo: it[0],
    descricao: it[1],
    ncm: it[2],
    cfop: it[3],
    qtd: it[4],
    vUnit: it[5],
    vTotal: +(it[4] * it[5]).toFixed(2),
  }));
  const totalProd = +itens.reduce((a, b) => a + b.vTotal, 0).toFixed(2);
  const valor = +(totalProd + r[5]).toFixed(2);
  return {
    id: 'nf' + i,
    supId: r[0],
    fornecedor: s.nome,
    fornCnpj: s.cnpj,
    fornIe: s.ie,
    fornCidade: s.cidade,
    numero: String(r[1]).padStart(6, '0'),
    serie: String(r[2]).padStart(3, '0'),
    data: r[3],
    sit: r[4],
    frete: r[5],
    itens,
    totalProd,
    valor,
    chave: makeKey(s.cnpj, r[1], r[2], i),
  };
});

export function findNfe(id) {
  return nfes.find((n) => n.id === id);
}
