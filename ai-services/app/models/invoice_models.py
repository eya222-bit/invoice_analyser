from typing import Optional

from pydantic import BaseModel


class InvoiceData(BaseModel):
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    vat: Optional[str] = None
    confidence: Optional[float] = None
    raw_text: Optional[str] = None


class InvoiceResponse(BaseModel):
    success: bool
    message: str
    data: InvoiceData