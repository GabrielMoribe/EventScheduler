# Event Scheduler

Sistema de agendamento de eventos desenvolvido com NestJS, oferecendo uma API RESTful completa para gerenciamento de eventos, usuários, autenticação e notificações em tempo real.

## Sumario

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao](#instalacao)
- [Configuracao](#configuracao)
- [Execucao](#execucao)
- [API Reference](#api-reference)
  - [Autenticacao](#autenticacao)
  - [Usuarios](#usuarios)
  - [Eventos](#eventos)
  - [Notificacoes](#notificacoes)
- [Banco de Dados](#banco-de-dados)
- [Testes](#testes)

## Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Framework | NestJS 11 |
| Linguagem | TypeScript |
| Banco Relacional | PostgreSQL 16 |
| Banco NoSQL | MongoDB |
| Cache | Redis 7 |
| Message Broker | RabbitMQ 3.13 |
| ORM | TypeORM |
| ODM | Mongoose |
| Autenticacao | JWT (Passport) |
| Validacao | class-validator |
| Containerizacao | Docker Compose |

## Arquitetura

O projeto segue uma arquitetura modular com separacao clara de responsabilidades:

```
src/
├── common/              # Recursos compartilhados (decorators, guards, pipes, filters)
├── config/              # Configuracoes da aplicacao
├── database/            # Configuracao de banco, migrations e seeds
└── modules/
    ├── auth/            # Autenticacao e autorizacao
    ├── users/           # Gerenciamento de usuarios
    ├── events/          # Gerenciamento de eventos
    ├── notifications/   # Sistema de notificacoes (MongoDB + RabbitMQ)
    ├── redis/           # Configuracao do cache Redis
    └── rabbitmq/        # Configuracao do message broker
```

### Padroes Utilizados

- **Domain-Driven Design (DDD)**: Entidades ricas com Value Objects e regras de negocio encapsuladas
- **Repository Pattern**: Camada de abstracao para acesso a dados
- **DTO Pattern**: Objetos de transferencia para requests e responses
- **Guard Pattern**: Protecao de rotas com JWT e controle de roles

## Pre-requisitos

- Node.js 20+
- npm ou yarn
- Docker e Docker Compose

## Instalacao

1. Clone o repositorio:

```bash
git clone https://github.com/GabrielMoribe/EventScheduler.git
cd event-scheduler
```

2. Instale as dependencias:

```bash
npm install
```

3. Inicie os servicos de infraestrutura:

```bash
docker-compose up -d
```

## Configuracao

Crie um arquivo `.env` na raiz do projeto com as seguintes variaveis:

```env
# Aplicacao
NODE_ENV=development
PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=EventScheduler

# MongoDB
MONGODB_URI=mongodb://root:root123@localhost:27017/EventScheduler?authSource=admin
MONGO_USER=root
MONGO_PASSWORD=root123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://rabbitmq:rabbitmq123@localhost:5672

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

## Execucao

### Desenvolvimento

```bash
# Executar migrations
npm run migration:run

# Popular banco com dados iniciais (opcional)
npm run seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

### Producao

```bash
# Build
npm run build

# Iniciar
npm run start:prod
```

### Scripts Disponiveis

| Script | Descricao |
|--------|-----------|
| `npm run start:dev` | Inicia em modo watch |
| `npm run start:debug` | Inicia com debugger |
| `npm run build` | Compila o projeto |
| `npm run migration:run` | Executa migrations pendentes |
| `npm run migration:create` | Cria nova migration |
| `npm run seed` | Popula banco com dados de teste |
| `npm run lint` | Executa linter |
| `npm run test` | Executa testes unitarios |
| `npm run test:e2e` | Executa testes end-to-end |
| `npm run test:cov` | Gera relatorio de cobertura |

## API Reference

A API utiliza autenticacao JWT. Endpoints protegidos requerem o header `Authorization: Bearer <token>`.

### Autenticacao

#### Login

```http
POST /auth/login
```

**Request Body:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| email | string | Sim | Email do usuario |
| password | string | Sim | Senha do usuario |

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PARTICIPANT"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:** `204 No Content`

---

### Usuarios

#### Criar Usuario

```http
POST /users
```

**Request Body:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| email | string | Sim | Email unico |
| password | string | Sim | Minimo 8 caracteres |
| firstName | string | Sim | Minimo 2 caracteres |
| lastName | string | Sim | Minimo 2 caracteres |
| role | enum | Nao | ADMIN, ORGANIZER, PARTICIPANT (default) |

**Response:** `201 Created`

#### Listar Usuarios

```http
GET /users
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Buscar Usuario

```http
GET /users/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Atualizar Usuario

```http
PATCH /users/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Remover Usuario

```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### Eventos

#### Criar Evento

```http
POST /events
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Request Body:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| title | string | Sim | Titulo do evento (max 255) |
| description | string | Nao | Descricao do evento |
| location | string | Nao | Local do evento |
| startDate | ISO8601 | Sim | Data/hora de inicio |
| endDate | ISO8601 | Sim | Data/hora de termino |
| maxParticipants | number | Nao | Limite de participantes |

**Response:** `201 Created`

#### Listar Eventos

```http
GET /events
Authorization: Bearer <token>
```

**Query Parameters:**

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| status | enum | Filtrar por status (DRAFT, PUBLISHED, CANCELLED, COMPLETED) |
| search | string | Busca por titulo ou descricao |

**Response:** `200 OK`

#### Buscar Evento

```http
GET /events/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Meus Eventos (Participando)

```http
GET /events/my-events
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Eventos Organizados

```http
GET /events/organized
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Response:** `200 OK`

#### Atualizar Evento

```http
PUT /events/:id
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Response:** `200 OK`

#### Remover Evento

```http
DELETE /events/:id
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Response:** `204 No Content`

#### Publicar Evento

```http
PATCH /events/:id/publish
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

Altera o status do evento de DRAFT para PUBLISHED.

**Response:** `200 OK`

#### Cancelar Evento

```http
PATCH /events/:id/cancel
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Response:** `200 OK`

#### Concluir Evento

```http
PATCH /events/:id/complete
Authorization: Bearer <token>
```

**Roles permitidas:** ADMIN, ORGANIZER

**Response:** `200 OK`

#### Participar de Evento

```http
POST /events/:id/join
Authorization: Bearer <token>
```

Adiciona o usuario autenticado como participante do evento.

**Response:** `200 OK`

#### Sair de Evento

```http
POST /events/:id/leave
Authorization: Bearer <token>
```

Remove o usuario autenticado da lista de participantes.

**Response:** `200 OK`

---

### Notificacoes

As notificacoes sao processadas de forma assincrona via RabbitMQ e armazenadas no MongoDB.

#### Listar Notificacoes

```http
GET /notifications
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "notifications": [...],
  "unreadCount": 5
}
```

#### Listar Nao Lidas

```http
GET /notifications/unread
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Contar Nao Lidas

```http
GET /notifications/unread/count
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "count": 5
}
```

#### Marcar como Lida

```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### Marcar Todas como Lidas

```http
PATCH /notifications/read-all
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Banco de Dados

### PostgreSQL

Utilizado para dados relacionais (usuarios, eventos). As migrations estao localizadas em `src/database/migrations/`.

**Entidades principais:**

- **users**: Armazena informacoes dos usuarios
- **events**: Armazena eventos criados
- **event_participants**: Tabela de relacionamento N:N entre eventos e usuarios

### MongoDB

Utilizado para armazenamento de notificacoes, permitindo consultas flexiveis e alta performance de escrita.

### Redis

Utilizado para:

- Cache de dados frequentemente acessados
- Blacklist de tokens JWT invalidados

### Migrations

```bash
# Executar migrations pendentes
npm run migration:run

# Criar nova migration
MIGRATION_NAME=NomeDaMigration npm run migration:create
```

## Testes

```bash
# Testes unitarios
npm run test

# Testes em modo watch
npm run test:watch

# Testes end-to-end
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Roles e Permissoes

O sistema implementa controle de acesso baseado em roles (RBAC):

| Role | Permissoes |
|------|------------|
| ADMIN | Acesso total ao sistema |
| ORGANIZER | Criar, editar e gerenciar eventos proprios |
| PARTICIPANT | Visualizar eventos e participar |

## Status de Eventos

| Status | Descricao |
|--------|-----------|
| DRAFT | Rascunho, visivel apenas para o organizador |
| PUBLISHED | Publicado, visivel para todos |
| CANCELLED | Cancelado |
| COMPLETED | Finalizado |

