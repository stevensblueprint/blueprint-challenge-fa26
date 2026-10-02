import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

// Fetches the book catalog, optionally narrowed by title search and/or genre.
// "q"/"genre" are omitted from the request entirely when empty or set to "All".
export async function listBooks(_params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
  void _params;
  void API_BASE_URL;
  // TODO: Call GET /books with optional q/genre query params.
  // throw new Error("TODO: implement listBooks in src/api/api.ts");
  //
  const query = new URLSearchParams();
  if (_params?.q) query.set("q", _params.q);
  if (_params?.genre && _params.genre != "All") query.set("genre", _params.genre);

  const queryString = query.toString();
  const response = await fetch(`${API_BASE_URL}/books${queryString ? `?${queryString}` : ""}`);
  if (!response.ok) throw new Error(`Failed to load books: ${response.status}`);
  return response.json();

}

// Fetches the details of a single book by id.
export async function getBook(_bookId: number): Promise<Book> {
  void _bookId;
  void API_BASE_URL;
  // TODO: Call GET /books/{id}.
  // throw new Error("TODO: implement getBook in src/api/api.ts");

  const response = await fetch(`${API_BASE_URL}/books/${_bookId}`);
  if (!response.ok) throw new Error(`Failed to load book ${_bookId}: ${response.status}`);
  return response.json();

}

// Creates a new book from form values and returns the persisted book (with its new id).
export async function createBook(
  _payload: BookFormValues,
): Promise<Book> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /books.
  // throw new Error("TODO: implement createBook in src/api/api.ts");

  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`Failed to create book: ${response.status} ${JSON.stringify(body?.detail ?? body)}`);
  }
  return response.json();

}

// Fetches every checkout recorded against the given book.
export async function listBookCheckouts(
  _bookId: number,
): Promise<Checkout[]> {
  void _bookId;
  void API_BASE_URL;
  // TODO: Call GET /books/{id}/checkouts.
  // throw new Error("TODO: implement listBookCheckouts in src/api/api.ts");

  const response = await fetch(`${API_BASE_URL}/books/${_bookId}/checkouts`);
  if (!response.ok) throw new Error(`Failed to load checkouts for book ${_bookId}: ${response.status}`);
  return response.json();

}

// Creates a checkout for a book. book_id is coerced to a number here since the
// <select> form value arrives as a string but the backend expects an int.
export async function createCheckout(
  _payload: CheckoutFormValues,
): Promise<Checkout> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /checkouts.
  // throw new Error("TODO: implement createCheckout in src/api/api.ts");
  const response = await fetch(`${API_BASE_URL}/checkouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ..._payload, book_id: Number(_payload.book_id) }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`Failed to create checkout: ${response.status} ${JSON.stringify(body?.detail ?? body)}`);
  }
  return response.json();
}
