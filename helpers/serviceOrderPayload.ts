import {
  IntakeFormData,
  LeakLocationName,
  LeakNearTypeName,
  RoofPitchTypeName,
  ServiceOrderIntakeLeakDetails,
  ServiceOrderIntakeRequest,
} from "@/types/emergencyLeakService";

const LEAK_LOCATION_MAP: Record<LeakLocationName, number> = {
  Front: 1,
  Middle: 2,
  Back: 3,
};

const LEAK_NEAR_MAP: Record<LeakNearTypeName, number> = {
  HVACDuct: 1,
  Skylight: 2,
  Wall: 3,
  Drain: 4,
  Other: 5,
};

const ROOF_PITCH_MAP: Record<RoofPitchTypeName, number> = {
  FlatRoof: 1,
  SteepShingleTile: 2,
};

function toLeakDetailsPayload(
  property: IntakeFormData["leakingProperties"][number],
): ServiceOrderIntakeLeakDetails {
  return {
    dynamoId: property.dynamoId,
    jobNo: property.jobNo,
    jobDate: null,
    siteName: property.siteName,
    siteAddress: property.siteAddress,
    siteAddress2: property.siteAddress2,
    siteCity: property.siteCity,
    siteZip: property.siteZip,
    tenantBusinessName: property.tenantBusinessName,
    tenantContactName: property.tenantContactName,
    tenantContactPhone: property.tenantContactPhone,
    tenantContactCell: property.tenantContactCell,
    tenantContactEmail: property.tenantContactEmail,
    hoursOfOperation: property.hoursOfOperation,
    leakLocation: LEAK_LOCATION_MAP[property.leakLocation],
    leakNear: LEAK_NEAR_MAP[property.leakNear],
    leakNearOther: property.leakNearOther,
    hasAccessCode: property.hasAccessCode,
    accessCode: property.accessCode,
    isSaturdayAccessPermitted: property.isSaturdayAccessPermitted,
    isKeyRequired: property.isKeyRequired,
    isLadderRequired: property.isLadderRequired,
    roofPitch: ROOF_PITCH_MAP[property.roofPitch],
    comments: property.comments,
  };
}

export function buildServiceOrderRequestPayload(
  formData: IntakeFormData,
  signatureDataUrl: string,
  signatureName: string,
): ServiceOrderIntakeRequest {
  const [primaryProperty, ...additionalProperties] = formData.leakingProperties;

  return {
    client: {
      dynamoAccountId: formData.clientDynamoAccountId,
      dynamoContactId: formData.clientDynamoCountId,
      accountName: formData.clientAccountName,
      accountContactName: formData.clientAccountContactName,
      email: formData.clientEmail,
      phone: formData.clientPhone,
    },
    billing: {
      dynamoId: formData.billingDynamoId,
      entityBillToName: formData.billingEntityBillToName,
      billToAddress: formData.billingBillToAddress,
      billToAddress2: formData.billingBillToAddress2,
      billToCity: formData.billingBillToCity,
      billToZip: formData.billingBillToZip,
      billToEmail: formData.billingBillToEmail,
    },
    leakDetails: toLeakDetailsPayload(primaryProperty),
    additionalLeaks: additionalProperties.map((property) =>
      toLeakDetailsPayload(property),
    ),
    SignatureData: signatureDataUrl,
    SignatureName: signatureName,
  };
}
