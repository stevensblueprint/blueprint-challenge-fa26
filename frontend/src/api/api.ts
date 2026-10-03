import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

// FastAPI errors look like {"detail": "Book not found"} or, for validation
// errors (422), {"detail": [{"msg": "...", ...}, ...]}.
async function errorMessage(response: Response): Promise<string> {
  const fallback = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join("; ") || fallback;
    }
  } catch {
    // Body was not JSON; use the fallback below.
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }
  return response.json() as Promise<T>;
}

function postJson<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listBooks(params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
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
  // The form keeps book_id as a string; the API expects a number.
  return postJson<Checkout>("/checkouts", {
    ...payload,
    book_id: Number(payload.book_id),
  });
}
