import asyncio
import asyncpg
import bcrypt

async def seed():
    conn = await asyncpg.connect('postgresql://app_admin:dev_secret_123@localhost:5433/realestate_engine')
    
    salt = bcrypt.gensalt(rounds=12)
    buyer_pwd = bcrypt.hashpw(b'Password123!', salt).decode('utf-8')
    admin_pwd = bcrypt.hashpw(b'AdminSecret123!', salt).decode('utf-8')
    
    # 1. Buyer
    exists = await conn.fetchval("SELECT 1 FROM users WHERE email='buyer@example.com'")
    if not exists:
        await conn.execute(
            """
            INSERT INTO users (email, hashed_password, full_name, phone_number, role, is_active, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
            'buyer@example.com', buyer_pwd, 'Test Buyer', '+1234567890', 'buyer', True, True
        )
        print("Created buyer@example.com")
    else:
        await conn.execute("UPDATE users SET hashed_password = $1 WHERE email = 'buyer@example.com'", buyer_pwd)
        print("Updated buyer@example.com password")

    # 2. Admin
    admin_exists = await conn.fetchval("SELECT 1 FROM users WHERE email='admin@example.com'")
    if not admin_exists:
        await conn.execute(
            """
            INSERT INTO users (email, hashed_password, full_name, phone_number, role, is_active, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
            'admin@example.com', admin_pwd, 'Super Admin', '+1987654321', 'admin', True, True
        )
        print("Created admin@example.com")
    else:
        await conn.execute("UPDATE users SET hashed_password = $1 WHERE email = 'admin@example.com'", admin_pwd)
        print("Updated admin@example.com password")

    await conn.close()
    print("Seed complete.")

if __name__ == '__main__':
    asyncio.run(seed())
