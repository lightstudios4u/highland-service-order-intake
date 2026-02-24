export type LeakLocationName = "Front" | "Middle" | "Back";

export type LeakNearTypeName =
  | "HVACDuct"
  | "Skylight"
  | "Wall"
  | "Drain"
  | "Other";

export type RoofPitchTypeName = "FlatRoof" | "SteepShingleTile";

export type LeakingProperty = {
  dynamoId: number | null;
  jobNo: string;
  siteName: string;
  siteAddress: string;
  siteAddress2: string;
  siteCity: string;
  siteZip: string;
  tenantBusinessName: string;
  tenantContactName: string;
  tenantContactPhone: string;
  tenantContactCell: string;
  tenantContactEmail: string;
  hoursOfOperation: string;
  leakLocation: LeakLocationName;
  leakNear: LeakNearTypeName;
  leakNearOther: string;
  hasAccessCode: boolean;
  accessCode: string;
  isSaturdayAccessPermitted: boolean;
  isKeyRequired: boolean;
  isLadderRequired: boolean;
  roofPitch: RoofPitchTypeName;
  comments: string;
};

export type IntakeFormData = {
  leakingProperties: LeakingProperty[];
  clientDynamoAccountId: number | null;
  clientDynamoCountId: number | null;
  clientAccountName: string;
  clientAccountContactName: string;
  clientEmail: string;
  clientPhone: string;
  billingDynamoId: number | null;
  billingEntityBillToName: string;
  billingBillToAddress: string;
  billingBillToAddress2: string;
  billingBillToCity: string;
  billingBillToZip: string;
  billingBillToEmail: string;
};

export type ValidationErrors = Partial<
  Record<
    | keyof IntakeFormData
    | keyof LeakingProperty
    | "signature"
    | "signatureName"
    | "billingTermsAcknowledged",
    string
  >
>;

export type PrefillLookupRequest = {
  companyName: string;
  email: string;
};

export type PrefillLookupData = Partial<
  Omit<IntakeFormData, "leakingProperties">
> & {
  leakingProperties?: Partial<LeakingProperty>[];
};

export type PrefillLookupResponse = {
  found: boolean;
  data?: PrefillLookupData;
  message?: string;
};

export type ClientInfoPayload = {
  DynamoAccountId?: number | null;
  DynamoCountId?: number | null;
  AccountName: string;
  AccountContactName: string;
  Email: string;
  Phone: string;
};

export type BillingInfoPayload = {
  DynamoId?: number | null;
  EntityBillToName: string;
  BillToAddress: string;
  BillToAddress2: string;
  BillToCity: string;
  BillToZip: string;
  BillToEmail: string;
};

export type LeakDetailsPayload = {
  DynamoId?: number | null;
  JobNo?: string;
  SiteName: string;
  SiteAddress: string;
  SiteAddress2: string;
  SiteCity: string;
  SiteZip: string;
  TenantBusinessName: string;
  TenantContactName: string;
  TenantContactPhone: string;
  TenantContactCell: string;
  TenantContactEmail: string;
  HoursOfOperation: string;
  LeakLocation: LeakLocationName;
  LeakNear: LeakNearTypeName;
  LeakNearOther: string;
  HasAccessCode: boolean;
  AccessCode: string;
  IsSaturdayAccessPermitted: boolean;
  IsKeyRequired: boolean;
  IsLadderRequired: boolean;
  RoofPitch: RoofPitchTypeName;
  Comments: string;
};

export type ServiceOrderRequestPayload = {
  requestDate: string;
  client: ClientInfoPayload;
  billing: BillingInfoPayload;
  leakDetails: LeakDetailsPayload;
  additionalLeaks: LeakDetailsPayload[];
};

// --- Service Order Intake API (camelCase, numeric enums) ---

export type ServiceOrderIntakeClient = {
  dynamoAccountId: number | null;
  dynamoContactId: number | null;
  accountName: string;
  accountContactName: string;
  email: string;
  phone: string;
};

export type ServiceOrderIntakeBilling = {
  dynamoId: number | null;
  entityBillToName: string;
  billToAddress: string;
  billToAddress2: string;
  billToCity: string;
  billToZip: string;
  billToEmail: string;
};

export type ServiceOrderIntakeLeakDetails = {
  dynamoId: number | null;
  jobNo: string;
  jobDate: string | null;
  siteName: string;
  siteAddress: string;
  siteAddress2: string;
  siteCity: string;
  siteZip: string;
  tenantBusinessName: string;
  tenantContactName: string;
  tenantContactPhone: string;
  tenantContactCell: string;
  tenantContactEmail: string;
  hoursOfOperation: string;
  leakLocation: number;
  leakNear: number;
  leakNearOther: string;
  hasAccessCode: boolean;
  accessCode: string;
  isSaturdayAccessPermitted: boolean;
  isKeyRequired: boolean;
  isLadderRequired: boolean;
  roofPitch: number;
  comments: string;
};

export type ServiceOrderIntakeRequest = {
  client: ServiceOrderIntakeClient;
  billing: ServiceOrderIntakeBilling;
  leakDetails: ServiceOrderIntakeLeakDetails;
  additionalLeaks: ServiceOrderIntakeLeakDetails[];
  SignatureData: string;
  SignatureName: string;
};

export type ServiceOrderIntakeResponse = {
  success: boolean;
  referenceId: string;
  queueName: string;
  requestDate: string;
  createdAt: string;
  message: string;
};

export type ServiceOrderResponsePayload = {
  Id: number;
  RequestDate: string;
  Clients: ClientInfoPayload[];
  BillingInfos: BillingInfoPayload[];
  LeakDetails: LeakDetailsPayload[];
  CreatedAt: string;
  UpdatedAt?: string | null;
};

export type ServiceIntakeRequestPayload = {
  JobNo: string;
  EmailAddress: string;
  City: string;
  Zip: string;
};

export type ServiceIntakeResponse =
  | ServiceOrderResponsePayload
  | ServiceOrderResponsePayload[];

export type ServiceOrderLookupResponse = {
  clients: ClientInfoPayload[];
  billings: BillingInfoPayload[];
  leaks: LeakDetailsPayload[];
  serviceOrders: ServiceOrderResponsePayload[];
  message?: string;
};

export type SubmitServiceOrderResponse = {
  message: string;
  requestId: string;
};

// --- Service Order Status API ---

export type ServiceOrderStatusName =
  | "NEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ServiceOrderStatusData = {
  Id: string;
  RequestDate: string;
  Client: {
    DynamoAccountId: number | null;
    DynamoContactId: number | null;
    AccountName: string;
    AccountContactName: string;
    Email: string;
    Phone: string;
  };
  Billing: {
    DynamoId: number | null;
    EntityBillToName: string;
    BillToAddress: string;
    BillToAddress2: string;
    BillToCity: string;
    BillToZip: string;
    BillToEmail: string;
  };
  LeakDetails: {
    DynamoId: number | null;
    JobNo: string;
    JobDate: string | null;
    SiteName: string;
    SiteAddress: string;
    SiteAddress2: string;
    SiteCity: string;
    SiteZip: string;
    TenantBusinessName: string;
    TenantContactName: string;
    TenantContactPhone: string;
    TenantContactCell: string;
    TenantContactEmail: string;
    HoursOfOperation: string;
    LeakLocation: number;
    LeakNear: number;
    LeakNearOther: string;
    HasAccessCode: boolean;
    AccessCode: string;
    IsSaturdayAccessPermitted: boolean;
    IsKeyRequired: boolean;
    IsLadderRequired: boolean;
    RoofPitch: number;
    Comments: string;
  };
  AdditionalLeaks: ServiceOrderStatusData["LeakDetails"][];
  CreatedAt: string;
  UpdatedAt: string | null;
};

export type ServiceOrderStatusResponse = {
  Success: boolean;
  Message: string;
  Status: ServiceOrderStatusName;
  Data: ServiceOrderStatusData | null;
};
