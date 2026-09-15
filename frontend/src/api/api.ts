import type {
  Category,
  Referral,
  ReferralFormValues,
  Resource,
  ResourceFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

export async function listResources(_params?: {
  q?: string;
  category?: Category | "All";
}): Promise<Resource[]> {
  void _params;
  void API_BASE_URL;
  // TODO: Call GET /resources with optional q/category query params.
  throw new Error("TODO: implement listResources in src/api/api.ts");
}

export async function getResource(_resourceId: number): Promise<Resource> {
  void _resourceId;
  void API_BASE_URL;
  // TODO: Call GET /resources/{id}.
  throw new Error("TODO: implement getResource in src/api/api.ts");
}

export async function createResource(
  _payload: ResourceFormValues,
): Promise<Resource> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /resources.
  throw new Error("TODO: implement createResource in src/api/api.ts");
}

export async function listResourceReferrals(
  _resourceId: number,
): Promise<Referral[]> {
  void _resourceId;
  void API_BASE_URL;
  // TODO: Call GET /resources/{id}/referrals.
  throw new Error("TODO: implement listResourceReferrals in src/api/api.ts");
}

export async function createReferral(
  _payload: ReferralFormValues,
): Promise<Referral> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /referrals.
  throw new Error("TODO: implement createReferral in src/api/api.ts");
}
