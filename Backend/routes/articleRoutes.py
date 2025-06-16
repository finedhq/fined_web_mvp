from fastapi import APIRouter,UploadFile,File,Form,HTTPException
from supabase import create_client
import os

router=APIRouter()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET=os.getenv("SUPABASE_BUCKET")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.get("/getall")
def get_all_articles():
    try:
        response = supabase.table("articles").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching articles: {str(e)}")

@router.post("/add")
async def add_article(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None)
):
    try:
        image_url = ""

        if image:
            contents = await image.read()
            path = f"articles/{title.replace(' ', '_')}_{image.filename}"

            upload_res = supabase.storage.from_(SUPABASE_BUCKET).upload(
                path=path,
                file=contents,
                file_options={"content-type": image.content_type}
            )

            image_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(path)
        data = {
            "title": title,
            "content": content,
            "image_url": image_url
        }

        res = supabase.table("articles").insert(data).execute()

        if res.data:
            return res.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to insert article.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")