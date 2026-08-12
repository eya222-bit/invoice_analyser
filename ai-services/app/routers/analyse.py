from fastapi import APIRouter, UploadFile, File, Depends
from app.security.api_key import verify_api_key

from app.services.ocr_service import extract_text
from app.services.ai_service import analyze_invoice

from app.models.invoice_models import InvoiceData, InvoiceResponse


router = APIRouter(
    prefix="/analyze",
    tags=["Invoice Analysis"]
)

@router.post("/")
async def analyze_invoice_route(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):

   

    extracted_text = extract_text(file)
    invoice = analyze_invoice(extracted_text)
    

   

    response = InvoiceResponse(
        success=True,
        message="Invoice analyzed",
        data=invoice
        
    )

    return response
   