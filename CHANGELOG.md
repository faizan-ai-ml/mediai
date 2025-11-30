# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation
  - README.md with complete project overview
  - ARCHITECTURE.md with system design details
  - CONTRIBUTING.md with contributor guidelines
  - API_DOCUMENTATION.md with API reference
  - ROADMAP.md with product roadmap
  - SECURITY.md with security policy
  - MEDICAL_DISCLAIMER.md with legal disclaimers
  - LICENSE (MIT License)
- GitHub issue templates
  - Bug report template
  - Feature request template
- CHANGELOG.md for version tracking

### Changed
- Updated project documentation structure

### Security
- Added security policy and vulnerability reporting guidelines

---

## [0.1.0] - 2025-XX-XX

### Added
- Initial MVP release
- **Authentication System**
  - User registration with email and username
  - Secure login with bcrypt password hashing
  - JWT token generation and validation
  - Protected API endpoints
  
- **Database Integration**
  - PostgreSQL database setup
  - SQLAlchemy ORM models
  - User model with authentication fields
  - Conversation and Message models for chat history
  
- **AI Chat Integration**
  - OpenRouter API integration
  - DeepSeek chat model support
  - Medical AI assistant system prompts
  - Conversation history persistence
  
- **Frontend Application**
  - React SPA with Vite
  - Modern chat interface with typing indicators
  - User authentication flow (login/register)
  - Responsive design for mobile and desktop
  - Quick question suggestions
  - Medical disclaimer display
  
- **Docker Setup**
  - Docker Compose configuration
  - PostgreSQL container setup
  - Development environment configuration
  
- **API Endpoints**
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user
  - `POST /api/chat` - Send message to AI
  - `GET /api/conversations` - List conversations
  - `GET /api/conversations/{id}` - Get conversation messages
  - `GET /health` - Health check endpoint

### Technical Details
- FastAPI v0.104.1 backend
- React v18.2.0 frontend
- PostgreSQL v15 database
- JWT authentication with python-jose
- bcrypt password hashing
- Axios HTTP client
- Vite build tool

---

## Version History Format

### Types of Changes

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Features that will be removed in future versions
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security-related changes

---

[Unreleased]: https://github.com/faizan-ai-ml/mediai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/faizan-ai-ml/mediai/releases/tag/v0.1.0
