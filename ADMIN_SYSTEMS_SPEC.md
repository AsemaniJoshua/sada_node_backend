# SADA Admin Systems - Frontend Integration Spec

This document provides the full technical specification for the Admin Activity Logs, Bulk Communications, and the Admin Notification Inbox.

---

## 1. Admin Activity Logs
Tracks all administrative mutations (Create, Update, Delete, Approve, Reject).

### Get All Activities
*   **Method:** `GET`
*   **Endpoint:** `/api/admin/activity`
*   **Auth:** Admin Token Required
*   **Query Parameters:**
    *   `page`: (Optional) Page number (default: 1)
    *   `limit`: (Optional) Records per page (default: 50)
    *   `action`: (Optional) Filter by `create` | `update` | `delete` | `approve` | `reject`
    *   `logType`: (Optional) Filter by category (e.g., `Blog`, `Events`, `Membership`)

**Full Response Body:**
```json
{
  "success": true,
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  },
  "data": [
    {
      "id": "uuid-string",
      "userId": "admin-uuid",
      "action": "create",
      "logType": "Blog",
      "entity": "BlogPost",
      "entityId": "post-uuid",
      "description": "Created blog post: My Summer Trip",
      "metadata": { "title": "My Summer Trip", "status": "published" },
      "createdAt": "2024-05-11T10:00:00Z",
      "admin": {
        "id": "admin-uuid",
        "name": "John Doe",
        "email": "admin@sada.com",
        "role": "admin",
        "image": null
      }
    }
  ]
}
```

---

## 2. Bulk Communication System
Allows admins to broadcast messages and track their history.

### Send System Email
*   **Method:** `POST`
*   **Endpoint:** `/api/admin/communication/email`
*   **Request Body:**
```json
{
  "target": "all_approved", 
  "subject": "System Update",
  "message": "Hello everyone, we have a new update..."
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "Email successfully sent to 25 recipients."
}
```

### Send System SMS
*   **Method:** `POST`
*   **Endpoint:** `/api/admin/communication/sms`
*   **Request Body:**
```json
{
  "target": "all_approved",
  "message": "SADA: Your application has been processed. Check your email."
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "SMS successfully sent to 25 recipients.",
  "data": {
    "status": "success",
    "main_msg": "Message Sent Successfully",
    "message_id": "12345..."
  }
}
```

### Get Communication History
*   **Method:** `GET`
*   **Endpoint:** `/api/admin/communication/history`
*   **Query Params:** `page`, `limit`, `type` (email/sms)

**Full Response Body:**
```json
{
  "success": true,
  "pagination": { "total": 10, "page": 1, "limit": 50, "totalPages": 1 },
  "data": [
    {
      "id": "uuid",
      "type": "email",
      "target": "all_approved",
      "recipientCount": 25,
      "subject": "System Update",
      "message": "Hello everyone...",
      "adminId": "admin-uuid",
      "createdAt": "2024-05-14T12:00:00Z",
      "admin": {
        "id": "admin-uuid",
        "name": "Admin Name",
        "email": "admin@sada.com"
      }
    }
  ]
}
```

### Get History Item by ID
*   **Method:** `GET`
*   **Endpoint:** `/api/admin/communication/history/:id`

**Full Response Body:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "sms",
    "target": "specific_member",
    "recipientCount": 1,
    "message": "Your membership is approved",
    "admin": { "name": "Admin Name", "email": "admin@sada.com" },
    "createdAt": "2024-05-14T12:05:00Z"
  }
}
```

### Delete History Item
*   **Method:** `DELETE`
*   **Endpoint:** `/api/admin/communication/history/:id`

**Full Response Body:**
```json
{
  "success": true,
  "message": "Communication history record deleted successfully"
}
```

---

## 3. Admin Notification Inbox
A history of system alerts (e.g., new registrations, contact forms, deletions, and bulk messages sent).

### Get All Notifications
*   **Method:** `GET`
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
      "body": "Joshua Asemani has applied.",
      "url": "/admin/membership/uuid",
      "isRead": false,
      "createdAt": "2024-05-14T08:00:00Z"
    }
  ]
}
```

### Status Management
*   **Mark as Read:** `PATCH /api/admin/notifications/:id/read`
*   **Mark as Unread:** `PATCH /api/admin/notifications/:id/unread`
*   **Mark ALL as Read:** `PATCH /api/admin/notifications/mark-all-read`

**Full Response Body:**
```json
{
  "success": true,
  "message": "Notification status updated successfully"
}
```

---

## 4. Web Push Registration
Endpoints to register browser push tokens.

### Subscribe (Opt-in)
*   **Method:** `POST`
*   **Endpoint:** `/api/notifications/subscribe`
*   **Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "key-string",
    "auth": "auth-string"
  }
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "Successfully subscribed to push notifications"
}
```
