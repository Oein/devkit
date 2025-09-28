# Deepslate Authentication System

This module provides a comprehensive authentication system for Deepslate, including user sign-in, sign-out, sign-up, user data management, personal information updates, password management, and flag management.

## Included APIs

### POST /deepslate/auth/signin

Signin an existing user.

- Request Body:

```json
{
  "username": "string",
  "password": "string"
}
```

- Response:

**Success (200)**:

```json
{
  "success": true
}
```

**Validation Error (400)**:

```json
{
  "success": false,
  "error": "Missing username or password"
}
```

**Account Not Found (404)**:

```json
{
  "success": false,
  "error": "Account not found"
}
```

**Invalid Password (401)**:

```json
{
  "success": false,
  "error": "Invalid password"
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### POST /deepslate/auth/signout

Signout the current user.

- Response:

**Success (200)**:

```json
{
  "success": true
}
```

**Not Logged In (401)**:

```json
{
  "success": false,
  "error": "Not logged in"
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### POST /deepslate/auth/signup

Signup a new user.

- Request Body:

```json
{
  "username": "string",
  "nickname": "string",
  "password": "string"
}
```

- Response:

**Success (200)**:

```json
{
  "success": true
}
```

**Validation Error (400)**:

```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**Username/Nickname Already Exists (409)**:

```json
{
  "success": false,
  "error": "Username or nickname already exists"
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### GET /deepslate/auth/user

Get the current user's information.

- Response:

**Success with User (200)**:

```json
{
  "success": true,
  "user": {
    "username": "string",
    "nickname": "string",
    "profileImage": "string | null"
  }
}
```

**Not Logged In (200)**:

```json
{
  "success": false
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### DELETE /deepslate/auth/user

Signout and delete the current user.

- Response:

**Success (200)**:

```json
{
  "success": true
}
```

**Not Logged In (401)**:

```json
{
  "success": false,
  "error": "Not logged in"
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

### POST /deepslate/auth/profile/upload

Upload a profile image for the current user.

- Request Body: WebP image file as binary data
- Content-Type: Should be set appropriately for binary data

- Response:

**Success (200)**:

```json
{
  "success": true,
  "profileImage": "/deepslate/public/profileImage/{userid}.webp"
}
```

**Not Logged In (401)**:

```json
{
  "success": false,
  "error": "Not logged in"
}
```

**No File Data (400)**:

```json
{
  "success": false,
  "error": "No file data provided"
}
```

**Server Error (500)**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```
