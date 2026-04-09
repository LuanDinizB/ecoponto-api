# ♻️ EcoPonto API

API REST desenvolvida em **Node.js + TypeScript** que serve como backend da aplicação EcoPonto, permitindo o gerenciamento de pontos de coleta de materiais recicláveis.

---

## 🎯 Objetivo do projeto

Fornecer uma API robusta para conectar usuários que desejam descartar resíduos recicláveis com cooperativas que realizam coleta e reciclagem, oferecendo:

- Autenticação separada para usuários e cooperativas
- Cadastro e gerenciamento de pontos de coleta
- Geocoding automático de endereços
- Upload de imagens via Cloudinary
- Monitoramento de logs via Grafana

---

## ⚙️ Funcionalidades

### 👤 Usuário
- Registro e login
- Visualização e atualização de perfil
- Alteração de senha

### 🏢 Cooperativa
- Registro e login
- Visualização e atualização de perfil
- Cadastro de pontos de coleta com endereço completo
- Upload de imagens dos pontos
- Definição de horários por dia da semana
- Definição de tipos de materiais aceitos

### ♻️ Pontos de Coleta
- Listagem pública com filtros por nome, tag, cidade e UF
- Geocoding automático via OpenCage
- Upload de imagens via Cloudinary

---

## 🧠 Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- MongoDB + Mongoose
- JSON Web Token (JWT)
- Bcrypt
- Multer
- Cloudinary
- OpenCage (Geocoding)
- Pino + Grafana Loki (Logs)
- UUID v7

---

## 📂 Estrutura do projeto

```bash
src
├── config        # Configurações (banco, cloudinary, logger)
├── controllers   # Lógica das rotas
├── middlewares   # Autenticação e upload
├── models        # Schemas do Mongoose
├── routes        # Definição das rotas
├── types         # Interfaces TypeScript
└── utils         # Utilitários (JWT, geocoding, cloudinary)
```

| Pasta         | Descrição                              |
| :------------ | :------------------------------------: |
| config        | Conexão com banco, Cloudinary e logger |
| controllers   | Regras de negócio de cada recurso      |
| middlewares   | JWT, permissões e upload de arquivos   |
| models        | Definição dos schemas MongoDB          |
| routes        | Mapeamento dos endpoints               |
| types         | Interfaces e tipos TypeScript          |
| utils         | Funções auxiliares reutilizáveis       |

---

## 🚀 Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/LuanDinizB/ecoponto-api.git
```

Entre na pasta:

```bash
cd ecoponto-api
```

Instale as dependências:

```bash
npm install
```

Execute em desenvolvimento:

```bash
npm run dev
```

Ou compile e execute em produção:

```bash
npm run build
npm start
```

---

## 🔗 Endpoints principais

| Método | Rota                          | Descrição                        | Auth         |
| :----- | :---------------------------- | :------------------------------: | :----------: |
| POST   | /auth/registro/usuario        | Registra um usuário              | —            |
| POST   | /auth/registro/cooperativa    | Registra uma cooperativa         | —            |
| POST   | /auth/login/usuario           | Login de usuário                 | —            |
| POST   | /auth/login/cooperativa       | Login de cooperativa             | —            |
| GET    | /usuarios/perfil              | Perfil do usuário logado         | Usuário      |
| GET    | /cooperativas/perfil          | Perfil da cooperativa logada     | Cooperativa  |
| GET    | /pontos-coleta                | Lista todos os pontos            | —            |
| GET    | /pontos-coleta/:id            | Detalhe de um ponto              | —            |
| GET    | /pontos-coleta/meus/lista     | Pontos da cooperativa logada     | Cooperativa  |
| POST   | /pontos-coleta                | Cria um ponto de coleta          | Cooperativa  |
| PUT    | /pontos-coleta/:id            | Atualiza um ponto                | Cooperativa  |
| DELETE | /pontos-coleta/:id            | Remove um ponto                  | Cooperativa  |

---

## 👩‍💻👨‍💻 Autores

Projeto desenvolvido pelos alunos [Carolina Valeriano](https://github.com/valerianocarolina) e [Luan Diniz](https://github.com/LuanDinizB) para a disciplina **Desenvolvimento Mobile**.

---

## 📄 Licença

MIT License
