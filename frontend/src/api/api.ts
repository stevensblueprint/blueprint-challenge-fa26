import type {
  Genre,
  Checkout,
  CheckoutFormValues,
  Book,
  BookFormValues,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

export async function listBooks(_params?: {
  q?: string;
  genre?: Genre | "All";
}): Promise<Book[]> {
  void _params;
  void API_BASE_URL;
  // TODO: Call GET /books with optional q/genre query params.
  throw new Error("TODO: implement listBooks in src/api/api.ts");
}

export async function getBook(_bookId: number): Promise<Book> {
  void _bookId;
  void API_BASE_URL;
  // TODO: Call GET /books/{id}.
  throw new Error("TODO: implement getBook in src/api/api.ts");
}

export async function createBook(
  _payload: BookFormValues,
): Promise<Book> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /books.
  throw new Error("TODO: implement createBook in src/api/api.ts");
}

export async function listBookCheckouts(
  _bookId: number,
): Promise<Checkout[]> {
  void _bookId;
  void API_BASE_URL;
  // TODO: Call GET /books/{id}/checkouts.
  throw new Error("TODO: implement listBookCheckouts in src/api/api.ts");
}

export async function createCheckout(
  _payload: CheckoutFormValues,
): Promise<Checkout> {
  void _payload;
  void API_BASE_URL;
  // TODO: Call POST /checkouts.
  throw new Error("TODO: implement createCheckout in src/api/api.ts");
}
