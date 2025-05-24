from fastapi import APIRouter,HTTPException
from models.courseModel import Course
from supabase import create_client,Client
import os

router=APIRouter()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



@router.post("/add")
def add_Course(c:Course):
    print(c)


    # existing=supabase.table("courses").select('*').eq("title",c.title).execute()
    # if existing.data:
    #     raise HTTPException(status_code=400, detail="Course with this title already exists.")

    response=supabase.table("courses").insert(c.__dict__).execute()
    print(response)
    if response.error:
        raise HTTPException(status_code=500, detail="Failed to add course: " + str(response.error))
    return {"message": "Course added successfully"}
 

from fastapi import APIRouter, HTTPException
from supabase import create_client  # assuming supabase is set up

@router.get("/getall")
def getall_Course():
    try:
        response = supabase.table("courses").select("*").execute()
        return response.data  
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")
