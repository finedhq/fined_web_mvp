from fastapi import APIRouter,HTTPException
from supabase import create_client,Client
from models.moduleModel import Module
import os
router=APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.get("/{course_id}/getall")
def get_modules(course_id:str):
    res=supabase.table("modules").select("*").eq("course_id",course_id).order("order_index").execute()
    print(res.data)
    return res.data


@router.post("/{course_id}/add")
def add_module(module:Module):
    data=module.dict()
    print(data)
    res=supabase.table("modules").insert(data).execute()
    print(res)
    # res  = requests.post(url,  json=data)
    # if res.status_code != 201: 
    #     raise Exception("Failed to add module")
    return res.data