import {
  IntakeFormData,
  LeakingProperty,
  ValidationErrors,
} from "@/types/emergencyLeakService";

export const EMPTY_PROPERTY: LeakingProperty = {
  dynamoId: null,
  jobNo: "",
  siteName: "",
  siteAddress: "",
  siteAddress2: "",
  siteCity: "",
  siteZip: "",
  tenantBusinessName: "",
  tenantContactName: "",
  tenantContactPhone: "",
  tenantContactCell: "",
  tenantContactEmail: "",
  hoursOfOperation: "",
  leakLocation: "Middle",
  leakNear: "HVACDuct",
  leakNearOther: "",
  hasAccessCode: false,
  accessCode: "",
  isSaturdayAccessPermitted: false,
  isKeyRequired: false,
  isLadderRequired: false,
  roofPitch: "FlatRoof",
  comments: "",
};

export const INITIAL_FORM_DATA: IntakeFormData = {
  leakingProperties: [],
  clientDynamoAccountId: null,
  clientDynamoCountId: null,
  clientAccountName: "",
  clientAccountContactName: "",
  clientEmail: "",
  clientPhone: "",
  billingDynamoId: null,
  billingEntityBillToName: "",
  billingBillToAddress: "",
  billingBillToAddress2: "",
  billingBillToCity: "",
  billingBillToZip: "",
  billingBillToEmail: "",
};

export const MOCK_FORM_DATA: IntakeFormData = {
  clientDynamoAccountId: 55001,
  clientDynamoCountId: 9911,
  clientAccountName: "Acme Retail Centers",
  clientAccountContactName: "Jordan Smith",
  clientEmail: "jordan.smith@acmeretail.com",
  clientPhone: "303-555-0199",
  billingDynamoId: 88001,
  billingEntityBillToName: "Acme AP Department",
  billingBillToAddress: "100 Market Street",
  billingBillToAddress2: "Suite 240",
  billingBillToCity: "Denver",
  billingBillToZip: "80202",
  billingBillToEmail: "ap@acmeretail.com",
  leakingProperties: [
    {
      dynamoId: 77001,
      jobNo: "ELS-26-01-0001",
      siteName: "Acme North Plaza",
      siteAddress: "4550 W 38th Ave",
      siteAddress2: "Rear Service Entrance",
      siteCity: "Denver",
      siteZip: "80212",
      tenantBusinessName: "North Plaza Liquor",
      tenantContactName: "Chris Ramirez",
      tenantContactPhone: "720-555-0141",
      tenantContactCell: "720-555-0191",
      tenantContactEmail: "chris.ramirez@tenantco.com",
      hoursOfOperation: "7:00 AM - 10:00 PM",
      leakLocation: "Middle",
      leakNear: "HVACDuct",
      leakNearOther: "",
      hasAccessCode: true,
      accessCode: "2468",
      isSaturdayAccessPermitted: true,
      isKeyRequired: false,
      isLadderRequired: true,
      roofPitch: "FlatRoof",
      comments:
        "Water intrusion over retail aisle during heavy rain. Please call tenant before arrival.",
    },
  ],
};

export const MOCK_LOOKUP_VALUES = {
  serviceOrderNumber: "ELS-26-01-0001",
  email: "jordan.smith@acmeretail.com",
};

export function isPropertyDirty(property: LeakingProperty): boolean {
  const initialProperty = EMPTY_PROPERTY;

  const propertyStringKeys: (keyof LeakingProperty)[] = [
    "siteName",
    "siteAddress",
    "siteAddress2",
    "siteCity",
    "siteZip",
    "tenantBusinessName",
    "tenantContactName",
    "tenantContactPhone",
    "tenantContactCell",
    "tenantContactEmail",
    "hoursOfOperation",
    "leakNearOther",
    "accessCode",
    "comments",
    "jobNo",
  ];

  for (const key of propertyStringKeys) {
    if (property[key] !== initialProperty[key]) return true;
  }

  if (
    property.leakLocation !== initialProperty.leakLocation ||
    property.leakNear !== initialProperty.leakNear ||
    property.roofPitch !== initialProperty.roofPitch ||
    property.hasAccessCode !== initialProperty.hasAccessCode ||
    property.isSaturdayAccessPermitted !==
      initialProperty.isSaturdayAccessPermitted ||
    property.isKeyRequired !== initialProperty.isKeyRequired ||
    property.isLadderRequired !== initialProperty.isLadderRequired ||
    property.dynamoId !== initialProperty.dynamoId
  ) {
    return true;
  }

  return false;
}

export function isFormDirty(
  formData: IntakeFormData,
  serviceOrderLookupValue: string,
  emailLookupValue: string,
): boolean {
  if (serviceOrderLookupValue.trim() || emailLookupValue.trim()) {
    return true;
  }

  const initial = INITIAL_FORM_DATA;

  const topLevelKeys: (keyof IntakeFormData)[] = [
    "clientAccountName",
    "clientAccountContactName",
    "clientEmail",
    "clientPhone",
    "billingEntityBillToName",
    "billingBillToAddress",
    "billingBillToAddress2",
    "billingBillToCity",
    "billingBillToZip",
    "billingBillToEmail",
  ];

  for (const key of topLevelKeys) {
    if (formData[key] !== initial[key]) return true;
  }

  if (
    formData.clientDynamoAccountId !== initial.clientDynamoAccountId ||
    formData.clientDynamoCountId !== initial.clientDynamoCountId ||
    formData.billingDynamoId !== initial.billingDynamoId
  ) {
    return true;
  }

  // Dirty if any properties have been added
  if (formData.leakingProperties.length > 0) return true;

  return false;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isPhone(value: string) {
  return /^[0-9+()\-\s]{10,}$/.test(value.trim());
}

export function validateProperty(property: LeakingProperty): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!property.siteName.trim()) {
    errors.siteName = "Site Name is required.";
  }
  if (!property.siteAddress.trim()) {
    errors.siteAddress = "Site Address is required.";
  }
  if (!property.siteCity.trim()) {
    errors.siteCity = "Site City is required.";
  }
  if (!property.siteZip.trim()) {
    errors.siteZip = "Site Zip is required.";
  }

  return errors;
}

export function validateEmergencyLeakServiceForm(
  data: IntakeFormData,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.clientAccountName.trim()) {
    errors.clientAccountName = "Account Name is required.";
  }
  if (!data.clientAccountContactName.trim()) {
    errors.clientAccountContactName = "Account Contact Name is required.";
  }
  if (!isEmail(data.clientEmail)) {
    errors.clientEmail = "Enter a valid email address.";
  }
  if (!isPhone(data.clientPhone)) {
    errors.clientPhone = "Enter a valid phone number.";
  }
  if (data.billingBillToEmail.trim() && !isEmail(data.billingBillToEmail)) {
    errors.billingBillToEmail = "Enter a valid billing email address.";
  }

  if (data.leakingProperties.length === 0) {
    errors.siteName = "At least one property is required.";
  }

  // Also validate each property in the array
  for (const property of data.leakingProperties) {
    const propErrors = validateProperty(property);
    // Surface the first property-level error found (keyed by field name)
    for (const [key, value] of Object.entries(propErrors)) {
      if (!errors[key as keyof ValidationErrors]) {
        errors[key as keyof ValidationErrors] = value;
      }
    }
  }

  return errors;
}
