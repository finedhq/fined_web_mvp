from fastapi import APIRouter, HTTPException
from typing import List
import os
from supabase import Client,create_client
from models.modulecardsModel import CardCreate, CardOut

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Get all cards for a module
@router.get("/{module_id}/getall", response_model=List[CardOut])
def get_cards_by_module(module_id: str):
    res=supabase.table("cards").select("*").eq("module_id",module_id).order("order_index").execute()
    print(res.data)
    return res.data

# Add a new card
@router.post("/{module_id}/add", response_model=CardOut)
def add_card(card: CardCreate):
    try:
        print(card)
        response = supabase.table("cards").insert(card.dict()).execute()
        print(response)
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception occurred: {str(e)}")
