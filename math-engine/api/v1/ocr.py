import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
import easyocr
import io

router = APIRouter(prefix='/api/v1/ocr', tags=['OCR'])


@router.post('/image_to_text')
async def image_to_text(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img_np = np.array(img)
        reader = easyocr.Reader(['en'], gpu=False)
        result = reader.readtext(img_np, detail=0)
        return {'text': '\n'.join(result)}
    except Exception as e:
        raise HTTPException(500, f'OCR failed: {e}')
