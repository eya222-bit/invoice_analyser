from datetime import date
import re

from app.models.invoice_models import InvoiceData


def parse_invoice(text: str) -> InvoiceData:

    supplier = None
    invoice_number = None
    invoice_date = None
    due_date = None
    total_amount = None
    currency = None
    vat = None

    # Supplier : première ligne non vide
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    if lines:
        supplier = lines[0]

    # Invoice Number
    match = re.search(
        r"(Invoice\s*(No|Number)?|Facture\s*(N°|No)?)\s*[:#]?\s*([A-Za-z0-9\-\/]+)",
        text,
        re.IGNORECASE
    )

    if match:
        invoice_number = match.group(4)

    # Total
    match = re.search(
        r"(Total|Montant\s*Total)\s*[:\-]?\s*([\d.,]+)\s*(EUR|USD|TND|GBP)?",
        text,
        re.IGNORECASE
    )

    if match:

        total_amount = float(
            match.group(2).replace(",", ".")
        )

        currency = match.group(3)

    # VAT

    match = re.search(
        r"(VAT|TVA|Tax)\s*[:\-]?\s*([\d.,]+%?)",
        text,
        re.IGNORECASE
    )

    if match:
        vat = match.group(2)
    

    return InvoiceData(
        supplier=supplier,
        invoice_number=invoice_number,
        invoice_date=invoice_date,
        due_date=due_date,
        total_amount=total_amount,
        currency=currency,
        vat=vat,
        confidence=0.70,
        raw_text=text
    )