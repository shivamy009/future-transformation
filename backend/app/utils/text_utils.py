from typing import List


def _sliding_window_chunks(text: str, chunk_size: int, overlap: int) -> List[str]:
    chunks: List[str] = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks


def _recursive_split(text: str, chunk_size: int, overlap: int, separators: list[str]) -> List[str]:
    normalized = text.strip()
    if not normalized:
        return []

    if len(normalized) <= chunk_size:
        return [normalized]

    if not separators:
        return _sliding_window_chunks(normalized, chunk_size, overlap)

    separator = separators[0]
    parts = normalized.split(separator)
    if len(parts) == 1:
        return _recursive_split(normalized, chunk_size, overlap, separators[1:])

    grouped: List[str] = []
    current = ""
    joiner = separator

    for part in parts:
        piece = part.strip()
        if not piece:
            continue

        candidate = f"{current}{joiner}{piece}" if current else piece
        if len(candidate) <= chunk_size:
            current = candidate
            continue

        if current:
            grouped.append(current)
        current = piece

    if current:
        grouped.append(current)

    results: List[str] = []
    for group in grouped:
        if len(group) <= chunk_size:
            results.append(group)
        else:
            results.extend(_recursive_split(group, chunk_size, overlap, separators[1:]))

    return results


def _apply_overlap(chunks: List[str], overlap: int) -> List[str]:
    if not chunks:
        return []
    if overlap <= 0:
        return chunks

    with_overlap: List[str] = [chunks[0]]
    for idx in range(1, len(chunks)):
        prev = chunks[idx - 1]
        current = chunks[idx]
        prefix = prev[-overlap:].strip()
        merged = f"{prefix} {current}".strip() if prefix else current
        with_overlap.append(merged)

    return with_overlap


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> List[str]:
    clean_text = text.strip()
    if not clean_text:
        return []

    if chunk_size <= 0:
        return []

    if chunk_size <= overlap:
        overlap = max(0, chunk_size // 5)

    recursive_chunks = _recursive_split(
        clean_text,
        chunk_size,
        overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return _apply_overlap(recursive_chunks, overlap)
