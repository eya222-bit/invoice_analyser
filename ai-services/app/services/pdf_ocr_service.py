import pytesseract

from fastapi import UploadFile
from pdf2image import convert_from_bytes


def extract_text_from_pdf(file: UploadFile) -> str:

    pdf_bytes = file.file.read()

    pages = convert_from_bytes(pdf_bytes)

    text = ""

    for page in pages:

        text += pytesseract.image_to_string(
            page,
            lang="eng+fra+ara"
        )

    file.file.seek(0)

    return text