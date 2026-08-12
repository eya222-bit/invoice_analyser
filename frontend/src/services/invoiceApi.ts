const API_URL = "http://localhost:3000";

export async function uploadInvoice(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/invoices/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Invoice upload failed"
    );
  }

  return data;
}
export async function getInvoiceStats() {
  const response = await fetch(
    `${API_URL}/api/invoices/stats`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to retrieve statistics"
    );
  }

  return data;
}

export async function getExpensesBySupplier() {
  const response = await fetch(
    `${API_URL}/api/invoices/by-supplier`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to retrieve supplier expenses"
    );
  }

  return data;
}

export async function getExpensesByDate() {
  const response = await fetch(
    `${API_URL}/api/invoices/by-date`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to retrieve expenses by date"
    );
  }

  return data;
}