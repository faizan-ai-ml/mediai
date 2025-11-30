# 🏥 MediAI - AI-Powered Medical Assistant

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/status-MVP%20Phase-yellow.svg" alt="Status">
  <img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/react-18.2-61dafb.svg" alt="React">
</p>

<p align="center">
  <strong>Democratizing Healthcare Access Worldwide</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📖 Table of Contents

- [About MediAI](#-about-mediai)
- [Vision Statement](#-vision-statement)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Status](#-project-status)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Medical Disclaimer](#-medical-disclaimer)
- [Contact](#-contact)
- [Acknowledgments](#-acknowledgments)

---

## 🏥 About MediAI

**MediAI** is an AI-powered medical assistant designed to democratize healthcare access worldwide. Our platform provides intelligent, conversational medical information to help users understand their health better, reducing unnecessary doctor visits for routine queries while ensuring users seek professional medical attention when needed.

MediAI combines cutting-edge AI technology with medical knowledge to deliver:
- Accurate, easy-to-understand health information
- 24/7 availability for health queries
- Privacy-focused design with secure authentication
- A user-friendly conversational interface

---

## 🎯 Vision Statement

> **Making quality medical information accessible to everyone, everywhere.**

Healthcare information should not be a privilege. MediAI aims to:

- 🌍 **Bridge the Healthcare Gap** - Provide accessible health information to underserved communities
- 💡 **Empower Users** - Help people make informed decisions about their health
- ⏰ **Save Time** - Reduce unnecessary clinic visits for routine health queries
- 🤝 **Support Healthcare** - Complement (not replace) professional medical advice

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🤖 **AI-Powered Symptom Analysis** | Intelligent analysis of health symptoms with relevant information | 🔄 In Progress |
| 💬 **Conversational Medical Assistant** | Natural language chat interface for health queries | ✅ Available |
| 🔒 **Secure Authentication** | JWT-based authentication with bcrypt password hashing | ✅ Available |
| 📜 **Conversation History** | Persistent chat history for registered users | ✅ Available |
| 🌍 **Global Scalability** | Architecture designed for worldwide deployment | 📋 Planned |
| 📱 **Mobile-Responsive Interface** | Works seamlessly on desktop and mobile devices | ✅ Available |
| 🆓 **Free to Use** | Currently free during MVP phase | ✅ Available |

---

## 🛠 Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python web framework |
| **PostgreSQL** | Reliable relational database |
| **SQLAlchemy** | SQL toolkit and ORM |
| **Pydantic** | Data validation using Python type annotations |
| **Uvicorn** | Lightning-fast ASGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Modern UI component library |
| **Vite** | Next-generation frontend build tool |
| **Axios** | Promise-based HTTP client |

### Authentication & Security
| Technology | Purpose |
|------------|---------|
| **JWT (JSON Web Tokens)** | Stateless authentication |
| **bcrypt** | Secure password hashing |
| **python-jose** | JWT encoding/decoding |

### Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Container platform |
| **Docker Compose** | Multi-container orchestration |
| **Railway** | Cloud deployment platform |

### AI Integration (Planned)
| Technology | Purpose |
|------------|---------|
| **OpenRouter** | AI model gateway |
| **DeepSeek** | LLM for medical responses |
| **Ollama** | Local LLM option (planned) |
| **Google Gemini** | Alternative AI provider (planned) |

---

## 📊 Project Status

<p align="center">
  <strong>🚧 Active Development - MVP Phase 🚧</strong>
</p>

| Component | Status | Progress |
|-----------|--------|----------|
| User Authentication | ✅ Complete | 100% |
| Database Integration | ✅ Complete | 100% |
| Docker Setup | ✅ Complete | 100% |
| Documentation | 🔄 In Progress | 80% |
| AI Chat Integration | 🔄 In Progress | 70% |
| Frontend UI | ✅ Complete | 100% |
| Medical Knowledge Base | ⏳ Planned | 0% |
| Testing Suite | ⏳ Planned | 0% |

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **PostgreSQL** (v15 or higher)
- **Docker** (optional, for containerized setup)

### Option 1: Running with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/faizan-ai-ml/mediai.git
cd mediai

# Start PostgreSQL with Docker Compose
docker-compose up -d

# The database will be available at localhost:5432
```

### Option 2: Running Locally

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
cp .env.example .env

# Edit .env with your configuration
# Important: Set DATABASE_URL, SECRET_KEY, and OPENROUTER_API_KEY

# Run the backend server
python main.py
```

#### Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Environment
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql://mediai_user:mediai_password@localhost:5432/mediai

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Configuration
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=deepseek/deepseek-chat
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Accessing the Application

Once both servers are running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📁 Project Structure

```
mediai/
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── chat.py          # Chat/AI endpoints
│   │   │   └── health.py        # Health check endpoints
│   │   ├── 📂 core/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication utilities
│   │   │   ├── config.py        # Configuration settings
│   │   │   └── database.py      # Database connection
│   │   └── 📂 models/
│   │       ├── __init__.py
│   │       └── models.py        # SQLAlchemy models
│   ├── main.py                  # FastAPI application entry
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template
│   ├── railway.json            # Railway deployment config
│   └── runtime.txt             # Python runtime version
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.jsx             # Main React component
│   │   ├── AuthContext.jsx     # Authentication context
│   │   ├── Chat.jsx            # Chat interface component
│   │   ├── Login.jsx           # Login component
│   │   ├── Register.jsx        # Registration component
│   │   ├── index.css           # Global styles
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML template
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite configuration
│
├── 📂 .github/
│   └── 📂 ISSUE_TEMPLATE/
│       ├── bug_report.md       # Bug report template
│       └── feature_request.md  # Feature request template
│
├── docker-compose.yml          # Docker Compose configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── ARCHITECTURE.md             # System architecture docs
├── CONTRIBUTING.md             # Contribution guidelines
├── API_DOCUMENTATION.md        # API reference
├── ROADMAP.md                  # Product roadmap
├── SECURITY.md                 # Security policy
├── MEDICAL_DISCLAIMER.md       # Medical disclaimers
├── CHANGELOG.md                # Version history
└── LICENSE                     # MIT License
```

---

## 📚 API Documentation

For detailed API documentation, see **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**.

### Quick API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/chat` | Send message to AI |
| `GET` | `/api/conversations` | Get user conversations |
| `GET` | `/api/conversations/{id}` | Get conversation messages |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines on:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 🔧 Submitting pull requests
- 📖 Improving documentation

---

## 🗺 Roadmap

See our detailed **[ROADMAP.md](ROADMAP.md)** for upcoming features and milestones.

### Upcoming Highlights

- **Q4 2025**: MVP completion with AI integration
- **Q1 2026**: Testing suite, caching, monitoring
- **Q2 2026**: Medical validation and protocols
- **Q3 2026**: Multi-language support, voice interface
- **Q4 2026**: Mobile apps, premium features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Medical Disclaimer

> **IMPORTANT**: MediAI is an informational tool only and is **NOT** a substitute for professional medical advice, diagnosis, or treatment.

Please read our full **[MEDICAL_DISCLAIMER.md](MEDICAL_DISCLAIMER.md)** for important information about:
- Limitations of AI-generated medical information
- When to seek emergency medical care
- User responsibilities
- Liability limitations

**In case of emergency, always call your local emergency services (911, 112, etc.) immediately.**

---

## 📞 Contact

- **Maintainer**: Faizan ([@faizan-ai-ml](https://github.com/faizan-ai-ml))
- **Project Link**: [https://github.com/faizan-ai-ml/mediai](https://github.com/faizan-ai-ml/mediai)
- **Issues**: [GitHub Issues](https://github.com/faizan-ai-ml/mediai/issues)

---

## 🙏 Acknowledgments

MediAI is built on the shoulders of giants. We thank:

- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for Python
- **[React](https://reactjs.org/)** - JavaScript library for building user interfaces
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[PostgreSQL](https://www.postgresql.org/)** - The world's most advanced open source database
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - The Python SQL toolkit
- **[OpenRouter](https://openrouter.ai/)** - AI model gateway
- All the open-source contributors who make projects like this possible

---

<p align="center">
  Made with ❤️ for global health accessibility
</p>

<p align="center">
  <a href="#-mediai---ai-powered-medical-assistant">⬆️ Back to Top</a>
</p>
