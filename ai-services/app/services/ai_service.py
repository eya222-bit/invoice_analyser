import requests
import json
import re


def clean_json_response(response_text: str):
    # Supprimer ```json et ```
    response_text = response_text.strip()

    response_text = re.sub(r"```json", "", response_text, flags=re.IGNORECASE)
    response_text = re.sub(r"```", "", response_text)

    response_text = response_text.strip()

    return json.loads(response_text)


def normalize_invoice(invoice):

    # Nettoyage du montant
    if isinstance(invoice.get("total_amount"), str):

        value = invoice["total_amount"]

        # Supprimer devise et caractères inutiles
        value = re.sub(r"[^\d,\-]", "", value)

        # Exemple : 174,00 -> 174.00
        value = value.replace(",", ".")

        try:
            invoice["total_amount"] = float(value)
        except ValueError:
            invoice["total_amount"] = None

    return invoice


def analyze_invoice(text):

    prompt = f"""
You are an invoice analysis AI.

Analyze the following invoice text.

Extract the following information:

- supplier
- invoice_number
- invoice_date
- due_date
- total_amount
- currency
- vat

IMPORTANT RULES:

1. total_amount MUST be a number only.
   Example: 174.00 or 174
   NOT: "174.00 €"
   NOT: "174 EUR"
   when you find a number like 144,77 you must return it as 144.77 and not 144,77

2. VAT EXTRACTION RULES:
- Extract the exact value of the percentage written next to TVA/VAT/Tax .

- "20.0%" MUST be returned as "20%".
- "19%" MUST be returned as "19%".
- "7.5%" MUST be returned as "7.5%".
- "4,4%" MUST be returned as "4,4%".
it can be 4,4% for example when you have VAT on this type of value you must return "4,4%".
very importent: if you have a VAT value like 20% or 19% or 7.5% or 4.4% you must return it as it is without any modification. and the vat never can be higher then 100% 



IMPORTANT:
-supplier in the high of document you find it in the first line or in the second line or in the third line you find it in the first 3 lines of the document and you can find it in the left margin.

3. currency must contain only the currency code when possible.
   Example: EUR, USD, TND, GBP.

4. If a field cannot be found, return null.
-the total_amount have not relation with the vat exigence.          

5. Return ONLY valid JSON.
6. Do not use Markdown.
7. Do not use ```json.
8.- invoice_date and due_date can be null if you can't find them in the document.but if you find them in the format dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy you must return them in the same format as they are in the document.

Return exactly this structure:

{{
    "supplier": null,
    "invoice_number": null,
    "invoice_date": null,
    "due_date": null,
    "total_amount": null,
    "currency": null,
    "vat": null
}}

Invoice text:
{text}
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        }
    )

    response.raise_for_status()

    result = response.json()

    invoice = clean_json_response(result["response"])

    invoice = normalize_invoice(invoice)

    return invoice