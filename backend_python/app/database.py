import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("uvicorn")

Base = declarative_base()

active_engine = None
AsyncSessionLocal = None

async def init_db_engine():
    global active_engine, AsyncSessionLocal
    target_url = settings.DATABASE_URL
    try:
        engine = create_async_engine(target_url, echo=False)
        # Test connection
        async with engine.connect() as conn:
            pass
        active_engine = engine
        logger.info(f"Connected successfully to primary database: {target_url.split('@')[-1] if '@' in target_url else target_url}")
    except Exception as exc:
        logger.warning(
            f"Could not connect to primary database ({exc}). "
            f"Falling back to resilient local database: {settings.FALLBACK_SQLITE_URL} "
            f"(You can provide your active PostgreSQL connection in .env whenever ready!)"
        )
        active_engine = create_async_engine(settings.FALLBACK_SQLITE_URL, echo=False)
    
    AsyncSessionLocal = async_sessionmaker(
        bind=active_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    return active_engine

def get_session_factory():
    global AsyncSessionLocal
    return AsyncSessionLocal

async def get_db():
    if AsyncSessionLocal is None:
        await init_db_engine()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
