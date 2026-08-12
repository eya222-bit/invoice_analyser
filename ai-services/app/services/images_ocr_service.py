import io
import pytesseract

from PIL import Image
from fastapi import UploadFile


pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text_from_image(file: UploadFile) -> str:

    image = Image.open(
        io.BytesIO(
            file.file.read()
        )
    )

    text = pytesseract.image_to_string(
        image,
        lang="eng+fra+ara"
    )

    # remettre le pointeur au début
    file.file.seek(0)

    return text