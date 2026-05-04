# Admin User Management API Documentation

**Base Path:** `/api/admin/user`  
**Authorization:** Required (Admin Role)

---

## 1. Update Self Profile
Update the currently authenticated admin's profile.

- **URL:** `/api/admin/user/profile`
- **Method:** `PATCH`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | No | Full name of the admin |
  | `email` | String | No | Email address |
  | `oldPassword` | String | No | Required if changing password |
  | `newPassword` | String | No | Min 8 characters |
  | `confirmNewPassword` | String | No | Must match `newPassword` |
  | `image` | File | No | Profile picture (Image file) |

- **Success Response:**
  - **Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "message": "Profile updated successfully.",
      "data": { "id": "...", "email": "...", "name": "...", "image": { "url": "...", "public_id": "..." }, "role": "admin", ... }
    }
    ```

---

## 2. Get All Users
List all registered users in the system.

- **URL:** `/api/admin/user/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "data": [
        { "id": "...", "email": "...", "name": "...", "role": "user", "createdAt": "..." },
        ...
      ]
    }
    ```

---

## 3. Get User By ID
Fetch details of a specific user.

- **URL:** `/api/admin/user/:id`
- **Method:** `GET`
- **Success Response:**
  - **Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "data": { "id": "...", "email": "...", "name": "...", "role": "user", ... }
    }
    ```

---

## 4. Create User
Manually create a new user account.

- **URL:** `/api/admin/user/`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Yes | Full name |
  | `email` | String | Yes | Unique email address |
  | `password` | String | Yes | Min 8 characters |
  | `role` | String | No | `admin` or `user` (default: `user`) |
  | `image` | File | No | Profile picture |

- **Success Response:**
  - **Code:** `201 Created`
  - **Body:**
    ```json
    {
      "success": true,
      "message": "User created successfully.",
      "data": { "id": "...", "email": "...", "name": "...", "role": "..." }
    }
    ```

---

## 5. Update User By ID
Modify an existing user's details.

- **URL:** `/api/admin/user/:id`
- **Method:** `PATCH`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | No | Full name |
  | `email` | String | No | New email address |
  | `password` | String | No | New password |
  | `role` | String | No | `admin` or `user` |
  | `image` | File | No | New profile picture |

- **Success Response:**
  - **Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "message": "User updated successfully.",
      "data": { ... }
    }
    ```

---

## 6. Delete User By ID
Permanently remove a user account.

- **URL:** `/api/admin/user/:id`
- **Method:** `DELETE`
- **Note:** Admins cannot delete their own account through this endpoint.

- **Success Response:**
  - **Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "message": "User deleted successfully."
    }
    ```

---

## Common Error Responses

| Code | Message | Description |
| :--- | :--- | :--- |
| `400` | "Email, password, and name are required" | Missing mandatory fields |
| `401` | "Unauthorized" | Invalid or missing token |
| `403` | "Forbidden" | User does not have admin privileges |
| `404` | "User not found" | The specified ID does not exist |
| `409` | "User with this email already exists" | Email collision |
