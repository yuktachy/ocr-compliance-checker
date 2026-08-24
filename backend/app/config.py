import os
from dotenv import load_dotenv

load_dotenv()

# DATABASE_* is retained temporarily to avoid breaking existing local .env files.
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("DATABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("DATABASE_KEY")
