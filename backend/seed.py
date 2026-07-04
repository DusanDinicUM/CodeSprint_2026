"""
Run once to create demo data: `python seed.py`
Gives you a Charity Admin / Volunteer / Auditor login (Role.ADMIN/MANAGER/VIEWER
internally - see utils/roles.js on the frontend for the display-name mapping)
and a couple of campaigns with donations for the VIVA and demo video without
hand-typing data live.
"""
from datetime import datetime, timedelta

from app.database import SessionLocal, Base, engine
from app.models import User, Role, Campaign, Transaction, TransactionStatus, PaymentMethod
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if not db.query(User).filter(User.email == "admin@codesprint.mt").first():
    db.add_all([
        User(email="admin@codesprint.mt", full_name="Charity Admin", role=Role.ADMIN,
             hashed_password=hash_password("Password123!")),
        User(email="manager@codesprint.mt", full_name="Volunteer", role=Role.MANAGER,
             hashed_password=hash_password("Password123!")),
        User(email="auditor@codesprint.mt", full_name="Auditor", role=Role.VIEWER,
             hashed_password=hash_password("Password123!")),
    ])
    db.commit()
    print("Seeded users: admin@codesprint.mt / manager@codesprint.mt / auditor@codesprint.mt (Password123!)")

if not db.query(Campaign).first():
    winter = Campaign(
        name="Winter Shelter Appeal", charity_name="Open Hands Malta",
        description="Food & shelter for families in need", logo_emoji="🧡",
        goal_amount=25000.0, suggested_amounts="5,10,25",
        start_date=datetime.utcnow() - timedelta(days=30),
        end_date=datetime.utcnow() + timedelta(days=30),
    )
    school = Campaign(
        name="School Bake Sale Fund", charity_name="St. Julian's Primary PTA",
        description="New library books for the school", logo_emoji="📚",
        goal_amount=3000.0, suggested_amounts="2,5,10",
        start_date=datetime.utcnow() - timedelta(days=10),
        end_date=datetime.utcnow() + timedelta(days=20),
    )
    db.add_all([winter, school])
    db.commit()
    db.refresh(winter)
    db.refresh(school)

    db.add_all([
        Transaction(reference="DON-0001", amount=25.0, currency="EUR", status=TransactionStatus.COMPLETED,
                    payment_method=PaymentMethod.TAP, payer_name="Jane Doe", is_anonymous=False,
                    campaign_id=winter.id),
        Transaction(reference="DON-0002", amount=40.0, currency="USD", status=TransactionStatus.COMPLETED,
                    payment_method=PaymentMethod.CARD, payer_name="John Smith", is_anonymous=True,
                    campaign_id=winter.id, external_id="mc-sandbox-demo1"),
        Transaction(reference="DON-0003", amount=15.5, currency="GBP", status=TransactionStatus.FAILED,
                    payment_method=PaymentMethod.CARD, payer_name="Alex Borg", failure_reason="declined_by_issuer",
                    campaign_id=school.id),
        Transaction(reference="DON-0004", amount=10.0, currency="EUR", status=TransactionStatus.COMPLETED,
                    payment_method=PaymentMethod.TAP, payer_name="Maria Vella", is_anonymous=False,
                    is_recurring=True, campaign_id=school.id),
    ])
    db.commit()
    print("Seeded demo campaigns and donations")

db.close()
