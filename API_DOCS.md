# API Documentation

This document outlines all the available REST API endpoints for the Storage Management System Backend.

## Base URL
`http://localhost:<PORT>/api`

*(Note: Replace `<PORT>` with your server port, default is typically 5000 based on your `.env`)*

---

## Authentication

Authentication is handled via JSON Web Tokens (JWT). 
Endpoints marked as **Protected** require an `Authorization` header containing the Bearer token.
> `Authorization: Bearer <your_jwt_token>`

---

## User Endpoints
Base Route: `/api/user`

### 1. Register User (Public)
Creates a new user account.
- **Endpoint**: `POST /api/user/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email_id": "johndoe@example.com",
    "password": "yourpassword123",
    "role": "SUPER_ADMIN" 
  }
  ```
  *(Note: Valid roles are `SUPER_ADMIN` and `WAREHOUSE_MANAGER`)*
- **Response**: `201 Created` with `userId`.

### 2. Login User (Public)
Authenticates a user and returns a JWT token.
- **Endpoint**: `POST /api/user/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email_id": "admin@storage.com",
    "password": "admin123"
  }
  ```
- **Response**: `200 OK` with `token` and `user` object.

### 3. Get User By ID (Protected)
Retrieves user details.
- **Endpoint**: `GET /api/user/:id`
- **Access**: Protected (Requires valid JWT)
- **Response**: `200 OK` with user details.

### 4. Update User (Protected)
Updates user details.
- **Endpoint**: `PUT /api/user/update/:id`
- **Access**: Protected (Requires valid JWT)
- **Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "role": "SUPER_ADMIN"
  }
  ```
- **Response**: `200 OK` with success message.

### 5. Delete User (Protected, Admin Only)
Deletes a user account.
- **Endpoint**: `DELETE /api/user/delete/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK` with success message.

---

## Warehouse Endpoints
Base Route: `/api/warehouse`

### 1. Get All Warehouses (Protected)
Retrieves a list of all warehouses along with their associated manager's details.
- **Endpoint**: `GET /api/warehouse`
- **Access**: Protected (Requires valid JWT)
- **Response**: `200 OK` with list of warehouses.

### 2. Get Warehouse By ID (Protected)
Retrieves a single warehouse's details by its ID.
- **Endpoint**: `GET /api/warehouse/:id`
- **Access**: Protected (Requires valid JWT)
- **Response**: `200 OK` with warehouse details.

### 3. Add Warehouse and Manager (Protected, Admin Only)
Creates a new warehouse and securely associates a new Warehouse Manager to it in a single transaction.
- **Endpoint**: `POST /api/warehouse/create`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Body**:
  ```json
  {
    "warehouseData": {
      "district_name": "District Name",
      "branch_name": "Branch Name",
      "warehouse_name": "Main Station",
      "warehouse_number": "WH-101",
      "gst_number": "GST101",
      "pan_number": "PAN101",
      "pancard_holder": "John Doe",
      "sr_no": "SR-101",
      "deposit_name": "Deposit Name",
      "warehouse_owner": "Warehouse Owner"
    },
    "managerData": {
      "first_name": "John",
      "last_name": "Doe",
      "email_id": "johndoe@test.com",
      "password": "password123"
    }
  }
  ```
- **Response**: `201 Created` with inserted data.

### 3. Update Warehouse (Protected, Admin Only)
Updates an existing warehouse's details.
- **Endpoint**: `PUT /api/warehouse/update/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Body**:
  ```json
  {
    "district_name": "New District",
    "branch_name": "New Branch",
    "warehouse_name": "Updated Name",
    "warehouse_number": "WH-101-UPD",
    "warehouse_owner": "Owner Name",
    "gst_number": "GST-UPD",
    "pan_number": "PAN-UPD",
    "pancard_holder": "Holder Name",
    "sr_no": "SR-UPD",
    "deposit_name": "Deposit Name"
  }
  ```
- **Response**: `200 OK` with updated data.

### 4. Delete Warehouse (Protected, Admin Only)
Deletes an existing warehouse.
- **Endpoint**: `DELETE /api/warehouse/delete/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK` with deleted warehouse ID.

---

## Commodity Endpoints
Base Route: `/api/commodity`

### 1. Add Commodity & Price (Protected, Admin Only)
Upserts a commodity and records its price for a specific financial year.
Endpoint: `POST /api/commodity/add`
Access: Protected (Requires JWT + SUPER_ADMIN role)
Body
```json
{
  "commodityData": {
    "name": "rice"
  },
  "priceData": {
    "financial_year": "2023-24",
    "price_per_unit": 40.00
  }
}
```
Response

201 Created

{
  "message": "Commodity and Price recorded successfully",
  "data": {
    "commodity": {
      "id": 1,
      "name": "rice"
    },
    "price": {
      "id": 3,
      "financial_year": "2023-24",
      "price_per_unit": 40
    }
  }
}
2. Get All Commodities (Protected, Admin Only)

Fetch all active commodities along with their financial year prices.

Endpoint: GET /api/commodity

Access: Protected (Requires JWT + SUPER_ADMIN role)

Response

200 OK

{
  "data": [
    {
      "id": 1,
      "name": "rice",
      "is_active": true,
      "financial_year": "2023-24",
      "price_per_unit": 40,
      "updated_at": "2026-03-16T10:10:10.000Z"
    }
  ]
}
3. Update Commodity or Price (Protected, Admin Only)

Updates commodity name or price for a specific financial year.

Endpoint: PUT /api/commodity/:id

Access: Protected (Requires JWT + SUPER_ADMIN role)

URL Params
id = commodity_id
Body
{
  "name": "basmati rice",
  "financial_year": "2023-24",
  "price_per_unit": 45
}
Response

200 OK

{
  "message": "Commodity updated successfully",
  "data": {
    "commodityId": 1
  }
}
4. Delete Commodity (Protected, Admin Only)

Soft deletes a commodity by marking is_active = false.

Endpoint: DELETE /api/commodity/:id

Access: Protected (Requires JWT + SUPER_ADMIN role)

URL Params
id = commodity_id
Response

200 OK

{
  "message": "Commodity deleted successfully"
}
