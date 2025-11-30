# 📚 MediAI API Documentation

<p align="center">
  <strong>Complete API Reference for MediAI Backend</strong>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Auth Endpoints](#-auth-endpoints)
- [Chat Endpoints](#-chat-endpoints)
- [Health Endpoints](#-health-endpoints)
- [User Endpoints](#-user-endpoints-planned)
- [Medical AI Endpoints](#-medical-ai-endpoints-planned)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting-planned)

---

## 🔭 Overview

### Base URL

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:8000` |
| Production | `https://api.mediai.app` *(or your deployed URL)* |

### API Prefix

All endpoints (except health checks) are prefixed with `/api`.

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

### API Documentation (Interactive)

FastAPI automatically generates interactive documentation:

- **Swagger UI**: `{BASE_URL}/docs`
- **ReDoc**: `{BASE_URL}/redoc`

---

## 🔐 Authentication

MediAI uses **JWT (JSON Web Token)** authentication with the **Bearer** scheme.

### How It Works

1. **Register or Login** to receive an access token
2. **Include token** in the `Authorization` header for protected endpoints
3. **Token expires** after 7 days (configurable)

### Authorization Header

```http
Authorization: Bearer <your_jwt_token>
```

### Token Structure

JWT tokens contain:

```json
{
  "sub": "user_id_uuid",
  "exp": 1735689600,
  "iat": 1735084800
}
```

| Field | Description |
|-------|-------------|
| `sub` | User ID (UUID) |
| `exp` | Expiration timestamp |
| `iat` | Issued at timestamp |

---

## 👤 Auth Endpoints

### Register User

Creates a new user account and returns an access token.

```http
POST /api/auth/register
```

#### Request Body

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Valid email address |
| `username` | string | ✅ | Unique username (3-50 chars) |
| `password` | string | ✅ | Password (min 8 chars) |
| `full_name` | string | ❌ | User's full name |

#### Success Response

```http
HTTP/1.1 201 Created
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2025-01-15T10:30:00.000000"
  }
}
```

#### Error Responses

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "detail": "Email already registered"
}
```

```json
{
  "detail": "Username already taken"
}
```

---

### Login

Authenticates a user and returns an access token.

```http
POST /api/auth/login
```

#### Request Body (Form Data)

```
username=user@example.com&password=securepassword123
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Email address |
| `password` | string | ✅ | User password |

> **Note**: Uses `application/x-www-form-urlencoded` format (OAuth2 standard)

#### cURL Example

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

#### Success Response

```http
HTTP/1.1 200 OK
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2025-01-15T10:30:00.000000"
  }
}
```

#### Error Response

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "detail": "Incorrect email or password"
}
```

---

### Get Current User

Returns the currently authenticated user's information.

```http
GET /api/auth/me
```

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response

```http
HTTP/1.1 200 OK
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "created_at": "2025-01-15T10:30:00.000000"
}
```

#### Error Response

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "detail": "Could not validate credentials"
}
```

---

## 💬 Chat Endpoints

### Send Message

Sends a message to the AI assistant and receives a response.

```http
POST /api/chat
```

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "message": "What are the symptoms of the common cold?",
  "conversation_id": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | User's message to AI |
| `conversation_id` | string | ❌ | Existing conversation ID (null for new) |

#### Success Response

```http
HTTP/1.1 200 OK
```

```json
{
  "response": "The common cold typically presents with the following symptoms:\n\n1. **Runny or stuffy nose**\n2. **Sore throat**\n3. **Coughing**\n4. **Sneezing**\n5. **Low-grade fever**\n6. **Mild body aches**\n\n⚠️ **Important**: If symptoms persist for more than 10 days or you experience high fever, please consult a healthcare professional.\n\nIs there anything specific about cold symptoms you'd like to know more about?",
  "timestamp": "2025-01-15T10:35:00.000000",
  "conversation_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the symptoms of the common cold?"}'
```

#### Error Responses

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "detail": "Message cannot be empty"
}
```

```http
HTTP/1.1 404 Not Found
```

```json
{
  "detail": "Conversation not found"
}
```

---

### Get Conversations

Returns all conversations for the authenticated user.

```http
GET /api/conversations
```

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response

```http
HTTP/1.1 200 OK
```

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "What are the symptoms of the common cold?",
    "created_at": "2025-01-15T10:30:00.000000",
    "updated_at": "2025-01-15T10:35:00.000000",
    "message_count": 4
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "How to prevent flu?",
    "created_at": "2025-01-14T09:00:00.000000",
    "updated_at": "2025-01-14T09:15:00.000000",
    "message_count": 2
  }
]
```

---

### Get Conversation Messages

Returns all messages in a specific conversation.

```http
GET /api/conversations/{conversation_id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | string | UUID of the conversation |

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response

```http
HTTP/1.1 200 OK
```

```json
{
  "conversation": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "What are the symptoms of the common cold?",
    "created_at": "2025-01-15T10:30:00.000000"
  },
  "messages": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "role": "user",
      "content": "What are the symptoms of the common cold?",
      "created_at": "2025-01-15T10:30:00.000000"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "role": "assistant",
      "content": "The common cold typically presents with...",
      "created_at": "2025-01-15T10:30:05.000000"
    }
  ]
}
```

#### Error Response

```http
HTTP/1.1 404 Not Found
```

```json
{
  "detail": "Conversation not found"
}
```

---

## ❤️ Health Endpoints

### Root Endpoint

Returns basic API information.

```http
GET /
```

#### Response

```json
{
  "message": "🏥 MediAI Backend API v2.0",
  "version": "2.0.0",
  "features": ["AI Chat", "User Authentication", "Chat History"],
  "docs_url": "/docs"
}
```

### Health Check

Returns the health status of the API.

```http
GET /health
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000000"
}
```

---

## 👤 User Endpoints (Planned)

> These endpoints are planned for future implementation.

### Get User Profile

```http
GET /api/user/profile
```

Returns detailed user profile information including preferences and settings.

### Update User Profile

```http
PUT /api/user/profile
```

Updates user profile information.

#### Request Body

```json
{
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "language_preference": "en"
}
```

### Get Medical History

```http
GET /api/user/medical-history
```

Returns the user's saved medical history and health records.

---

## 🏥 Medical AI Endpoints (Planned)

> These endpoints are planned for future implementation.

### Analyze Symptoms

```http
POST /api/symptoms/analyze
```

Analyzes a list of symptoms and provides relevant health information.

#### Request Body

```json
{
  "symptoms": ["headache", "fever", "fatigue"],
  "duration_days": 3,
  "severity": "moderate"
}
```

#### Response

```json
{
  "possible_conditions": [
    {
      "name": "Common Cold",
      "probability": "high",
      "description": "A viral infection of the upper respiratory tract"
    },
    {
      "name": "Influenza (Flu)",
      "probability": "medium",
      "description": "A more serious viral respiratory illness"
    }
  ],
  "recommendations": [
    "Rest and stay hydrated",
    "Monitor your temperature",
    "Consider over-the-counter fever reducers"
  ],
  "when_to_seek_help": "If fever exceeds 103°F or symptoms worsen significantly",
  "disclaimer": "This is not a diagnosis. Please consult a healthcare provider."
}
```

### Get Condition Information

```http
GET /api/conditions/{condition_id}
```

Returns detailed information about a specific medical condition.

---

## ⚠️ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required or failed |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation error |
| `429` | Too Many Requests | Rate limit exceeded (planned) |
| `500` | Internal Server Error | Server-side error |

### Validation Errors

Pydantic validation errors return detailed information:

```http
HTTP/1.1 422 Unprocessable Entity
```

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## ⏱️ Rate Limiting (Planned)

Rate limiting will be implemented to ensure fair usage:

| Tier | Requests per Hour | Notes |
|------|-------------------|-------|
| Free | 100 | Default for all users |
| Premium | 1000 | Future paid tier |
| Enterprise | Unlimited | Custom agreements |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735689600
```

### Rate Limit Exceeded

```http
HTTP/1.1 429 Too Many Requests
```

```json
{
  "detail": "Rate limit exceeded. Try again in 3600 seconds.",
  "retry_after": 3600
}
```

---

## 📱 Code Examples

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
async function register(email, username, password) {
  const response = await api.post('/api/auth/register', {
    email,
    username,
    password
  });
  return response.data;
}

// Login
async function login(email, password) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  
  const response = await api.post('/api/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
}

// Send chat message
async function sendMessage(message, conversationId = null) {
  const response = await api.post('/api/chat', {
    message,
    conversation_id: conversationId
  });
  return response.data;
}
```

### Python (Requests)

```python
import requests

BASE_URL = "http://localhost:8000"

class MediAIClient:
    def __init__(self):
        self.token = None
    
    def register(self, email, username, password, full_name=None):
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": email,
                "username": username,
                "password": password,
                "full_name": full_name
            }
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        return data
    
    def login(self, email, password):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": email,
                "password": password
            }
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        return data
    
    def send_message(self, message, conversation_id=None):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "message": message,
                "conversation_id": conversation_id
            },
            headers=headers
        )
        response.raise_for_status()
        return response.json()

# Usage
client = MediAIClient()
client.login("user@example.com", "password123")
response = client.send_message("What are symptoms of flu?")
print(response["response"])
```

### cURL

```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"

# Get current user
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send chat message
curl -X POST "http://localhost:8000/api/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the symptoms of the flu?"}'

# Get conversations
curl -X GET "http://localhost:8000/api/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

<p align="center">
  <a href="#-mediai-api-documentation">⬆️ Back to Top</a>
</p>
