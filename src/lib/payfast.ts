export interface CreatePaymentPayload {
  order_id: string;
  amount: number;
  item_name: string;
  buyer_email?: string;
  request_id?: string;
  book_id?: string;
  reader_id?: string;
  reader_email?: string;
  reader_name?: string;
}

export async function createPayment(
  backendUrl: string,
  payload: CreatePaymentPayload
): Promise<string> {
  const res = await fetch(`${backendUrl}/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create payment");
  }

  const data = await res.json();
  return data.redirect_url;
}