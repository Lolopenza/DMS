import os
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager

try:
    import matplotlib
    matplotlib.use('Agg')
except Exception:
    matplotlib = None

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

_app_dir = os.path.dirname(__file__)
_repo_root = os.path.dirname(_app_dir)
load_dotenv(os.path.join(_repo_root, '.env'))
load_dotenv(os.path.join(_app_dir, '.env'), override=True)

from api.v1 import FEATURE_NAMES, ROUTERS

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)


def _error_envelope(request: Request, status_code: int, code: str, message: str, details=None):
    safe_details = jsonable_encoder(
        details,
        custom_encoder={
            Exception: lambda e: str(e),
            ValueError: lambda e: str(e),
        },
    )
    return {
        'error': {
            'code': code,
            'message': message,
            'status': status_code,
            'path': request.url.path,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'details': safe_details,
        }
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    api_key = os.environ.get('OPENROUTER_API_KEY', '')
    if api_key:
        logger.info('OPENROUTER_API_KEY is set: %s...%s', api_key[:4], api_key[-4:])
    else:
        logger.warning('OPENROUTER_API_KEY is not set — chatbot will not work')
    yield


app = FastAPI(
    title='DMC Math Engine',
    description='Discrete Math Calculator — вычислительный микросервис',
    version='2.0.0',
    lifespan=lifespan,
    redoc_url=None,  # отключаем ReDoc, используем только /docs (Swagger UI)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def add_api_version_header(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-API-Version'] = 'v1'
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    message = exc.detail if isinstance(exc.detail, str) else 'Request failed'
    payload = _error_envelope(request, exc.status_code, 'HTTP_ERROR', message, details=exc.detail)
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    payload = _error_envelope(
        request,
        422,
        'VALIDATION_ERROR',
        'Validation failed',
        details=exc.errors(),
    )
    return JSONResponse(status_code=422, content=payload)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception('Unhandled exception on %s: %s', request.url.path, exc)
    payload = _error_envelope(request, 500, 'INTERNAL_ERROR', 'Internal server error')
    return JSONResponse(status_code=500, content=payload)

for router in ROUTERS:
    app.include_router(router)


@app.get('/api/v1/status', tags=['Health'])
def status():
    return {
        'status': 'online',
        'version': '2.0.0',
        'features': FEATURE_NAMES,
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='0.0.0.0', port=8081, reload=True)
