import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object" && "detail" in body) {
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        const errors = body.detail.flatMap((item: unknown) => {
          if (!item || typeof item !== "object" || !("msg" in item)) {
            return [];
          }
          if (typeof item.msg !== "string") return [];
          const field = "loc" in item && Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== "body").join(".")
            : "";
          return [field ? `${field}: ${item.msg}` : item.msg];
        });
        if (errors.length) message = errors.join("; ");
      }
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function listBooks(params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.genre && params.genre !== "All") {
    query.set("genre", params.genre);
  }
  const suffix = query.toString();
  return request<Book[]>(`/books${suffix ? `?${suffix}` : ""}`);
}

export async function getBook(bookId: number): Promise<Book> {
  return request<Book>(`/books/${bookId}`);
}

export async function createBook(payload: BookFormValues): Promise<Book> {
  return request<Book>("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listBookCheckouts(bookId: number): Promise<Checkout[]> {
  return request<Checkout[]>(`/books/${bookId}/checkouts`);
}

export async function createCheckout(
  payload: CheckoutFormValues,
): Promise<Checkout> {
  return request<Checkout>("/checkouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
