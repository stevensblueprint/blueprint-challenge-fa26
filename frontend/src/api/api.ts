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
  // Call GET /books with optional q/genre query params.
  const searchParams = new URLSearchParams();

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  if(params?.genre && params.genre !== "All") {
    searchParams.set("genre", params.genre);
  }

  const query = searchParams.toString();
  const url = query
    ? `${API_BASE_URL}/books?${query}`
    : `${API_BASE_URL}/books`;
  
  const response = await fetch(url);
  if(!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status}`)
  }

  return response.json();
}

export async function getBook(bookId: number): Promise<Book> {
  // Call GET /books/{id}.
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
  if(!response.ok) {
    throw new Error(`Failed to fetch book: ${response.status}`);
  }

  return response.json();
}

export async function createBook(
  payload: BookFormValues,
): Promise<Book> {
  // Call POST /books.
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  })
  if(!response.ok) {
    throw new Error(`Failed to create book: ${response.status}`);
  }

  return response.json();
}

export async function listBookCheckouts(
  bookId: number,
): Promise<Checkout[]> {
  // Call GET /books/{id}/checkouts.
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/checkouts`);
  if(!response.ok) {
    throw new Error(`Failed to fetch checkouts: ${response.status}`);
  }
  return response.json();
}

export async function createCheckout(
  payload: CheckoutFormValues,
): Promise<Checkout> {
  // Call POST /checkouts.
  const response = await fetch(`${API_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ ...payload, book_id: Number(payload.book_id) }), // backend expects number type book_id
  })
  if(!response.ok) {
    throw new Error(`Failed to create checkout: ${response.status}`);
  }

  return response.json();
}
