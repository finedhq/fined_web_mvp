from fastapi import APIRouter, HTTPException, UploadFile, Form, File
from typing import Optional, List
import os
from uuid import uuid4
from supabase import create_client, Client
from fastapi.responses import JSONResponse
from models.modulecardsModel import CardOut

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.get("/{module_id}/getall", response_model=List[CardOut])
def get_cards_by_module(module_id: str):
    res = supabase.table("cards").select("*").eq("module_id", module_id).order("order_index").execute()
    return res.data


@router.post("/add/{moduleId}")
async def add_card(
    moduleId: str,
    content_type: str = Form(...),
    content_text: Optional[str] = Form(None),
    question_type: Optional[str] = Form(None),
    options: Optional[List[str]] = Form(None),
    correct_answer: Optional[str] = Form(None),
    allotted_finstars: int = Form(...),
    order_index: int = Form(...),
    answer_compulsory: Optional[bool] = Form(False),
    feedback_type: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
):
    try:
        media_urls = {}

        async def upload_to_supabase(file: UploadFile, folder: str):
            ext = file.filename.split('.')[-1]
            file_path = f"{folder}/{uuid4()}.{ext}"
            file_bytes = await file.read()
            supabase.storage.from_(BUCKET_NAME).upload(file_path, file_bytes, {"content-type": file.content_type})
            return supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)

        if image_file:
            media_urls["image_url"] = await upload_to_supabase(image_file, "images")
        if audio_file:
            media_urls["audio_url"] = await upload_to_supabase(audio_file, "audios")
        if video_file:
            media_urls["video_url"] = await upload_to_supabase(video_file, "videos")

        # Base card data
        card_data = {
            "module_id": moduleId,
            "content_type": content_type,
            "content_text": content_text,
            "order_index": order_index,
            "allotted_finstars": allotted_finstars,
            **media_urls
        }

        # Question-specific fields
        if content_type == "question":
            card_data.update({
                "question_type": question_type,
                "options": options,
                "correct_answer": correct_answer,
                "answer_compulsory": answer_compulsory,
                "feedback_type": feedback_type,
                "correct_answer_exists": bool(correct_answer),
                "finstars_involved": True
            })
        else:
            # Null out question-related fields to avoid DB constraint issues
            card_data.update({
                "question_type": None,
                "options": None,
                "correct_answer": None,
                "answer_compulsory": None,
                "feedback_type": None,
                "correct_answer_exists": None,
                "finstars_involved": None
            })

        # Insert into Supabase
        res = supabase.table("cards").insert(card_data).execute()
        return JSONResponse(content=res.data[0], status_code=201)

    except Exception as e:
        import traceback
        print("Full traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Exception occurred: {str(e)}")
