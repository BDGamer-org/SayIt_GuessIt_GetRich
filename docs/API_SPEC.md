# API Specification

## Base URL
```
https://sgit-api.bdgamer.org
```

## Authentication

This API uses a simple device-based authentication:
- `X-Player-ID` header contains the player's UUID
- No tokens or passwords required
- Backup codes allow cross-device recovery

---

## Endpoints

### POST /api/register

Register a new player.

**Request:**
```http
POST /api/register
Content-Type: application/json

{
  "player_name": "Player Name"
}
```

**Response (200 OK):**
```json
{
  "player_id": "550e8400-e29b-41d4-a716-446655440000",
  "backup_code": "ABC12345",
  "player_name": "Player Name"
}
```

**Error Responses:**
```json
// 500 Internal Server Error
{
  "error": "Database error details"
}
```

---

### POST /api/recover

Recover an existing account using backup code.

**Request:**
```http
POST /api/recover
Content-Type: application/json

{
  "backup_code": "ABC12345"
}
```

**Response (200 OK):**
```json
{
  "player_id": "550e8400-e29b-41d4-a716-446655440000",
  "player_name": "Player Name"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Backup code required"
}

// 404 Not Found
{
  "error": "Invalid backup code"
}
```

---

### GET /api/history

Get the authenticated player's last 10 scores.

**Request:**
```http
GET /api/history
X-Player-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "player_name": "Player Name",
    "score": 15,
    "created_at": "2024-02-15T10:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "player_id": "550e8400-e29b-41d4-a716-446655440000",
    "player_name": "Player Name",
    "score": 12,
    "created_at": "2024-02-15T09:15:00Z"
  }
]
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "X-Player-ID header required"
}
```

---

### GET /api/words

Get words from `word_bank`.

**Request:**
```http
GET /api/words?category=idiom&limit=320&exclude=10001,10002
```

**Query Parameters:**
| Name | Required | Description |
|------|----------|-------------|
| `category` | No | `idiom` or `life` |
| `limit` | No | Max rows, default `320`, upper bound `500` |
| `exclude` | No | Comma-separated `word_id` list to skip (e.g. `10001,10002`) |

**Response (200 OK):**
```json
[
  {
    "word_id": 10001,
    "word": "坚定不移",
    "category": "idiom"
  }
]
```

**Error Responses:**
```json
// 500 Internal Server Error
{
  "error": "Database error details"
}
```

---

### POST /api/score

Submit a new score.

**Request:**
```http
POST /api/score
Content-Type: application/json
X-Player-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "score": 15
}
```

**Response (200 OK):**
```
OK
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "X-Player-ID header required"
}
```

---

## CORS

All endpoints support CORS for cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Player-ID
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 401 | Unauthorized - Missing X-Player-ID header |
| 404 | Not Found - Invalid backup code or endpoint |
| 500 | Internal Server Error - Database or other error |

---

## Data Types

### Player

| Field | Type | Description |
|-------|------|-------------|
| player_id | UUID | Unique identifier (v4) |
| backup_code | String | 8 uppercase alphanumeric characters |
| player_name | String | 1-12 characters |

### Score

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Score record ID |
| player_id | UUID | Reference to player |
| player_name | String | Denormalized name at time of score |
| score | Integer | Number of correct answers |
| created_at | ISO 8601 | Timestamp in UTC |

---

## Example Flows

### New Player Registration

```
1. POST /api/register
   Body: { "player_name": "Alice" }

2. Store response:
   - player_id (for API calls)
   - backup_code (show to user for safekeeping)

3. Display backup code to user
```

### Returning Player (Same Device)

```
1. Retrieve player_id from local storage
2. Use player_id in X-Player-ID header for all requests
```

### Returning Player (New Device)

```
1. POST /api/recover
   Body: { "backup_code": "ABC12345" }

2. Store response:
   - player_id (for API calls)
   - player_name (display)

3. Resume normal operation
```

### Game Session

```
1. Play game locally
2. POST /api/score
   Headers: X-Player-ID: <player_id>
   Body: { "score": 15 }

3. GET /api/history
   Headers: X-Player-ID: <player_id>
   Response: Last 10 scores
```
