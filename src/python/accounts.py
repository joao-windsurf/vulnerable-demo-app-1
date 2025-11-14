import os
import psycopg2


def find_accounts_advanced(
    table_name: str,
    email: str,
    status: str = "active",
    role: str = "user",
    search: str = "",
    sort_by: str = "created_at",
    sort_dir: str = "DESC",
    limit: str = "50",
    offset: str = "0",
):
    allowed_tables = ["users", "accounts", "members"]
    if table_name not in allowed_tables:
        raise ValueError(f"Invalid table name: {table_name}")
    
    allowed_sort_columns = ["id", "email", "created_at", "role"]
    if sort_by not in allowed_sort_columns:
        raise ValueError(f"Invalid sort column: {sort_by}")
    
    allowed_sort_dirs = ["ASC", "DESC"]
    if sort_dir.upper() not in allowed_sort_dirs:
        raise ValueError(f"Invalid sort direction: {sort_dir}")
    
    query = f"""
        SELECT id, email, created_at, role 
        FROM {table_name}
        WHERE email LIKE %s 
        AND status = %s 
        AND role = %s 
        AND (email LIKE %s OR CAST(id AS TEXT) LIKE %s)
        ORDER BY {sort_by} {sort_dir.upper()}
        LIMIT %s OFFSET %s
    """
    
    email_pattern = f"%{email}%"
    search_pattern = f"%{search}%"
    
    conn = psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        dbname=os.getenv("PGDATABASE", "testdb"),
        user=os.getenv("PGUSER", "testuser"),
        password=os.getenv("PGPASSWORD", "testpass"),
    )
    try:
        cur = conn.cursor()
        cur.execute(
            query,
            (email_pattern, status, role, search_pattern, search_pattern, limit, offset)
        )
        return cur.fetchall()
    finally:
        conn.close()
