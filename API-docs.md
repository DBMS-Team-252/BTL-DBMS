# 📘 E-Commerce API Documentation


# 📌 Global Standard Response

Unless explicitly marked as **`[RAW JSON]`**, every API endpoint returns the following structure:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```


# 🟢 0. System

## `GET /api/ping`

**Access:** Public

### Request

None

### Response `[RAW JSON]`

```json
{
  "message": "Server đang chạy ngon lành!"
}
```


# 🔐 1. Authentication (`/api/auth`)


## `POST /register`

**Access:** Public

### Request Body

```json
{
  "name": "str(2-255)",
  "email": "str",
  "phone": "str(9-15)",
  "password": "str(min:6)"
}
```

### Response

```json
{
  "success": true,
  "message": "Register successful",
  "data": {
    "id": "str",
    "name": "str",
    "email": "str",
    "phone": "str",
    "role": "USER",
    "created_at": "date"
  }
}
```


## `POST /login`

**Access:** Public

### Request Body

```json
{
  "email": "str",
  "password": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "str",
    "refreshToken": "str",
    "user": {
      "id": "str",
      "name": "str",
      "email": "str",
      "role": "USER|ADMIN"
    }
  }
}
```


## `POST /logout`

**Access:** Protected

### Request Body

```json
{
  "refreshToken": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```


## `POST /refresh`

**Access:** Public

### Request Body

```json
{
  "refreshToken": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "str"
  }
}
```


# 🏷️ 2. Categories (`/api/categories`)


## `GET /`

**Access:** Public

### Request

None

### Response

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "str",
      "name": "str",
      "parent_id": "str|null"
    }
  ]
}
```


## `POST /`

**Access:** Admin

### Request Body

```json
{
  "name": "str",
  "parent_id": "str|number (optional)"
}
```

### Response

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "str",
    "name": "str",
    "parent_id": "str|null"
  }
}
```


## `PUT /:id`

**Access:** Admin

### Path Params

| Param | Type   |
| ----- | ------ |
| id    | string |

### Request Body

```json
{
  "name": "str",
  "parent_id": "str|number (optional)"
}
```

### Response

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "str",
    "name": "str",
    "parent_id": "str|null"
  }
}
```


## `DELETE /:id`

**Access:** Admin

### Response

```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

> ❗ Fails if sub-categories or products are attached.


# 📦 3. Products (`/api/products`)


## `GET /`

**Access:** Public

### Query Parameters

| Query    | Type   |
| -------- | ------ |
| page     | number |
| limit    | number |
| search   | string |
| category | string |
| minPrice | number |
| maxPrice | number |
| rating   | number |

### Response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "data": [
      {
        "id": "str",
        "name": "str",
        "description": "str",
        "price": "num",
        "category_id": "str",
        "created_by": "str",
        "created_at": "date",
        "category": {
          "id": "str",
          "name": "str"
        }
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `GET /detail/:id`

**Access:** Public

### Response `[RAW JSON]`

```json
{
  "id": "str",
  "name": "str",
  "description": "str",
  "price": "str(decimal)",
  "category_id": "str",
  "categories": {
    "id": "str",
    "name": "str"
  },
  "inventory": {
    "product_id": "str",
    "stock": "num"
  },
  "reviews": [
    {
      "id": "str",
      "rating": "num",
      "comment": "str"
    }
  ]
}
```


## `POST /`

**Access:** Admin

### Request Body

```json
{
  "name": "str",
  "description": "str",
  "price": "num",
  "category_id": "num",
  "stock": "num"
}
```

### Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "str",
    "name": "str",
    "price": "num",
    "category_id": "str",
    "created_by": "str"
  }
}
```


## `PUT /:id`

**Access:** Admin

### Request Body

```json
{
  "name": "str",
  "description": "str",
  "price": "num",
  "category_id": "num"
}
```

### Response

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "str",
    "name": "str",
    "price": "num",
    "category_id": "str"
  }
}
```


## `DELETE /:id`

**Access:** Admin

### Response

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```


# 🛒 4. Cart (`/api/cart`)


## `GET /detail`

**Access:** Protected (User)

### Response `[RAW JSON]`

```json
{
  "id": "str",
  "user_id": "str",
  "created_at": "date",
  "cart_items": [
    {
      "id": "str",
      "product_id": "str",
      "quantity": "num",
      "products": {
        "id": "str",
        "name": "str",
        "price": "str"
      }
    }
  ]
}
```


## `POST /add-item`

**Access:** Protected (User)

### Request Body

```json
{
  "productId": "str|num",
  "quantity": "num"
}
```

### Response `[RAW JSON]`

```json
{
  "id": "str",
  "cart_id": "str",
  "product_id": "str",
  "quantity": "num"
}
```


# 🧾 5. Orders (`/api/orders`)


## `POST /checkout`

**Access:** Protected (User)

### Response `[RAW JSON]`

```json
{
  "message": "Checkout success",
  "order": {
    "id": "str",
    "user_id": "str",
    "total": "str(decimal)",
    "status": "PENDING"
  }
}
```


## `GET /my-orders`

**Access:** Protected (User)

### Response

```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": "str",
      "total": "num",
      "status": "str",
      "created_at": "date",
      "items": [
        {
          "product_id": "str",
          "product_name": "str",
          "price": "num",
          "quantity": "num"
        }
      ],
      "payment": {
        "id": "str",
        "method": "str",
        "status": "str"
      }
    }
  ]
}
```


## `GET /detail/:id`

**Access:** Protected (User/Admin)

### Response

```json
{
  "success": true,
  "message": "Order detail fetched successfully",
  "data": {
    "id": "str",
    "status": "str",
    "total": "str(decimal)",
    "order_items": [],
    "payments": []
  }
}
```


## `GET /admin`

**Access:** Admin

### Response

```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": {
    "data": [
      {
        "id": "str",
        "user_id": "str",
        "customer_name": "str",
        "customer_email": "str",
        "total": "num",
        "status": "str",
        "created_at": "date"
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `PATCH /admin/:id/status`

**Access:** Admin

### Request Body

```json
{
  "status": "PENDING | PAID | SHIPPED | CANCELLED"
}
```

### Response

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "str",
    "status": "str"
  }
}
```


# ⭐ 6. Reviews (`/api/reviews`)


## `POST /`

**Access:** Protected (User)

### Request Body

```json
{
  "product_id": "num",
  "rating": "num(1-5)",
  "comment": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "str",
    "rating": "num",
    "comment": "str"
  }
}
```


## `GET /product/:productId`

**Access:** Public

### Response

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    {
      "id": "str",
      "user_name": "str",
      "rating": "num",
      "comment": "str",
      "created_at": "date"
    }
  ]
}
```


## `GET /admin`

**Access:** Admin

### Response

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "data": [
      {
        "id": "str",
        "user_id": "str",
        "customer_name": "str",
        "product_id": "str",
        "product_name": "str",
        "rating": "num",
        "comment": "str",
        "created_at": "date"
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `DELETE /admin/:id`

### Response

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```


# 📦 7. Inventory (`/api/inventory`)

> All endpoints are Admin Only


## `GET /`

### Response

```json
{
  "success": true,
  "message": "Inventory fetched successfully",
  "data": {
    "data": [
      {
        "product_id": "str",
        "stock": "num",
        "updated_at": "date",
        "product_name": "str",
        "price": "num"
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `GET /alerts`

### Response

```json
{
  "success": true,
  "message": "Inventory alerts fetched successfully",
  "data": [
    {
      "product_id": "str",
      "stock": "num",
      "product_name": "str"
    }
  ]
}
```


## `GET /transactions`

### Response

```json
{
  "success": true,
  "message": "Inventory transactions fetched successfully",
  "data": {
    "data": [
      {
        "id": "str",
        "product_id": "str",
        "product_name": "str",
        "type": "str",
        "quantity": "num",
        "old_stock": "num",
        "new_stock": "num",
        "reason": "str",
        "created_by": "str",
        "created_at": "date"
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `POST /transaction`

### Request Body

```json
{
  "productId": "str|num",
  "type": "IMPORT | EXPORT | ADJUST | RETURN",
  "quantity": "num",
  "reason": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "Inventory transaction created successfully",
  "data": {
    "transaction_id": "str",
    "product_id": "str",
    "type": "str",
    "old_stock": "num",
    "new_stock": "num"
  }
}
```


## `PUT /:productId`

### Request Body

```json
{
  "stock": "num"
}
```

### Response

```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "product_id": "str",
    "stock": "num"
  }
}
```


## `PUT /bulk`

### Request Body

```json
{
  "updates": [
    {
      "productId": "str|num",
      "stock": "num"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "message": "Bulk inventory updated successfully",
  "data": [
    {
      "product_id": "str",
      "stock": "num"
    }
  ]
}
```


# 👥 8. Users (`/api/users`)

> All endpoints are Admin Only


## `GET /`

### Response

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "data": [
      {
        "id": "str",
        "name": "str",
        "email": "str",
        "phone": "str",
        "role": "str",
        "status": "str",
        "created_at": "date"
      }
    ],
    "pagination": {
      "totalItems": "num",
      "totalPages": "num",
      "currentPage": "num",
      "pageSize": "num"
    }
  }
}
```


## `PUT /:id`

### Request Body

```json
{
  "name": "str",
  "phone": "str"
}
```

### Response

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "str",
    "name": "str",
    "email": "str",
    "phone": "str",
    "role": "str",
    "status": "str"
  }
}
```


## `PATCH /:id/role`

### Request Body

```json
{
  "role": "USER | ADMIN"
}
```

### Response

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "str",
    "role": "str"
  }
}
```


## `PATCH /:id/disable`

### Response

```json
{
  "success": true,
  "message": "User disabled successfully",
  "data": {
    "id": "str",
    "status": "DISABLE"
  }
}
```


# 📊 9. Statistics (`/api/stats`)

> All endpoints are Admin Only


## `GET /overview`

### Response

```json
{
  "success": true,
  "message": "Overview fetched successfully",
  "data": {
    "total_users": "num",
    "total_orders": "num",
    "total_revenue": "num"
  }
}
```


## `GET /analytics`

### Query Parameters

| Query     | Type            |
| --------- | --------------- |
| startDate | ISO Date String |
| endDate   | ISO Date String |

### Response

```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "revenueByTime": [
      {
        "date": "date",
        "revenue": "num"
      }
    ],
    "topProducts": [
      {
        "id": "str",
        "name": "str",
        "total_sold": "num"
      }
    ],
    "topCustomers": [
      {
        "id": "str",
        "name": "str",
        "email": "str",
        "total_spent": "num"
      }
    ],
    "conversionRate": "num"
  }
}
```
