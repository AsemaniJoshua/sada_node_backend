# SADA Admin Systems - Full Technical Specification

This document contains the complete technical specification for administrative integration. Every endpoint follows a consistent structure with standard pagination and error handling.

---

## 1. Authentication & Profile Management

### Change Password
Allows an authenticated admin to update their password. Completing this also sets `isFirstTimeLogin` to `false`.
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

## 2. Membership System (Unique ID)
Every member is assigned a unique 6-character alphanumeric ID (e.g., `A1B2C3`).

### Get Member by Unique ID (Public)
*   **Request Method:** `GET`
*   **Endpoint:** `/api/memberships/member-id/:memberId`
*   **Auth:** None

**Full Response Body:**
```json
{
  "success": true,
  "data": {
    "memberId": "A1B2C3",
    "firstName": "Joshua",
    "lastName": "Asemani",
    "status": "approved",
    "createdAt": "..."
  }
}
```

### Get Member by Unique ID (Admin)
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/memberships/member-id/:memberId`
*   **Auth:** Admin Token Required

**Full Response Body:**
```json
{
  "success": true,
  "data": { "id": "uuid", "memberId": "A1B2C3", "firstName": "...", "lastName": "...", "status": "approved", "..." }
}
```

---

## 3. Payments System
Supports both standard UUID and 6-digit Membership ID.

### Initiate Payment (Public)
**Mandatory Requirement:** Both `id` (UUID) and `memberId` (6-digit ID) must be provided in the payload for verification.
*   **Request Method:** `POST`
*   **Endpoint:** `/api/payments/initiate`
*   **Request Body:**
```json
{
  "id": "uuid-of-member",
  "memberId": "A1B2C3",
  "full_name": "Member Name",
  "email": "member@email.com",
  "membership_role": "standard",
  "month_paid_for": 5,
  "year_paid_for": 2024,
  "amount": 100.00
}
```

**Full Response Body:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "reference": "SADA_...",
    "authorizationUrl": "https://checkout.paystack.com/..."
  }
}
```

### Verify Payment (Public)
*   **Request Method:** `GET`
*   **Endpoint:** `/api/payments/verify/:reference`

**Full Response Body:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "successful",
    "uniqueMemberId": "A1B2C3",
    "..."
  }
}
```

### Get Payments by Member ID (Admin)
Finds all transactions for a specific member using their 6-digit code.
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/payments/member/:uniqueMemberId`
*   **Auth:** Admin Token Required

**Full Response Body:**
```json
{
  "success": true,
  "pagination": { "total": 5, "page": 1, "limit": 50, "totalPages": 1 },
  "data": [
    { "id": "uuid", "amount": 100, "status": "successful", "uniqueMemberId": "A1B2C3" }
  ]
}
```

---

## 4. Admin Activity Logs (Audit Trail)
Tracks every administrative action for accountability.

### Get All Activities
*   **Request Method:** `GET`
*   **Endpoint:** `/api/admin/activity`
*   **Query Params:** `page`, `limit`, `action`, `logType`
*   **Auth:** Admin Token Required

---

## 5. Bulk Communication Suite
Direct broadcasting to segments via Email and SMS.

### Target Options:
*   `all_approved`, `all_pending`, `all_admins`
*   `specific_member`, `specific_admin` (Requires `targetId`)

### Send Bulk Email / SMS
*   **Endpoint (Email):** `/api/admin/communication/email`
*   **Endpoint (SMS):** `/api/admin/communication/sms`

---

## 6. Admin Notification Inbox
Real-time alerts for system events and critical deletions.

### Get All Notifications
*   **Endpoint:** `/api/admin/notifications`
*   **Query Params:** `page`, `limit`, `isRead`
