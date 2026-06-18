# FiscalFlow — NF-e SaaS Dashboard

Painel SaaS para gestão de Notas Fiscais Eletrônicas (NF-e): empresa, fornecedores,
notas fiscais com itens, certificado digital e relatórios de gastos.

- **Frontend:** React 19 + React Router 7 + Vite 8 + Tailwind 4
- **Backend:** Express 5 + Prisma 7 (ORM) + SQLite (via `better-sqlite3`)

---

## Estrutura

```
.
├── index.html, vite.config.js     # entrada do client (Vite)
├── src/                           # aplicação React (frontend)
│   ├── api/client.js              # wrapper de fetch para a API (BASE = /api)
│   ├── hooks/useApi.js            # hook de carregamento de dados
│   └── pages/, components/, ...
└── server/                        # API (backend)
    ├── src/
    │   ├── index.js               # app Express + rotas
    │   ├── db.js                  # PrismaClient com adapter better-sqlite3
    │   └── serialize.js           # mapeia modelos do banco → formato do frontend
    ├── prisma/
    │   ├── schema.prisma          # modelos de dados
    │   └── seed.js                # popula o banco com dados de exemplo
    ├── prisma.config.ts           # config do Prisma 7 (schema + datasource)
    └── dev.db                      # banco SQLite (gerado localmente)
```

---

## Como o backend funciona

### Stack e conexão
A API roda em **Express 5** na porta `4000`. O acesso ao banco é feito com o
**Prisma 7** usando o adapter **`@prisma/adapter-better-sqlite3`** — ou seja, o
SQLite é acessado diretamente pelo driver nativo `better-sqlite3`, sem engine de
query separada. A conexão é criada em [server/src/db.js](server/src/db.js) a partir
da variável de ambiente `DATABASE_URL`.

### Modelo de dados ([server/prisma/schema.prisma](server/prisma/schema.prisma))
Uma `Company` é a raiz e agrega tudo:

- `Company` → dados cadastrais + `scheduleFrequency` (frequência de coleta)
- `Supplier` — fornecedores da empresa
- `Nfe` — notas fiscais (numero, série, data, situação, valores, chave única) com `NfeItem[]`
- `Certificate` — certificado digital A1 (1:1 com a empresa)
- `CertHistoryEntry`, `CategorySpend`, `MonthlySpend` — histórico e dados de relatórios

### Camada de serialização
[server/src/serialize.js](server/src/serialize.js) converte os modelos do Prisma
para o formato que o frontend espera (ex.: `supplier.nome` vira `fornecedor`,
`situacao` vira `sit`), mantendo o backend desacoplado da UI.

### Rotas da API ([server/src/index.js](server/src/index.js))

| Método | Rota                | Descrição                                                        |
|--------|---------------------|------------------------------------------------------------------|
| GET    | `/api/health`       | Healthcheck → `{ ok: true }`                                      |
| GET    | `/api/company`      | Empresa + certificado, histórico, categorias e gastos mensais    |
| PATCH  | `/api/company`      | Atualiza `scheduleFrequency`                                      |
| GET    | `/api/suppliers`    | Lista de fornecedores                                            |
| GET    | `/api/nfes`         | Lista de NF-e (com fornecedor e itens, ordenadas por data desc)  |
| GET    | `/api/nfes/:id`     | Uma NF-e específica (404 se não existir)                         |

Durante o desenvolvimento o Vite faz **proxy** de `/api` para `http://localhost:4000`
(ver [vite.config.js](vite.config.js)), então o frontend chama apenas `/api/...`.

---

## Setup e execução

### 1. Pré-requisitos
- Node.js 20+ (testado com v24)
- npm 10+

### 2. Instalar dependências
```bash
npm install                 # dependências do frontend (raiz)
npm install --prefix server # dependências do backend
```

### 3. Configurar o ambiente do backend
Crie `server/.env` (não versionado):
```env
DATABASE_URL="file:./dev.db"
PORT=4000
```

### 4. Preparar o banco
```bash
cd server
npx prisma generate   # gera o Prisma Client
npx prisma db push    # cria o schema no SQLite (se o dev.db ainda não existir)
npm run db:seed       # popula com dados de exemplo
```
> O seed cria **1 empresa, 8 fornecedores, 16 NF-e e 35 itens**.

### 5. Rodar
Na raiz do projeto, sobe client + API juntos:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:4000

Para rodar apenas a API:
```bash
npm run dev:server
```

---

## Scripts úteis

| Comando                        | O que faz                                  |
|--------------------------------|--------------------------------------------|
| `npm run dev`                  | Client + servidor em paralelo              |
| `npm run dev:client`           | Apenas o frontend (Vite)                   |
| `npm run dev:server`           | Apenas a API (Express, com `--watch`)      |
| `npm run build`                | Build de produção do frontend             |
| `npm run db:seed`              | Popula o banco                             |
| `npm run db:studio`            | Abre o Prisma Studio (inspeção do banco)   |

---

## Verificação rápida da API

Com a API no ar:
```bash
curl http://localhost:4000/api/health      # {"ok":true}
curl http://localhost:4000/api/company     # dados da empresa
curl http://localhost:4000/api/nfes        # lista de notas fiscais
```
