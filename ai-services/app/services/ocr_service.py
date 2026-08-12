from fastapi import UploadFile

from app.services.images_ocr_service import (
    extract_text_from_image
)

from app.services.pdf_ocr_service import (
    extract_text_from_pdf
)


def extract_text(file: UploadFile) -> str:

    extension = (
        file.filename
        .split(".")[-1]
        .lower()
    )


    if extension == "pdf":

        return extract_text_from_pdf(file)


    elif extension in [
        "jpg",
        "jpeg",
        "png"
    ]:

        return extract_text_from_image(file)


    else:

        raise ValueError(
            "Unsupported file type"
        )