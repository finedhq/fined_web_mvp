import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.authRoute import router as auth_router
from routes.courseRoutes import router as course_router
from routes.moduleRoutes import router as module_router
from routes.moduleCardsRoutes import router as cards_router

load_dotenv()
app = FastAPI()

allowed_origin = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(course_router, prefix="/api/courses")
app.include_router(module_router, prefix="/api/modules")
app.include_router(cards_router, prefix="/api/cards")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)