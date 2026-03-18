from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(BASE_DIR, "simpson_data.json")
PHOTOS_DIR = os.path.join(BASE_DIR, "photos")

app = FastAPI()

@app.get("/api/data")
def get_data():
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)

@app.post("/api/photo")
async def upload_photo(file: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{timestamp}.{ext}"
    filepath = os.path.join(PHOTOS_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return JSONResponse({"ok": True, "filename": filename, "path": f"photos/{filename}"})

@app.get("/api/photos")
def list_photos():
    files = sorted(os.listdir(PHOTOS_DIR), reverse=True)
    files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".heic"))]
    return [{"filename": f, "path": f"photos/{f}"} for f in files]

# 사진 서빙
app.mount("/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")

# 정적 파일 (HTML, CSS, JS)
app.mount("/", StaticFiles(directory=os.path.join(BASE_DIR, "static"), html=True), name="static")
