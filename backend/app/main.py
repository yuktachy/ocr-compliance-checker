from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .router.dashboard import router as dashboard_router
from .router.inspections import router as inspections_router
from .router.analyze import router as analyze_router
from .router.products import router as products_router
from .router.reports import router as reports_router
from .router.notifications import router as notifications_router
from .router.settings import router as settings_router
from .router.auth import router as auth_router

app = FastAPI(
    title="Legal Metrology Compliance Checker API",
    description="Automated OCR & Legal Metrology Mandatory Declarations Verification API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Upload static folder
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "upload")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")

# Include Routers
app.include_router(dashboard_router, prefix="/app")
app.include_router(inspections_router, prefix="/app")
app.include_router(analyze_router, prefix="/app")
app.include_router(products_router, prefix="/app")
app.include_router(reports_router, prefix="/app")
app.include_router(notifications_router, prefix="/app")
app.include_router(settings_router, prefix="/app")
app.include_router(auth_router, prefix="/app")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Legal Metrology OCR Compliance API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
