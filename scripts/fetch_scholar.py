#!/usr/bin/env python3
"""Fetch Google Scholar stats for a fixed author id and write scholar-stats.json."""

import datetime
import json
import sys

from scholarly import scholarly

SCHOLAR_ID = "Ns91gt4AAAAJ"
OUTPUT_PATH = "scholar-stats.json"


def main() -> int:
    try:
        author = scholarly.search_author_id(SCHOLAR_ID)
        author = scholarly.fill(author, sections=["indices", "counts"])
    except Exception as exc:
        print(f"Failed to fetch author {SCHOLAR_ID}: {exc}", file=sys.stderr)
        return 1

    citations_per_year = {
        str(year): int(count)
        for year, count in (author.get("cites_per_year") or {}).items()
    }

    data = {
        "updated": datetime.date.today().isoformat(),
        "scholar_id": SCHOLAR_ID,
        "total_citations": int(author.get("citedby", 0) or 0),
        "h_index": int(author.get("hindex", 0) or 0),
        "i10_index": int(author.get("i10index", 0) or 0),
        "citations_per_year": citations_per_year,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")

    print(f"Wrote {OUTPUT_PATH}: {data}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
