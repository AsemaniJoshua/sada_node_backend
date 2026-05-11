# SADA Admin Systems - Frontend Integration Spec

This document provides the technical details for the newly implemented Admin Activity Logs, Bulk Communications, and Web Push Notification systems.

---

## 1. Admin Activity Logs
Used to track administrative actions (Create, Update, Delete, Approve, Reject).

### Get All Activities
*   **Endpoint:** `GET /api/admin/activity`
*   **Auth:** Admin Token Required
*   **Query Parameters:**
    *   `page`: (Optional) Page number (default: 1)
    *   `limit`: (Optional) Records per page (default: 50)
    *   `action`: (Optional) `create` | `update` | `delete` | `approve` | `reject`
    *   `logType`: (Optional) e.g., `Blog`, `Events`, `Membership`, `Users`, etc.
    *   `userId`: (Optional) Filter by a specific Admin ID

**Response:**
```json
{
  "success": true,
  "pagination": { "total": 120, "page": 1, "limit": 50, "totalPages": 3 },
  "data": [
    {
      "id": "uuid",
      "action": "create",
      "logType": "Blog",
      "description": "Created blog post: My Summer Trip",
      "createdAt": "2024-05-11T...",
      "admin": {
        "id": "admin-id",
        "name": "Admin Name",
        "email": "admin@sada.com"
      }
    }
  ]
}
```

---

## 2. Bulk Communication System
Allows admins to send Emails and SMS to members or other admins.

### Send System Email
*   **Endpoint:** `POST /api/admin/communication/email`
*   **Auth:** Admin Token Required
*   **Request Body:**
```json
{
  "target": "all_approved", 
  "subject": "System Update",
  "message": "Hello everyone, we have a new update..."
}
```

### Send System SMS
*   **Endpoint:** `POST /api/admin/communication/sms`
*   **Auth:** Admin Token Required
*   **Request Body:**
```json
{
  "target": "all_approved",
  "message": "SADA: Your application has been processed. Check your email."
}
```

### Target Options (Valid for both Email & SMS):
| Target Key | Description | `targetId` required? |
| :--- | :--- | :--- |
| `all_approved` | All members with 'approved' status | No |
| `all_pending` | All members with 'pending' status | No |
| `all_admins` | All users with 'admin' role | No |
| `specific_member` | A single member | **Yes** |
| `specific_admin` | A single admin user | **Yes** |

---

## 3. Web Push Notifications
System-level notifications for browser/mobile OS.

### Subscribe (Opt-in)
*   **Endpoint:** `POST /api/notifications/subscribe`
*   **Auth:** Optional (If token provided, subscription is linked to the user)
*   **Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "base64_string",
    "auth": "base64_string"
  }
}
```

### Frontend Implementation Steps:
1.  **VAPID Public Key:** Use the `VAPID_PUBLIC_KEY` from the `.env` file for the subscription.
2.  **Service Worker:** Register a `sw.js` file in the browser.
3.  **Permission:** Call `Notification.requestPermission()`.
4.  **Subscribe:** Call `registration.pushManager.subscribe()` using the public key.
5.  **Save:** Send the resulting JSON object to the `POST /api/notifications/subscribe` endpoint.

---

## 4. Summary of Smart Automation (Backend)
The frontend does not need to call these; they happen automatically on the server:
*   **Blog/Event/Announcement created/published:** Auto-broadcasts to all public subscribers.
*   **New Contact Form/Member Registration:** Auto-notifies all Admin subscribers.
