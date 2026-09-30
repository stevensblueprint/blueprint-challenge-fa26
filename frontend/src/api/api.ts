import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

export async function listBooks(params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) {
    searchParams.set("q", params.q);
  }
  if (params?.genre && params.genre !== "All") {
    searchParams.set("genre", params.genre);
  }

  const query = searchParams.toString();
  const url = query ? `${API_BASE_URL}/books?${query}` : `${API_BASE_URL}/books`;

  const response = await fetch(url);

  return response.json()
}

export async function getBook(bookId: number): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
  return response.json();
}

export async function createBook(
  payload: BookFormValues,
): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function listBookCheckouts(
  bookId: number,
): Promise<Checkout[]> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/checkouts`);
  return response.json();
}

export async function createCheckout(
  payload: CheckoutFormValues,
): Promise<Checkout> {
  const response = await fetch(`${API_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      book_id: Number(payload.book_id),
    }),
  });
  return response.json();
}
