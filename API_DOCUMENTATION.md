# SADA Backend API Documentation

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Environment:** Node.js with Express, Prisma ORM, MariaDB  
**Last Updated:** April 26, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Concepts](#core-concepts)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Public Endpoints](#public-endpoints)
   - [Home](#home-page)
   - [About](#about-page)
   - [Projects](#projects)
   - [Blog](#blog)
   - [Gallery](#gallery)
   - [Contact](#contact-form)
   - [Testimonials](#testimonials)
   - [FAQs](#faqs)
   - [Journey](#journey-timeline)
   - [Announcements](#announcements)
   - [Leadership](#leadership)
   - [Payments](#payments)
5. [Admin Endpoints](#admin-endpoints)
   - [Home (Admin)](#home-page-admin)
   - [About (Admin)](#about-page-admin)
   - [Projects (Admin)](#projects-admin)
   - [Blog (Admin)](#blog-admin)
   - [Gallery (Admin)](#gallery-admin)
   - [Contact (Admin)](#contact-form-admin)
   - [Testimonials (Admin)](#testimonials-admin)
   - [FAQs (Admin)](#faqs-admin)
   - [Journey (Admin)](#journey-timeline-admin)
   - [Announcements (Admin)](#announcements-admin)
   - [Leadership (Admin)](#leadership-admin)
   - [Payments (Admin)](#payments-admin)
   - [Statistics](#statistics-dashboard)
6. [Error Handling](#error-handling)
7. [Image Upload Requirements](#image-upload-requirements)
8. [Database Models](#database-models)
9. [Environment Variables](#environment-variables)

---

## Authentication

The SADA API uses **JWT (JSON Web Token)** for authentication and authorization.

### Token Types

1. **Access Token**: Short-lived token (expires in ~1 hour) for API requests
   - Used in `Authorization: Bearer <accessToken>` header
   - Contains userId and user role

2. **Refresh Token**: Long-lived token (expires in 14 days) for obtaining new access tokens
   - Stored in database for validation
   - Used to generate new access tokens when they expire

### Authorization Roles

- **`admin`**: Full access to admin endpoints (create, read, update, delete operations)
- **`user`**: Standard user role, no access to admin endpoints

### Authentication Headers

All authenticated endpoints require:
```
Authorization: Bearer <accessToken>
```

### Common Auth Errors

- `401 Unauthorized`: Missing or invalid access token
- `401 Invalid or expired refresh token`: Refresh token invalid or expired
- `403 Forbidden`: User doesn't have admin role (for admin endpoints)

---

## Core Concepts

### Singleton Pages

**Home** and **About** pages are singleton resources (only one record should exist):
- Public endpoint returns single record
- Admin endpoints can create/update/delete (but typically only one exists)

### Image Storage

All images are stored in **Cloudinary** with the following structure:
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "sada/folder/unique-id"
}
```

Image folders by module:
- Projects: `sada/projects`
- Blog: `sada/blog`
- Gallery: `sada/gallery`
- Testimonials: `sada/testimonials`
- Leadership: `sada/leadership`

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Timestamps

All records include:
- `createdAt`: ISO 8601 datetime (auto-set)
- `updatedAt`: ISO 8601 datetime (auto-updated)

---

# Authentication Endpoints

## Register User

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None  
**Description:** Register a new user account

### Request Body

```json
{
  "email": "user@example.com",
  "password": "12345678",
  "name": "John Doe",
  "role": "user"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `name`: Required, non-empty string
- `role`: Optional, must be one of `admin` or `user` (defaults to `user` if not provided)

### Success Response (201)

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Email, password, and name are required |
| 400 | Invalid email format |
| 400 | Password must be at least 8 characters long |
| 400 | Invalid role. Must be one of: admin, user |
| 409 | User with this email already exists |

---

## Login User

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None  
**Description:** Authenticate user and obtain access & refresh tokens

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required
- `password`: Required

### Success Response (200)

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Email and password are required |
| 401 | Invalid email |
| 401 | Invalid password |

---

## Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`  
**Authentication:** None  
**Description:** Get new access token using refresh token

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `refreshToken`: Required, must be valid and not expired

### Success Response (200)

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Refresh token is required |
| 401 | Invalid or expired refresh token |
| 401 | Refresh token not found or revoked |
| 401 | Refresh token has expired |
| 404 | User not found |

---

## Logout User

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** None  
**Description:** Revoke refresh token (logout)

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `refreshToken`: Required

### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Refresh token is required |

---

## Forgot Password (Request OTP)

**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** None  
**Description:** Request password reset by sending OTP to user's email

### Request Body

```json
{
  "email": "user@example.com"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format

### OTP Details

- **Format**: 6-digit numeric code
- **Delivery**: Sent via email with HTML template
- **Expiry**: 15 minutes from request
- **Purpose**: Used to verify user identity before password reset

### Success Response (200)

```json
{
  "success": true,
  "message": "If an account with this email exists, an OTP has been sent to it."
}
```

**Note:** The message is generic to prevent user enumeration attacks. OTP is always sent if account exists.

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Email is required |
| 400 | Invalid email format |

---

## Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** None  
**Description:** Verify OTP and receive verification token for password reset

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `otp`: Required, must match hashed OTP from database
- OTP must not be expired (15 minutes max)
- OTP must exist in database

### Success Response (200)

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "data": {
    "verificationToken": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Verification Token Usage:**
- Used in subsequent `reset-password` endpoint
- Single-use token
- Expires at same time as OTP (15 minutes from initial forgot-password request)

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Email is required |
| 400 | Invalid email format |
| 400 | OTP is required |
| 400 | No password reset request found. Please request a new OTP. |
| 400 | OTP has expired. Please request a new one. |
| 401 | Invalid OTP |
| 404 | User with this email does not exist |

---

## Reset Password

**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** None  
**Description:** Reset user password using verified OTP

### Request Body

```json
{
  "email": "user@example.com",
  "verificationToken": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `verificationToken`: Required, must be valid token from OTP verification
- `newPassword`: Required, minimum 8 characters, must match confirmPassword
- `confirmPassword`: Required, must match newPassword
- Verification token must belong to the user's email
- OTP must be marked as verified
- OTP must not be expired

### Password Requirements

- Minimum 8 characters
- No maximum length
- Can contain any characters (letters, numbers, symbols)
- Hashed with Argon2id before storage
- Previous password reset token is deleted after successful reset

### Success Response (200)

```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Email is required |
| 400 | Invalid email format |
| 400 | Verification token is required |
| 400 | New password and confirmation password are required |
| 400 | Password must be at least 8 characters long |
| 400 | Passwords do not match |
| 400 | No password reset request found. Please request a new OTP. |
| 400 | Invalid verification token |
| 400 | OTP has not been verified. Please verify the OTP first. |
| 400 | OTP has expired. Please request a new one. |
| 401 | Verification token does not match the user |
| 404 | User with this email does not exist |

---

# Public Endpoints

## Home Page

### Get Home Page Data

**Endpoint:** `GET /api/home`  
**Authentication:** None  
**Description:** Fetch home page data (hero section, statistics, featured projects)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "hero": {
      "title": "Welcome to SADA",
      "subtitle": "Supporting African Development Agenda",
      "image": {
        "url": "https://res.cloudinary.com/.../hero.jpg",
        "public_id": "sada/hero/xyz123"
      }
    },
    "statistics": [
      {
        "label": "Projects Completed",
        "value": "150"
      },
      {
        "label": "Communities Served",
        "value": "45"
      }
    ],
    "featuredProjects": [
      {
        "id": "project-1",
        "title": "Water Project",
        "description": "Clean water initiative",
        "image": {
          "url": "https://res.cloudinary.com/.../project1.jpg",
          "public_id": "sada/featured/proj1"
        }
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Home page data not found |

---

## About Page

### Get About Page Data

**Endpoint:** `GET /api/about`  
**Authentication:** None  
**Description:** Fetch organization information (mission, vision, values)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "mission": "To empower African communities...",
    "vision": "A prosperous and equitable Africa...",
    "coreValues": [
      "Integrity",
      "Innovation",
      "Inclusion",
      "Impact"
    ],
    "history": "Founded in 2020, SADA has...",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | About page data not found |

---

## Projects

### Get All Projects

**Endpoint:** `GET /api/projects`  
**Authentication:** None  
**Description:** Fetch all projects (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Water Pipeline Installation",
      "description": "Installing clean water pipelines to rural areas...",
      "status": "completed",
      "images": [
        {
          "url": "https://res.cloudinary.com/.../proj1-img1.jpg",
          "public_id": "sada/projects/proj1-1"
        },
        {
          "url": "https://res.cloudinary.com/.../proj1-img2.jpg",
          "public_id": "sada/projects/proj1-2"
        }
      ],
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Project by ID

**Endpoint:** `GET /api/projects/:id`  
**Authentication:** None  
**Description:** Fetch a specific project by ID

### URL Parameters

- `id`: Project UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Water Pipeline Installation",
    "description": "Installing clean water pipelines to rural areas...",
    "status": "completed",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../proj1-img1.jpg",
        "public_id": "sada/projects/proj1-1"
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Project not found |

---

## Blog

### Get All Blog Posts

**Endpoint:** `GET /api/blog`  
**Authentication:** None  
**Description:** Fetch all blog posts (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Impact Report 2026",
      "content": "This year we have made significant progress...",
      "author": "Jane Smith",
      "date": "2026-04-26T10:00:00Z",
      "images": [
        {
          "url": "https://res.cloudinary.com/.../blog1-img1.jpg",
          "public_id": "sada/blog/blog1-1"
        }
      ],
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Blog Post by ID

**Endpoint:** `GET /api/blog/:id`  
**Authentication:** None  
**Description:** Fetch a specific blog post by ID

### URL Parameters

- `id`: BlogPost UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Impact Report 2026",
    "content": "This year we have made significant progress...",
    "author": "Jane Smith",
    "date": "2026-04-26T10:00:00Z",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../blog1-img1.jpg",
        "public_id": "sada/blog/blog1-1"
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Blog post not found |

---

## Gallery

### Get All Gallery Entries

**Endpoint:** `GET /api/gallery`  
**Authentication:** None  
**Description:** Fetch all gallery entries with images (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "title": "Community Events 2026",
      "images": [
        {
          "url": "https://res.cloudinary.com/.../gallery1-img1.jpg",
          "public_id": "sada/gallery/gallery1-1"
        },
        {
          "url": "https://res.cloudinary.com/.../gallery1-img2.jpg",
          "public_id": "sada/gallery/gallery1-2"
        }
      ],
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Gallery Entry by ID

**Endpoint:** `GET /api/gallery/:id`  
**Authentication:** None  
**Description:** Fetch a specific gallery entry by ID

### URL Parameters

- `id`: Gallery UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "title": "Community Events 2026",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../gallery1-img1.jpg",
        "public_id": "sada/gallery/gallery1-1"
      },
      {
        "url": "https://res.cloudinary.com/.../gallery1-img2.jpg",
        "public_id": "sada/gallery/gallery1-2"
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Gallery not found |

---

## Contact Form

### Submit Contact Form

**Endpoint:** `POST /api/contact`  
**Authentication:** None  
**Description:** Submit a contact form message (auto-sends email notification)

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Website Inquiry",
  "message": "I would like to know more about SADA..."
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `subject`: Required, non-empty string
- `message`: Required, non-empty string

### Success Response (201)

```json
{
  "success": true,
  "message": "Contact submitted successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Website Inquiry",
    "message": "I would like to know more about SADA...",
    "date": "2026-04-26T10:00:00Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

**Side Effect:** An HTML email notification is sent to `joshuaasemani27@gmail.com` with the submission details.

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Name is required and cannot be empty |
| 400 | Email is required and cannot be empty |
| 400 | Invalid email format |
| 400 | Subject is required and cannot be empty |
| 400 | Message is required and cannot be empty |

---

## Testimonials

### Get All Testimonials

**Endpoint:** `GET /api/testimonials`  
**Authentication:** None  
**Description:** Fetch all testimonials (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "name": "Mary Johnson",
      "role": "Community Leader",
      "text": "SADA has transformed our community with clean water access and education programs...",
      "image": {
        "url": "https://res.cloudinary.com/.../testimonial1.jpg",
        "public_id": "sada/testimonials/test1"
      },
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Testimonial by ID

**Endpoint:** `GET /api/testimonials/:id`  
**Authentication:** None  
**Description:** Fetch a specific testimonial by ID

### URL Parameters

- `id`: Testimonial UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Mary Johnson",
    "role": "Community Leader",
    "text": "SADA has transformed our community...",
    "image": {
      "url": "https://res.cloudinary.com/.../testimonial1.jpg",
      "public_id": "sada/testimonials/test1"
    },
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Testimonial not found |

---

## FAQs

### Get All FAQs

**Endpoint:** `GET /api/faqs`  
**Authentication:** None  
**Description:** Fetch all frequently asked questions (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "question": "What is SADA's mission?",
      "answer": "SADA aims to support African development through community empowerment...",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get FAQ by ID

**Endpoint:** `GET /api/faqs/:id`  
**Authentication:** None  
**Description:** Fetch a specific FAQ by ID

### URL Parameters

- `id`: FAQ UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "question": "What is SADA's mission?",
    "answer": "SADA aims to support African development through community empowerment...",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | FAQ not found |

---

## Journey Timeline

### Get All Journey Milestones

**Endpoint:** `GET /api/journey`  
**Authentication:** None  
**Description:** Fetch all organization journey milestones (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "year": "2026",
      "event": "Launched education initiative in 15 communities",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "year": "2025",
      "event": "Reached 1000+ beneficiaries with water projects",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Journey Milestone by ID

**Endpoint:** `GET /api/journey/:id`  
**Authentication:** None  
**Description:** Fetch a specific journey milestone by ID

### URL Parameters

- `id`: Journey UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "year": "2026",
    "event": "Launched education initiative in 15 communities",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Journey milestone not found |

---

## Announcements

### Get All Announcements

**Endpoint:** `GET /api/announcements`  
**Authentication:** None  
**Description:** Fetch all announcements (ordered by date descending)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Annual General Meeting",
      "content": "The 2026 AGM will be held on May 15th...",
      "date": "2026-05-15T14:00:00Z",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Announcement by ID

**Endpoint:** `GET /api/announcements/:id`  
**Authentication:** None  
**Description:** Fetch a specific announcement by ID

### URL Parameters

- `id`: Announcement UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Annual General Meeting",
    "content": "The 2026 AGM will be held on May 15th...",
    "date": "2026-05-15T14:00:00Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Announcement not found |

---

## Leadership

### Get All Leadership Profiles

**Endpoint:** `GET /api/leadership`  
**Authentication:** None  
**Description:** Fetch all leadership team members (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Dr. Samuel Osei",
      "position": "Executive Director",
      "bio": "With over 15 years of experience in development work...",
      "image": {
        "url": "https://res.cloudinary.com/.../leader1.jpg",
        "public_id": "sada/leadership/lead1"
      },
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Leadership Profile by ID

**Endpoint:** `GET /api/leadership/:id`  
**Authentication:** None  
**Description:** Fetch a specific leadership profile by ID

### URL Parameters

- `id`: Leadership UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "name": "Dr. Samuel Osei",
    "position": "Executive Director",
    "bio": "With over 15 years of experience in development work...",
    "image": {
      "url": "https://res.cloudinary.com/.../leader1.jpg",
      "public_id": "sada/leadership/lead1"
    },
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Leadership profile not found |

---

## Payments

### Initiate Payment

**Endpoint:** `POST /api/payments`  
**Authentication:** None  
**Description:** Initiate a payment via Paystack

### Request Body

```json
{
  "memberId": "member-123",
  "amount": 100.00,
  "purpose": "Monthly membership dues",
  "email": "member@example.com"
}
```

**Validation Rules:**
- `memberId`: Required, non-empty string
- `amount`: Required, must be greater than 0
- `purpose`: Required, non-empty string
- `email`: Required, valid email format

**Fee Calculation:**
- 1% fee is added to base amount
- Amount is converted to pesewas (GHS × 100) for Paystack
- Example: 100 GHS → 100 GHS (base) + 1 GHS (fee) = 101 GHS = 10,100 pesewas

### Success Response (200)

```json
{
  "success": true,
  "message": "Payment initialized successfully.",
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440012",
    "reference": "SADA_1714138800000_A7B3C9F2",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_from_paystack"
  }
}
```

**Database State:** Payment record created with status `pending`

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Member ID is required and cannot be empty |
| 400 | Amount must be greater than 0 |
| 400 | Purpose is required and cannot be empty |
| 400 | Email is required for payment |
| 500 | Failed to initialize payment with Paystack |

---

### Verify Payment

**Endpoint:** `GET /api/payments/verify/:reference`  
**Authentication:** None  
**Description:** Verify payment status with Paystack and update database

### URL Parameters

- `reference`: Paystack reference (e.g., `SADA_1714138800000_A7B3C9F2`)

### Success Response (200)

```json
{
  "success": true,
  "message": "Payment verified successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440012",
    "memberId": "member-123",
    "amount": 100.00,
    "amountWithFee": 101.00,
    "purpose": "Monthly membership dues",
    "status": "successful",
    "reference": "SADA_1714138800000_A7B3C9F2",
    "date": "2026-04-26T10:00:00Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:05:00Z"
  }
}
```

**Payment Status Values:**
- `pending`: Payment initiated but not yet processed
- `successful`: Payment completed successfully
- `failed`: Payment failed

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Reference is required |
| 404 | Payment not found |
| 500 | Failed to verify payment with Paystack |

---

# Admin Endpoints

All admin endpoints require:
- **Authentication:** Valid JWT access token
- **Authorization:** User role must be `admin`

---

## Home Page (Admin)

### Create Home Record

**Endpoint:** `POST /api/admin/home`  
**Authentication:** Required (admin)  
**Description:** Create home page data (typically only one record)

### Request Body

```json
{
  "hero": {
    "title": "Welcome to SADA",
    "subtitle": "Supporting African Development",
    "image": {
      "url": "https://res.cloudinary.com/.../hero.jpg",
      "public_id": "sada/hero/xyz123"
    }
  },
  "statistics": [
    {
      "label": "Projects Completed",
      "value": "150"
    },
    {
      "label": "Communities Served",
      "value": "45"
    }
  ],
  "featuredProjects": [
    {
      "id": "project-1",
      "title": "Water Project",
      "description": "Clean water initiative",
      "image": {
        "url": "https://res.cloudinary.com/.../project1.jpg",
        "public_id": "sada/featured/proj1"
      }
    }
  ]
}
```

**Validation Rules:**
- `hero`: Required object with `title`, `subtitle`, `image`
- `statistics`: Required array of objects with `label` and `value`
- `featuredProjects`: Required array of objects

### Success Response (201)

```json
{
  "success": true,
  "message": "Home page created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "hero": { ... },
    "statistics": [ ... ],
    "featuredProjects": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | hero, statistics, and featuredProjects are required |
| 400 | hero must contain title, subtitle, and image |
| 400 | statistics must be an array |
| 400 | featuredProjects must be an array |

---

### Get All Home Records

**Endpoint:** `GET /api/admin/home`  
**Authentication:** Required (admin)  
**Description:** Fetch all home records

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "hero": { ... },
      "statistics": [ ... ],
      "featuredProjects": [ ... ],
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  ]
}
```

---

### Get Home Record by ID

**Endpoint:** `GET /api/admin/home/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific home record

### URL Parameters

- `id`: Home UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "hero": { ... },
    "statistics": [ ... ],
    "featuredProjects": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Home record not found |

---

### Update Home Record

**Endpoint:** `PATCH /api/admin/home/:id`  
**Authentication:** Required (admin)  
**Description:** Update home record (partial update)

### URL Parameters

- `id`: Home UUID (required)

### Request Body

All fields are optional:
```json
{
  "hero": { ... },
  "statistics": [ ... ],
  "featuredProjects": [ ... ]
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Home page updated successfully.",
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Home record not found |

---

### Delete Home Record

**Endpoint:** `DELETE /api/admin/home/:id`  
**Authentication:** Required (admin)  
**Description:** Delete home record

### URL Parameters

- `id`: Home UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "message": "Home page deleted successfully."
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Home record not found |

---

## About Page (Admin)

### Create About Record

**Endpoint:** `POST /api/admin/about`  
**Authentication:** Required (admin)  
**Description:** Create about page data

### Request Body

```json
{
  "mission": "To empower African communities through sustainable development initiatives...",
  "vision": "A prosperous and equitable Africa where all communities thrive...",
  "coreValues": [
    "Integrity",
    "Innovation",
    "Inclusion",
    "Impact"
  ],
  "history": "Founded in 2020, SADA has been dedicated to supporting African development..."
}
```

**Validation Rules:**
- `mission`: Required, string
- `vision`: Required, string
- `coreValues`: Required, array of strings
- `history`: Required, string

### Success Response (201)

```json
{
  "success": true,
  "message": "About page created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "mission": "...",
    "vision": "...",
    "coreValues": [ ... ],
    "history": "...",
    "membership": { ... },
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | mission, vision, coreValues, and history are required |
| 400 | coreValues must be an array |

---

### Get All About Records

**Endpoint:** `GET /api/admin/about`  
**Authentication:** Required (admin)  
**Description:** Fetch all about records

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get About Record by ID

**Endpoint:** `GET /api/admin/about/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific about record

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | About record not found |

---

### Update About Record

**Endpoint:** `PATCH /api/admin/about/:id`  
**Authentication:** Required (admin)  
**Description:** Update about record (partial update)

### Success Response (200)

```json
{
  "success": true,
  "message": "About page updated successfully.",
  "data": { ... }
}
```

---

### Delete About Record

**Endpoint:** `DELETE /api/admin/about/:id`  
**Authentication:** Required (admin)  
**Description:** Delete about record

### Success Response (200)

```json
{
  "success": true,
  "message": "About page deleted successfully."
}
```

---

## Membership

### Get All Memberships

**Endpoint:** `GET /api/membership`  
**Authentication:** None  
**Description:** Fetch all membership records (for singleton, returns 1 record)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "benefits": [
        "Access to resources",
        "Networking opportunities",
        "Training programs"
      ],
      "requirements": [
        "Age 18+",
        "Commitment to values",
        "Monthly contribution"
      ],
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Membership by ID

**Endpoint:** `GET /api/membership/:id`  
**Authentication:** None  
**Description:** Fetch a specific membership record

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "benefits": [ ... ],
    "requirements": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Membership record not found |

---

## Membership (Admin)

### Create Membership Record

**Endpoint:** `POST /api/admin/membership`  
**Authentication:** Required (admin)  
**Description:** Create membership data

### Request Body

```json
{
  "benefits": [
    "Access to resources",
    "Networking opportunities",
    "Training programs",
    "Mentorship"
  ],
  "requirements": [
    "Age 18+",
    "Commitment to organizational values",
    "Monthly financial contribution",
    "Active participation"
  ]
}
```

**Validation Rules:**
- `benefits`: Required, array of strings
- `requirements`: Required, array of strings

### Success Response (201)

```json
{
  "success": true,
  "message": "Membership created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "benefits": [ ... ],
    "requirements": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | benefits and requirements are required |
| 400 | benefits and requirements must be arrays |

---

### Get All Membership Records (Admin)

**Endpoint:** `GET /api/admin/membership`  
**Authentication:** Required (admin)  
**Description:** Fetch all membership records

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get Membership Record by ID (Admin)

**Endpoint:** `GET /api/admin/membership/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific membership record

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Membership record not found |

---

### Update Membership Record

**Endpoint:** `PATCH /api/admin/membership/:id`  
**Authentication:** Required (admin)  
**Description:** Update membership record (partial update)

### Request Body (All fields optional)

```json
{
  "benefits": [ ... ],
  "requirements": [ ... ]
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Membership updated successfully.",
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 400 | benefits must be an array |
| 400 | requirements must be an array |
| 404 | Membership record not found |

---

### Delete Membership Record

**Endpoint:** `DELETE /api/admin/membership/:id`  
**Authentication:** Required (admin)  
**Description:** Delete membership record

### Success Response (200)

```json
{
  "success": true,
  "message": "Membership deleted successfully."
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | ID is required |
| 404 | Membership record not found |

---

## Projects (Admin)

### Create Project

**Endpoint:** `POST /api/admin/projects`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new project with images

### Form Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Non-empty project title |
| `description` | String | Yes | Non-empty project description |
| `status` | Enum | Yes | One of: `planning`, `active`, `completed`, `on-hold` |
| `images` | File[] | Yes | 1-10 image files (JPEG, PNG, WebP) |

### Example cURL

```bash
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Water Pipeline" \
  -F "description=Installing clean water..." \
  -F "status=completed" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Water Pipeline",
    "description": "Installing clean water...",
    "status": "completed",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../proj1-1.jpg",
        "public_id": "sada/projects/proj1-1"
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | title, description, and status are required |
| 400 | At least one image is required |
| 400 | Invalid status. Must be one of: planning, active, completed, on-hold |

---

### Get All Projects (Admin)

**Endpoint:** `GET /api/admin/projects`  
**Authentication:** Required (admin)  
**Description:** Fetch all projects with full details

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get Project by ID (Admin)

**Endpoint:** `GET /api/admin/projects/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific project with full details

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Project

**Endpoint:** `PATCH /api/admin/projects/:id`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Update project (partial update with optional images)

### Form Data

All fields are optional:

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Update title |
| `description` | String | Update description |
| `status` | Enum | Update status |
| `images` | File[] | Replace all images (if provided) |

**Image Behavior:**
- If new images provided: All old images deleted from Cloudinary, new ones uploaded
- If no images provided: Existing images unchanged

### Success Response (200)

```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": { ... }
}
```

---

### Delete Project

**Endpoint:** `DELETE /api/admin/projects/:id`  
**Authentication:** Required (admin)  
**Description:** Delete project and all its images

### Success Response (200)

```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

---

## Blog (Admin)

### Create Blog Post

**Endpoint:** `POST /api/admin/blog`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new blog post with optional images

### Form Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Non-empty blog title |
| `content` | String | Yes | Non-empty blog content (long text) |
| `author` | String | Yes | Non-empty author name |
| `images` | File[] | No | 0-10 image files (optional) |

### Success Response (201)

```json
{
  "success": true,
  "message": "Blog post created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Impact Report 2026",
    "content": "This year we have made significant progress...",
    "author": "Jane Smith",
    "date": "2026-04-26T10:00:00Z",
    "images": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | title, content, and author are required |
| 400 | author must be a non-empty string |
| 400 | title must be a non-empty string |
| 400 | content must be a non-empty string |

---

### Get All Blog Posts (Admin)

**Endpoint:** `GET /api/admin/blog`  
**Authentication:** Required (admin)  
**Description:** Fetch all blog posts with full details

---

### Get Blog Post by ID (Admin)

**Endpoint:** `GET /api/admin/blog/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific blog post

---

### Update Blog Post

**Endpoint:** `PATCH /api/admin/blog/:id`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Update blog post (partial update)

### Form Data

All fields optional: `title`, `content`, `author`, `images` (File[])

### Success Response (200)

```json
{
  "success": true,
  "message": "Blog post updated successfully.",
  "data": { ... }
}
```

---

### Delete Blog Post

**Endpoint:** `DELETE /api/admin/blog/:id`  
**Authentication:** Required (admin)  
**Description:** Delete blog post and all its images

### Success Response (200)

```json
{
  "success": true,
  "message": "Blog post deleted successfully."
}
```

---

## Gallery (Admin)

### Create Gallery Entry

**Endpoint:** `POST /api/admin/gallery`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new gallery entry with multiple images

### Form Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Non-empty gallery title |
| `images` | File[] | Yes | 1-10 image files (required) |

### Success Response (201)

```json
{
  "success": true,
  "message": "Gallery entry created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "title": "Community Events 2026",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../gallery1-1.jpg",
        "public_id": "sada/gallery/gallery1-1"
      }
    ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Title is required and cannot be empty |
| 400 | At least one image is required |

---

### Upload Gallery Images

**Endpoint:** `POST /api/admin/gallery/upload`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Dedicated endpoint to upload and create gallery entry

### Form Data

| Field | Type | Required |
|-------|------|----------|
| `title` | String | Yes |
| `images` | File[] | Yes (min 1) |

### Success Response (201)

```json
{
  "success": true,
  "message": "Gallery entry created successfully.",
  "data": { ... }
}
```

---

### Get All Gallery Entries (Admin)

**Endpoint:** `GET /api/admin/gallery`  
**Authentication:** Required (admin)  
**Description:** Fetch all gallery entries

---

### Get Gallery Entry by ID (Admin)

**Endpoint:** `GET /api/admin/gallery/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific gallery entry

---

### Update Gallery Entry

**Endpoint:** `PATCH /api/admin/gallery/:id`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Update gallery entry with optional image replacement

### Form Data

All fields optional:
- `title`: String
- `images`: File[] (if provided, replaces ALL existing images)

---

### Delete Gallery Entry

**Endpoint:** `DELETE /api/admin/gallery/:id`  
**Authentication:** Required (admin)  
**Description:** Delete gallery entry and all images

---

## Contact Form (Admin)

### Get All Contacts

**Endpoint:** `GET /api/admin/contact`  
**Authentication:** Required (admin)  
**Description:** Fetch all contact form submissions (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Website Inquiry",
      "message": "I would like to know more about SADA...",
      "date": "2026-04-26T10:00:00Z",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  ]
}
```

---

### Get Contact by ID

**Endpoint:** `GET /api/admin/contact/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific contact submission

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Contact submission not found |

---

### Delete Contact

**Endpoint:** `DELETE /api/admin/contact/:id`  
**Authentication:** Required (admin)  
**Description:** Delete a contact submission

### Success Response (200)

```json
{
  "success": true,
  "message": "Contact submission deleted successfully."
}
```

---

## Testimonials (Admin)

### Create Testimonial

**Endpoint:** `POST /api/admin/testimonials`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new testimonial with a profile image

### Form Data

| Field | Type | Required |
|-------|------|----------|
| `name` | String | Yes |
| `role` | String | Yes |
| `text` | String | Yes |
| `image` | File | Yes (single image) |

### Success Response (201)

```json
{
  "success": true,
  "message": "Testimonial created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Mary Johnson",
    "role": "Community Leader",
    "text": "SADA has transformed our community...",
    "image": {
      "url": "https://res.cloudinary.com/.../testimonial1.jpg",
      "public_id": "sada/testimonials/test1"
    },
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

---

### Get All Testimonials (Admin)

**Endpoint:** `GET /api/admin/testimonials`  
**Authentication:** Required (admin)

---

### Get Testimonial by ID (Admin)

**Endpoint:** `GET /api/admin/testimonials/:id`  
**Authentication:** Required (admin)

---

### Update Testimonial

**Endpoint:** `PATCH /api/admin/testimonials/:id`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Update testimonial with optional image replacement

### Form Data

All fields optional: `name`, `role`, `text`, `image` (File)

---

### Delete Testimonial

**Endpoint:** `DELETE /api/admin/testimonials/:id`  
**Authentication:** Required (admin)

---

## FAQs (Admin)

### Create FAQ

**Endpoint:** `POST /api/admin/faqs`  
**Authentication:** Required (admin)  
**Description:** Create a new FAQ entry

### Request Body

```json
{
  "question": "What is SADA's mission?",
  "answer": "SADA aims to support African development through community empowerment..."
}
```

**Validation Rules:**
- `question`: Required, non-empty string
- `answer`: Required, non-empty string

### Success Response (201)

```json
{
  "success": true,
  "message": "FAQ created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "question": "What is SADA's mission?",
    "answer": "SADA aims to support African development...",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

---

### Get All FAQs (Admin)

**Endpoint:** `GET /api/admin/faqs`  
**Authentication:** Required (admin)

---

### Get FAQ by ID (Admin)

**Endpoint:** `GET /api/admin/faqs/:id`  
**Authentication:** Required (admin)

---

### Update FAQ

**Endpoint:** `PATCH /api/admin/faqs/:id`  
**Authentication:** Required (admin)  
**Description:** Update FAQ (partial update)

### Request Body

All fields optional:
```json
{
  "question": "...",
  "answer": "..."
}
```

---

### Delete FAQ

**Endpoint:** `DELETE /api/admin/faqs/:id`  
**Authentication:** Required (admin)

---

## Journey Timeline (Admin)

### Create Journey Entry

**Endpoint:** `POST /api/admin/journey`  
**Authentication:** Required (admin)  
**Description:** Create a new journey milestone

### Request Body

```json
{
  "year": "2026",
  "event": "Launched education initiative in 15 communities"
}
```

**Validation Rules:**
- `year`: Required, non-empty string
- `event`: Required, non-empty string

### Success Response (201)

```json
{
  "success": true,
  "message": "Journey entry created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "year": "2026",
    "event": "Launched education initiative...",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

---

### Get All Journey Entries (Admin)

**Endpoint:** `GET /api/admin/journey`  
**Authentication:** Required (admin)

---

### Get Journey Entry by ID (Admin)

**Endpoint:** `GET /api/admin/journey/:id`  
**Authentication:** Required (admin)

---

### Update Journey Entry

**Endpoint:** `PATCH /api/admin/journey/:id`  
**Authentication:** Required (admin)

### Request Body

All fields optional: `year`, `event`

---

### Delete Journey Entry

**Endpoint:** `DELETE /api/admin/journey/:id`  
**Authentication:** Required (admin)

---

## Announcements (Admin)

### Create Announcement

**Endpoint:** `POST /api/admin/announcements`  
**Authentication:** Required (admin)  
**Description:** Create a new announcement

### Request Body

```json
{
  "title": "Annual General Meeting",
  "content": "The 2026 AGM will be held on May 15th...",
  "date": "2026-05-15T14:00:00Z"
}
```

**Validation Rules:**
- `title`: Required, non-empty string
- `content`: Required, non-empty string
- `date`: Optional, ISO 8601 format (defaults to now())
  - If provided, must be in the future

### Success Response (201)

```json
{
  "success": true,
  "message": "Announcement created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Annual General Meeting",
    "content": "The 2026 AGM will be held...",
    "date": "2026-05-15T14:00:00Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

---

### Get All Announcements (Admin)

**Endpoint:** `GET /api/admin/announcements`  
**Authentication:** Required (admin)

---

### Get Announcement by ID (Admin)

**Endpoint:** `GET /api/admin/announcements/:id`  
**Authentication:** Required (admin)

---

### Update Announcement

**Endpoint:** `PATCH /api/admin/announcements/:id`  
**Authentication:** Required (admin)

### Request Body

All fields optional: `title`, `content`, `date`

---

### Delete Announcement

**Endpoint:** `DELETE /api/admin/announcements/:id`  
**Authentication:** Required (admin)

---

## Leadership (Admin)

### Create Leadership Profile

**Endpoint:** `POST /api/admin/leadership`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new leadership profile with image

### Form Data

| Field | Type | Required |
|-------|------|----------|
| `name` | String | Yes |
| `position` | String | Yes |
| `bio` | String | Yes |
| `image` | File | Yes (single image) |

### Success Response (201)

```json
{
  "success": true,
  "message": "Leadership profile created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "name": "Dr. Samuel Osei",
    "position": "Executive Director",
    "bio": "With over 15 years of experience...",
    "image": {
      "url": "https://res.cloudinary.com/.../leader1.jpg",
      "public_id": "sada/leadership/lead1"
    },
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Name/Position/Bio is required and cannot be empty |
| 400 | Image is required |

---

### Get All Leadership Profiles (Admin)

**Endpoint:** `GET /api/admin/leadership`  
**Authentication:** Required (admin)

---

### Get Leadership Profile by ID (Admin)

**Endpoint:** `GET /api/admin/leadership/:id`  
**Authentication:** Required (admin)

---

### Update Leadership Profile

**Endpoint:** `PATCH /api/admin/leadership/:id`  
**Authentication:** Required (admin)  
**Content-Type:** `multipart/form-data`

### Form Data

All fields optional: `name`, `position`, `bio`, `image` (File)

---

### Delete Leadership Profile

**Endpoint:** `DELETE /api/admin/leadership/:id`  
**Authentication:** Required (admin)

---

## Payments (Admin)

### Get All Payments

**Endpoint:** `GET /api/admin/payments`  
**Authentication:** Required (admin)  
**Description:** Fetch all payments (ordered by newest first)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "memberId": "member-123",
      "amount": 100.00,
      "amountWithFee": 101.00,
      "purpose": "Monthly membership dues",
      "status": "successful",
      "reference": "SADA_1714138800000_A7B3C9F2",
      "date": "2026-04-26T10:00:00Z",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:05:00Z"
    }
  ]
}
```

---

### Get Payment by ID

**Endpoint:** `GET /api/admin/payments/:id`  
**Authentication:** Required (admin)  
**Description:** Fetch a specific payment record

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Payment not found |

---

## Statistics Dashboard

### Get Dashboard Statistics

**Endpoint:** `GET /api/admin/statistics`  
**Authentication:** Required (admin)  
**Description:** Get comprehensive dashboard statistics across all 14 models

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "users": {
      "totalUsers": 45,
      "adminCount": 3,
      "userCount": 42,
      "adminPercentage": 6.67,
      "userPercentage": 93.33
    },
    "pages": {
      "homeConfigured": true,
      "aboutConfigured": true
    },
    "projects": {
      "totalProjects": 12,
      "byStatus": {
        "planning": 2,
        "active": 4,
        "completed": 5,
        "on_hold": 1
      }
    },
    "blog": {
      "totalPosts": 23,
      "recentPosts": [
        {
          "id": "...",
          "title": "Impact Report 2026",
          "createdAt": "2026-04-26T10:00:00Z"
        }
      ]
    },
    "gallery": {
      "totalEntries": 8,
      "totalImages": 45,
      "averageImagesPerEntry": 5.63
    },
    "testimonials": {
      "totalTestimonials": 15,
      "recentTestimonials": [ ... ]
    },
    "contact": {
      "totalSubmissions": 87,
      "submissionsLast30Days": 12
    },
    "faqs": {
      "totalFAQs": 18
    },
    "journey": {
      "totalEvents": 6,
      "yearsRepresented": ["2026", "2025", "2024"]
    },
    "announcements": {
      "totalAnnouncements": 14,
      "scheduledForFuture": 3,
      "recentAnnouncements": [ ... ]
    },
    "leadership": {
      "totalTeamMembers": 8
    },
    "payments": {
      "totalTransactions": 234,
      "byStatus": {
        "pending": 5,
        "successful": 220,
        "failed": 9
      },
      "totalRevenue": 22350.50,
      "averagePaymentAmount": 101.59,
      "successRate": 94.02
    },
    "tokens": {
      "activeRefreshTokens": 28
    },
    "summary": {
      "totalModels": 14,
      "totalRecordsAcrossAllModels": 651
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST/create request |
| 400 | Bad Request | Invalid input, missing required fields, validation error |
| 401 | Unauthorized | Missing or invalid access token |
| 403 | Forbidden | Insufficient permissions (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Server Error | Internal server error |

### Authentication Errors

**Missing Token:**
```
Status: 401
Message: "Unauthorized - No token provided"
```

**Invalid Token:**
```
Status: 401
Message: "Invalid or expired access token"
```

**Insufficient Permissions:**
```
Status: 403
Message: "Forbidden - Admin access required"
```

---

## Image Upload Requirements

### Supported Formats

- **JPEG**: `image/jpeg` (.jpg, .jpeg)
- **PNG**: `image/png` (.png)
- **WebP**: `image/webp` (.webp)

### File Size Limits

- **Maximum file size:** 100MB per image
- **Maximum files per request:** 10 images (for array uploads)

### Upload Specifications by Module

#### Projects (`/api/admin/projects`)
- **Folder:** `sada/projects`
- **Required:** Yes (minimum 1 image)
- **Multiple:** Yes (up to 10)
- **Update behavior:** Replaces ALL images if new ones provided

#### Blog (`/api/admin/blog`)
- **Folder:** `sada/blog`
- **Required:** No (optional)
- **Multiple:** Yes (up to 10)
- **Update behavior:** Replaces all images if new ones provided

#### Gallery (`/api/admin/gallery` and `/api/admin/gallery/upload`)
- **Folder:** `sada/gallery`
- **Required:** Yes (minimum 1 image)
- **Multiple:** Yes (up to 10)
- **Update behavior:** Replaces all images if new ones provided

#### Testimonials (`/api/admin/testimonials`)
- **Folder:** `sada/testimonials`
- **Required:** Yes (on create)
- **Multiple:** No (single image only, use `upload.single('image')`)
- **Update behavior:** Optional, replaces if provided

#### Leadership (`/api/admin/leadership`)
- **Folder:** `sada/leadership`
- **Required:** Yes (on create)
- **Multiple:** No (single image only)
- **Update behavior:** Optional, replaces if provided

### Cloudinary Image Object Structure

All uploaded images are stored as:
```json
{
  "url": "https://res.cloudinary.com/dxxx/image/upload/v1714138800/sada/folder/xyz123.jpg",
  "public_id": "sada/folder/xyz123"
}
```

**Storage:** Images are stored in a JSON array for modules that support multiple images.

### Image Upload Error Handling

**Common Upload Errors:**

| Error | Status | Cause |
|-------|--------|-------|
| "At least one image is required" | 400 | No files provided |
| "Failed to upload image" | 500 | Cloudinary API error |
| "Image upload failed" | 500 | Temporary network issue |

---

## Database Models

### User Model

```javascript
{
  id: String (UUID, primary key),
  email: String (unique),
  password: String (hashed with argon2),
  name: String,
  role: Enum (admin | user, default: user),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto),
  refreshTokens: RefreshToken[] (relation)
}
```

### RefreshToken Model

```javascript
{
  id: String (UUID, primary key),
  userId: String (foreign key to User),
  user: User (relation),
  token: String (unique),
  expiresAt: DateTime,
  createdAt: DateTime (auto)
}
```

### Home Model

```javascript
{
  id: String (UUID, primary key),
  hero: Json (structure: { title, subtitle, image: { url, public_id } }),
  statistics: Json (array of { label, value }),
  featuredProjects: Json (array of { id, title, description, image: { url, public_id } }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### About Model

```javascript
{
  id: String (UUID, primary key),
  mission: LongText,
  vision: LongText,
  coreValues: Json (array of strings),
  history: LongText,
  membership: Json (structure: { benefits: [], requirements: [] }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Project Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  description: LongText,
  status: Enum (planning | active | completed | on_hold, default: completed),
  images: Json (array of { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### BlogPost Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  content: LongText,
  author: String,
  date: DateTime (auto, when post was created),
  images: Json (array of { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Gallery Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  images: Json (array of { url, public_id }, minimum 1 image),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Contact Model

```javascript
{
  id: String (UUID, primary key),
  name: String,
  email: String,
  subject: String,
  message: LongText,
  date: DateTime (auto, when submitted),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Testimonial Model

```javascript
{
  id: String (UUID, primary key),
  name: String,
  role: String,
  text: LongText,
  image: Json (single object: { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### FAQ Model

```javascript
{
  id: String (UUID, primary key),
  question: String,
  answer: LongText,
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Journey Model

```javascript
{
  id: String (UUID, primary key),
  year: String,
  event: LongText,
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Announcement Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  content: LongText,
  date: DateTime (auto, announcement date),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Leadership Model

```javascript
{
  id: String (UUID, primary key),
  name: String,
  position: String,
  bio: LongText,
  image: Json (single object: { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Payment Model

```javascript
{
  id: String (UUID, primary key),
  memberId: String,
  amount: Decimal (base amount in GHS),
  amountWithFee: Decimal (amount + 1% fee),
  purpose: String,
  status: Enum (pending | successful | failed, default: pending),
  reference: String (unique, format: SADA_{timestamp}_{hex}),
  date: DateTime (auto, when initiated),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

---

## Environment Variables

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/sada_db

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_key_min_32_chars

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Payment Configuration
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Environment Variable Details

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | String | MariaDB connection URL |
| `JWT_ACCESS_SECRET` | String | Secret key for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | String | Secret key for signing refresh tokens (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | String | Cloudinary cloud name for image storage |
| `CLOUDINARY_API_KEY` | String | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | String | Cloudinary API secret |
| `EMAIL_USER` | String | Gmail address for sending notifications |
| `EMAIL_PASSWORD` | String | Gmail app-specific password (not regular password) |
| `PAYSTACK_SECRET_KEY` | String | Paystack API secret key for payment processing |
| `PORT` | Number | Server port (default: 5000) |
| `NODE_ENV` | String | Environment: development, production, test |

### Configuration Notes

**JWT Secrets:**
- Use strong random strings (at least 32 characters)
- Keep separate secrets for access and refresh tokens
- Never commit to version control

**Email Setup:**
- For Gmail: Enable 2-factor authentication
- Generate app-specific password in Google Account settings
- Use the app password in `EMAIL_PASSWORD`, NOT your regular password

**Cloudinary:**
- Create a free account at https://cloudinary.com
- Images are organized in folders: `sada/projects`, `sada/blog`, etc.

**Paystack:**
- Get keys from https://dashboard.paystack.co/settings/developers
- Use live keys in production, test keys in development

---

## API Summary

### Endpoint Count by Category

| Category | Count | Note |
|----------|-------|------|
| Authentication | 4 | register, login, refresh-token, logout |
| Home (Public) | 1 | GET home data |
| Home (Admin) | 5 | CRUD operations |
| About (Public) | 1 | GET about data |
| About (Admin) | 5 | CRUD operations |
| Projects (Public) | 2 | GET all, GET by ID |
| Projects (Admin) | 5 | CRUD operations |
| Blog (Public) | 2 | GET all, GET by ID |
| Blog (Admin) | 5 | CRUD operations |
| Gallery (Public) | 2 | GET all, GET by ID |
| Gallery (Admin) | 6 | CRUD + dedicated upload endpoint |
| Contact (Public) | 1 | POST submit form |
| Contact (Admin) | 3 | GET all, GET by ID, DELETE |
| Testimonials (Public) | 2 | GET all, GET by ID |
| Testimonials (Admin) | 5 | CRUD operations |
| FAQs (Public) | 2 | GET all, GET by ID |
| FAQs (Admin) | 5 | CRUD operations |
| Journey (Public) | 2 | GET all, GET by ID |
| Journey (Admin) | 5 | CRUD operations |
| Announcements (Public) | 2 | GET all, GET by ID |
| Announcements (Admin) | 5 | CRUD operations |
| Leadership (Public) | 2 | GET all, GET by ID |
| Leadership (Admin) | 5 | CRUD operations |
| Payments (Public) | 2 | POST initiate, GET verify |
| Payments (Admin) | 2 | GET all, GET by ID |
| Statistics (Admin) | 1 | GET dashboard stats |
| **TOTAL** | **78 Endpoints** | Complete API coverage |

### Quick Reference: Common Patterns

**Public GET Endpoints:**
- Format: `GET /api/{resource}` (Get all) or `GET /api/{resource}/:id` (Get one)
- No authentication required
- Cached data for website display

**Admin CRUD Endpoints:**
- Create: `POST /api/admin/{resource}`
- Read All: `GET /api/admin/{resource}`
- Read One: `GET /api/admin/{resource}/:id`
- Update: `PATCH /api/admin/{resource}/:id`
- Delete: `DELETE /api/admin/{resource}/:id`
- All require authentication & admin role

**File Uploads:**
- Use `multipart/form-data` content type
- Images auto-uploaded to Cloudinary
- Old images auto-deleted on update
- Support up to 10 images (except single-image endpoints)

**Image-Storing Modules:**
- Projects: Multi-image required
- Blog: Multi-image optional
- Gallery: Multi-image required
- Testimonials: Single image required
- Leadership: Single image required

---

**End of Documentation**

Generated: April 26, 2026  
API Version: 1.0.0  
Status: Complete & Verified
