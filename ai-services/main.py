from fastapi import FastAPI
from app.routers.analyse import router as analyze_router
from fastapi.security import APIKeyHeader
from fastapi.openapi.utils import get_openapi

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

app = FastAPI(
    title="Invoice AI Microservice",
    version="1.0.0"
)

app.include_router(analyze_router)

@app.get("/")
def root():
    return {
        "message": "Invoice AI Microservice is running"
    }
