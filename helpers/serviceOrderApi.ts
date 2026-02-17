import {
  ServiceIntakeRequestPayload,
  ServiceIntakeResponse,
  ServiceOrderResponsePayload,
  ServiceOrderLookupResponse,
  ServiceOrderRequestPayload,
  SubmitServiceOrderResponse,
} from "@/types/emergencyLeakService";
import { fetchJson } from "@/helpers/unifiedFetcher";

type LegacyServiceIntakeResponse = {
  matches?: ServiceOrderResponsePayload[];
  message?: string;
};

function isServiceOrderResponsePayload(
  value: unknown,
): value is ServiceOrderResponsePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ServiceOrderResponsePayload>;

  return (
    typeof candidate.Id === "number" &&
    typeof candidate.RequestDate === "string" &&
    Array.isArray(candidate.Clients) &&
    Array.isArray(candidate.BillingInfos) &&
    Array.isArray(candidate.LeakDetails)
  );
}

function normalizeServiceIntakeResponse(input: unknown): {
  orders: ServiceOrderResponsePayload[];
  message?: string;
} {
  if (Array.isArray(input)) {
    const orders = input.filter(isServiceOrderResponsePayload);
    return { orders };
  }

  if (isServiceOrderResponsePayload(input)) {
    return { orders: [input] };
  }

  const legacy = input as LegacyServiceIntakeResponse;
  if (legacy && Array.isArray(legacy.matches)) {
    return {
      orders: legacy.matches.filter(isServiceOrderResponsePayload),
      message: legacy.message,
    };
  }

  return {
    orders: [],
    message:
      legacy && typeof legacy.message === "string" ? legacy.message : undefined,
  };
}

function toLookupResponse(
  response: ServiceIntakeResponse | LegacyServiceIntakeResponse,
): ServiceOrderLookupResponse {
  const { orders, message } = normalizeServiceIntakeResponse(response);
  const clients = orders.flatMap((order) => order.Clients);
  const billings = orders.flatMap((order) => order.BillingInfos);
  const leaks = orders.flatMap((order) => order.LeakDetails);

  return {
    clients,
    billings,
    leaks,
    serviceOrders: orders,
    message,
  };
}

export async function lookupServiceIntake(
  payload: ServiceIntakeRequestPayload,
): Promise<ServiceOrderLookupResponse> {
  const result = await fetchJson<ServiceIntakeResponse>(
    "/api/emergency-leak-service/lookup",
    {
      method: "POST",
      body: payload,
    },
    "Lookup request failed.",
  );

  return toLookupResponse(result);
}

export async function submitServiceOrderRequest(
  payload: ServiceOrderRequestPayload,
): Promise<SubmitServiceOrderResponse> {
  const result = await fetchJson<Partial<SubmitServiceOrderResponse>>(
    "/api/emergency-leak-service",
    {
      method: "POST",
      body: payload,
    },
    "Submit request failed.",
  );

  return {
    message:
      typeof result.message === "string"
        ? result.message
        : "Request submitted successfully.",
    requestId:
      typeof result.requestId === "string" && result.requestId.trim().length > 0
        ? result.requestId
        : "Pending",
  };
}
