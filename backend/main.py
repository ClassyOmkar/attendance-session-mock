from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from datetime import datetime, timedelta
import uuid
import re
from typing import List, Dict, Optional

app = FastAPI(title="Attendance Session Mock", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
sessions: Dict[str, Dict] = {}
attendees: Dict[str, List[Dict]] = {}

class SessionStartRequest(BaseModel):
    subject: str
    
    @field_validator('subject')
    @classmethod
    def validate_subject(cls, v):
        if not v.strip():
            raise ValueError('Subject cannot be empty')
        if len(v.strip()) > 25:
            raise ValueError('Subject cannot exceed 25 characters')
        return v.strip()

class CheckinRequest(BaseModel):
    roll_no: str
    
    @field_validator('roll_no')
    @classmethod
    def validate_roll_no(cls, v):
        if not v.strip():
            raise ValueError('Roll number cannot be empty')
        if len(v.strip()) > 20:
            raise ValueError('Roll number cannot exceed 20 characters')
        # Only allow alphanumeric characters and hyphens
        if not re.match(r'^[A-Za-z0-9-]+$', v.strip()):
            raise ValueError('Roll number can only contain letters, numbers, and hyphens')
        return v.strip()

class SessionResponse(BaseModel):
    session_id: str
    subject: str
    started_at: datetime
    expires_at: datetime

class SessionStatusResponse(BaseModel):
    status: str
    subject: str
    started_at: datetime
    attendees_count: int
    attendees: List[Dict]

class CheckinResponse(BaseModel):
    ok: bool
    total: int

class EndResponse(BaseModel):
    ok: bool

@app.get("/health")
async def health_check():
    return {"status": "UP"}

@app.post("/session/start", response_model=SessionResponse)
async def start_session(request: SessionStartRequest):
    session_id = str(uuid.uuid4())
    started_at = datetime.now()
    expires_at = started_at + timedelta(hours=2)  # 2 hour session
    
    sessions[session_id] = {
        "subject": request.subject,
        "started_at": started_at,
        "expires_at": expires_at,
        "status": "active"
    }
    
    attendees[session_id] = []
    
    return SessionResponse(
        session_id=session_id,
        subject=request.subject,
        started_at=started_at,
        expires_at=expires_at
    )

@app.get("/session/{session_id}", response_model=SessionStatusResponse)
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    session_attendees = attendees.get(session_id, [])
    
    # Check if session has expired
    if datetime.now() > session["expires_at"]:
        session["status"] = "ended"
    
    return SessionStatusResponse(
        status=session["status"],
        subject=session["subject"],
        started_at=session["started_at"],
        attendees_count=len(session_attendees),
        attendees=session_attendees
    )

@app.post("/session/{session_id}/checkin", response_model=CheckinResponse)
async def checkin_student(session_id: str, request: CheckinRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Check if session has expired
    if datetime.now() > session["expires_at"]:
        session["status"] = "ended"
        raise HTTPException(status_code=400, detail="Session has ended")
    
    if session["status"] == "ended":
        raise HTTPException(status_code=400, detail="Session has ended")
    
    session_attendees = attendees.get(session_id, [])
    
    # Check for duplicate check-in (case-insensitive)
    for attendee in session_attendees:
        if attendee["roll_no"].lower() == request.roll_no.lower():
            raise HTTPException(status_code=400, detail="Student already checked in")
    
    # Add new attendee
    new_attendee = {
        "roll_no": request.roll_no,
        "time": datetime.now()
    }
    session_attendees.append(new_attendee)
    attendees[session_id] = session_attendees
    
    return CheckinResponse(ok=True, total=len(session_attendees))

@app.post("/session/{session_id}/end", response_model=EndResponse)
async def end_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["status"] = "ended"
    
    return EndResponse(ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
