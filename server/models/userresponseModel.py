
from pydantic import BaseModel
from typing import Optional

class UserResponseCreate(BaseModel):
    user_id: str
    card_id: str
    module_id: Optional[str]
    course_id: Optional[str]
    response_text: str
    is_correct: Optional[bool] = None

class UserResponseOut(UserResponseCreate):
    id: str
    submitted_at: str
