from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings


_pc_client = None
_index = None
_index_dimension = None


def _get_client() -> Pinecone:
    global _pc_client
    if _pc_client is None:
        if not settings.PINECONE_API_KEY:
            raise RuntimeError("PINECONE_API_KEY is not configured")
        _pc_client = Pinecone(api_key=settings.PINECONE_API_KEY)
    return _pc_client


def init_pinecone_index() -> None:
    client = _get_client()
    index_name = settings.PINECONE_INDEX_NAME

    listed = client.list_indexes()
    if hasattr(listed, "names"):
        existing_indexes = listed.names()
    else:
        existing_indexes = [item["name"] for item in listed]

    if index_name in existing_indexes:
        return

    client.create_index(
        name=index_name,
        dimension=settings.EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud=settings.PINECONE_CLOUD,
            region=settings.PINECONE_ENVIRONMENT,
        ),
    )


def get_pinecone_index():
    global _index
    if _index is None:
        init_pinecone_index()
        _index = _get_client().Index(settings.PINECONE_INDEX_NAME)
    return _index


def get_pinecone_index_dimension() -> int:
    global _index_dimension
    if _index_dimension is not None:
        return _index_dimension

    try:
        description = _get_client().describe_index(settings.PINECONE_INDEX_NAME)
        if hasattr(description, "dimension"):
            _index_dimension = int(description.dimension)
        else:
            _index_dimension = int(description["dimension"])
    except Exception:
        _index_dimension = settings.EMBEDDING_DIMENSION

    return _index_dimension
