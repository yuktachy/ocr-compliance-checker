from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

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

# Frontend is served by this same FastAPI application. This avoids opening the
# HTML with file://, which prevents reliable fetch requests in browsers.
BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = BACKEND_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"
UPLOAD_DIR = BACKEND_DIR / "upload"
UPLOAD_DIR.mkdir(exist_ok=True)
templates = Jinja2Templates(directory=str(FRONTEND_DIR))

# Existing HTML uses css/... and js/... paths. Keep those URLs stable while
# serving the files through FastAPI.
app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
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

PAGES = {"index", "dashboard", "inspection", "history", "results", "products", "reports", "analytics", "settings"}

@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/{page}.html", response_class=HTMLResponse)
def frontend_page(request: Request, page: str):
    if page not in PAGES:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Page not found")
    return templates.TemplateResponse(request=request, name=f"{page}.html")
