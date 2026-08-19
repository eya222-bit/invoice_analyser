import io
import shutil
import pytesseract

from PIL import Image
from fastapi import UploadFile


tesseract_cmd = shutil.which("tesseract")
if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


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