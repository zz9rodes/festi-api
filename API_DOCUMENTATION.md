# Quiz Festif - API Backend Documentation

Complete API specification for the Quiz Festif Vue.js application.

---

## Base Configuration

- **Base URL**: `http://your-domain.com/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

### Authentication Header
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

---

## Database Schema

### Users Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| display_name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Quizzes Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY -> users.id |
| title | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Questions Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY |
| quiz_id | UUID | FOREIGN KEY -> quizzes.id |
| question_text | TEXT | NOT NULL |
| options | JSON/ARRAY | NOT NULL (4 options) |
| correct_option_index | INTEGER | NOT NULL (0-3) |
| order_index | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Participants Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY |
| quiz_id | UUID | FOREIGN KEY -> quizzes.id |
| participant_name | VARCHAR(100) | NOT NULL |
| score | INTEGER | NOT NULL |
| total_questions | INTEGER | NOT NULL |
| answers | JSON | NOT NULL |
| completed_at | TIMESTAMP | DEFAULT NOW() |

---

## API Endpoints

---

## 1. Authentication

### POST /api/auth/signup
Create a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "display_name": "Jean Dupont"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Jean Dupont",
    "public_key": "user6-123456",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=random"
  }
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Cet email est déjà utilisé",
  "code": "DUPLICATE_EMAIL"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 6 characters
- `display_name`: 2-100 characters

---

### POST /api/auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Jean Dupont",
    "public_key": "user6-123456",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=random"
  }
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Email ou mot de passe incorrect",
  "code": "INVALID_CREDENTIALS"
}
```

---

### POST /api/auth/logout
Invalidate the current session/token.

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
\`\`\`json
{
  "message": "Déconnexion réussie"
}
\`\`\`

---

### GET /api/auth/profile
Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
\`\`\`json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Jean Dupont",
    "public_key": "user6-123456",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=random",
    "created_at": "2024-12-01T10:00:00Z"
  }
}
\`\`\`

**Error Response (401):**
\`\`\`json
{
  "error": true,
  "message": "Non authentifié",
  "code": "UNAUTHORIZED"
}
\`\`\`

---

### PUT /api/auth/profile
Update the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "display_name": "Jean-Pierre Dupont",
  "avatar": "https://example.com/new-avatar.png"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "Jean-Pierre Dupont",
    "public_key": "user6-123456",
    "avatar": "https://example.com/new-avatar.png"
  }
}
```

---

### GET /api/auth/users/:publicKey
Get a user's public profile information by their public key.

**URL Parameters:**
- `publicKey`: The public key of the user (e.g., `user6-123456`).

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Jean Dupont",
    "public_key": "user6-123456",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=random"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Utilisateur non trouvé"
}
```

---

### GET /api/auth/users/:publicKey
Get public user profile by public key (PUBLIC).

**URL Parameters:**
- `publicKey`: User Public Key

**Success Response (200):**
```json
{
  "user": {
    "display_name": "Jean Dupont",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=random",
    "public_key": "user6-123456"
  }
}
```

**Error Response (404):**
```json
{
  "error": true,
  "message": "Utilisateur non trouvé",
  "code": "NOT_FOUND"
}
```

---

## 2. Quizzes

### GET /api/quizzes
Get all quizzes created by the authenticated user.

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
\`\`\`json
{
  "quizzes": [
    {
      "id": "quiz-uuid-1",
      "title": "Quiz de Noël 2024",
      "question_count": 5,
      "participant_count": 12,
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-05T15:30:00Z"
    },
    {
      "id": "quiz-uuid-2",
      "title": "Culture Générale",
      "question_count": 10,
      "participant_count": 3,
      "created_at": "2024-11-20T08:00:00Z",
      "updated_at": "2024-11-20T08:00:00Z"
    }
  ]
}
\`\`\`

---

### GET /api/quizzes/:id
Get a single quiz by ID (for the creator/owner).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
\`\`\`json
{
  "quiz": {
    "id": "quiz-uuid-1",
    "title": "Quiz de Noël 2024",
    "question_count": 5,
    "participant_count": 12,
    "created_at": "2024-12-01T10:00:00Z",
    "questions": [
      {
        "id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "options": ["Londres", "Paris", "Berlin", "Madrid"],
        "correct_option_index": 1,
        "order_index": 0
      },
      {
        "id": "question-uuid-2",
        "question_text": "Combien de jours y a-t-il dans une année ?",
        "options": ["364", "365", "366", "360"],
        "correct_option_index": 1,
        "order_index": 1
      }
    ]
  }
}
\`\`\`

**Error Response (404):**
\`\`\`json
{
  "error": true,
  "message": "Quiz non trouvé",
  "code": "NOT_FOUND"
}
\`\`\`

---

### GET /api/quizzes/:id/play
Get quiz data for participants (PUBLIC - no auth required).
Note: This endpoint should NOT return `correct_option_index` to prevent cheating.

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
\`\`\`json
{
  "quiz": {
    "id": "quiz-uuid-1",
    "title": "Quiz de Noël 2024",
    "creator_name": "Jean Dupont",
    "questions": [
      {
        "id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "options": ["Londres", "Paris", "Berlin", "Madrid"]
      },
      {
        "id": "question-uuid-2",
        "question_text": "Combien de jours y a-t-il dans une année ?",
        "options": ["364", "365", "366", "360"]
      }
    ]
  }
}
\`\`\`

---

### POST /api/quizzes
Create a new quiz.

**Headers:** `Authorization: Bearer <token>` (required)

**Request Body:**
\`\`\`json
{
  "title": "Mon nouveau quiz"
}
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "quiz": {
    "id": "new-quiz-uuid",
    "title": "Mon nouveau quiz",
    "question_count": 0,
    "participant_count": 0,
    "created_at": "2024-12-07T10:00:00Z"
  }
}
\`\`\`

**Validation Rules:**
- `title`: 3-255 characters, required

---

### PUT /api/quizzes/:id
Update a quiz (owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Request Body:**
\`\`\`json
{
  "title": "Titre mis à jour"
}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "quiz": {
    "id": "quiz-uuid-1",
    "title": "Titre mis à jour",
    "updated_at": "2024-12-07T12:00:00Z"
  }
}
\`\`\`

**Error Response (403):**
\`\`\`json
{
  "error": true,
  "message": "Vous n'êtes pas autorisé à modifier ce quiz",
  "code": "FORBIDDEN"
}
\`\`\`

---

### DELETE /api/quizzes/:id
Delete a quiz and all its questions/participations (owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
\`\`\`json
{
  "message": "Quiz supprimé avec succès"
}
\`\`\`

---

### GET /api/quizzes/:id/stats
Get statistics for a quiz (owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
\`\`\`json
{
  "quiz": {
    "id": "quiz-uuid-1",
    "title": "Quiz de Noël 2024"
  },
  "participantCount": 12,
  "averageScore": 72.5,
  "averagePercentage": 72.5,
  "mostMissedQuestion": {
    "id": "question-uuid-3",
    "question_text": "Quelle est la date de la fête nationale française ?",
    "miss_count": 8
  },
  "participants": [
    {
      "id": "participation-uuid-1",
      "participant_name": "Alice",
      "score": 5,
      "total_questions": 5,
      "percentage": 100,
      "completed_at": "2024-12-05T14:30:00Z"
    },
    {
      "id": "participation-uuid-2",
      "participant_name": "Bob",
      "score": 3,
      "total_questions": 5,
      "percentage": 60,
      "completed_at": "2024-12-05T15:00:00Z"
    }
  ]
}
\`\`\`

---

## 3. Questions

### POST /api/quizzes/:quizId/questions
Add a question to a quiz (owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `quizId`: Quiz UUID

**Request Body:**
\`\`\`json
{
  "question_text": "Quelle est la capitale de l'Italie ?",
  "options": ["Milan", "Rome", "Naples", "Florence"],
  "correct_option_index": 1
}
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "question": {
    "id": "new-question-uuid",
    "quiz_id": "quiz-uuid-1",
    "question_text": "Quelle est la capitale de l'Italie ?",
    "options": ["Milan", "Rome", "Naples", "Florence"],
    "correct_option_index": 1,
    "order_index": 5
  }
}
\`\`\`

**Validation Rules:**
- `question_text`: 5-500 characters, required
- `options`: Array of exactly 4 strings, each 1-200 characters
- `correct_option_index`: Integer 0-3, required

---

### PUT /api/questions/:id
Update a question (quiz owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Question UUID

**Request Body:**
\`\`\`json
{
  "question_text": "Quelle est la capitale de l'Espagne ?",
  "options": ["Barcelone", "Madrid", "Séville", "Valence"],
  "correct_option_index": 1
}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "question": {
    "id": "question-uuid-1",
    "question_text": "Quelle est la capitale de l'Espagne ?",
    "options": ["Barcelone", "Madrid", "Séville", "Valence"],
    "correct_option_index": 1
  }
}
\`\`\`

---

### DELETE /api/questions/:id
Delete a question (quiz owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Question UUID

**Success Response (200):**
\`\`\`json
{
  "message": "Question supprimée avec succès"
}
\`\`\`

---

## 4. Participations

### POST /api/quizzes/:id/participate
Submit a quiz participation (PUBLIC - no auth required).

**URL Parameters:**
- `id`: Quiz UUID

**Request Body:**
\`\`\`json
{
  "participant_name": "Marie",
  "answers": [
    {
      "question_id": "question-uuid-1",
      "selected_option_index": 1
    },
    {
      "question_id": "question-uuid-2",
      "selected_option_index": 2
    },
    {
      "question_id": "question-uuid-3",
      "selected_option_index": 0
    }
  ]
}
\`\`\`

**Success Response (201):**
\`\`\`json
{
  "participation": {
    "id": "participation-uuid",
    "quiz_id": "quiz-uuid-1",
    "participant_name": "Marie",
    "score": 2,
    "total_questions": 3,
    "percentage": 66.67,
    "completed_at": "2024-12-07T10:30:00Z",
    "results": [
      {
        "question_id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "selected_option_index": 1,
        "correct_option_index": 1,
        "is_correct": true,
        "options": ["Londres", "Paris", "Berlin", "Madrid"]
      },
      {
        "question_id": "question-uuid-2",
        "question_text": "Combien de jours y a-t-il dans une année ?",
        "selected_option_index": 2,
        "correct_option_index": 1,
        "is_correct": false,
        "options": ["364", "365", "366", "360"]
      },
      {
        "question_id": "question-uuid-3",
        "question_text": "Quelle couleur a le ciel ?",
        "selected_option_index": 0,
        "correct_option_index": 0,
        "is_correct": true,
        "options": ["Bleu", "Vert", "Rouge", "Jaune"]
      }
    ]
  }
}
\`\`\`

**Validation Rules:**
- `participant_name`: 2-100 characters, required
- `answers`: Array with one answer per question, required

---

### GET /api/participations/:id
Get a participation result (PUBLIC - for showing results page).

**URL Parameters:**
- `id`: Participation UUID

**Success Response (200):**
\`\`\`json
{
  "participation": {
    "id": "participation-uuid",
    "quiz_title": "Quiz de Noël 2024",
    "participant_name": "Marie",
    "score": 2,
    "total_questions": 3,
    "percentage": 66.67,
    "completed_at": "2024-12-07T10:30:00Z",
    "results": [
      {
        "question_id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "selected_option_index": 1,
        "correct_option_index": 1,
        "is_correct": true,
        "options": ["Londres", "Paris", "Berlin", "Madrid"]
      }
    ]
  }
}
\`\`\`

---

### GET /api/quizzes/:id/participants
Get all participants for a quiz (owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
\`\`\`json
{
  "participants": [
    {
      "id": "participation-uuid-1",
      "participant_name": "Alice",
      "score": 5,
      "total_questions": 5,
      "percentage": 100,
      "completed_at": "2024-12-05T14:30:00Z"
    },
    {
      "id": "participation-uuid-2",
      "participant_name": "Bob",
      "score": 3,
      "total_questions": 5,
      "percentage": 60,
      "completed_at": "2024-12-05T15:00:00Z"
    }
  ]
}
\`\`\`

---

### GET /api/participations/:id/details
Get detailed participation result (PROTECTED - owner only).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Participation UUID

**Success Response (200):**
```json
{
  "participation": {
    "id": "participation-uuid",
    "quiz_title": "Quiz de Noël 2024",
    "participant_name": "Marie",
    "score": 2,
    "total_questions": 3,
    "percentage": 66.67,
    "completed_at": "2024-12-07T10:30:00Z",
    "results": [
      {
        "question_id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "selected_option_index": 1,
        "correct_option_index": 1,
        "is_correct": true,
        "options": ["Londres", "Paris", "Berlin", "Madrid"]
      }
    ]
  }
}
```

**Error Response (403):**
```json
{
  "error": true,
  "message": "Vous n'êtes pas autorisé à voir les détails de cette participation",
  "code": "FORBIDDEN"
}
```

---

## 5. Anonymous Messages

### POST /api/users/:publicKey/messages
Send an anonymous message to a user (PUBLIC).

**URL Parameters:**
- `publicKey`: User Public Key (Recipient)

**Request Body:**
```json
{
  "content": "Ceci est un message secret !"
}
```

**Success Response (201):**
```json
{
  "message": "Message envoyé avec succès",
  "data": {
    "id": 1,
    "created_at": "2024-12-09T16:00:00.000+01:00"
  }
}
```

**Validation Rules:**
- `content`: 1-1000 characters, required

---

### GET /api/messages
List received messages (PROTECTED).

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "content": "Ceci est un message secret !",
      "created_at": "2024-12-09T16:00:00.000+01:00"
    }
  ]
}
```

---

### GET /api/messages/:id
Show a single message (PROTECTED).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Message ID

**Success Response (200):**
```json
{
  "message": {
    "id": 1,
    "content": "Ceci est un message secret !",
    "created_at": "2024-12-09T16:00:00.000+01:00"
  }
}
```

**Error Response (404):**
```json
{
  "error": true,
  "message": "Message non trouvé",
  "code": "NOT_FOUND"
}
```

---

### DELETE /api/messages/:id
Delete a message (PROTECTED).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Message ID

**Success Response (200):**
```json
{
  "message": "Message supprimé avec succès"
}
```

---

## 6. Admin Dashboard

> [!IMPORTANT]
> All admin routes require authentication AND admin privileges (`is_admin: true`).

### GET /api/admin/users
List all users in the system (ADMIN ONLY).

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "display_name": "Jean Dupont",
      "public_key": "user6-123456",
      "avatar": "https://api.dicebear.com/...",
      "is_admin": false,
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

---

### GET /api/admin/quizzes
List all quizzes in the system (ADMIN ONLY).

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
```json
{
  "quizzes": [
    {
      "id": "quiz-uuid-1",
      "title": "Quiz de Noël 2024",
      "creator": {
        "id": 1,
        "display_name": "Jean Dupont",
        "email": "user@example.com"
      },
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

---

### GET /api/admin/quizzes/:id
Get quiz details with questions/options (ADMIN ONLY).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `id`: Quiz UUID

**Success Response (200):**
```json
{
  "quiz": {
    "id": "quiz-uuid-1",
    "title": "Quiz de Noël 2024",
    "creator": {
      "id": 1,
      "display_name": "Jean Dupont",
      "email": "user@example.com"
    },
    "questions": [
      {
        "id": "question-uuid-1",
        "question_text": "Quelle est la capitale de la France ?",
        "options": ["Londres", "Paris", "Berlin", "Madrid"],
        "correct_option_index": 1,
        "order_index": 0
      }
    ],
    "created_at": "2024-12-01T10:00:00Z"
  }
}
```

---

### GET /api/admin/participations
List all participations in the system (ADMIN ONLY).

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response (200):**
```json
{
  "participations": [
    {
      "id": "participation-uuid",
      "participant_name": "Marie",
      "quiz": {
        "id": "quiz-uuid-1",
        "title": "Quiz de Noël 2024"
      },
      "score": 3,
      "total_questions": 5,
      "percentage": 60,
      "completed_at": "2024-12-07T10:30:00Z"
    }
  ]
}
```

---

### GET /api/admin/users/:publicKey/messages
List messages for a user (ADMIN OR OWNER).

**Headers:** `Authorization: Bearer <token>` (required)

**URL Parameters:**
- `publicKey`: User's public key

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "display_name": "Jean Dupont",
    "public_key": "user6-123456"
  },
  "messages": [
    {
      "id": 1,
      "content": "Ceci est un message secret !",
      "created_at": "2024-12-09T16:00:00Z"
    }
  ]
}
```

**Error Response (403):**
```json
{
  "error": true,
  "message": "Accès non autorisé",
  "code": "FORBIDDEN"
}
```

---

## Error Handling

All error responses follow this format:

\`\`\`json
{
  "error": true,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input data |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_EMAIL` | Email already exists |
| `INVALID_CREDENTIALS` | Wrong email or password |

---

## JWT Token Structure

The JWT token should contain:

\`\`\`json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "display_name": "Jean Dupont",
  "iat": 1701936000,
  "exp": 1702540800
}
\`\`\`

**Recommended settings:**
- Algorithm: HS256 or RS256
- Expiration: 7 days
- Secret: Strong random string (min 32 characters)

---

## CORS Configuration

Your backend should allow:

\`\`\`
Access-Control-Allow-Origin: * (or specific frontend domain)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
\`\`\`

---

## Example Backend Stack

### Node.js / Express

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Routes
app.post('/api/auth/login', async (req, res) => { /* ... */ });
app.post('/api/auth/signup', async (req, res) => { /* ... */ });
app.get('/api/quizzes', authenticate, async (req, res) => { /* ... */ });
// ... etc
\`\`\`

### Python / FastAPI

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt

app = FastAPI()
security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token invalide")

@app.post("/api/auth/login")
async def login(data: LoginRequest):
    # ...

@app.get("/api/quizzes")
async def get_quizzes(user = Depends(get_current_user)):
    # ...
\`\`\`

---

## Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can log in and receive JWT token
- [ ] Authenticated user can create a quiz
- [ ] Authenticated user can add questions to their quiz
- [ ] Authenticated user can view their quizzes list
- [ ] Anyone can access quiz via /play endpoint (without answers)
- [ ] Anyone can submit participation and receive score
- [ ] Quiz owner can view statistics and participants
- [ ] Proper error handling for all edge cases
- [ ] CORS working correctly with frontend
