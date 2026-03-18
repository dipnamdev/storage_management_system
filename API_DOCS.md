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

### 4. Update Warehouse (Protected, Admin Only)
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

### 5. Delete Warehouse (Protected, Admin Only)
Deletes an existing warehouse.
- **Endpoint**: `DELETE /api/warehouse/delete/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK` with deleted warehouse ID.

---

## Billing Endpoints
Base Route: `/api/billing`

### 1. Create Billing (Warehouse Manager Only)
Managers create a new billing request for their warehouse.
- **Endpoint**: `POST /api/billing/add`
- **Access**: Protected (Requires JWT + `WAREHOUSE_MANAGER` role)
- **Body**:
  ```json
  {
    "inbound_time": "2023-10-01T10:00:00Z",
    "outbound_time": "2023-10-01T15:00:00Z",
    "depositor_name": "ABC Corp",
    "depositor_gst": "GST123",
    "commodity_id": 1,
    "bill_no": "BILL-001",
    "claim_month": 10,
    "financial_year": "2023-24",
    "taxable_amount": 1000.00
  }
  ```
  *(Note: CGST, SGST (9% each), and Total Amount are calculated automatically)*
- **Response**: `201 Created` with `billingId` and `versionId`.

### 2. Edit Billing (Warehouse Manager Only)
Managers can propose an edit to an existing bill (creating a new version).
- **Endpoint**: `PUT /api/billing/:billingId`
- **Access**: Protected (Requires JWT + `WAREHOUSE_MANAGER` role)
- **Constraint**: Cannot edit if status is `APPROVED` or `PAID`.
- **Response**: `200 OK` with `versionId`.

### 3. Get Manager's Warehouse Billing (Warehouse Manager Only)
Fetch billing history for the current manager's warehouse.
- **Endpoint**: `GET /api/billing/my`
- **Access**: Protected (Requires JWT + `WAREHOUSE_MANAGER` role)
- **Response**: `200 OK` with list of bills including payment info if available.

### 4. Get Billing Details (Both Roles)
Fetch detailed information for a specific bill.
- **Endpoint**: `GET /api/billing/:billingId`
- **Access**: Protected (Requires valid JWT)
- **Response**: `200 OK` with bill, version, and payment details.

### 5. Get All Billing (Admin Only)
Admin dashboard view for all warehouses.
- **Endpoint**: `GET /api/billing`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Query Params**: `?district=...`, `?status=...`
- **Response**: `200 OK` with list.

### 6. Final Bill Approval (Admin Only)
Final approval for the whole bill.
- **Endpoint**: `PATCH /api/billing/approve/:billingId`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK`.

### 7. Approve Edit (Admin Only)
Admin approves a specific version of a bill.
- **Endpoint**: `PATCH /api/billing/approve-edit/:billingId/:versionId`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK`.

### 8. Reject Bill/Edit (Admin Only)
- **Endpoint**: `PATCH /api/billing/reject/:billingId` (Reject whole bill)
- **Endpoint**: `PATCH /api/billing/reject-edit/:billingId/:versionId` (Reject specific edit)
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK`.

### 9. Record Payment (Admin Only)
Records payment details for an approved bill and marks it as `PAID`.
- **Endpoint**: `POST /api/billing/payment/:billingId`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Body**:
  ```json
  {
    "amount_passed": 1180.00,
    "payment_mode": "NEFT",
    "instrument_no": "INST-555",
    "payment_date": "2023-10-15",
    "advice_no": "ADV-999",
    "advice_date": "2023-10-14",
    "remarks": "Payment successful"
  }
  ```
- **Response**: `200 OK`.




---

## Commodity Endpoints
Base Route: `/api/commodity`

### 1. Add Commodity & Price (Protected, Admin Only)
Upserts a commodity and records its price for a specific financial year.
- **Endpoint**: `POST /api/commodity/add`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Body**:
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
- **Response**: `201 Created` with commodity and price data.

### 2. Get All Commodities (Protected, Admin Only)
Fetch all active commodities along with their financial year prices.
- **Endpoint**: `GET /api/commodity`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK` with list of commodities and prices.

### 3. Update Commodity or Price (Protected, Admin Only)
Updates commodity name or price for a specific financial year.
- **Endpoint**: `PUT /api/commodity/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Body**:
  ```json
  {
    "name": "basmati rice",
    "financial_year": "2023-24",
    "price_per_unit": 45
  }
  ```
- **Response**: `200 OK`.

### 4. Delete Commodity (Protected, Admin Only)
Soft deletes a commodity by marking `is_active = false`.
- **Endpoint**: `DELETE /api/commodity/:id`
- **Access**: Protected (Requires JWT + `SUPER_ADMIN` role)
- **Response**: `200 OK`.










