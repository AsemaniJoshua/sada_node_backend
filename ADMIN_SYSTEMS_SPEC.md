# SADA Admin Systems - Full Technical Specification

This document contains the complete technical specification for administrative integration. Every endpoint follows a consistent structure with standard pagination and error handling.

---

## 1. Authentication & Profile Management

### Change Password
Allows an authenticated admin to update their password.
*   **Request Method:** `PATCH`
*   **Endpoint:** `/api/auth/change-password`
*   **Auth:** Admin Token Required
*   **Request Body:**
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-secure-password",
  "confirmNewPassword": "new-secure-password"
}
```

**Full Response Body:**
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

## 2. Admin Activity Logs (Audit Trail)
Tracks every administrative action for accountability.

### Get All Activities
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/activity`
*   **Query Params:** `page`, `limit`, `action` (create/update/delete/approve/reject), `logType`
*   **Auth:** Admin Token Required

**Full Response Body:**
```json
{
  "success": true,
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "totalPages": 25
  },
  "data": [
    {
      "id": "uuid",
      "action": "delete",
      "logType": "Blog",
      "entity": "BlogPost",
      "description": "Deleted blog post: Summer Gala",
      "admin": {
        "name": "Super Admin",
        "email": "admin@sada.com"
      },
      "createdAt": "2024-05-14T10:00:00Z"
    }
  ]
}
```

---

## 3. Bulk Communication Suite
Direct broadcasting to segments via Email and SMS.

### Target Options (Valid for both Email & SMS):
*   `all_approved`: All members with "approved" status.
*   `all_pending`: All members awaiting approval.
*   `all_admins`: All system administrators.
*   `specific_member`: Requires `targetId` (Membership ID).
*   `specific_admin`: Requires `targetId` (User ID).

### Send Bulk Email
*   **Request Method:** `POST`
*   **Endpoint:** `/api/admin/communication/email`
*   **Request Body:**
```json
{
  "target": "all_approved",
  "subject": "Important Meeting Notice",
  "message": "Dear members, please join us this Sunday..."
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "Email successfully sent to 45 recipients."
}
```

### Send Bulk SMS
*   **Request Method:** `POST`
*   **Endpoint:** `/api/admin/communication/sms`
*   **Request Body:**
```json
{
  "target": "all_pending",
  "message": "SADA: Your application is being reviewed. Check your email for updates."
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "SMS successfully sent to 12 recipients.",
  "data": { "status": "success", "message_id": "9988..." }
}
```

---

## 4. Communication History
Audit logs for every broadcast message sent.

### Get Communication History
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/communication/history`
*   **Query Params:** `page`, `limit`, `type` (email/sms)

**Full Response Body:**
```json
{
  "success": true,
  "pagination": { "total": 20, "page": 1, "limit": 50, "totalPages": 1 },
  "data": [
    {
      "id": "uuid",
      "type": "email",
      "target": "all_approved",
      "recipientCount": 45,
      "subject": "Meeting Notice",
      "message": "Dear members...",
      "admin": { "name": "Admin User" },
      "createdAt": "2024-05-14T11:00:00Z"
    }
  ]
}
```

---

## 5. Admin Notification Inbox
Real-time alerts for system events and critical deletions.

### Get All Notifications
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/notifications`
*   **Query Params:** `page`, `limit`, `isRead` (true/false)

**Full Response Body:**
```json
{
  "success": true,
  "pagination": { "total": 15, "page": 1, "limit": 50, "totalPages": 1 },
  "data": [
    {
      "id": "uuid",
      "title": "New Membership Application!",
      "body": "Ama Serwaa has applied.",
      "url": "/admin/membership/uuid",
      "isRead": false,
      "createdAt": "2024-05-14T12:00:00Z"
    }
  ]
}
```

### Mark All as Read
*   **Request Method:** `PATCH`
*   **Endpoint:** `/api/admin/notifications/mark-all-read`

**Full Response Body:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 6. General Data Management (Paginated)
Standard format for all data list endpoints.

### Get All Memberships
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/memberships`
*   **Query Params:** `page`, `limit`, `status` (pending/approved/rejected)

**Full Response Body:**
```json
{
  "success": true,
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 50,
    "totalPages": 10
  },
  "data": [
    { "id": "uuid", "firstName": "Joshua", "status": "approved", "createdAt": "..." }
  ]
}
```

### Get All Blog Posts
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/blogs`
*   **Query Params:** `page`, `limit`, `category`, `status`, `tag`

**Full Response Body:**
```json
{
  "success": true,
  "pagination": { "total": 80, "page": 1, "limit": 50, "totalPages": 2 },
  "data": [
    { "id": "uuid", "title": "Summer Gala", "status": "published" }
  ]
}
```
