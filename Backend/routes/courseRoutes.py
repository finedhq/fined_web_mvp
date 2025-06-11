from fastapi import APIRouter, HTTPException
from models.courseModel import Course
from supabase import create_client, Client
import os

router = APIRouter()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.post("/add")
def add_course(c: Course):
    try:
        print(c)
        response = supabase.table("courses").insert(c.dict()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception occurred: {str(e)}")


@router.get("/getall")
def get_all_courses():
    res=supabase.table("courses").select("*").execute()
    return res.data