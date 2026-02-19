import { describe, it, expect } from "vitest";
import {
  INITIAL_FORM_DATA,
  EMPTY_PROPERTY,
  isFormDirty,
  validateEmergencyLeakServiceForm,
} from "@/helpers/emergencyLeakServiceForm";
import { IntakeFormData } from "@/types/emergencyLeakService";

function validFormData(): IntakeFormData {
  return {
    ...INITIAL_FORM_DATA,
    clientAccountName: "Acme Corp",
    clientAccountContactName: "John Smith",
    clientEmail: "john@acme.com",
    clientPhone: "555-123-4567",
    billingEntityBillToName: "Acme AP",
    billingBillToAddress: "100 Main St",
    billingBillToCity: "Denver",
    billingBillToZip: "80202",
    billingBillToEmail: "ap@acme.com",
    leakingProperties: [
      {
        ...EMPTY_PROPERTY,
        siteName: "Acme Warehouse",
        siteAddress: "456 Industrial Pkwy",
        siteCity: "Denver",
        siteZip: "80212",
      },
    ],
  };
}

describe("validateEmergencyLeakServiceForm", () => {
  it("returns no errors for a fully valid form", () => {
    const errors = validateEmergencyLeakServiceForm(validFormData());
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires clientAccountName", () => {
    const data = validFormData();
    data.clientAccountName = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientAccountName).toBeDefined();
  });

  it("requires clientAccountContactName", () => {
    const data = validFormData();
    data.clientAccountContactName = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientAccountContactName).toBeDefined();
  });

  it("requires a valid clientEmail", () => {
    const data = validFormData();
    data.clientEmail = "not-an-email";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientEmail).toBeDefined();
  });

  it("accepts a valid email address", () => {
    const data = validFormData();
    data.clientEmail = "user@example.com";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientEmail).toBeUndefined();
  });

  it("requires a valid clientPhone", () => {
    const data = validFormData();
    data.clientPhone = "123";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientPhone).toBeDefined();
  });

  it("accepts a valid phone number", () => {
    const data = validFormData();
    data.clientPhone = "(303) 555-0199";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.clientPhone).toBeUndefined();
  });

  it("requires siteName on leaking property", () => {
    const data = validFormData();
    data.leakingProperties[0].siteName = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.siteName).toBeDefined();
  });

  it("requires siteAddress on leaking property", () => {
    const data = validFormData();
    data.leakingProperties[0].siteAddress = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.siteAddress).toBeDefined();
  });

  it("requires siteCity on leaking property", () => {
    const data = validFormData();
    data.leakingProperties[0].siteCity = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.siteCity).toBeDefined();
  });

  it("requires siteZip on leaking property", () => {
    const data = validFormData();
    data.leakingProperties[0].siteZip = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.siteZip).toBeDefined();
  });

  it("validates billingBillToEmail only when provided", () => {
    const data = validFormData();
    data.billingBillToEmail = "";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.billingBillToEmail).toBeUndefined();
  });

  it("rejects invalid billingBillToEmail when provided", () => {
    const data = validFormData();
    data.billingBillToEmail = "bad-email";
    const errors = validateEmergencyLeakServiceForm(data);
    expect(errors.billingBillToEmail).toBeDefined();
  });

  it("reports multiple errors at once", () => {
    const errors = validateEmergencyLeakServiceForm(INITIAL_FORM_DATA);
    // At minimum: clientAccountName, clientAccountContactName, clientEmail,
    // clientPhone, siteName, siteAddress, siteCity, siteZip
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(8);
  });
});

describe("isFormDirty", () => {
  it("returns false for pristine state", () => {
    expect(isFormDirty(INITIAL_FORM_DATA, "", "")).toBe(false);
  });

  it("returns true when service order lookup has a value", () => {
    expect(isFormDirty(INITIAL_FORM_DATA, "ELS-26-01-0001", "")).toBe(true);
  });

  it("returns true when email lookup has a value", () => {
    expect(isFormDirty(INITIAL_FORM_DATA, "", "test@example.com")).toBe(true);
  });

  it("returns true when a top-level form field is changed", () => {
    const data: IntakeFormData = {
      ...INITIAL_FORM_DATA,
      clientAccountName: "Acme Corp",
      leakingProperties: [{ ...EMPTY_PROPERTY }],
    };
    expect(isFormDirty(data, "", "")).toBe(true);
  });

  it("returns true when a property field is changed", () => {
    const data: IntakeFormData = {
      ...INITIAL_FORM_DATA,
      leakingProperties: [{ ...EMPTY_PROPERTY, siteName: "Test Site" }],
    };
    expect(isFormDirty(data, "", "")).toBe(true);
  });

  it("returns true when a boolean property field differs", () => {
    const data: IntakeFormData = {
      ...INITIAL_FORM_DATA,
      leakingProperties: [{ ...EMPTY_PROPERTY, hasAccessCode: true }],
    };
    expect(isFormDirty(data, "", "")).toBe(true);
  });

  it("returns true when dynamo ID differs from initial", () => {
    const data: IntakeFormData = {
      ...INITIAL_FORM_DATA,
      clientDynamoAccountId: 123,
      leakingProperties: [{ ...EMPTY_PROPERTY }],
    };
    expect(isFormDirty(data, "", "")).toBe(true);
  });

  it("returns false when lookup values are whitespace only", () => {
    expect(isFormDirty(INITIAL_FORM_DATA, "   ", "  ")).toBe(false);
  });
});
