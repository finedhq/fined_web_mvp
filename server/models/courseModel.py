from pydantic import BaseModel

class Course(BaseModel):
    title: str
    description: str
    modules_count: int
    duration: int
    thumbnail_url: str