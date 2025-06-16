
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Article(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None  # optional field
    created_at: Optional[datetime] = None  # handled automatically usually

    class Config:
        orm_mode = True
