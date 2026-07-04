"""
Central configuration. Read from env vars in a real deployment;
"""
import os

SECRET_KEY = os.getenv("APP_SECRET_KEY", "change-me-on-competition-day")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # a full competition day

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./codesprint.db")

# ISO 4217 - EUR must always be present and first (primary currency per M1.5)
SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP"]
PRIMARY_CURRENCY = "EUR"
