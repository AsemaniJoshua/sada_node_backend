# 📰 Frontend Integration Guide - Blog API Updates

This document outlines the recent updates to the SADA Blog API. These updates introduce `slug` (for URL-friendly titles) and `author` fields, along with new endpoints to retrieve blog posts by slug.

---

## 📋 Schema Changes

The `BlogPost` model now includes two new optional fields:

1. **`slug`**: A unique string containing the URL-safe representation of the title (e.g. `/blog/my-first-post`).
2. **`author`**: A string containing the name of the post's writer.

---

## 🛠️ Create & Update Actions (Admin Panel)

When creating or modifying blog posts, you can now pass `slug` and `author` parameters in the request payload.

### 1. Create Blog Post

* **Method:** `POST`
* **Endpoint:** `/api/admin/blog`
* **Content-Type:** `multipart/form-data` (Supports images)
* **Payload Fields:**
  * `title` (String, Required)
  * `content` (String, Required - Supports rich text HTML/Markdown)
  * `category` (String, Required - `news` | `blog` | `article`)
  * `status` (String, Optional - `draft` | `published`, defaults to `draft`)
  * `tags` (Array of Strings, Optional)
  * `author` (String, Optional)
  * `slug` (String, Optional)
    * 💡 *Tip: If you do not provide a `slug`, the backend will automatically generate a unique one based on the `title`.*
    * 💡 *If a slug collision occurs (i.e. another post has the same slug), the backend will automatically append a numeric suffix (e.g., `-1`, `-2`) to ensure uniqueness.*

### 2. Update Blog Post

* **Method:** `PATCH`
* **Endpoint:** `/api/admin/blog/:id`
* **Content-Type:** `multipart/form-data`
* **Payload Fields:** Same optional fields as above.
  * 💡 *Tip: Changing the `title` does NOT automatically regenerate the `slug` to prevent broken links (SEO impact). If you wish to change the slug during an update, pass the new `slug` value explicitly in the body.*

---

## 🚀 Retrieving Blog Posts (New Endpoints)

You can now fetch blog posts by their unique `slug` instead of their UUID. This is highly recommended for client-facing SEO routes.

### 1. Public Fetch by Slug

Use this on the main website to fetch details of a published blog post.

* **Method:** `GET`
* **Endpoint:** `/api/blog/slug/:slug`
* **Auth Required:** None
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-string",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "author": "Author Name",
      "content": "HTML or markdown content...",
      "category": "blog",
      "status": "published",
      "tags": ["tag1", "tag2"],
      "images": [
        { "url": "https://res.cloudinary.com/...", "public_id": "..." }
      ],
      "createdAt": "2026-06-30T09:35:00.000Z",
      "updatedAt": "2026-06-30T09:35:00.000Z"
    }
  }
  ```

  * ⚠️ *Note: This endpoint returns `404 Not Found` if the post is a `draft`.*

### 2. Admin Fetch by Slug

Use this inside the admin panel if you need to fetch details of any post (including drafts) by slug.

* **Method:** `GET`
* **Endpoint:** `/api/admin/blog/slug/:slug`
* **Auth Required:** Admin token
* **Response (200 OK):** Same structure as above.


When integrating the frontend routes, ensure that fetching by slug uses `/slug/:slug` (e.g. `/api/blog/slug/my-post`), and fetching by UUID continues to use `/:id` (e.g. `/api/blog/b0b11449-34fc-...`).