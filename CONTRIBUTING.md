# 🤝 Contributing to MediAI

<p align="center">
  <strong>Thank you for your interest in contributing to MediAI!</strong>
</p>

We're excited to have you join our mission to democratize healthcare access worldwide. Every contribution, whether it's code, documentation, bug reports, or feature suggestions, helps make healthcare information more accessible.

---

## 📖 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
- [Development Setup](#-development-setup)
- [Coding Standards](#-coding-standards)
- [Pull Request Process](#-pull-request-process)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation Guidelines](#-documentation-guidelines)
- [Community](#-community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors. We pledge to:

- **Be Respectful** - Treat everyone with respect and consideration
- **Be Inclusive** - Welcome contributors from all backgrounds
- **Be Professional** - Keep discussions constructive and focused
- **Be Patient** - Help newcomers learn and grow
- **Be Supportive** - Encourage and support fellow contributors

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Violations may result in temporary or permanent bans from the project. Report issues to the maintainers.

---

## 💡 How to Contribute

There are many ways to contribute to MediAI:

### 🐛 Reporting Bugs

Found a bug? Help us fix it!

1. **Check existing issues** - Search [GitHub Issues](https://github.com/faizan-ai-ml/mediai/issues) to see if it's already reported
2. **Create a new issue** - Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. **Include details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### 💡 Suggesting Features

Have an idea for a new feature?

1. **Check existing issues** - Someone might have suggested it already
2. **Create a new issue** - Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. **Be specific**:
   - Describe the problem you're solving
   - Explain your proposed solution
   - List any alternatives you've considered

### 🔧 Submitting Pull Requests

Ready to contribute code?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [Pull Request Process](#-pull-request-process) for details.

### 📖 Improving Documentation

Documentation is crucial! You can:

- Fix typos and errors
- Improve clarity and readability
- Add missing information
- Translate documentation
- Add code examples

---

## 🛠 Development Setup

### Prerequisites

Make sure you have installed:

- **Git** - Version control
- **Node.js** (v18+) - For frontend development
- **Python** (v3.11+) - For backend development
- **PostgreSQL** (v15+) - Database
- **Docker** (optional) - For containerized development

### Step-by-Step Setup

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mediai.git
cd mediai

# Add upstream remote
git remote add upstream https://github.com/faizan-ai-ml/mediai.git
```

#### 2. Backend Setup

```bash
# Navigate to backend
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

# Copy environment file
cp .env.example .env

# Edit .env with your local configuration
# At minimum, set DATABASE_URL and SECRET_KEY
```

#### 3. Database Setup

**Option A: Using Docker (Recommended)**

```bash
# From project root
docker-compose up -d

# Database will be available at localhost:5432
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb mediai

# Update DATABASE_URL in backend/.env
DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/mediai
```

#### 4. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install
```

#### 5. Run Development Servers

**Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
# Server runs at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Server runs at http://localhost:5173
```

#### 6. Verify Setup

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📏 Coding Standards

### Python (Backend)

We follow **PEP 8** style guidelines with some additions:

#### Style Guide

```python
# Good: Descriptive names, type hints, docstrings
def create_user(
    email: str,
    username: str,
    password: str
) -> User:
    """
    Create a new user in the database.
    
    Args:
        email: User's email address
        username: Unique username
        password: Plain text password (will be hashed)
    
    Returns:
        User: The created user object
    
    Raises:
        ValueError: If email or username already exists
    """
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        username=username,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    return user
```

#### Key Guidelines

- **Type Hints** - Use type hints for all function arguments and returns
- **Docstrings** - Document all public functions and classes
- **Imports** - Group imports: stdlib, third-party, local
- **Line Length** - Maximum 100 characters
- **Naming**:
  - `snake_case` for functions and variables
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants

#### Linting

```bash
# Install linters (if not installed)
pip install black flake8 mypy

# Format code
black .

# Check style
flake8 .

# Type checking
mypy .
```

### JavaScript (Frontend)

We follow modern JavaScript/React best practices:

#### Style Guide

```jsx
// Good: Functional components with hooks
import React, { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * Chat component for user interactions with AI assistant
 */
function Chat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Effect logic here
  }, [])

  const handleSendMessage = async (content) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/chat', { message: content })
      setMessages(prev => [...prev, response.data])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container">
      {/* Component JSX */}
    </div>
  )
}

export default Chat
```

#### Key Guidelines

- **Functional Components** - Prefer functional components with hooks
- **Hooks** - Use React hooks for state and effects
- **Props** - Destructure props for clarity
- **Naming**:
  - `PascalCase` for components
  - `camelCase` for functions and variables
- **File Names** - `PascalCase.jsx` for components

#### Linting

```bash
# ESLint and Prettier (when configured)
npm run lint
npm run format
```

### Git Commit Messages

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling changes |

#### Examples

```
feat(auth): add email verification for new users

fix(chat): resolve message ordering issue in conversation history

docs(readme): update installation instructions

refactor(api): simplify error handling middleware

test(auth): add unit tests for login endpoint
```

### Branch Naming

Use descriptive branch names:

```
<type>/<short-description>
```

#### Examples

```
feature/email-verification
bugfix/chat-history-order
docs/api-documentation
refactor/auth-middleware
```

---

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull upstream main

# Create and checkout a new branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the coding standards
- Add/update tests as needed
- Update documentation if necessary

### 3. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat(scope): add new feature description"
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template:
   - Clear title describing the change
   - Description of what and why
   - Link to related issues
   - Screenshots for UI changes
4. Submit the PR

### 6. Code Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

### PR Checklist

Before submitting, ensure:

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Changes are tested locally
- [ ] Documentation is updated (if needed)
- [ ] No breaking changes (or documented if unavoidable)
- [ ] Commit messages follow conventions

---

## 🧪 Testing Guidelines

### Backend Testing (Python)

We use **pytest** for testing:

```bash
# Install test dependencies
pip install pytest pytest-cov pytest-asyncio

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

#### Test Structure

```python
# tests/test_auth.py

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    """Test user registration endpoint."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_register_duplicate_email():
    """Test registration fails with duplicate email."""
    # First registration
    client.post("/api/auth/register", json={...})
    
    # Duplicate registration
    response = client.post("/api/auth/register", json={...})
    assert response.status_code == 400
```

### Frontend Testing (JavaScript)

We use **Jest** and **React Testing Library**:

```bash
# Run tests (when configured)
npm test
```

#### Test Structure

```jsx
// src/__tests__/Login.test.jsx

import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../Login'

describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  test('submits form with credentials', async () => {
    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    // Assert expected behavior
  })
})
```

### Writing Good Tests

1. **Test Behavior, Not Implementation** - Focus on what the code does
2. **One Assertion per Test** - Keep tests focused
3. **Descriptive Names** - Clearly describe what's being tested
4. **Arrange-Act-Assert** - Structure tests clearly
5. **Test Edge Cases** - Include boundary conditions and error cases

---

## 📝 Documentation Guidelines

### Keep Documentation Updated

When you make changes that affect documentation:

1. **Code Changes** - Update relevant docs
2. **API Changes** - Update API_DOCUMENTATION.md
3. **New Features** - Add to README and relevant docs
4. **Breaking Changes** - Document migration steps

### Documentation Style

- **Clear and Concise** - Use simple language
- **Examples** - Include code examples where helpful
- **Structure** - Use headers, lists, and tables for readability
- **Links** - Use relative links within the repo

### Markdown Guidelines

```markdown
# Main Heading (only one per document)

## Section Heading

### Subsection Heading

- Bullet points for lists
- Another item

1. Numbered lists
2. For sequential steps

`inline code` for short code references

```python
# Code blocks for longer examples
def example():
    pass
```

> Blockquotes for notes or quotes

**Bold** for emphasis

[Link Text](URL)

| Table | Header |
|-------|--------|
| Row   | Data   |
```

---

## 🌐 Community

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion (coming soon)
- **Discord/Slack** - Community chat (coming soon)

### Stay Updated

- ⭐ Star the repository
- 👁️ Watch for updates
- 🔔 Enable notifications

---

## 🙏 Thank You!

Your contributions make MediAI better for everyone. Whether you're fixing a typo or adding a major feature, we appreciate your time and effort.

**Together, we can democratize healthcare access worldwide.**

---

<p align="center">
  <a href="#-contributing-to-mediai">⬆️ Back to Top</a>
</p>
