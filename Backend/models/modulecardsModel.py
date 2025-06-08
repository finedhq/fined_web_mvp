from pydantic import BaseModel
from typing import Optional, List, Literal

class CardCreate(BaseModel):
    module_id: str
    content_type: Literal['text', 'video', 'audio', 'question']
    content_text: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    order_index: Optional[int] = None

    # Question-specific
    question_type: Optional[Literal['mcq_single', 'mcq_multiple', 'subjective']] = None
    answer_compulsory: Optional[bool] = None
    finstars_involved: Optional[bool] = None
    allotted_finstars: Optional[int] = 0
    correct_answer_exists: Optional[bool] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None  # or List[str] if MCQ multiple
    feedback_type: Optional[str] = None  # Text, one-liner or paragraph

class CardOut(CardCreate):
    card_id: str