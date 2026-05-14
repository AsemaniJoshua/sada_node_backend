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
Allows admins to broadcast messages via Email and SMS.

### Send System Email
*   **Method:** `POST`
*   **Endpoint:** `/api/admin/communication/email`
*   **Auth:** Admin Token Required
*   **Request Body:**
```json
{
  "target": "all_approved", 
  "subject": "System Update",
  "message": "Hello everyone, we have a new update regarding our next meeting."
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "Email successfully sent to 25 recipients."
}
```

### Send System SMS (Arkesel v2)
*   **Method:** `POST`
*   **Endpoint:** `/api/admin/communication/sms`
*   **Auth:** Admin Token Required
*   **Request Body:**
```json
{
  "target": "specific_member",
  "targetId": "member-uuid",
  "message": "SADA: Your membership application has been approved. Welcome!"
}
```
**Full Response Body:**
```json
{
  "success": true,
  "message": "SMS successfully sent to 1 recipients.",
  "data": {
    "status": "success",
    "main_msg": "Message Sent Successfully",
    "message_id": "987654321"
  }
}
```

### Available Targets (`target` field):
*   `all_approved`: Every member with "approved" status. (No `targetId` needed)
*   `all_pending`: Every member with "pending" status. (No `targetId` needed)
*   `all_admins`: Every system user with "admin" role. (No `targetId` needed)
*   `specific_member`: Target a single member by their ID. (**Requires** `targetId`)
*   `specific_admin`: Target a single admin user by their ID. (**Requires** `targetId`)

---

## 3. Admin Notification Inbox
A history of system alerts (e.g., new registrations, contact forms, and content deletions).

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
      "icon": null,
      "isRead": false,
      "createdAt": "2024-05-14T08:00:00Z"
    }
  ]
}
```

### Get Single Notification
*   **Method:** `GET`
*   **Endpoint:** `/api/admin/notifications/:id`

**Full Response Body:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Contact Message!",
    "body": "From: Jane Doe - Inquiry about events",
    "url": "/admin/contact/uuid",
    "isRead": true,
    "createdAt": "2024-05-14T08:05:00Z"
  }
}
```

### Status Management
*   **Mark as Read:** `PATCH /api/admin/notifications/:id/read`
*   **Mark as Unread:** `PATCH /api/admin/notifications/:id/unread`
*   **Mark ALL as Read:** `PATCH /api/admin/notifications/mark-all-read`

**Response Body (for all status updates):**
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
    "p256dh": "p256dh-key-string",
    "auth": "auth-secret-string"
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
