import { describe, it, expect } from "vitest";
import { buildServiceOrderRequestPayload } from "@/helpers/serviceOrderPayload";
import { IntakeFormData } from "@/types/emergencyLeakService";
import {
  INITIAL_FORM_DATA,
  EMPTY_PROPERTY,
} from "@/helpers/emergencyLeakServiceForm";

function makeFormData(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...INITIAL_FORM_DATA,
    clientAccountName: "Acme Corp",
    clientAccountContactName: "John Smith",
    clientEmail: "john@acme.com",
    clientPhone: "555-1234",
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
        leakLocation: "Front",
        leakNear: "HVACDuct",
        roofPitch: "FlatRoof",
      },
    ],
    ...overrides,
  };
}

describe("serviceOrderPayload", () => {
  describe("buildServiceOrderRequestPayload", () => {
    it("maps client fields correctly", () => {
      const formData = makeFormData({
        clientDynamoAccountId: 55,
        clientDynamoCountId: 99,
      });

      const payload = buildServiceOrderRequestPayload(
        formData,
        "data:image/png;base64,TEST",
        "John Smith",
      );

      expect(payload.client.dynamoAccountId).toBe(55);
      expect(payload.client.dynamoContactId).toBe(99);
      expect(payload.client.accountName).toBe("Acme Corp");
      expect(payload.client.accountContactName).toBe("John Smith");
      expect(payload.client.email).toBe("john@acme.com");
      expect(payload.client.phone).toBe("555-1234");
    });

    it("maps billing fields correctly", () => {
      const formData = makeFormData({ billingDynamoId: 88 });
      const payload = buildServiceOrderRequestPayload(
        formData,
        "data:image/png;base64,TEST",
        "John Smith",
      );

      expect(payload.billing.dynamoId).toBe(88);
      expect(payload.billing.entityBillToName).toBe("Acme AP");
      expect(payload.billing.billToAddress).toBe("100 Main St");
      expect(payload.billing.billToCity).toBe("Denver");
      expect(payload.billing.billToZip).toBe("80202");
      expect(payload.billing.billToEmail).toBe("ap@acme.com");
    });

    it("converts leakLocation string to numeric enum", () => {
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        "data:image/png;base64,TEST",
        "John Smith",
      );
      // "Front" → 1
      expect(payload.leakDetails.leakLocation).toBe(1);
    });

    it("converts leakNear string to numeric enum", () => {
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        "data:image/png;base64,TEST",
        "John Smith",
      );
      // "HVACDuct" → 1
      expect(payload.leakDetails.leakNear).toBe(1);
    });

    it("converts roofPitch string to numeric enum", () => {
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        "data:image/png;base64,TEST",
        "John Smith",
      );
      // "FlatRoof" → 1
      expect(payload.leakDetails.roofPitch).toBe(1);
    });

    it("maps Middle leak location to 2", () => {
      const formData = makeFormData({
        leakingProperties: [
          {
            ...EMPTY_PROPERTY,
            siteName: "Site",
            siteAddress: "1 St",
            siteCity: "City",
            siteZip: "00000",
            leakLocation: "Middle",
            leakNear: "Skylight",
            roofPitch: "SteepShingleTile",
          },
        ],
      });
      const payload = buildServiceOrderRequestPayload(
        formData,
        "data:image/png;base64,TEST",
        "John Smith",
      );

      expect(payload.leakDetails.leakLocation).toBe(2); // Middle
      expect(payload.leakDetails.leakNear).toBe(2); // Skylight
      expect(payload.leakDetails.roofPitch).toBe(2); // SteepShingleTile
    });

    it("places first property in leakDetails, rest in additionalLeaks", () => {
      const formData = makeFormData({
        leakingProperties: [
          {
            ...EMPTY_PROPERTY,
            siteName: "Primary Site",
            siteAddress: "1 St",
            siteCity: "City",
            siteZip: "00000",
            leakLocation: "Front",
            leakNear: "Wall",
            roofPitch: "FlatRoof",
          },
          {
            ...EMPTY_PROPERTY,
            siteName: "Secondary Site",
            siteAddress: "2 St",
            siteCity: "City",
            siteZip: "00000",
            leakLocation: "Back",
            leakNear: "Drain",
            roofPitch: "SteepShingleTile",
          },
        ],
      });

      const payload = buildServiceOrderRequestPayload(
        formData,
        "data:image/png;base64,TEST",
        "John Smith",
      );

      expect(payload.leakDetails.siteName).toBe("Primary Site");
      expect(payload.additionalLeaks).toHaveLength(1);
      expect(payload.additionalLeaks[0].siteName).toBe("Secondary Site");
      expect(payload.additionalLeaks[0].leakLocation).toBe(3); // Back
      expect(payload.additionalLeaks[0].leakNear).toBe(4); // Drain
    });

    it("returns empty additionalLeaks when only one property", () => {
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        "data:image/png;base64,TEST",
        "John Smith",
      );
      expect(payload.additionalLeaks).toEqual([]);
    });

    it("includes signatureData in the payload", () => {
      const sig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        sig,
        "John Smith",
      );
      expect(payload.SignatureData).toBe(sig);
    });

    it("includes SignatureName in the payload", () => {
      const payload = buildServiceOrderRequestPayload(
        makeFormData(),
        "data:image/png;base64,TEST",
        "Jane Doe",
      );
      expect(payload.SignatureName).toBe("Jane Doe");
    });
  });
});
