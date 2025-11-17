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
    allowed_tables = ["users", "accounts", "customers"]
    allowed_sort_fields = ["id", "email", "created_at", "role", "status"]
    allowed_sort_dirs = ["ASC", "DESC"]
    
    if table_name not in allowed_tables:
        raise ValueError(f"Invalid table name: {table_name}")
    if sort_by not in allowed_sort_fields:
        raise ValueError(f"Invalid sort field: {sort_by}")
    if sort_dir.upper() not in allowed_sort_dirs:
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
