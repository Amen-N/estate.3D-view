import asyncio
import asyncpg
import sys

async def main():
    print("Connecting to postgres database...")
    conn = await asyncpg.connect(
        host="127.0.0.1",
        port=5432,
        user="postgres",
        password="",
        database="postgres"
    )
    print("Connected successfully to postgres database.")
    
    # 1. Create or update user app_admin
    user_exists = await conn.fetchval("SELECT 1 FROM pg_roles WHERE rolname='app_admin'")
    if not user_exists:
        await conn.execute("CREATE ROLE app_admin WITH LOGIN SUPERUSER PASSWORD 'dev_secret_123'")
        print("Created role 'app_admin' with SUPERUSER privileges.")
    else:
        await conn.execute("ALTER ROLE app_admin WITH SUPERUSER PASSWORD 'dev_secret_123'")
        print("Updated role 'app_admin' password and privileges.")

    # 2. Create database realestate_engine if not exists
    db_exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname='realestate_engine'")
    if not db_exists:
        await conn.execute("CREATE DATABASE realestate_engine OWNER app_admin")
        print("Created database 'realestate_engine' owned by 'app_admin'.")
    else:
        print("Database 'realestate_engine' already exists.")
        
    await conn.close()

    # 3. Connect to realestate_engine as app_admin
    print("Connecting to realestate_engine as app_admin...")
    app_conn = await asyncpg.connect(
        host="127.0.0.1",
        port=5432,
        user="app_admin",
        password="dev_secret_123",
        database="realestate_engine"
    )
    print("Connected to realestate_engine as app_admin!")
    
    # 4. Enable extensions
    await app_conn.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    print("Extension uuid-ossp enabled.")
    
    await app_conn.execute('CREATE EXTENSION IF NOT EXISTS btree_gist;')
    print("Extension btree_gist enabled.")
    
    try:
        await app_conn.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
        print("Extension postgis enabled.")
    except Exception as e:
        print("PostGIS notice:", e)

    await app_conn.close()
    print("Setup completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
