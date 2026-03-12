"""
Backup the database to local JSON site files.

Usage:
    pip install psycopg2-binary
    DATABASE_URL="postgresql://..." python db/backup.py

Or pass the URL as an argument:
    python db/backup.py "postgresql://user:pass@host:port/dbname"
"""

import json
import os
import sys

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
        # Try to find DATABASE_URL in .env.local if it's not set in environment
        try:
            from dotenv import load_dotenv
            load_dotenv(".env.local")
            url = os.environ.get("DATABASE_URL")
        except ImportError:
            pass
            
    if not url:
        print("Provide DATABASE_URL as env var or first argument.")
        sys.exit(1)
    return url


def main():
    database_url = get_database_url()
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "sites")
    
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    print("Connecting to database...")
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        print("Fetching sites from database...")
        cur.execute("SELECT slug, data FROM sites")
        rows = cur.fetchall()

        if not rows:
            print("No sites found in database.")
            return

        for slug, data in rows:
            file_path = os.path.join(data_dir, f"{slug}.json")
            
            # Ensure slug is in the data object for consistency
            if isinstance(data, dict):
                full_data = {"slug": slug, **data}
            else:
                # If data is a string (JSON string), parse it first
                data_dict = json.loads(data) if isinstance(data, str) else data
                full_data = {"slug": slug, **data_dict}

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(full_data, f, indent=2, ensure_ascii=False)
            
            print(f"  Backed up: {slug}.json")

        print(f"\nDone! {len(rows)} site(s) backed up to {data_dir}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    main()
