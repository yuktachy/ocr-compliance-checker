# ML ↔ Backend Interface

Owned jointly. If either side needs to change something here, message the
other person before editing — this file is the source of truth both of you
build against.

## Entry point

```python
from app.extraction.extractor import process_image
from app.schemas.extraction import ExtractedLabelInfo

result: ExtractedLabelInfo = process_image(image_path="uploads/1024.jpg")
```

- **Function:** `process_image`
- **Location:** `backend/app/extraction/extractor.py`
- **Sync or async:** synchronous. It calls OpenCV + PaddleOCR, both of which
  are CPU-bound and not async-native. The backend route must wrap the call:

  ```python
  from starlette.concurrency import run_in_threadpool

  @router.post("/inspect", response_model=ExtractedLabelInfo)
  async def inspect(file: UploadFile):
      path = save_upload(file)                       # backend's job
      result = await run_in_threadpool(process_image, path)
      return result
  ```

## Input

| Param        | Type  | Notes                                                              |
|--------------|-------|---------------------------------------------------------------------|
| `image_path` | `str` | Path to an already-saved image file on disk. **Not** raw bytes and **not** the FastAPI `UploadFile` object — the backend saves the upload first, then passes the path. |

**Upload path convention (backend owns this, ML needs to know it):**
`uploads/{inspection_id}.jpg` — confirm exact pattern with backend teammate before Day 1 coding.

## Output

Returns an `ExtractedLabelInfo` instance (see `extraction_schema.py`).
FastAPI serializes this automatically via `response_model=ExtractedLabelInfo` —
neither side writes manual JSON serialization code.

## Errors

| Exception                | Raised when                                              | Backend should                                    |
|---------------------------|-----------------------------------------------------------|----------------------------------------------------|
| `OCRFailedError`          | Image unreadable / corrupt / OCR engine crashes entirely  | Catch via `@app.exception_handler`, return HTTP 422 with a "could not process image" message |
| *(no exception)*          | OCR runs but confidence is low / fields missing            | Not an error — reflected in `extraction_metadata.fields_missing` and low `confidence` scores. Backend/rules-engine treats this as "needs verification," not a failure. |

Define `OCRFailedError` in `app/extraction/exceptions.py` — ML raises it, backend catches it.

## Field name alignment

The keys in `ExtractedLabelInfo` (`net_quantity`, `mrp`, `manufacturer`, etc.)
must match exactly what `rules/rules_config.json` expects. Confirm with
whoever owns the rules engine before either side is deep into coding.

## Fixtures for parallel development

`EXAMPLE_CLEAN` and `EXAMPLE_NEEDS_REVIEW` in `extraction_schema.py` are
ready-made `ExtractedLabelInfo` instances. Backend can import and return
these from a stub `process_image()` today, before the real ML pipeline
exists, and swap in the real import once it's ready — no other code changes.

## Still open (confirm before Day 1 ends)

- [ ] Exact upload path pattern
- [ ] `rules_config.json` field names match this schema
- [ ] `OCRFailedError` defined and imported on both sides
