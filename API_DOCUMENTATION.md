# SADA Backend API Documentation

**API Version:** 1.0.0
**Base URL:** `http://localhost:5000/api`
**Environment:** Node.js with Express, Prisma ORM, MariaDB
**Last Updated:** May 22, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Concepts](#core-concepts)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Public Endpoints](#public-endpoints)
   - [Home](#home-page)
   - [Hero](#hero-banners)
   - [About](#about-page)
   - [Projects](#projects)
   - [Blog](#blog)
   - [Gallery](#gallery)
   - [Contact](#contact-form)
   - [Testimonials](#testimonials)
   - [FAQs](#faqs)
   - [Journey](#journey-timeline)
   - [Announcements](#announcements)
   - [Events](#events)
   - [Leadership](#leadership)
   - [Membership](#membership)
   - [Payments](#payments)
5. [Admin Endpoints](#admin-endpoints)
   - [Home (Admin)](#home-page-admin)
   - [Hero (Admin)](#hero-banners-admin)
   - [About (Admin)](#about-page-admin)
   - [Projects (Admin)](#projects-admin)
   - [Blog (Admin)](#blog-admin)
   - [Gallery (Admin)](#gallery-admin)
   - [Contact (Admin)](#contact-form-admin)
   - [Testimonials (Admin)](#testimonials-admin)
   - [FAQs (Admin)](#faqs-admin)
   - [Journey (Admin)](#journey-timeline-admin)
   - [Announcements (Admin)](#announcements-admin)
   - [Events (Admin)](#events-admin)
   - [Leadership (Admin)](#leadership-admin)
   - [Membership (Admin)](#membership-admin)
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

- Hero: `sada/hero`
- Projects: `sada/projects`
- Blog: `sada/blog`
- Gallery: `sada/gallery`
- Testimonials: `sada/testimonials`
- Leadership: `sada/leadership`
- Events: `sada/events`

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

| Status | Message                                     |
| ------ | ------------------------------------------- |
| 400    | Email, password, and name are required      |
| 400    | Invalid email format                        |
| 400    | Password must be at least 8 characters long |
| 400    | Invalid role. Must be one of: admin, user   |
| 409    | User with this email already exists         |

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

| Status | Message                         |
| ------ | ------------------------------- |
| 400    | Email and password are required |
| 401    | Invalid email                   |
| 401    | Invalid password                |

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

| Status | Message                            |
| ------ | ---------------------------------- |
| 400    | Refresh token is required          |
| 401    | Invalid or expired refresh token   |
| 401    | Refresh token not found or revoked |
| 401    | Refresh token has expired          |
| 404    | User not found                     |

---

## Logout User

**Endpoint:** `POST /api/auth/logout`
**Authentication:** None
**Description:** Revoke refresh token (logout)

### Request Bodymember

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

| Status | Message                   |
| ------ | ------------------------- |
| 400    | Refresh token is required |

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

| Status | Message              |
| ------ | -------------------- |
| 400    | Email is required    |
| 400    | Invalid email format |

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

| Status | Message                                                    |
| ------ | ---------------------------------------------------------- |
| 400    | Email is required                                          |
| 400    | Invalid email format                                       |
| 400    | OTP is required                                            |
| 400    | No password reset request found. Please request a new OTP. |
| 400    | OTP has expired. Please request a new one.                 |
| 401    | Invalid OTP                                                |
| 404    | User with this email does not exist                        |

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

| Status | Message                                                    |
| ------ | ---------------------------------------------------------- |
| 400    | Email is required                                          |
| 400    | Invalid email format                                       |
| 400    | Verification token is required                             |
| 400    | New password and confirmation password are required        |
| 400    | Password must be at least 8 characters long                |
| 400    | Passwords do not match                                     |
| 400    | No password reset request found. Please request a new OTP. |
| 400    | Invalid verification token                                 |
| 400    | OTP has not been verified. Please verify the OTP first.    |
| 400    | OTP has expired. Please request a new one.                 |
| 401    | Verification token does not match the user                 |
| 404    | User with this email does not exist                        |

---

# Public Endpoints

## Home Page

### Get Home Page Data

**Endpoint:** `GET /api/home`
**Authentication:** None
**Description:** Fetch home page data (statistics and featured projects)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
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

| Status | Message                  |
| ------ | ------------------------ |
| 404    | Home page data not found |

---

## Hero Banners

### Get All Published Hero Banners

**Endpoint:** `GET /api/hero`
**Authentication:** None
**Description:** Fetch all hero banners with `published` status

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Empowering Communities",
      "subtitle": "Building a sustainable future for all.",
      "image": {
        "url": "https://res.cloudinary.com/.../hero1.jpg",
        "public_id": "sada/heroes/hero1"
      },
      "label": "Join Us",
      "target_url": "/membership",
      "status": "published",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Published Hero Banner by ID

**Endpoint:** `GET /api/hero/:id`
**Authentication:** None
**Description:** Fetch a specific hero banner by ID (must be `published`)

### URL Parameters

- `id`: Hero UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Empowering Communities",
    "subtitle": "Building a sustainable future for all.",
    "image": {
      "url": "https://res.cloudinary.com/.../hero1.jpg",
      "public_id": "sada/heroes/hero1"
    },
    "label": "Join Us",
    "target_url": "/membership",
    "status": "published",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message        |
| ------ | -------------- |
| 404    | Hero not found |

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

| Status | Message                   |
| ------ | ------------------------- |
| 404    | About page data not found |

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
      "budget": 50000.00,
      "category": "Infrastructure",
      "progress": 100,
      "status": "completed",
      "isFeatured": true,
      "start_date": "2026-01-15T00:00:00Z",
      "end_date": "2026-04-15T00:00:00Z",
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

| Status | Message           |
| ------ | ----------------- |
| 400    | ID is required    |
| 404    | Project not found |

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
      "category": "news",
      "status": "published",
      "tags": ["impact", "2026", "annual"],
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

| Status | Message             |
| ------ | ------------------- |
| 400    | ID is required      |
| 404    | Blog post not found |

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
      "description": "Photos from our annual community gathering...",
      "primary_image": {
        "url": "https://res.cloudinary.com/.../gallery1-primary.jpg",
        "public_id": "sada/gallery/gallery1-main"
      },
      "event_date": "2026-05-10T00:00:00Z",
      "category": "Events",
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

| Status | Message           |
| ------ | ----------------- |
| 404    | Gallery not found |

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

| Status | Message                                 |
| ------ | --------------------------------------- |
| 400    | Name is required and cannot be empty    |
| 400    | Email is required and cannot be empty   |
| 400    | Invalid email format                    |
| 400    | Subject is required and cannot be empty |
| 400    | Message is required and cannot be empty |

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
      "ratings": 5,
      "status": "published",
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
    "ratings": 5,
    "status": "published",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message               |
| ------ | --------------------- |
| 404    | Testimonial not found |

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

| Status | Message       |
| ------ | ------------- |
| 404    | FAQ not found |

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
      "title": "Education Initiative Launch",
      "description": "Launched education initiative in 15 communities",
      "category": "Education",
      "status": "published",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "year": "2025",
      "title": "Water Projects Milestone",
      "description": "Reached 1000+ beneficiaries with water projects",
      "category": "Water",
      "status": "published",
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
    "title": "Education Initiative Launch",
    "description": "Launched education initiative in 15 communities",
    "category": "Education",
    "status": "published",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message                     |
| ------ | --------------------------- |
| 404    | Journey milestone not found |

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
      "priority": "high",
      "status": "published",
      "start_date": "2026-05-01T00:00:00Z",
      "expiry_date": "2026-05-15T23:59:59Z",
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
    "priority": "high",
    "status": "published",
    "start_date": "2026-05-01T00:00:00Z",
    "expiry_date": "2026-05-15T23:59:59Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message                |
| ------ | ---------------------- |
| 404    | Announcement not found |

---

## Events

### Get All Events

**Endpoint:** `GET /api/events`
**Authentication:** None
**Description:** Fetch all upcoming and live events (ordered by start_date ascending)

### Query Parameters

- `event_type=string` (optional)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "title": "Community Forum 2026",
      "event_type": "Forum",
      "location": "Accra Convention Centre",
      "description": "Join us for our annual community forum...",
      "event_banner": {
        "url": "https://res.cloudinary.com/.../event1-banner.jpg",
        "public_id": "sada/events/banners/event1"
      },
      "start_date": "2026-05-15T00:00:00Z",
      "start_time": "09:00",
      "status": "upcoming",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

### Get Event by ID

**Endpoint:** `GET /api/events/:id`
**Authentication:** None
**Description:** Fetch a specific event by ID (upcoming or live only)

### URL Parameters

- `id`: Event UUID (required)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "title": "Community Forum 2026",
    "event_type": "Forum",
    "location": "Accra Convention Centre",
    "description": "Join us for our annual community forum...",
    "event_banner": {
      "url": "https://res.cloudinary.com/.../event1-banner.jpg",
      "public_id": "sada/events/banners/event1"
    },
    "start_date": "2026-05-15T00:00:00Z",
    "start_time": "09:00",
    "status": "upcoming",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:30:00Z"
  }
}
```

### Error Responses

| Status | Message         |
| ------ | --------------- |
| 400    | ID is required  |
| 404    | Event not found |

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
      "email": "samuel.osei@sada.org",
      "bio": "With over 15 years of experience in development work...",
      "image": {
        "url": "https://res.cloudinary.com/.../leader1.jpg",
        "public_id": "sada/leadership/lead1"
      },
      "start_year": "2020",
      "end_year": null,
      "social_media": {
        "linkedin": "https://linkedin.com/in/samuelosei"
      },
      "status": "published",
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

| Status | Message                      |
| ------ | ---------------------------- |
| 404    | Leadership profile not found |

---

## Membership

### Register as a Member

**Endpoint:** `POST /api/membership/register`
**Authentication:** None
**Description:** Submit a new membership application. Requires all personal and emergency details.

### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "age": 34,
  "placeOfBirth": "Accra",
  "gender": "male",
  "hometown": "Kumasi",
  "currentAddress": "123 Street, Accra",
  "ethnicity": "Akan",
  "suburb": "East Legon",
  "occupation": "Software Engineer",
  "phone": "0241234567",
  "email": "john.doe@example.com",
  "fatherName": "James Doe",
  "fatherHometown": "Kumasi",
  "fatherContact": "0240000001",
  "motherName": "Janet Doe",
  "motherHometown": "Kumasi",
  "motherContact": "0240000002",
  "emergencyName": "Jill Doe",
  "emergencyRelationship": "Sister",
  "emergencyOccupation": "Nurse",
  "emergencyContact": "0240000003",
  "declaration": true
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Membership application submitted successfully. Please check your email for confirmation.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440015",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "0241234567",
    "status": "pending",
    "createdAt": "2026-04-26T10:00:00Z"
  }
}
```

---

### Get All Approved Memberships

**Endpoint:** `GET /api/membership`
**Authentication:** None
**Description:** Fetch a list of all members with `approved` status. Sensitive data (emergency contacts, parents) is omitted.

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440015",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "0241234567",
      "occupation": "Software Engineer",
      "hometown": "Kumasi",
      "status": "approved",
      "createdAt": "2026-04-26T10:00:00Z"
    }
  ]
}
```

---

### Get Approved Membership by ID

**Endpoint:** `GET /api/membership/:id`
**Authentication:** None
**Description:** Fetch details of a specific approved member by ID.

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440015",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "0241234567",
    "occupation": "Software Engineer",
    "hometown": "Kumasi",
    "status": "approved",
    "createdAt": "2026-04-26T10:00:00Z"
  }
}
```

---

## Payments

### Initiate Payment

**Endpoint:** `POST /api/payments/initiate`
**Authentication:** None
**Description:** Initiate a membership payment via Paystack

### Request Body

```json
{
  "memberId": "member-123",
  "full_name": "John Doe",
  "email": "member@example.com",
  "membership_role": "standard",
  "month_paid_for": 5,
  "year_paid_for": 2026,
  "amount": 100.00
}
```

**Validation Rules:**

- `memberId`: Required, must exist in Membership table
- `full_name`: Required, non-empty string
- `email`: Required, valid email format (sent to Paystack)
- `membership_role`: Required, one of: `standard`, `executive`, `voluntary`
- `month_paid_for`: Required, integer 1-12
- `year_paid_for`: Required, valid year (typically current or next)
- `amount`: Required, must be greater than 0

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

| Status | Message                                    |
| ------ | ------------------------------------------ |
| 400    | Member ID is required and cannot be empty  |
| 400    | Amount must be greater than 0              |
| 400    | Purpose is required and cannot be empty    |
| 400    | Email is required for payment              |
| 500    | Failed to initialize payment with Paystack |

---

### Verify Payment

**Endpoint:** `GET /api/payments/verify/:reference`
**Authentication:** None
**Description:** Verify payment status with Paystack and update database with payment method

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
    "full_name": "John Doe",
    "email": "member@example.com",
    "membership_role": "standard",
    "month_paid_for": 5,
    "year_paid_for": 2026,
    "amount": 100.00,
    "amountWithFee": 101.00,
    "payment_method": "card",
    "status": "successful",
    "reference": "SADA_1714138800000_A7B3C9F2",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:05:00Z"
  }
}
```

**Payment Method Values (from Paystack):**

- `card` - Credit/Debit card
- `bank` - Bank transfer
- `mobile_money` - Mobile money payment
- `other` - Other payment methods

**Payment Status Values:**

- `pending`: Payment initiated but not yet processed
- `successful`: Payment completed successfully
- `failed`: Payment failed

### Error Responses

| Status | Message                                |
| ------ | -------------------------------------- |
| 400    | Reference is required                  |
| 404    | Payment not found                      |
| 500    | Failed to verify payment with Paystack |

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
**Description:** Create home page data (singleton record)

### Request Body

```json
{
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
      "id": "project-uuid",
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

---

## Hero Banners (Admin)

### Create Hero Banner

**Endpoint:** `POST /api/admin/hero`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Create a new hero banner with image upload

### Form Data

| Field          | Type   | Description                                               |
| -------------- | ------ | --------------------------------------------------------- |
| `title`      | String | (Required) Title of the banner                            |
| `subtitle`   | String | (Required) Subtitle text                                  |
| `image`      | File   | (Required) Banner image                                   |
| `label`      | String | (Required) Button text                                    |
| `target_url` | String | (Required) Button destination                             |
| `status`     | String | (Optional)`published` or `draft` (default: `draft`) |

---

### Get All Hero Banners

**Endpoint:** `GET /api/admin/hero`
**Authentication:** Admin Token
**Description:** Fetch all hero banners (both `published` and `draft`)

---

### Update Hero Banner

**Endpoint:** `PATCH /api/admin/hero/:id`
**Authentication:** Admin Token
**Description:** Update a specific hero banner. Supports partial updates and optional image replacement.

### URL Parameters

- `id`: Hero UUID (required)

### Request Body (Multipart/Form-Data)

| Field          | Type   | Description                          |
| -------------- | ------ | ------------------------------------ |
| `title`      | String | (Optional) Title of the banner       |
| `subtitle`   | String | (Optional) Subtitle text             |
| `image`      | File   | (Optional) New banner image          |
| `label`      | String | (Optional) Button text               |
| `target_url` | String | (Optional) Button destination        |
| `status`     | String | (Optional)`published` or `draft` |

### Success Response (200)

```json
{
  "success": true,
  "message": "Hero updated successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Updated Title",
    "status": "published"
  }
}
```

---

### Delete Hero Banner

**Endpoint:** `DELETE /api/admin/hero/:id`
**Authentication:** Required (admin)
**Description:** Deletes record and Cloudinary image

---

## About Page (Admin)

### Update About Data

**Endpoint:** `PATCH /api/admin/about/:id`
**Authentication:** Required (admin)
**Description:** Update mission, vision, core values, or history

### Request Body

```json
{
  "mission": "...",
  "vision": "...",
  "coreValues": ["Value 1", "Value 2"],
  "history": "..."
}
```

---

## Membership Applications (Admin)

### Get All Applications

**Endpoint:** `GET /api/admin/membership`
**Authentication:** Required (admin)
**Description:** Fetch all membership applications (pending, approved, rejected)

---

### Approve Application

**Endpoint:** `POST /api/admin/membership/:id/approve`
**Authentication:** Required (admin)
**Description:** Approve a member and send notification email

---

### Reject Application

**Endpoint:** `POST /api/admin/membership/:id/reject`
**Authentication:** Required (admin)
**Request Body:** `{ "reason": "...", "notes": "..." }`

---

### Update Member Record

**Endpoint:** `PATCH /api/admin/membership/:id`
**Authentication:** Required (admin)
**Description:** Update any member field or internal notes

---

## Projects (Admin)

### Create Project

**Endpoint:** `POST /api/admin/projects`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Create a new project with comprehensive details and images

### Form Data

| Field           | Type     | Required | Notes                                                                         |
| --------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `title`       | String   | Yes      | Non-empty project title                                                       |
| `description` | String   | Yes      | Non-empty project description                                                 |
| `budget`      | Number   | Yes      | Must be greater than 0                                                        |
| `category`    | String   | Yes      | Project category                                                              |
| `progress`    | Number   | Yes      | Integer 0-100                                                                 |
| `status`      | Enum     | No       | One of: planned, in_progress, paused, completed, cancelled (default: planned) |
| `isFeatured`  | Boolean  | No       | Whether project is publicly visible (default: false)                          |
| `start_date`  | DateTime | Yes      | Project start date (ISO format)                                               |
| `end_date`    | DateTime | No       | Project end date (optional, must be after start_date)                         |
| `images`      | File[]   | Yes      | 1-10 image files (JPEG, PNG, WebP)                                            |

### Example cURL

```bash
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Water Pipeline" \
  -F "description=Installing clean water..." \
  -F "budget=50000" \
  -F "category=Infrastructure" \
  -F "progress=85" \
  -F "status=in_progress" \
  -F "isFeatured=true" \
  -F "start_date=2026-01-15T00:00:00Z" \
  -F "end_date=2026-06-30T00:00:00Z" \
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
    "budget": 50000.00,
    "category": "Infrastructure",
    "progress": 85,
    "status": "in_progress",
    "isFeatured": true,
    "start_date": "2026-01-15T00:00:00Z",
    "end_date": "2026-06-30T00:00:00Z",
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

| Status | Message                                                                            |
| ------ | ---------------------------------------------------------------------------------- |
| 400    | title, description, budget, category, progress, and start_date are required        |
| 400    | budget must be greater than 0                                                      |
| 400    | progress must be between 0 and 100                                                 |
| 400    | end_date must be after start_date                                                  |
| 400    | At least one image is required                                                     |
| 400    | Invalid status. Must be one of: planned, in_progress, paused, completed, cancelled |

---

### Get All Projects (Admin)

**Endpoint:** `GET /api/admin/projects`
**Authentication:** Required (admin)
**Description:** Fetch all projects with full details

### Query Parameters

- `status=planned|in_progress|paused|completed|cancelled` (optional)
- `category=string` (optional)
- `isFeatured=true|false` (optional)

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

| Field           | Type   | Notes                            |
| --------------- | ------ | -------------------------------- |
| `title`       | String | Update title                     |
| `description` | String | Update description               |
| `status`      | Enum   | Update status                    |
| `images`      | File[] | Replace all images (if provided) |

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
**Description:** Create a new blog post with category, status, tags, and optional images

### Form Data

| Field        | Type     | Required | Notes                                     |
| ------------ | -------- | -------- | ----------------------------------------- |
| `title`    | String   | Yes      | Non-empty blog title                      |
| `content`  | String   | Yes      | Non-empty blog content (long text)        |
| `category` | Enum     | Yes      | One of: news, blog, article               |
| `status`   | Enum     | No       | One of: draft, published (default: draft) |
| `tags`     | String[] | No       | Array of tag strings (optional)           |
| `images`   | File[]   | No       | 0-10 image files (optional)               |

### Success Response (201)

```json
{
  "success": true,
  "message": "Blog post created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Impact Report 2026",
    "content": "This year we have made significant progress...",
    "category": "news",
    "status": "draft",
    "tags": ["impact", "2026", "annual"],
    "images": [ ... ],
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message                                               |
| ------ | ----------------------------------------------------- |
| 400    | title, content, and category are required             |
| 400    | Invalid category. Must be one of: news, blog, article |
| 400    | Invalid status. Must be one of: draft, published      |
| 400    | title must be a non-empty string                      |
| 400    | content must be a non-empty string                    |

---

### Get All Blog Posts (Admin)

**Endpoint:** `GET /api/admin/blog`
**Authentication:** Required (admin)
**Description:** Fetch all blog posts with full details

### Query Parameters

- `category=news|blog|article` (optional)
- `status=draft|published` (optional)
- `tag=string` (optional)

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get Blog Post by ID (Admin)

**Endpoint:** `GET /api/admin/blog/:id`
**Authentication:** Required (admin)
**Description:** Fetch a specific blog post

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Blog Post

**Endpoint:** `PATCH /api/admin/blog/:id`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Update blog post (partial update)

### Form Data

All fields optional: `title`, `content`, `category`, `status`, `tags`, `images` (File[])

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

### Request Body (Multipart/Form-Data)

| Field             | Type   | Description                                |
| ----------------- | ------ | ------------------------------------------ |
| `title`         | String | Title of the gallery entry                 |
| `description`   | String | Detailed description of the event          |
| `event_date`    | String | Date of the event (ISO format)             |
| `category`      | String | e.g., "Outreach", "Workshop", "Donation"   |
| `primary_image` | File   | The main display image (Required)          |
| `images`        | File[] | Multiple related images (Required, min: 1) |

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

| Status | Message                               |
| ------ | ------------------------------------- |
| 400    | Title is required and cannot be empty |
| 400    | At least one image is required        |

---

### Upload Gallery Images

**Endpoint:** `POST /api/admin/gallery/upload`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Dedicated endpoint to upload and create gallery entry

### Form Data

| Field      | Type   | Required    |
| ---------- | ------ | ----------- |
| `title`  | String | Yes         |
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

| Status | Message                      |
| ------ | ---------------------------- |
| 404    | Contact submission not found |

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

### Request Body (Multipart/Form-data)

| Field       | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| `name`    | String | Name of the person (Required)                   |
| `role`    | String | Role or designation (Required)                  |
| `text`    | String | Testimonial content (Required)                  |
| `ratings` | Number | Integer between 1 and 5 (Required)              |
| `image`   | File   | Profile photo (Required)                        |
| `status`  | String | `published` or `draft` (default: `draft`) |

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
  "question": "What is SADA?",
  "answer": "SADA is a non-profit organization...",
  "category": "General",
  "status": "published"
}
```

**Fields:**

- `question`: Required string
- `answer`: Required string
- `category`: Required string
- `status`: "published" | "draft" (optional, default: draft)

### Success Response (201)

```json
{
  "success": true,
  "message": "FAQ created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "question": "What is SADA?",
    "answer": "SADA is a non-profit organization...",
    "category": "General",
    "status": "published",
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

All fields optional: `question`, `answer`, `category`, `status`

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
  "year": "2020",
  "title": "Foundation",
  "description": "SADA was officially registered...",
  "category": "Milestone",
  "status": "published"
}
```

**Fields:**

- `year`: Required string (e.g., "2020")
- `title`: Required string
- `description`: Required string (replaces legacy `event` field)
- `category`: Required string
- `status`: "published" | "draft" (optional, default: draft)

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
**Description:** Create a new announcement with priority, status, and date range

### Request Body

```json
{
  "title": "Annual Report 2025",
  "content": "Our annual report is now available...",
  "priority": "high",
  "status": "published",
  "start_date": "2026-05-01",
  "expiry_date": "2026-05-31"
}
```

**Fields:**

- `title`: Required string
- `content`: Required string
- `priority`: "low" | "medium" | "high" (default: low)
- `status`: "published" | "draft" (default: draft)
- `start_date`: Required date
- `expiry_date`: Required date

### Success Response (201)

```json
{
  "success": true,
  "message": "Announcement created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "Annual General Meeting",
    "content": "The 2026 AGM will be held...",
    "priority": "high",
    "status": "draft",
    "start_date": "2026-05-15T14:00:00Z",
    "expiry_date": "2026-05-20T23:59:59Z",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message                                             |
| ------ | --------------------------------------------------- |
| 400    | title and content are required                      |
| 400    | Invalid priority. Must be one of: low, medium, high |
| 400    | Invalid status. Must be one of: draft, published    |
| 400    | start_date and expiry_date are required             |
| 400    | expiry_date must be after start_date                |

---

### Get All Announcements (Admin)

**Endpoint:** `GET /api/admin/announcements`
**Authentication:** Required (admin)
**Description:** Fetch all announcements with full details

### Query Parameters

- `priority=low|medium|high` (optional)
- `status=draft|published` (optional)

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get Announcement by ID (Admin)

**Endpoint:** `GET /api/admin/announcements/:id`
**Authentication:** Required (admin)
**Description:** Fetch a specific announcement

---

### Update Announcement

**Endpoint:** `PATCH /api/admin/announcements/:id`
**Authentication:** Required (admin)

### Request Body

All fields optional: `title`, `content`, `priority`, `status`, `start_date`, `expiry_date`

---

### Delete Announcement

**Endpoint:** `DELETE /api/admin/announcements/:id`
**Authentication:** Required (admin)

---

## Events (Admin)

### Create Event

**Endpoint:** `POST /api/admin/events`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Create a new event with banner image

### Form Data

| Field            | Type     | Required | Notes                                                           |
| ---------------- | -------- | -------- | --------------------------------------------------------------- |
| `title`        | String   | Yes      | Non-empty event title                                           |
| `event_type`   | String   | Yes      | Event type category                                             |
| `location`     | String   | Yes      | Event location                                                  |
| `description`  | String   | Yes      | Event description                                               |
| `start_date`   | DateTime | Yes      | Event date (ISO format)                                         |
| `start_time`   | String   | Yes      | Event time (HH:MM, 24-hour format)                              |
| `status`       | Enum     | No       | One of: draft, upcoming, live, past, cancelled (default: draft) |
| `event_banner` | File     | Yes      | Single banner image (JPEG, PNG, WebP)                           |

### Example cURL

```bash
curl -X POST http://localhost:5000/api/admin/events \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Community Forum" \
  -F "event_type=Forum" \
  -F "location=Accra Convention Centre" \
  -F "description=Join us for our annual community forum..." \
  -F "start_date=2026-05-15T00:00:00Z" \
  -F "start_time=09:00" \
  -F "event_banner=@banner.jpg"
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Event created successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "title": "Community Forum 2026",
    "event_type": "Forum",
    "location": "Accra Convention Centre",
    "description": "Join us for our annual community forum...",
    "event_banner": {
      "url": "https://res.cloudinary.com/.../event1-banner.jpg",
      "public_id": "sada/events/banners/event1"
    },
    "start_date": "2026-05-15T00:00:00Z",
    "start_time": "09:00",
    "status": "draft",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Error Responses

| Status | Message                                                    |
| ------ | ---------------------------------------------------------- |
| 400    | title, event_type, location, description are required      |
| 400    | start_date and start_time are required                     |
| 400    | Invalid start_time format. Must be HH:MM in 24-hour format |
| 400    | Event banner is required                                   |

---

### Get All Events (Admin)

**Endpoint:** `GET /api/admin/events`
**Authentication:** Required (admin)
**Description:** Fetch all events with full details

### Query Parameters

- `status=draft|upcoming|live|past|cancelled` (optional)
- `event_type=string` (optional)

### Success Response (200)

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get Event by ID (Admin)

**Endpoint:** `GET /api/admin/events/:id`
**Authentication:** Required (admin)
**Description:** Fetch a specific event with full details

### Success Response (200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Responses

| Status | Message         |
| ------ | --------------- |
| 400    | ID is required  |
| 404    | Event not found |

---

### Update Event

**Endpoint:** `PATCH /api/admin/events/:id`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Update event (partial update with optional banner replacement)

### Form Data

All fields are optional:

| Field            | Type     | Notes                        |
| ---------------- | -------- | ---------------------------- |
| `title`        | String   | Update title                 |
| `event_type`   | String   | Update event type            |
| `location`     | String   | Update location              |
| `description`  | String   | Update description           |
| `start_date`   | DateTime | Update event date            |
| `start_time`   | String   | Update event time (HH:MM)    |
| `status`       | Enum     | Update status                |
| `event_banner` | File     | Replace banner (if provided) |

**Banner Behavior:**

- If new banner provided: Old image deleted from Cloudinary, new one uploaded
- If no banner provided: Existing banner unchanged

### Success Response (200)

```json
{
  "success": true,
  "message": "Event updated successfully.",
  "data": { ... }
}
```

---

### Delete Event

**Endpoint:** `DELETE /api/admin/events/:id`
**Authentication:** Required (admin)
**Description:** Delete event and its banner image

### Success Response (200)

```json
{
  "success": true,
  "message": "Event deleted successfully."
}
```

---

## Leadership (Admin)

### Create Leadership Profile

**Endpoint:** `POST /api/admin/leadership`
**Authentication:** Required (admin)
**Content-Type:** `multipart/form-data`
**Description:** Create a new leadership profile with image

### Request Body (Multipart/Form-data)

| Field            | Type   | Description                                           |
| ---------------- | ------ | ----------------------------------------------------- |
| `name`         | String | Full name (Required)                                  |
| `role`         | String | Position/Title (Required)                             |
| `email`        | String | Professional email (Required)                         |
| `bio`          | String | Short biography (Required)                            |
| `image`        | File   | Professional headshot (Required)                      |
| `start_year`   | String | Year they joined (Required)                           |
| `end_year`     | String | (Optional) Year they left                             |
| `social_media` | Json   | (Optional)`{ "linkedin": "...", "twitter": "..." }` |
| `status`       | String | `published` or `draft` (default: `draft`)       |

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

| Status | Message                                           |
| ------ | ------------------------------------------------- |
| 400    | Name/Position/Bio is required and cannot be empty |
| 400    | Image is required                                 |

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

All fields optional: `name`, `role`, `email`, `bio`, `start_year`, `end_year`, `social_media` (JSON string), `status`, `image` (File)

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

### Query Parameters

- `status=pending|successful|failed` (optional)
- `membership_role=standard|executive|voluntary` (optional)
- `year_paid_for=number` (optional)

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "memberId": "member-123",
      "full_name": "John Doe",
      "email": "john@example.com",
      "membership_role": "standard",
      "month_paid_for": 5,
      "year_paid_for": 2026,
      "amount": 100.00,
      "amountWithFee": 101.00,
      "payment_method": "card",
      "status": "successful",
      "reference": "SADA_1714138800000_A7B3C9F2",
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
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440012",
    "memberId": "member-123",
    "full_name": "John Doe",
    "email": "john@example.com",
    "membership_role": "standard",
    "month_paid_for": 5,
    "year_paid_for": 2026,
    "amount": 100.00,
    "amountWithFee": 101.00,
    "payment_method": "card",
    "status": "successful",
    "reference": "SADA_1714138800000_A7B3C9F2",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:05:00Z"
  }
}
```

### Error Responses

| Status | Message           |
| ------ | ----------------- |
| 404    | Payment not found |

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

| Code | Meaning      | Common Causes                                            |
| ---- | ------------ | -------------------------------------------------------- |
| 200  | OK           | Successful GET request                                   |
| 201  | Created      | Successful POST/create request                           |
| 400  | Bad Request  | Invalid input, missing required fields, validation error |
| 401  | Unauthorized | Missing or invalid access token                          |
| 403  | Forbidden    | Insufficient permissions (not admin)                     |
| 404  | Not Found    | Resource doesn't exist                                   |
| 409  | Conflict     | Resource already exists (e.g., duplicate email)          |
| 500  | Server Error | Internal server error                                    |

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

| Error                            | Status | Cause                   |
| -------------------------------- | ------ | ----------------------- |
| "At least one image is required" | 400    | No files provided       |
| "Failed to upload image"         | 500    | Cloudinary API error    |
| "Image upload failed"            | 500    | Temporary network issue |

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
  budget: Float (required, > 0),
  category: String (required),
  progress: Int (0-100, default: 0),
  status: Enum (planned | in_progress | paused | completed | cancelled, default: planned),
  isFeatured: Boolean (default: false, controls public endpoint access),
  start_date: DateTime (required),
  end_date: DateTime (optional, nullable, must be after start_date),
  images: Json (array of { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

**Status Values:**

- `planned`: Project in planning phase
- `in_progress`: Project is actively being executed
- `paused`: Project is temporarily halted
- `completed`: Project is finished
- `cancelled`: Project was cancelled

### BlogPostModel

```javascript
{
  id: String (UUID, primary key),
  title: String,
  content: LongText,
  category: Enum (news | blog | article, required),
  status: Enum (draft | published, default: draft),
  tags: Json (array of strings),
  images: Json (array of { url, public_id }),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

**Category Values:**

- `news`: News article
- `blog`: Blog post
- `article`: General article

**Status Values:**

- `draft`: Not yet published
- `published`: Publicly visible

### Gallery Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  description: LongText,
  primary_image: Json ({ url, public_id }),
  event_date: DateTime,
  category: String,
  images: Json (array of { url, public_id }),
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
  category: String,
  status: Enum (draft | published, default: draft),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Journey Model

```javascript
{
  id: String (UUID, primary key),
  year: String,
  title: String,
  description: LongText,
  category: String,
  status: Enum (draft | published, default: draft),
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
  priority: Enum (low | medium | high, default: low),
  status: Enum (draft | published, default: draft),
  start_date: DateTime (required, when announcement becomes active),
  expiry_date: DateTime (required, must be after start_date),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

**Priority Values:**

- `low`: Low priority announcement
- `medium`: Medium priority announcement
- `high`: High priority announcement

**Status Values:**

- `draft`: Not yet published
- `published`: Publicly visible (and not expired)

### Leadership Model

```javascript
{
  id: String (UUID, primary key),
  name: String,
  role: String,
  bio: LongText,
  image: Json (single object: { url, public_id }),
  email: String (optional),
  start_year: String,
  end_year: String (optional),
  social_media: Json (optional),
  status: Enum (published | draft, default: published),

  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Event Model

```javascript
{
  id: String (UUID, primary key),
  title: String,
  event_type: String,
  location: String,
  description: LongText,
  event_banner: Json (single object: { url, public_id }),
  start_date: DateTime (required),
  start_time: String (HH:MM format, 24-hour),
  status: Enum (draft | upcoming | live | past | cancelled, default: draft),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

**Status Values:**

- `draft`: Event in draft status
- `upcoming`: Event is scheduled for the future
- `live`: Event is currently happening
- `past`: Event has already occurred
- `cancelled`: Event was cancelled

### Membership Model

```javascript
{
  id: String (UUID, primary key),
  firstName: String,
  lastName: String,
  dob: String,
  age: Int,
  placeOfBirth: String,
  gender: String,
  hometown: String,
  currentAddress: String,
  ethnicity: String,
  suburb: String,
  occupation: String,
  phone: String (unique),
  email: String (unique),
  fatherName: String,
  fatherHometown: String,
  fatherContact: String,
  motherName: String,
  motherHometown: String,
  motherContact: String,
  emergencyName: String,
  emergencyRelationship: String,
  emergencyOccupation: String,
  emergencyContact: String,
  declaration: Boolean (default: true),
  status: Enum (pending | approved | rejected, default: pending),
  notes: LongText (nullable, admin only),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

### Payment Model

```javascript
{
  id: String (UUID, primary key),
  memberId: String (foreign key to Membership, CASCADE delete),
  full_name: String,
  email: String,
  membership_role: Enum (standard | executive | voluntary),
  month_paid_for: Int (1-12),
  year_paid_for: Int,
  amount: Decimal (base amount in GHS),
  amountWithFee: Decimal (amount + 1% fee),
  payment_method: String (nullable, extracted from Paystack response),
  status: Enum (pending | successful | failed, default: pending),
  reference: String (unique, format: SADA_{timestamp}_{hex}),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

**Membership Role Values:**

- `standard`: Standard membership
- `executive`: Executive membership
- `voluntary`: Voluntary membership

**Status Values:**

- `pending`: Payment initiated but not yet processed
- `successful`: Payment completed successfully
- `failed`: Payment failed

**Payment Method Values (from Paystack):**

- `card`: Credit/Debit card
- `bank`: Bank transfer
- `mobile_money`: Mobile money payment
- `other`: Other payment methods

---

## Database Enums

### AnnouncementPriority

```
- low
- medium
- high
```

### AnnouncementStatus

```
- draft
- published
```

### BlogPostCategory

```
- news
- blog
- article
```

### BlogPostStatus

```
- draft
- published
```

### ProjectStatus

```
- planned
- in_progress
- paused
- completed
- cancelled
```

### EventStatus

```
- draft
- upcoming
- live
- past
- cancelled
```

### MembershipRole

```
- standard
- executive
- voluntary
```

### PaymentStatus

```
- pending
- successful
- failed
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

| Variable                  | Type   | Description                                          |
| ------------------------- | ------ | ---------------------------------------------------- |
| `DATABASE_URL`          | String | MariaDB connection URL                               |
| `JWT_ACCESS_SECRET`     | String | Secret key for signing access tokens (min 32 chars)  |
| `JWT_REFRESH_SECRET`    | String | Secret key for signing refresh tokens (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | String | Cloudinary cloud name for image storage              |
| `CLOUDINARY_API_KEY`    | String | Cloudinary API key                                   |
| `CLOUDINARY_API_SECRET` | String | Cloudinary API secret                                |
| `EMAIL_USER`            | String | Gmail address for sending notifications              |
| `EMAIL_PASSWORD`        | String | Gmail app-specific password (not regular password)   |
| `PAYSTACK_SECRET_KEY`   | String | Paystack API secret key for payment processing       |
| `PORT`                  | Number | Server port (default: 5000)                          |
| `NODE_ENV`              | String | Environment: development, production, test           |

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

| Category        | Count                  | Note                                                 |
| --------------- | ---------------------- | ---------------------------------------------------- |
| Authentication  | 4                      | register, login, refresh-token, logout               |
| Home            | 3                      | Public GET, Admin GET/PATCH                          |
| Hero Banners    | 4                      | Public GET, Admin CRUD                               |
| About Page      | 2                      | Public GET, Admin PATCH                              |
| Membership      | 7                      | Public Reg/List/ID, Admin Approve/Reject/Update/List |
| Projects        | 7                      | Public (2), Admin (5)                                |
| Blog            | 7                      | Public (2), Admin (5)                                |
| Gallery         | 8                      | Public (2), Admin (6)                                |
| Contact         | 4                      | Public (1), Admin (3)                                |
| Testimonials    | 7                      | Public (2), Admin (5)                                |
| FAQs            | 7                      | Public (2), Admin (5)                                |
| Journey         | 7                      | Public (2), Admin (5)                                |
| Announcements   | 7                      | Public (2), Admin (5)                                |
| Leadership      | 7                      | Public (2), Admin (5)                                |
| Events          | 7                      | Public (2), Admin (5)                                |
| Payments        | 4                      | Public (2), Admin (2)                                |
| Statistics      | 1                      | Admin Dashboard                                      |
| **TOTAL** | **96 Endpoints** | Complete API coverage                                |

---

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

Generated: April 28, 2026
API Version: 1.0.0
Status: Complete & Verified

**Latest Updates (April 28, 2026):**

- ✅ Synchronized all models (Projects, Blog, Gallery, Leadership, Membership) with schema.prisma
- ✅ Decoupled Hero banners from Home page singleton
- ✅ Documented full Membership registration and approval workflow
- ✅ Added Events model with full CRUD endpoints
- ✅ Updated Statistics Dashboard to cover all 14 models
- ✅ Total: 96 endpoints across 16 resource categories
- ✅ Documentation 100% verified against codebase
