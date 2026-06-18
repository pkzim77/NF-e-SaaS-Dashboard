export const suppliers = [
  { id: 's1', nome: 'Distribuidora Sol Nascente LTDA', cnpj: '12.345.678/0001-90', ie: '114.220.880.117', cidade: 'Campinas / SP' },
  { id: 's2', nome: 'Atacadão Verde Vale Comércio LTDA', cnpj: '27.901.443/0001-08', ie: '336.118.402.553', cidade: 'Ribeirão Preto / SP' },
  { id: 's3', nome: 'Bebidas União Distribuidora S/A', cnpj: '44.512.336/0001-71', ie: '109.778.220.330', cidade: 'Jundiaí / SP' },
  { id: 's4', nome: 'Higiene Total Produtos de Limpeza', cnpj: '18.660.902/0001-44', ie: '287.450.119.006', cidade: 'São Paulo / SP' },
  { id: 's5', nome: 'Papelaria & Cia Materiais de Escritório', cnpj: '31.224.708/0001-93', ie: '401.330.557.221', cidade: 'Sorocaba / SP' },
  { id: 's6', nome: 'EmbalaMais Indústria de Embalagens', cnpj: '09.882.150/0001-29', ie: '556.901.330.448', cidade: 'Limeira / SP' },
  { id: 's7', nome: 'Frigorífico Boa Carne LTDA', cnpj: '52.117.609/0001-37', ie: '778.220.114.990', cidade: 'Barretos / SP' },
  { id: 's8', nome: 'TecnoSuprimentos Brasil S/A', cnpj: '63.448.221/0001-55', ie: '220.665.901.118', cidade: 'São Paulo / SP' },
];

export function findSupplier(id) {
  return suppliers.find((s) => s.id === id);
}
