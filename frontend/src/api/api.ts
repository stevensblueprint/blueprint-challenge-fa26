import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

// FastAPI explains an error in a "detail" field: either one sentence, or a
// list of validation problems that each carry a "msg".
async function describeError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown } | null;
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((problem: { msg?: string }) => problem.msg ?? "Invalid value")
        .join(" ");
    }
  } catch {
    // The body was not JSON, so fall back to the generic message below.
  }
  return `The server returned an error (status ${response.status}).`;
}

// Every call goes through here: send the request, turn a failure into an
// Error with a readable message, and hand back the parsed JSON.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new Error(
      "Could not reach the LibraryConnect server. Check that the backend is running.",
    );
  }
  if (!response.ok) {
    throw new Error(await describeError(response));
  }
  return (await response.json()) as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listBooks(params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
  // URLSearchParams escapes special characters such as & and # for us.
  const query = new URLSearchParams();
  const q = params?.q?.trim();
  if (q) query.set("q", q);
  if (params?.genre && params.genre !== "All") query.set("genre", params.genre);
  const queryString = query.toString();
  return request<Book[]>(queryString ? `/books?${queryString}` : "/books");
}

export async function getBook(bookId: number): Promise<Book> {
  return request<Book>(`/books/${bookId}`);
}

export async function createBook(payload: BookFormValues): Promise<Book> {
  return postJson<Book>("/books", payload);
}

export async function listBookCheckouts(bookId: number): Promise<Checkout[]> {
  return request<Checkout[]>(`/books/${bookId}/checkouts`);
}

export async function createCheckout(
  payload: CheckoutFormValues,
): Promise<Checkout> {
  // The form keeps book_id as text; the API expects a number.
  return postJson<Checkout>("/checkouts", {
    ...payload,
    book_id: Number(payload.book_id),
  });
}
