import csv
import io
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.placement_record import PlacementRecord
from app.modules.auth.dependencies import AuthContext, get_auth_context
from app.modules.placement.schemas import (
    PlacementRecordResponse,
    PlacementUploadError,
    PlacementUploadResponse,
)

logger = logging.getLogger(__name__)

placement_router = APIRouter(prefix="/placement", tags=["placement"])

# Column name mapping: CSV header -> model field
COLUMN_MAP = {
    "Sl. No.": "sl_no",
    "Roll No.": "roll_no",
    "STUDENT'S NAME": "student_name",
    "Photo Id": "photo_id",
    "Gender": "gender",
    "Type": "type",
    "Contact No.": "contact_no",
    "E-mail": "email",
    "X Result": "x_result",
    "XII Result": "xii_result",
    "Course": "course",
    "Branch": "branch",
    "Designation": "designation",
    "Name of the company": "company_name",
    "Industry": "industry",
    "Date of Drive": "date_of_drive",
    "Company Offers 1": "company_offers",
    "Probation/Training duration": "probation_duration",
    "Stipend during training per month": "stipend_per_month",
    "Package": "package",
    "Offer letter": "offer_letter",
    "Email/Contact Details of HR": "hr_contact",
}

TEMPLATE_HEADERS = list(COLUMN_MAP.keys())


def _parse_csv_content(content: str) -> list[dict[str, str]]:
    """Parse CSV content and return list of row dicts."""
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)

    # Find the header row (the one containing 'Roll No.')
    header_row_idx = None
    for i, row in enumerate(rows):
        stripped = [c.strip() for c in row]
        if "Roll No." in stripped:
            header_row_idx = i
            break

    if header_row_idx is None:
        raise ValueError("Could not find header row with 'Roll No.' column")

    headers = [c.strip() for c in rows[header_row_idx]]
    data_rows = []

    for row in rows[header_row_idx + 1 :]:
        if not any(c.strip() for c in row):
            continue  # skip empty rows
        row_dict: dict[str, str] = {}
        for j, cell in enumerate(row):
            if j < len(headers) and headers[j] in COLUMN_MAP:
                row_dict[COLUMN_MAP[headers[j]]] = cell.strip()
        if row_dict.get("roll_no") or row_dict.get("student_name"):
            data_rows.append(row_dict)

    return data_rows


@placement_router.post("/upload", response_model=PlacementUploadResponse)
async def upload_placement_data(
    file: UploadFile = File(...),
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> PlacementUploadResponse:
    """Upload placement data from a CSV or Excel file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".csv") or filename_lower.endswith(".xlsx")):
        raise HTTPException(
            status_code=400, detail="Only .csv and .xlsx files are supported"
        )

    raw = await file.read()

    if filename_lower.endswith(".xlsx"):
        # Try to use openpyxl for xlsx parsing
        try:
            import openpyxl

            wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True)
            ws = wb.active
            if ws is None:
                raise HTTPException(status_code=400, detail="Empty workbook")

            # Convert to CSV-like content
            csv_lines = []
            for row in ws.iter_rows(values_only=True):
                csv_lines.append(
                    ",".join(str(cell) if cell is not None else "" for cell in row)
                )
            content = "\n".join(csv_lines)
            wb.close()
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="Excel support requires openpyxl. Please upload a .csv file instead.",
            )
    else:
        # Try different encodings
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError:
            content = raw.decode("latin-1")

    try:
        data_rows = _parse_csv_content(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    processed = 0
    skipped = 0
    errors: list[PlacementUploadError] = []

    for idx, row_data in enumerate(data_rows, start=1):
        try:
            if not row_data.get("roll_no") and not row_data.get("student_name"):
                skipped += 1
                continue

            sl_no_val = None
            if row_data.get("sl_no"):
                try:
                    sl_no_val = int(row_data["sl_no"])
                except (ValueError, TypeError):
                    sl_no_val = None

            record = PlacementRecord(
                sl_no=sl_no_val,
                roll_no=row_data.get("roll_no", ""),
                student_name=row_data.get("student_name", ""),
                photo_id=row_data.get("photo_id"),
                gender=row_data.get("gender"),
                type=row_data.get("type"),
                contact_no=row_data.get("contact_no"),
                email=row_data.get("email"),
                x_result=row_data.get("x_result"),
                xii_result=row_data.get("xii_result"),
                course=row_data.get("course"),
                branch=row_data.get("branch"),
                designation=row_data.get("designation"),
                company_name=row_data.get("company_name"),
                industry=row_data.get("industry"),
                date_of_drive=row_data.get("date_of_drive"),
                company_offers=row_data.get("company_offers"),
                probation_duration=row_data.get("probation_duration"),
                stipend_per_month=row_data.get("stipend_per_month"),
                package=row_data.get("package"),
                offer_letter=row_data.get("offer_letter"),
                hr_contact=row_data.get("hr_contact"),
            )
            db.add(record)
            processed += 1
        except Exception as e:
            logger.warning(f"Error processing row {idx}: {e}")
            errors.append(PlacementUploadError(row=idx, message=str(e)))

    if processed > 0:
        db.commit()

    return PlacementUploadResponse(processed=processed, skipped=skipped, errors=errors)


@placement_router.get("/template")
async def download_template() -> StreamingResponse:
    """Download the placement data template as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(TEMPLATE_HEADERS)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=placement_template.csv"},
    )


@placement_router.get("/records")
def list_placement_records(
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[PlacementRecordResponse]:
    """List all uploaded placement records."""
    records = db.scalars(
        select(PlacementRecord).order_by(PlacementRecord.created_at.desc()).limit(500)
    ).all()
    return [
        PlacementRecordResponse(
            id=str(r.id),
            sl_no=r.sl_no,
            roll_no=r.roll_no,
            student_name=r.student_name,
            photo_id=r.photo_id,
            gender=r.gender,
            type=r.type,
            contact_no=r.contact_no,
            email=r.email,
            x_result=r.x_result,
            xii_result=r.xii_result,
            course=r.course,
            branch=r.branch,
            designation=r.designation,
            company_name=r.company_name,
            industry=r.industry,
            date_of_drive=r.date_of_drive,
            company_offers=r.company_offers,
            probation_duration=r.probation_duration,
            stipend_per_month=r.stipend_per_month,
            package=r.package,
            offer_letter=r.offer_letter,
            hr_contact=r.hr_contact,
        )
        for r in records
    ]
