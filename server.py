from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(BASE_DIR, "simpson_data.json")
PHOTOS_DIR = os.path.join(BASE_DIR, "photos")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

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

    # 이미지는 photos/, 나머지는 uploads/
    is_image = ext.lower() in ("jpg", "jpeg", "png", "webp", "heic", "gif")
    save_dir = PHOTOS_DIR if is_image else UPLOADS_DIR
    folder = "photos" if is_image else "uploads"
    filepath = os.path.join(save_dir, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return JSONResponse({"ok": True, "filename": filename, "path": f"{folder}/{filename}", "type": "image" if is_image else "file"})

@app.post("/api/exercise")
async def save_exercise(request: Request):
    body = await request.json()
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    # 같은 날짜+시작시간 기록 있으면 덮어쓰기 (수정 모드)
    idx = next((i for i, r in enumerate(data["exercise_records"])
                if r.get("date") == body.get("date") and r.get("start_time") == body.get("start_time")), -1)
    if idx >= 0:
        data["exercise_records"][idx] = body
    else:
        data["exercise_records"].append(body)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return JSONResponse({"ok": True})

@app.delete("/api/exercise")
async def delete_exercise(request: Request):
    body = await request.json()
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    data["exercise_records"] = [
        r for r in data["exercise_records"]
        if not (r.get("date") == body.get("date") and r.get("start_time") == body.get("start_time"))
    ]
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return JSONResponse({"ok": True})

@app.get("/api/photos")
def list_photos():
    files = sorted(os.listdir(PHOTOS_DIR), reverse=True)
    files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".heic"))]
    return [{"filename": f, "path": f"photos/{f}"} for f in files]

# 파일 서빙
app.mount("/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# 정적 파일 (HTML, CSS, JS)
app.mount("/", StaticFiles(directory=os.path.join(BASE_DIR, "static"), html=True), name="static")
