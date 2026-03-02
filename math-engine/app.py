import os
import logging
from contextlib import asynccontextmanager

import matplotlib
matplotlib.use('Agg')

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from api.v1 import combinatorics, logic, set_theory, automata, graph_theory, adjacency_matrix, probability, number_theory, chat, ocr

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)


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

app.include_router(combinatorics.router)
app.include_router(logic.router)
app.include_router(set_theory.router)
app.include_router(automata.router)
app.include_router(graph_theory.router)
app.include_router(adjacency_matrix.router)
app.include_router(probability.router)
app.include_router(number_theory.router)
app.include_router(chat.router)
app.include_router(ocr.router)


@app.get('/api/v1/status', tags=['Health'])
def status():
    return {
        'status': 'online',
        'version': '2.0.0',
        'features': [
            'Graph Theory', 'Combinatorics', 'Probability',
            'Automata', 'Set Theory', 'Number Theory', 'Logic', 'AI Chat',
        ],
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='0.0.0.0', port=8081, reload=True)
