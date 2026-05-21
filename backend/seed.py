"""
Seed script — inserts 500 fake MUJ students directly into the DB.
These have no Google account; real sign-ins are added on top.

Run inside the container:
    docker-compose exec backend python seed.py
"""

import asyncio
import random
import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import settings
from app.models import Base, User

# ── Name data ────────────────────────────────────────────────────────────────

FIRST_NAMES = [
    "Aarav", "Aryan", "Vivaan", "Aditya", "Vihaan", "Sai", "Arjun", "Reyansh",
    "Ayaan", "Dhruv", "Kabir", "Ritvik", "Eshaan", "Shaurya", "Atharv", "Advait",
    "Pranav", "Rohan", "Karan", "Nikhil", "Rahul", "Vikas", "Sumit", "Ankit",
    "Gaurav", "Harsh", "Ishaan", "Jay", "Kunal", "Laksh", "Manav", "Neel",
    "Om", "Parth", "Raj", "Sahil", "Tarun", "Uday", "Varun", "Yash",
    "Aaditya", "Abhishek", "Akash", "Aman", "Amit", "Arnav", "Ashish",
    "Deepak", "Divyam", "Hemant", "Himanshu", "Ishan", "Jatin", "Kartik",
    "Mohit", "Nihal", "Piyush", "Prateek", "Rishi", "Sagar", "Shubham",
    "Sourav", "Tushar", "Ujjwal", "Veer", "Vikram", "Vinay", "Vishal",
    # Female names
    "Aanya", "Aarohi", "Aditi", "Aisha", "Akanksha", "Ananya", "Anjali",
    "Anushka", "Apurva", "Avni", "Diya", "Divya", "Esha", "Garima",
    "Ishita", "Jhanvi", "Kavya", "Khushi", "Kiara", "Kriti", "Mansi",
    "Meera", "Nandini", "Neha", "Nikita", "Palak", "Pooja", "Prachi",
    "Pragati", "Priya", "Radhika", "Riya", "Sakshi", "Saloni", "Shreya",
    "Simran", "Sneha", "Srishti", "Swati", "Tanvi", "Trisha", "Urvashi",
    "Vandana", "Varsha", "Vidya", "Yashika", "Zara", "Preeti", "Nisha",
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Agarwal",
    "Mehta", "Shah", "Yadav", "Pandey", "Chauhan", "Srivastava", "Mishra",
    "Tiwari", "Dubey", "Pathak", "Shukla", "Trivedi", "Reddy", "Nair",
    "Menon", "Pillai", "Iyer", "Rao", "Bose", "Das", "Ghosh", "Mukherjee",
    "Chatterjee", "Banerjee", "Sengupta", "Roy", "Saxena", "Malhotra",
    "Kapoor", "Bhatia", "Chopra", "Arora", "Sethi", "Anand", "Bajaj",
    "Jain", "Khanna", "Mehra", "Nanda", "Oberoi", "Taneja", "Walia",
    "Bisht", "Rawat", "Thakur", "Rajput", "Bhatt", "Negi", "Chandra",
    "Desai", "Modi", "Parikh", "Bhattacharya", "Dutta", "Mitra",
]

HOMETOWNS = [
    "Jaipur", "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai",
    "Pune", "Ahmedabad", "Kolkata", "Lucknow", "Kanpur", "Nagpur",
    "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
    "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
    "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota",
    "Guwahati", "Chandigarh", "Solapur", "Hubli", "Mysore", "Tiruchirappalli",
    "Bareilly", "Aligarh", "Moradabad", "Noida", "Gurugram", "Dehradun",
    "Udaipur", "Ajmer", "Bikaner", "Sikar", "Alwar", "Bharatpur",
]

BRANCHES = [
    "CSE", "ECE", "EEE", "ME", "CE", "BBA", "MBA",
    "BCA", "MCA", "B.Pharm", "B.Arch", "Design", "Law", "Other",
]

BRANCH_WEIGHTS = [25, 15, 8, 8, 6, 7, 5, 8, 5, 4, 3, 3, 2, 1]

INTERESTS = [
    "Gaming", "Music", "Football", "Cricket", "Basketball",
    "Badminton", "Gym/Fitness", "Art & Design", "Movies", "Travel",
    "Cooking", "Reading", "Photography", "Dance", "Other",
]

VEG_OPTIONS = ["veg", "non_veg", "both"]
VEG_WEIGHTS = [40, 45, 15]

BIO_TEMPLATES = [
    "Looking for a chill roommate who respects study time and keeps things clean.",
    "Early riser, gym person. Need someone with a similar routine.",
    "Night owl 🦉 — do my best work after midnight. Need a compatible roommate.",
    "Into gaming and late night Maggi sessions. Let's vibe.",
    "Pretty easygoing, just need a clean space and decent sleep hours.",
    "Cricket on weekends, hustle on weekdays. Looking for someone similar.",
    "Music is life. Will have headphones on most of the time — no drama.",
    "First year here, nervous but excited. Looking for a friendly roommate!",
    "Foodie who loves to cook. Will share food if you keep the kitchen clean.",
    "Prefer a quiet, focused environment. Study hard, sleep well.",
    "Social butterfly 🦋 — love having people over sometimes. Hope that's okay!",
    "Travel addict, always planning the next trip. Need someone adventurous.",
    "Bookworm looking for a like-minded roommate. Quiet evenings preferred.",
    "Fitness freak — early morning workouts are non-negotiable. Very clean habits.",
    "Dance is my therapy. Practice sessions are chill, I use headphones.",
    "Introvert, keep to myself mostly. Very respectful of personal space.",
    "Final year so mostly offline and grinding. Need a focused roommate.",
    "Photographer — my room might have some equipment. Very organized though.",
    "Mujhe sirf ek clean room chahiye aur ek decent roommate 😄",
    "From Rajasthan, first time living away from home. Adjustable and friendly!",
    "",  # some people leave bio blank
    "",
    "",
]


def random_phone() -> str:
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88", "87", "86"]
    return random.choice(prefixes) + str(random.randint(10000000, 99999999))


def make_student(index: int) -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    email = f"seed.{first.lower()}.{last.lower()}.{index}@example.com"

    n_interests = random.choices([2, 3, 4, 5, 6], weights=[10, 25, 30, 25, 10])[0]
    chosen_interests = random.sample(INTERESTS, n_interests)

    return {
        "id": uuid.uuid4(),
        "google_id": f"seed_student_{index:04d}",
        "email": email,
        "name": name,
        "avatar_url": None,
        "year": random.choices([1, 2, 3, 4], weights=[30, 28, 25, 17])[0],
        "branch": random.choices(BRANCHES, weights=BRANCH_WEIGHTS)[0],
        "hometown": random.choice(HOMETOWNS),
        "veg_nonveg": random.choices(VEG_OPTIONS, weights=VEG_WEIGHTS)[0],
        "interests": chosen_interests,
        "contact_info": random_phone(),
        "bio": random.choice(BIO_TEMPLATES).strip() or None,
        "is_looking": random.choices([True, False], weights=[85, 15])[0],
        "profile_complete": True,
    }


async def seed():
    engine = create_async_engine(settings.database_url, echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with Session() as db:
        # Remove any previously seeded students so re-running is safe
        await db.execute(
            text("DELETE FROM users WHERE google_id LIKE 'seed_student_%'")
        )
        await db.commit()

        students = [make_student(i) for i in range(1, 501)]
        db.add_all([User(**s) for s in students])
        await db.commit()

    await engine.dispose()
    print("✅  Seeded 500 fake MUJ students.")


if __name__ == "__main__":
    asyncio.run(seed())
