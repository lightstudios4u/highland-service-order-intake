import {
  IntakeFormData,
  LeakDetailsPayload,
  ServiceOrderRequestPayload,
} from "@/types/emergencyLeakService";

function toLeakDetailsPayload(
  property: IntakeFormData["leakingProperties"][number],
): LeakDetailsPayload {
  return {
    DynamoId: property.dynamoId,
    JobNo: property.jobNo,
    SiteName: property.siteName,
    SiteAddress: property.siteAddress,
    SiteAddress2: property.siteAddress2,
    SiteCity: property.siteCity,
    SiteZip: property.siteZip,
    TenantBusinessName: property.tenantBusinessName,
    TenantContactName: property.tenantContactName,
    TenantContactPhone: property.tenantContactPhone,
    TenantContactCell: property.tenantContactCell,
    TenantContactEmail: property.tenantContactEmail,
    HoursOfOperation: property.hoursOfOperation,
    LeakLocation: property.leakLocation,
    LeakNear: property.leakNear,
    LeakNearOther: property.leakNearOther,
    HasAccessCode: property.hasAccessCode,
    AccessCode: property.accessCode,
    IsSaturdayAccessPermitted: property.isSaturdayAccessPermitted,
    IsKeyRequired: property.isKeyRequired,
    IsLadderRequired: property.isLadderRequired,
    RoofPitch: property.roofPitch,
    Comments: property.comments,
  };
}

export function buildServiceOrderRequestPayload(
  formData: IntakeFormData,
): ServiceOrderRequestPayload {
  const [primaryProperty, ...additionalProperties] = formData.leakingProperties;

  return {
    requestDate: new Date().toISOString(),
    client: {
      DynamoAccountId: formData.clientDynamoAccountId,
      DynamoCountId: formData.clientDynamoCountId,
      AccountName: formData.clientAccountName,
      AccountContactName: formData.clientAccountContactName,
      Email: formData.clientEmail,
      Phone: formData.clientPhone,
    },
    billing: {
      DynamoId: formData.billingDynamoId,
      EntityBillToName: formData.billingEntityBillToName,
      BillToAddress: formData.billingBillToAddress,
      BillToAddress2: formData.billingBillToAddress2,
      BillToCity: formData.billingBillToCity,
      BillToZip: formData.billingBillToZip,
      BillToEmail: formData.billingBillToEmail,
    },
    leakDetails: toLeakDetailsPayload(primaryProperty),
    additionalLeaks: additionalProperties.map((property) =>
      toLeakDetailsPayload(property),
    ),
  };
}
