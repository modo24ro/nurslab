from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CertificateResponse(BaseModel):
    id: str
    certificate_code: str
    student_name: str
    course_title: str
    instructor_name: str
    issue_date: datetime
    pdf_url: Optional[str] = None
    verification_url: Optional[str] = None

    class Config:
        from_attributes = True

class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_code: str
    student_name: Optional[str] = None
    course_title: Optional[str] = None
    instructor_name: Optional[str] = None
    issue_date: Optional[datetime] = None
    verification_hash: Optional[str] = None
    message: str
