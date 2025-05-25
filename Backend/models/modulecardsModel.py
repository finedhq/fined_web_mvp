from pydantic import BaseModel
from typing import Optional, List, Literal

class CardCreate(BaseModel):
    module_id: str
    content_type: Literal['text', 'video', 'audio', 'question']
    content_text: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    question_type: Optional[Literal['mcq', 'descriptive']] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    order_index: Optional[int] = None

class CardOut(CardCreate):
    card_id: str
