import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
import easyocr
import io
import logging
from threading import Lock

router = APIRouter(prefix='/api/v1/ocr', tags=['OCR'])
logger = logging.getLogger(__name__)

_reader_lock = Lock()
_reader_singleton = None


def _get_reader():
    global _reader_singleton
    if _reader_singleton is None:
        with _reader_lock:
            if _reader_singleton is None:
                _reader_singleton = easyocr.Reader(['en'], gpu=False)
    return _reader_singleton


@router.post('/image_to_text')
async def image_to_text(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img_np = np.array(img)
        reader = _get_reader()
        result = reader.readtext(img_np, detail=0)
        return {'text': '\n'.join(result)}
    except Exception as e:
        logger.exception('OCR failed for uploaded file: %s', getattr(image, 'filename', 'unknown'))
        raise HTTPException(500, f'OCR failed: {e}')
