"""
Seed the Railway Postgres database from local JSON site files.

Usage:
    pip install psycopg2-binary
    DATABASE_URL="postgresql://..." python db/seed.py

Or pass the URL as an argument:
    python db/seed.py "postgresql://user:pass@host:port/dbname"
"""

import json
import os
import sys
import glob

try:
    import psycopg2
except ImportError:
    print("Install psycopg2-binary first:  pip install psycopg2-binary")
    sys.exit(1)


def get_database_url():
    if len(sys.argv) > 1:
        return sys.argv[1]
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("Provide DATABASE_URL as env var or first argument.")
        sys.exit(1)
    return url


def main():
    database_url = get_database_url()
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "sites")
    json_files = glob.glob(os.path.join(data_dir, "*.json"))

    if not json_files:
        print(f"No JSON files found in {data_dir}")
        sys.exit(1)

    # Run schema first
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()

    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Create tables
        cur.execute(schema_sql)
        print("Schema applied.")

        # Seed each site
        for json_file in json_files:
            with open(json_file, "r", encoding="utf-8") as f:
                site_data = json.load(f)

            slug = site_data["slug"]
            cur.execute(
                """
                INSERT INTO sites (slug, data)
                VALUES (%s, %s)
                ON CONFLICT (slug) DO UPDATE
                    SET data = EXCLUDED.data
                """,
                (slug, json.dumps(site_data)),
            )
            print(f"  Seeded: {slug}")

        conn.commit()
        print(f"\nDone! {len(json_files)} site(s) seeded.")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
