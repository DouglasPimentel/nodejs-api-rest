# Node.js API REST

Este repositório contém uma API REST desenvolvida com Node.js e Hono, utilizando TypeScript, TypeORM e PostgreSQL. A autenticação é baseada em JWT, utilizando a biblioteca Jose, e o hash de senhas é feito com Argon2.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript no servidor
- **Hono** - Microframework para criação de APIs web
- **TypeScript** - Superconjunto tipado do JavaScript
- **PostgreSQL** - Banco de dados relacional
- **TypeORM** - ORM para modelagem e manipulação do banco de dados
- **JWT (Jose)** - Autenticação e segurança baseada em tokens JWT
- **Argon2** - Hash de senhas seguro

## 📌 Requisitos

Antes de iniciar o projeto, certifique-se de que os seguintes softwares estão instalados na sua máquina:

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 14 ou superior)

## 🔧 Instalação

1. Clone este repositório:
   ```sh
   git clone https://github.com/DouglasPimentel/nodejs-api-rest
   cd nodejs-api-rest
   ```
2. Instale as dependências:
   ```sh
   pnpm install
   ```
3. Crie um arquivo `.env.local` com as variáveis necessárias (exemplo no `.env.template`).
4. Inicie a aplicação em modo de desenvolvimento:
   ```sh
   pnpm dev
   ```

## 📂 Estrutura do Projeto

```
nodejs-api-rest/
|-- public/
│-- src/
|   |-- database/
│   │-- middlewares/
│   │-- modules/
│   │-- routes/
│   │-- utils/ 
|   |-- app.ts
|   |-- environment.ts
|   |-- index.ts
│   └── logger.ts
│-- .env.template
|-- .gitignore
│-- tsconfig.json
│-- package.json
|-- README.md
└── tsconfig.json
```

## 📌 Rotas Principais

- **Autenticação**
  - `POST /auth/login` - Autentica um usuário e retorna um token JWT
  - `POST /auth/signup` - Registra um novo usuário

- **Recursos Protegidos** (Exemplo)
  - `GET /api/v1/users` - Retorna a lista de usuários (requer autenticação)
  - `GET /api/v1/tools` - Retorna a lista de ferramentas (requer autenticação)

## 🔑 Autenticação JWT

Os tokens JWT são gerados utilizando a biblioteca [Jose](https://github.com/panva/jose). O token deve ser incluído no cabeçalho `Authorization` para acessar rotas protegidas:

```
Authorization: Bearer <seu-token>
```

## 📜 Scripts Disponíveis

- `pnpm dev` - Inicia o servidor em modo de desenvolvimento

## 🤝 Contribuição

1. Fork este repositório
2. Crie uma branch (`git checkout -b feature-minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Envie para a branch (`git push origin feature-minha-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
