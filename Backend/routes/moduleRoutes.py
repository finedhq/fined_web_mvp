from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from models.moduleModel import Module
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.get("/course/{course_id}")
def get_modules_by_course(course_id: str):
    try:
        res = supabase.table("modules").select("*").eq("course_id", course_id).order("order_index").execute()
        if res.data is None:
            raise HTTPException(status_code=404, detail="Modules not found")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/add")
def add_module(module: Module):
    try:
        data = module.dict()
        res = supabase.table("modules").insert(data).execute()
        if len(res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to add module")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
