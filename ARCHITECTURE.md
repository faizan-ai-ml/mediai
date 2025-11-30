# 🏗️ MediAI Architecture

<p align="center">
  <strong>Technical Architecture Documentation</strong>
</p>

---

## 📖 Table of Contents

- [System Overview](#-system-overview)
- [Architecture Diagram](#-architecture-diagram)
- [Components](#-components)
- [Data Flow](#-data-flow)
- [Authentication Flow](#-authentication-flow)
- [Database Schema](#-database-schema)
- [Scalability Considerations](#-scalability-considerations)
- [Security Architecture](#-security-architecture)
- [AI Integration Architecture](#-ai-integration-architecture)
- [Deployment Architecture](#-deployment-architecture)
- [Future Enhancements](#-future-enhancements)

---

## 🔭 System Overview

MediAI follows a modern, scalable architecture designed with separation of concerns, security, and future growth in mind.

### Key Architectural Principles

1. **Separation of Concerns** - Frontend, Backend, Database, and AI layers are decoupled
2. **Stateless Authentication** - JWT tokens for scalable authentication
3. **API-First Design** - RESTful APIs with clear contracts
4. **Security by Default** - Encrypted communications, hashed passwords
5. **Horizontal Scalability** - Designed for containerized deployment

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Browser  │  │  Mobile  │  │   CLI    │  │   API    │                     │
│  │   App    │  │   App    │  │  Client  │  │ Consumer │                     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                     │
│       │             │             │             │                            │
└───────┼─────────────┼─────────────┼─────────────┼────────────────────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        React SPA (Vite)                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │  Auth       │  │   Chat      │  │  Profile    │  │   API      │  │    │
│  │  │  Context    │  │   Interface │  │  Components │  │   Client   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │ HTTP/REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND API LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      FastAPI Application                             │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                      MIDDLEWARE                               │   │    │
│  │  │  CORS │ Authentication │ Rate Limiting (planned) │ Logging   │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │                                                                      │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │   Auth     │  │   Chat     │  │   Health   │  │   User     │    │    │
│  │  │   Router   │  │   Router   │  │   Router   │  │   Router   │    │    │
│  │  │            │  │            │  │            │  │  (planned) │    │    │
│  │  │ • register │  │ • chat     │  │ • /health  │  │ • profile  │    │    │
│  │  │ • login    │  │ • history  │  │ • /ready   │  │ • settings │    │    │
│  │  │ • me       │  │ • convs    │  │            │  │            │    │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                       CORE SERVICES                           │   │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │    │
│  │  │  │   Auth      │  │   Database  │  │   Configuration     │   │   │    │
│  │  │  │   Service   │  │   Service   │  │   Management        │   │   │    │
│  │  │  │             │  │             │  │                     │   │   │    │
│  │  │  │ • JWT       │  │ • Sessions  │  │ • Environment vars  │   │   │    │
│  │  │  │ • bcrypt    │  │ • ORM       │  │ • Settings class    │   │   │    │
│  │  │  │ • OAuth2    │  │ • Migrations│  │                     │   │   │    │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                      │                        │                              │
└──────────────────────┼────────────────────────┼──────────────────────────────┘
                       │                        │
          ┌────────────┘                        └────────────┐
          │                                                  │
          ▼                                                  ▼
┌───────────────────────────┐              ┌───────────────────────────┐
│      DATABASE LAYER       │              │       AI/LLM LAYER        │
│                           │              │                           │
│  ┌─────────────────────┐  │              │  ┌─────────────────────┐  │
│  │    PostgreSQL 15    │  │              │  │    OpenRouter API   │  │
│  │                     │  │              │  │                     │  │
│  │  ┌───────────────┐  │  │              │  │  ┌───────────────┐  │  │
│  │  │    Users      │  │  │              │  │  │   DeepSeek    │  │  │
│  │  │    Table      │  │  │              │  │  │   Chat Model  │  │  │
│  │  └───────────────┘  │  │              │  │  └───────────────┘  │  │
│  │  ┌───────────────┐  │  │              │  │                     │  │
│  │  │ Conversations │  │  │              │  │  ┌───────────────┐  │  │
│  │  │    Table      │  │  │              │  │  │   Ollama      │  │  │
│  │  └───────────────┘  │  │              │  │  │   (planned)   │  │  │
│  │  ┌───────────────┐  │  │              │  │  └───────────────┘  │  │
│  │  │   Messages    │  │  │              │  │                     │  │
│  │  │    Table      │  │  │              │  │  ┌───────────────┐  │  │
│  │  └───────────────┘  │  │              │  │  │ Google Gemini │  │  │
│  │                     │  │              │  │  │   (planned)   │  │  │
│  └─────────────────────┘  │              │  │  └───────────────┘  │  │
│                           │              │  └─────────────────────┘  │
└───────────────────────────┘              └───────────────────────────┘
```

---

## 🧩 Components

### 1. Frontend Layer (React SPA)

The frontend is a Single Page Application built with React and Vite.

| Component | Purpose |
|-----------|---------|
| `App.jsx` | Main application component, routing |
| `AuthContext.jsx` | Global authentication state management |
| `Chat.jsx` | AI chat interface |
| `Login.jsx` | User login form |
| `Register.jsx` | User registration form |

**Key Features:**
- Responsive design for mobile and desktop
- Real-time chat interface with typing indicators
- Persistent authentication state
- Axios HTTP client for API communication

### 2. Backend API Layer (FastAPI)

The backend is built with FastAPI, providing high-performance RESTful APIs.

```
backend/
├── main.py                    # Application entry point
└── app/
    ├── api/                   # API route handlers
    │   ├── auth.py            # Authentication endpoints
    │   ├── chat.py            # Chat/AI endpoints
    │   └── health.py          # Health check endpoints
    ├── core/                  # Core utilities
    │   ├── auth.py            # JWT & password utilities
    │   ├── config.py          # Configuration management
    │   └── database.py        # Database connection
    └── models/                # Data models
        └── models.py          # SQLAlchemy ORM models
```

### 3. Database Layer (PostgreSQL)

PostgreSQL serves as the primary data store, managed through SQLAlchemy ORM.

**Benefits:**
- ACID compliance for data integrity
- Rich query capabilities
- Excellent performance at scale
- JSON support for flexible data storage

### 4. AI/LLM Layer (External Services)

The AI layer handles medical query processing through external LLM services.

**Current Integration:**
- OpenRouter API as the gateway
- DeepSeek Chat model for responses

**Planned Integrations:**
- Ollama for local/self-hosted LLM
- Google Gemini as alternative provider
- Custom fine-tuned medical models

### 5. Caching Layer (Planned - Redis)

Future addition for performance optimization:
- Session caching
- API response caching
- Rate limiting storage

---

## 🔄 Data Flow

### Request/Response Cycle

```
1. User Action (Frontend)
       │
       ▼
2. HTTP Request (Axios)
       │
       ▼
3. CORS Middleware
       │
       ▼
4. Authentication Middleware
       │
       ▼
5. Route Handler
       │
       ├──► Database Query (if needed)
       │         │
       │         ▼
       │    PostgreSQL
       │         │
       │         ▼
       │    Query Result
       │
       ├──► AI Service Call (if chat)
       │         │
       │         ▼
       │    OpenRouter API
       │         │
       │         ▼
       │    AI Response
       │
       ▼
6. Response Serialization (Pydantic)
       │
       ▼
7. HTTP Response
       │
       ▼
8. Frontend State Update (React)
```

### Chat Message Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  Save User Msg  │ ──► Database
│  to Database    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Build System   │
│  Prompt         │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Send to        │ ──► OpenRouter API
│  AI Service     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Process AI     │
│  Response       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Save AI Msg    │ ──► Database
│  to Database    │
└─────────────────┘
    │
    ▼
Return Response to Client
```

---

## 🔐 Authentication Flow

### JWT Token Lifecycle

```
                    REGISTRATION
                         │
    ┌────────────────────┼────────────────────┐
    │                    ▼                    │
    │  1. User submits email, password, etc.  │
    │                    │                    │
    │                    ▼                    │
    │  2. Server validates input              │
    │                    │                    │
    │                    ▼                    │
    │  3. Hash password with bcrypt           │
    │                    │                    │
    │                    ▼                    │
    │  4. Store user in database              │
    │                    │                    │
    │                    ▼                    │
    │  5. Generate JWT access token           │
    │                    │                    │
    │                    ▼                    │
    │  6. Return token + user info            │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                    ┌────┴────┐
                    │ CLIENT  │
                    │ STORES  │
                    │  TOKEN  │
                    └────┬────┘
                         │
                    LOGIN/ACCESS
                         │
    ┌────────────────────┼────────────────────┐
    │                    ▼                    │
    │  1. User submits email/password         │
    │                    │                    │
    │                    ▼                    │
    │  2. Server verifies credentials         │
    │                    │                    │
    │                    ▼                    │
    │  3. bcrypt.verify(password, hash)       │
    │                    │                    │
    │                    ▼                    │
    │  4. Generate new JWT token              │
    │                    │                    │
    │                    ▼                    │
    │  5. Return token + user info            │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
              AUTHENTICATED REQUESTS
                         │
    ┌────────────────────┼────────────────────┐
    │                    ▼                    │
    │  1. Client sends Authorization header   │
    │     "Bearer <jwt_token>"                │
    │                    │                    │
    │                    ▼                    │
    │  2. Server extracts token               │
    │                    │                    │
    │                    ▼                    │
    │  3. Verify signature & expiration       │
    │                    │                    │
    │                    ▼                    │
    │  4. Extract user_id from payload        │
    │                    │                    │
    │                    ▼                    │
    │  5. Fetch user from database            │
    │                    │                    │
    │                    ▼                    │
    │  6. Process request with user context   │
    │                    │                    │
    └────────────────────┼────────────────────┘
```

### Token Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Algorithm | HS256 | HMAC with SHA-256 |
| Expiration | 10080 min (7 days) | Token validity period |
| Token Type | Bearer | OAuth2 bearer token |

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        USERS                             │
├─────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)    PK      UUID             │
│ email           VARCHAR(255)   UNIQUE  NOT NULL         │
│ username        VARCHAR(100)   UNIQUE  NOT NULL         │
│ full_name       VARCHAR(255)   NULL                     │
│ hashed_password VARCHAR(255)   NOT NULL                 │
│ is_active       BOOLEAN        DEFAULT TRUE             │
│ created_at      TIMESTAMP      DEFAULT NOW()            │
│ updated_at      TIMESTAMP      DEFAULT NOW()            │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    CONVERSATIONS                         │
├─────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)    PK      UUID             │
│ user_id         VARCHAR(36)    FK      REFERENCES users │
│ title           VARCHAR(255)   DEFAULT 'New Conv.'      │
│ created_at      TIMESTAMP      DEFAULT NOW()            │
│ updated_at      TIMESTAMP      DEFAULT NOW()            │
└─────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      MESSAGES                            │
├─────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)    PK      UUID             │
│ conversation_id VARCHAR(36)    FK      REFERENCES convs │
│ role            VARCHAR(20)    NOT NULL (user/assistant)│
│ content         TEXT           NOT NULL                 │
│ created_at      TIMESTAMP      DEFAULT NOW()            │
└─────────────────────────────────────────────────────────┘
```

### Future Tables (Planned)

- **medical_history** - User health records
- **symptoms** - Symptom analysis logs
- **conditions** - Medical condition reference
- **reminders** - Medication/appointment reminders

---

## 📈 Scalability Considerations

### Horizontal Scaling Strategy

```
                        Load Balancer
                    (Nginx / AWS ALB / Cloudflare)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Backend  │        │ Backend  │        │ Backend  │
    │ Instance │        │ Instance │        │ Instance │
    │    #1    │        │    #2    │        │    #3    │
    └────┬─────┘        └────┬─────┘        └────┬─────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              ┌──────────┐      ┌──────────┐
              │  Primary │      │  Replica │
              │ Database │ ───► │ Database │
              └──────────┘      └──────────┘
```

### Scaling Strategies

| Component | Strategy |
|-----------|----------|
| **Frontend** | CDN distribution (Cloudflare, AWS CloudFront) |
| **Backend** | Horizontal scaling with container orchestration |
| **Database** | Read replicas for query distribution |
| **Cache** | Redis cluster for session/response caching |
| **AI Calls** | Queue-based processing with rate limiting |

### Performance Optimizations (Planned)

1. **Response Caching** - Cache frequent AI responses
2. **Database Indexing** - Optimize query performance
3. **Connection Pooling** - Efficient database connections
4. **Gzip Compression** - Reduce payload sizes
5. **Lazy Loading** - Progressive content loading

---

## 🔒 Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                 SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. NETWORK LAYER                                       │
│     ├── HTTPS/TLS encryption in production             │
│     ├── CORS policy enforcement                        │
│     └── Rate limiting (planned)                        │
│                                                         │
│  2. APPLICATION LAYER                                   │
│     ├── Input validation (Pydantic)                    │
│     ├── SQL injection prevention (SQLAlchemy ORM)      │
│     ├── XSS prevention (React auto-escaping)           │
│     └── CSRF protection                                │
│                                                         │
│  3. AUTHENTICATION LAYER                                │
│     ├── JWT token validation                           │
│     ├── bcrypt password hashing (work factor 12)       │
│     ├── Token expiration enforcement                   │
│     └── OAuth2 password bearer scheme                  │
│                                                         │
│  4. DATA LAYER                                          │
│     ├── Database access controls                       │
│     ├── Encrypted connections                          │
│     ├── No plaintext password storage                  │
│     └── Sensitive data encryption (planned)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Security Best Practices

| Practice | Implementation |
|----------|----------------|
| **Password Security** | bcrypt with cost factor 12 |
| **Token Security** | Short-lived JWTs, secure storage |
| **Input Validation** | Pydantic models for all inputs |
| **SQL Injection** | ORM with parameterized queries |
| **Secrets Management** | Environment variables, never in code |
| **HTTPS** | Enforced in production |

---

## 🤖 AI Integration Architecture

### Current Architecture

```
┌───────────────────────────────────────────────────────┐
│                    AI SERVICE FLOW                     │
└───────────────────────────────────────────────────────┘

User Message
     │
     ▼
┌─────────────────┐
│  System Prompt  │  ◄── Medical assistant guidelines
│  Construction   │      - Disclaimers
└────────┬────────┘      - Emergency protocols
         │               - Response format
         ▼
┌─────────────────┐
│  Message        │  ◄── User's health query
│  Formatting     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌───────────────────┐
│  OpenRouter     │ ───► │  DeepSeek Chat    │
│  API Gateway    │      │  Model            │
└────────┬────────┘      └───────────────────┘
         │
         ▼
┌─────────────────┐
│  Response       │  ◄── Add disclaimers if missing
│  Processing     │      - Format for display
└────────┬────────┘
         │
         ▼
Store & Return Response
```

### Future AI Architecture (RAG-based)

```
┌───────────────────────────────────────────────────────┐
│          RETRIEVAL-AUGMENTED GENERATION (RAG)          │
└───────────────────────────────────────────────────────┘

User Query
     │
     ▼
┌─────────────────┐
│  Query Analysis │  ◄── Intent detection
│  & Embedding    │      - Entity extraction
└────────┬────────┘      - Medical term normalization
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│  Vector Search  │          │  Medical        │
│  (Similarity)   │          │  Knowledge Base │
└────────┬────────┘          │  (Elasticsearch)│
         │                   └────────┬────────┘
         │                            │
         └─────────────┬──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Context        │  ◄── Relevant medical info
              │  Augmentation   │      - Guidelines
              └────────┬────────┘      - Protocols
                       │
                       ▼
              ┌─────────────────┐
              │  LLM Response   │  ◄── Informed response
              │  Generation     │      - With sources
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Response       │  ◄── Medical accuracy check
              │  Validation     │      - Disclaimer enforcement
              └────────┬────────┘      - Emergency detection
                       │
                       ▼
              Return Validated Response
```

### AI Safety Measures

1. **System Prompts** - Clear medical guidelines in every request
2. **Emergency Detection** - Automatic detection of emergency symptoms
3. **Disclaimer Enforcement** - Required medical disclaimers
4. **No Diagnosis** - AI cannot diagnose conditions
5. **No Prescriptions** - AI cannot recommend medications
6. **Professional Referral** - Always recommend professional consultation

---

## 🚀 Deployment Architecture

### Current Deployment (Development)

```
┌───────────────────────────────────────────────────────┐
│                 DEVELOPMENT SETUP                      │
└───────────────────────────────────────────────────────┘

Developer Machine
       │
       ├──► Frontend (npm run dev)
       │        Port: 5173
       │
       ├──► Backend (python main.py)
       │        Port: 8000
       │
       └──► PostgreSQL (Docker)
                Port: 5432
```

### Production Deployment (Railway)

```
┌───────────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT                     │
└───────────────────────────────────────────────────────┘

                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │    Railway      │
              │  Load Balancer  │
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│    Frontend     │        │    Backend      │
│    (Static)     │        │    (FastAPI)    │
│    Container    │        │    Container    │
└─────────────────┘        └────────┬────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   PostgreSQL    │
                          │   (Railway)     │
                          └─────────────────┘
```

### Future CI/CD Pipeline (Planned)

```
┌───────────────────────────────────────────────────────┐
│                   CI/CD PIPELINE                       │
└───────────────────────────────────────────────────────┘

Git Push to Main
       │
       ▼
┌─────────────────┐
│  GitHub Actions │
│  Triggered      │
└────────┬────────┘
         │
         ├──► Lint & Format Check
         │
         ├──► Unit Tests
         │
         ├──► Integration Tests
         │
         ├──► Security Scan
         │
         ├──► Build Docker Images
         │
         └──► Deploy to Environment
                    │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
      Dev      Staging    Production
```

---

## 🔮 Future Enhancements

### Near-term (Q1-Q2 2026)

| Enhancement | Purpose |
|-------------|---------|
| **Redis Caching** | Response caching, rate limiting |
| **Celery + RabbitMQ** | Async task processing |
| **Elasticsearch** | Medical knowledge search |
| **Prometheus + Grafana** | Monitoring & metrics |
| **ELK Stack** | Centralized logging |

### Mid-term (Q3-Q4 2026)

| Enhancement | Purpose |
|-------------|---------|
| **Kubernetes** | Container orchestration |
| **Multi-region** | Global availability |
| **CDN Integration** | Static asset delivery |
| **WebSocket** | Real-time chat updates |
| **Mobile Apps** | iOS and Android clients |

### Long-term (2027+)

| Enhancement | Purpose |
|-------------|---------|
| **Microservices** | Service decomposition |
| **Event Sourcing** | Medical history audit trail |
| **ML Pipeline** | Custom model training |
| **HIPAA Compliance** | US healthcare certification |
| **Wearables Integration** | Health data ingestion |

---

<p align="center">
  <a href="#-mediai-architecture">⬆️ Back to Top</a>
</p>
