"""
Async SQLite feedback storage using aiosqlite.
DB lives at backend/database/feedback.db
"""
import aiosqlite
import pathlib
from datetime import datetime, timezone

DB_PATH = pathlib.Path(__file__).parent / "feedback.db"


async def init_db() -> None:
    """Create feedback table if it doesn't exist. Called at app startup."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text  TEXT,
                rating      INTEGER NOT NULL,  -- 1=thumbs-up, -1=thumbs-down
                language    TEXT,
                scheme_id   TEXT,
                timestamp   TEXT NOT NULL
            )
        """)
        await db.commit()


async def save_feedback(
    query_text: str,
    rating: int,
    language: str,
    scheme_id: str | None,
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO feedback (query_text, rating, language, scheme_id, timestamp)
               VALUES (?, ?, ?, ?, ?)""",
            (query_text, rating, language, scheme_id, datetime.now(timezone.utc).isoformat()),
        )
        await db.commit()


async def get_feedback_stats() -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Overall counts
        cur = await db.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN rating = 1  THEN 1 ELSE 0 END) AS positive,
                SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) AS negative
            FROM feedback
        """)
        row = await cur.fetchone()
        total    = row["total"]    or 0
        positive = row["positive"] or 0
        negative = row["negative"] or 0

        # Top schemes by feedback volume
        cur = await db.execute("""
            SELECT scheme_id, COUNT(*) AS cnt,
                   SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) AS pos
            FROM feedback
            WHERE scheme_id IS NOT NULL
            GROUP BY scheme_id
            ORDER BY cnt DESC
            LIMIT 5
        """)
        top_rows = await cur.fetchall()
        top_schemes = [
            {"scheme_id": r["scheme_id"], "count": r["cnt"], "positive": r["pos"]}
            for r in top_rows
        ]

        # Language breakdown
        cur = await db.execute("""
            SELECT language, COUNT(*) AS cnt
            FROM feedback
            GROUP BY language
            ORDER BY cnt DESC
        """)
        lang_rows = await cur.fetchall()
        by_language = {r["language"]: r["cnt"] for r in lang_rows}

    return {
        "total": total,
        "positive": positive,
        "negative": negative,
        "satisfaction_pct": round((positive / total * 100) if total else 0, 1),
        "top_schemes": top_schemes,
        "by_language": by_language,
    }
