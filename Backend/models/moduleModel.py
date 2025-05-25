from pydantic import BaseModel
from typing import Optional

class Module(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = None
