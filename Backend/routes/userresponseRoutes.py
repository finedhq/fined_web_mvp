from fastapi import APIRouter, HTTPException
from typing import List
from models.userresponseModel import UserResponseCreate, UserResponseOut
from supabase import create_client, Client
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/save", response_model=UserResponseOut)
def submit_response(response_data: UserResponseCreate):
    data=response_data.dict()
    print(data)
    result = supabase.table("user_responses").insert(data).execute()
    print(result)
