from fastapi import APIRouter, HTTPException, UploadFile, Form, File
from fastapi.responses import JSONResponse
from supabase import create_client, Client
import os
import uuid
from datetime import datetime

router = APIRouter()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
@router.post("/add")
async def add_course(
    title: str = Form(...),
    description: str = Form(...),
    modules_count: int = Form(...),
    duration: int = Form(...),
    thumbnail_file: UploadFile = File(None)
):
    try:
        thumbnail_url = ""

        # ✅ Upload the thumbnail if present
        if thumbnail_file:
            contents = await thumbnail_file.read()
            filename = f"{title.replace(' ', '_')}_{thumbnail_file.filename}"
            path = f"thumbnails/{filename}"

            # Upload to Supabase Storage
            upload_res = supabase.storage.from_(BUCKET_NAME).upload(
                path=path,
                file=contents,
                file_options={"content-type": thumbnail_file.content_type}
            )

            # Get public URL
            thumbnail_url = supabase.storage.from_(BUCKET_NAME).get_public_url(path)

        # ✅ Insert course data into DB
        data = {
            "title": title,
            "description": description,
            "modules_count": modules_count,
            "duration": duration,
            "thumbnail_url": thumbnail_url,
        }

        res = supabase.table("courses").insert(data).execute()

        if res.data:
            return res.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to add course to database.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")@router.get("/getall")
    

@router.get("/getall")
def get_all_courses():
    try:
        res = supabase.table("courses").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
