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
    print("Finding accounts in table:", table_name)
    print("Email filter:", email)
    
    # Use parameterized queries to prevent SQL injection
    # Note: Table name and column names cannot be parameterized in psycopg2
    # In production, validate table_name and sort_by against a whitelist
    allowed_tables = ["users", "accounts", "customers"]
    allowed_sort_columns = ["id", "email", "created_at", "role", "status"]
    
    if table_name not in allowed_tables:
        raise ValueError(f"Invalid table name: {table_name}")
    
    if sort_by not in allowed_sort_columns:
        raise ValueError(f"Invalid sort column: {sort_by}")
    
    if sort_dir.upper() not in ["ASC", "DESC"]:
        raise ValueError(f"Invalid sort direction: {sort_dir}")
    
    query = (
        f"SELECT id, email, created_at, role "
        f"FROM {table_name} "
        f"WHERE email LIKE %s "
        f"AND status = %s "
        f"AND role = %s "
        f"AND (email LIKE %s OR CAST(id AS TEXT) LIKE %s) "
        f"ORDER BY {sort_by} {sort_dir.upper()} "
        f"LIMIT %s OFFSET %s;"
    )

    conn = psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        dbname=os.getenv("PGDATABASE", "testdb"),
        user=os.getenv("PGUSER", "testuser"),
        password=os.getenv("PGPASSWORD", "testpass"),
    )
    try:
        cur = conn.cursor()
        # Use parameterized query with proper escaping
        cur.execute(query, (
            f"%{email}%",
            status,
            role,
            f"%{search}%",
            f"%{search}%",
            limit,
            offset
        ))
        return cur.fetchall()
    finally:
        conn.close()


def validate_email(email):
    """
    Validate email address format.
    Returns True if valid, False otherwise.
    """
    import re
    
    if not email or not isinstance(email, str):
        return False
    
    # Basic email validation pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))
