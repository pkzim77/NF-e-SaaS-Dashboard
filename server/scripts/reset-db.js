// Apaga TODOS os dados do banco (uso ao trocar de empresa/certificado).
// Reporta as contagens antes de apagar. Deleta na ordem segura de chaves estrangeiras.
//
//   npm run db:reset
//
import { prisma } from '../src/db.js';

async function main() {
  const antes = {
    notas: await prisma.nfe.count(),
    itens: await prisma.nfeItem.count(),
    fornecedores: await prisma.supplier.count(),
    empresas: await prisma.company.count(),
    sync: await prisma.sefazSync.count(),
    certificados: await prisma.certificate.count(),
  };
  console.log('Antes do reset:', antes);

  // Ordem segura: filhos antes dos pais.
  await prisma.nfeItem.deleteMany();
  await prisma.nfe.deleteMany();
  await prisma.certHistoryEntry.deleteMany();
  await prisma.categorySpend.deleteMany();
  await prisma.monthlySpend.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.sefazSync.deleteMany();
  await prisma.company.deleteMany();

  console.log('✓ Banco zerado. Próximos passos: atualizar server/.env (CERT_PATH, CERT_PASSWORD, SEFAZ_CNPJ) e criar a nova empresa.');
}

main()
  .catch((err) => {
    console.error('✗ Erro:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
