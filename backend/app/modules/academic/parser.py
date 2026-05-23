import io
from typing import Dict, Any, List
import pandas as pd
import pdfplumber

def _base_result() -> Dict[str, Any]:
    return {
        "total_records": 0,
        "success_count": 0,
        "error_count": 0,
        "warnings_count": 0,
        "preview_data": [],
        "errors": []
    }

def parse_timetable(file_content: bytes, filename: str) -> Dict[str, Any]:
    """Parse timetable PDF or Excel."""
    res = _base_result()
    if filename.endswith(".pdf"):
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                # Basic extraction - will need specific logic for actual SOET PDF format
                for page in pdf.pages:
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            if row and len(row) > 0:
                                res["total_records"] += 1
                                res["preview_data"].append({"row_data": [str(cell).strip() if cell else "" for cell in row]})
                                res["success_count"] += 1
        except Exception as e:
            res["error_count"] += 1
            res["errors"].append({"message": f"Failed to parse PDF: {str(e)}"})
    elif filename.endswith((".xlsx", ".xls")):
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            res["total_records"] = len(df)
            res["preview_data"] = df.fillna("").to_dict(orient="records")
            res["success_count"] = len(df)
        except Exception as e:
            res["error_count"] += 1
            res["errors"].append({"message": f"Failed to parse Excel: {str(e)}"})
    else:
        res["error_count"] += 1
        res["errors"].append({"message": "Unsupported file format. Please upload PDF or Excel."})
    
    return res

def parse_excel_generic(file_content: bytes, required_columns: List[str] = None) -> Dict[str, Any]:
    res = _base_result()
    try:
        df = pd.read_excel(io.BytesIO(file_content))
        df = df.fillna("")
        
        if required_columns:
            missing_cols = [c for c in required_columns if c not in df.columns]
            if missing_cols:
                res["error_count"] += 1
                res["errors"].append({"message": f"Missing required columns: {', '.join(missing_cols)}"})
                return res
                
        res["total_records"] = len(df)
        res["preview_data"] = df.to_dict(orient="records")
        res["success_count"] = len(df)
    except Exception as e:
        res["error_count"] += 1
        res["errors"].append({"message": f"Failed to parse Excel: {str(e)}"})
    return res

def parse_faculty_mapping(file_content: bytes, filename: str) -> Dict[str, Any]:
    if not filename.endswith((".xlsx", ".xls")):
        res = _base_result()
        res["error_count"] += 1
        res["errors"].append({"message": "Unsupported file format. Please upload Excel."})
        return res
    return parse_excel_generic(file_content, ["Name", "Email", "Department", "Designation"])

def parse_subject_allocation(file_content: bytes, filename: str) -> Dict[str, Any]:
    if not filename.endswith((".xlsx", ".xls")):
        res = _base_result()
        res["error_count"] += 1
        res["errors"].append({"message": "Unsupported file format. Please upload Excel."})
        return res
    return parse_excel_generic(file_content, ["Subject Code", "Subject Name", "Programme", "Semester", "Credits", "Section"])

def parse_student_master(file_content: bytes, filename: str) -> Dict[str, Any]:
    if not filename.endswith((".xlsx", ".xls")):
        res = _base_result()
        res["error_count"] += 1
        res["errors"].append({"message": "Unsupported file format. Please upload Excel."})
        return res
    return parse_excel_generic(file_content, ["Roll No", "Name", "Programme", "Semester", "Section", "Batch"])

def parse_mentor_mapping(file_content: bytes, filename: str) -> Dict[str, Any]:
    if not filename.endswith((".xlsx", ".xls")):
        res = _base_result()
        res["error_count"] += 1
        res["errors"].append({"message": "Unsupported file format. Please upload Excel."})
        return res
    return parse_excel_generic(file_content, ["Mentor Email", "Student Roll No"])
