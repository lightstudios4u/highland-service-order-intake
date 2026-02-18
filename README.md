# Highland Service Order Intake

Emergency Leak Service intake form for Highland Commercial Roofing. Built with Next.js, React 19, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev        # start dev server at http://localhost:3000
npm test           # run tests (single run)
npm run test:watch # run tests in watch mode
```

### Environment Variables

Create a `.env.local` file with:

```env
# Customer Lookup & Order Status (staging API)
SERVICE_INTAKE_API_URL=https://hcr-staging.dukusolutions.com/ws/api/ServiceIntake/CustomerLookup
SERVICE_INTAKE_API_KEY=<your-api-key>

# Service Order Submission (Azure Function)
SERVICE_ORDER_INTAKE_URL=https://dynamo-highland-functions.azurewebsites.net/api/service-order-intake
SERVICE_ORDER_INTAKE_KEY=<your-function-key>
```

---

## API Endpoints

The app proxies all backend calls through Next.js API routes so that API keys and upstream URLs are never exposed to the browser.

### 1. Customer Lookup (Prefill)

Look up existing customer records by job number or email to prefill the form.

|                    |                                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| **Frontend route** | `POST /api/emergency-leak-service/lookup`                                       |
| **Upstream**       | `GET https://hcr-staging.dukusolutions.com/ws/api/ServiceIntake/CustomerLookup` |
| **Auth**           | `apikey` header                                                                 |

**Request body:**

```json
{
  "JobNo": "ELS-26-01-0001",
  "EmailAddress": "john@acme.com",
  "City": "Denver",
  "Zip": "80202"
}
```

At least one of `JobNo` or `EmailAddress` is required. `City` and `Zip` are optional filters.

**Response:** Array of `ServiceOrderResponse` objects containing `Clients[]`, `BillingInfos[]`, and `LeakDetails[]`.

---

### 2. Submit Service Order

Submit a new emergency leak service request. The Azure Function queues it for processing.

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Frontend route** | `POST /api/emergency-leak-service`                                                             |
| **Upstream**       | `POST https://dynamo-highland-functions.azurewebsites.net/api/service-order-intake?code=<key>` |

**Request body:** `ServiceOrderIntakeRequest` (camelCase, numeric enums)

```json
{
  "client": { "dynamoAccountId": null, "dynamoContactId": null, "accountName": "...", "accountContactName": "...", "email": "...", "phone": "..." },
  "billing": { "dynamoId": null, "entityBillToName": "...", "billToAddress": "...", "billToAddress2": "...", "billToCity": "...", "billToZip": "...", "billToEmail": "..." },
  "leakDetails": { "dynamoId": null, "jobNo": "", "jobDate": null, "siteName": "...", "siteAddress": "...", ... },
  "additionalLeaks": []
}
```

**Response:**

```json
{
  "success": true,
  "referenceId": "7568e1e0-1d0c-4f22-bd1a-303ee95fb7b7",
  "queueName": "...",
  "requestDate": "2026-02-16T18:54:25Z",
  "createdAt": "2026-02-16T18:54:25Z",
  "message": "Service order request received and queued for processing."
}
```

**Save the `referenceId`** — you need it to check order status.

---

### 3. Get Service Order Status

Pull up an existing submitted request using the `referenceId` returned from submission.

|                    |                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **Frontend route** | `GET /api/emergency-leak-service/status?referenceId=<guid>`                                               |
| **Upstream**       | `GET https://hcr-staging.dukusolutions.com/ws/api/ServiceIntake/GetServiceOrderStatus?referenceId=<guid>` |
| **Auth**           | `apikey` header                                                                                           |

**Query string parameter:**

| Parameter     | Type          | Required | Description                                            |
| ------------- | ------------- | -------- | ------------------------------------------------------ |
| `referenceId` | string (GUID) | Yes      | The reference ID returned when the order was submitted |

**Example request:**

```
GET /api/emergency-leak-service/status?referenceId=7568e1e0-1d0c-4f22-bd1a-303ee95fb7b7
```

**Example response:**

```json
{
  "Success": true,
  "Message": "Service order found",
  "Status": "NEW",
  "Data": {
    "Id": "7568e1e0-1d0c-4f22-bd1a-303ee95fb7b7",
    "RequestDate": "2026-02-16T18:54:25Z",
    "Client": {
      "DynamoAccountId": null,
      "DynamoContactId": null,
      "AccountName": "Acme Corporation",
      "AccountContactName": "John Smith",
      "Email": "john.smith@acmecorp.com",
      "Phone": "555-123-4567"
    },
    "Billing": {
      "DynamoId": null,
      "EntityBillToName": "Acme Corporation Billing Dept",
      "BillToAddress": "123 Main Street",
      "BillToAddress2": "Suite 200",
      "BillToCity": "Springfield",
      "BillToZip": "12345",
      "BillToEmail": "billing@acmecorp.com"
    },
    "LeakDetails": {
      "DynamoId": null,
      "JobNo": "",
      "JobDate": "2024-03-15T10:00:00Z",
      "SiteName": "Acme Warehouse Building A",
      "SiteAddress": "456 Industrial Pkwy",
      "SiteAddress2": "Building A",
      "SiteCity": "Springfield",
      "SiteZip": "12345",
      "TenantBusinessName": "ABC Logistics",
      "TenantContactName": "Jane Doe",
      "TenantContactPhone": "555-987-6543",
      "TenantContactCell": "555-111-2222",
      "TenantContactEmail": "jane.doe@abclogistics.com",
      "HoursOfOperation": "Monday-Friday 8:00 AM - 5:00 PM",
      "LeakLocation": 1,
      "LeakNear": 2,
      "LeakNearOther": "",
      "HasAccessCode": true,
      "AccessCode": "1234#",
      "IsSaturdayAccessPermitted": true,
      "IsKeyRequired": false,
      "IsLadderRequired": true,
      "RoofPitch": 1,
      "Comments": "Leak is actively dripping."
    },
    "AdditionalLeaks": [],
    "CreatedAt": "2026-02-16T18:54:25Z",
    "UpdatedAt": null
  }
}
```

**Status values:**

| Status        | Description                      |
| ------------- | -------------------------------- |
| `NEW`         | Order received, not yet assigned |
| `IN_PROGRESS` | Order is being worked            |
| `COMPLETED`   | Service completed                |
| `CANCELLED`   | Order was cancelled              |

**Numeric enum mappings (for `LeakLocation`, `LeakNear`, `RoofPitch`):**

| LeakLocation |        | LeakNear |           | RoofPitch |                    |
| ------------ | ------ | -------- | --------- | --------- | ------------------ |
| 1            | Front  | 1        | HVAC Duct | 1         | Flat Roof          |
| 2            | Middle | 2        | Skylight  | 2         | Steep/Shingle/Tile |
| 3            | Back   | 3        | Wall      |           |                    |
|              |        | 4        | Drain     |           |                    |
|              |        | 5        | Other     |           |                    |

---

## Project Structure

```
app/
  api/emergency-leak-service/
    route.ts              # POST — submit new order (Azure Function proxy)
    lookup/route.ts       # POST — customer lookup (staging API proxy)
    status/route.ts       # GET  — order status (staging API proxy)
  page.tsx                # Main page
components/
  EmergencyLeakServiceForm.tsx        # Main form component
  emergencyLeakService/
    ContactInfoSection.tsx
    BillingInfoSection.tsx
    LeakingPropertySection.tsx
    OrderStatusPanel.tsx              # Post-submit status view
    IntakeHeader.tsx
    FormInput.tsx
helpers/
  emergencyLeakServiceForm.ts         # Validation, initial data, mocks
  serviceOrderApi.ts                  # Client-side API functions
  serviceOrderPayload.ts              # Form data → API payload transform
  unifiedFetcher.ts                   # Generic fetch wrapper
types/
  emergencyLeakService.ts             # All TypeScript types
__tests__/
  helpers/                             # Vitest unit tests
backendfiles/                          # C# model reference files
```
