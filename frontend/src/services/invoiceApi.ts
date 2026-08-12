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