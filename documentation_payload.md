# API Documentation Payload

This document outlines the API endpoints, request bodies, and response bodies for all features on both the website and the admin dashboard. The admin dashboard is used to manage the website, so each feature on the website has a corresponding section in the admin dashboard.

---

## 1. Home Page
### Website
- **Endpoint**: `GET /api/home`
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "hero": {
      "title": "string",
      "subtitle": "string",
      "image": "string"
    },
    "statistics": [
      { "label": "string", "value": "string" }
    ],
    "featuredProjects": [
      { "id": "string", "title": "string", "description": "string", "image": "string" }
    ]
  }
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/home`
- **Request Body**:
  ```json
  {
    "hero": {
      "title": "string",
      "subtitle": "string",
      "image": "string"
    },
    "statistics": [
      { "label": "string", "value": "string" }
    ],
    "featuredProjects": [
      { "id": "string", "title": "string", "description": "string", "image": "string" }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Home page updated successfully."
  }
  ```

---

## 2. About Page
### Website
- **Endpoint**: `GET /api/about`
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "mission": "string",
    "vision": "string",
    "coreValues": ["string"],
    "history": "string",
    "membership": {
      "benefits": ["string"],
      "requirements": ["string"]
    }
  }
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/about`
- **Request Body**:
  ```json
  {
    "mission": "string",
    "vision": "string",
    "coreValues": ["string"],
    "history": "string",
    "membership": {
      "benefits": ["string"],
      "requirements": ["string"]
    }
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "About page updated successfully."
  }
  ```

---

## 3. Projects
### Website
- **Endpoint**: `GET /api/projects`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "string",
      "images": ["string"]
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/projects`
- **Request Body**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "images": ["string"]
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Project updated successfully."
  }
  ```

---

## 4. Blog
### Website
- **Endpoint**: `GET /api/blog`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "author": "string",
      "date": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/blog`
- **Request Body**:
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "author": "string",
    "date": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Blog post updated successfully."
  }
  ```

---

## 5. Gallery
### Website
- **Endpoint**: `GET /api/gallery`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "image": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/gallery`
- **Request Body**:
  ```json
  {
    "id": "string",
    "title": "string",
    "image": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Gallery updated successfully."
  }
  ```

---

## 6. Contact
### Website
- **Endpoint**: `POST /api/contact`
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Thank you for contacting us."
  }
  ```

### Admin Dashboard
- **Endpoint**: `GET /api/admin/contact`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "subject": "string",
      "message": "string",
      "date": "string"
    }
  ]
  ```

---

## 7. Testimonials
### Website
- **Endpoint**: `GET /api/testimonials`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "role": "string",
      "text": "string",
      "image": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/testimonials`
- **Request Body**:
  ```json
  {
    "id": "string",
    "name": "string",
    "role": "string",
    "text": "string",
    "image": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Testimonial updated successfully."
  }
  ```

---

## 8. FAQs
### Website
- **Endpoint**: `GET /api/faqs`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "question": "string",
      "answer": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/faqs`
- **Request Body**:
  ```json
  {
    "id": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "FAQ updated successfully."
  }
  ```

---

## 9. Journey
### Website
- **Endpoint**: `GET /api/journey`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "year": "string",
      "event": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/journey`
- **Request Body**:
  ```json
  {
    "id": "string",
    "year": "string",
    "event": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Journey updated successfully."
  }
  ```

---

## 10. Announcements
### Website
- **Endpoint**: `GET /api/announcements`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "date": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/announcements`
- **Request Body**:
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "date": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Announcement updated successfully."
  }
  ```

---

## 11. Leadership
### Website
- **Endpoint**: `GET /api/leadership`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "position": "string",
      "bio": "string",
      "image": "string"
    }
  ]
  ```

### Admin Dashboard
- **Endpoint**: `POST /api/admin/leadership`
- **Request Body**:
  ```json
  {
    "id": "string",
    "name": "string",
    "position": "string",
    "bio": "string",
    "image": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Leadership profile updated successfully."
  }
  ```

---

## 12. Payments
### Website
- **Endpoint**: `POST /api/payments`
- **Request Body**:
  ```json
  {
    "memberId": "string",
    "amount": "number",
    "purpose": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Payment processed successfully."
  }
  ```

### Admin Dashboard
- **Endpoint**: `GET /api/admin/payments`
- **Request Body**: None
- **Response Body**:
  ```json
  [
    {
      "id": "string",
      "memberId": "string",
      "amount": "number",
      "purpose": "string",
      "status": "string",
      "date": "string"
    }
  ]
  ```

---

## 13. Gallery Uploads
### Admin Dashboard
- **Endpoint**: `POST /api/admin/gallery/upload`
- **Request Body**:
  ```json
  {
    "title": "string",
    "image": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully."
  }
  ```

---

This document provides a comprehensive overview of the API endpoints for managing the website and admin dashboard features. Each feature is designed to ensure seamless integration and management.