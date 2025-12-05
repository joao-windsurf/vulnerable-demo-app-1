import os
import re
from typing import List, Tuple, Any

import psycopg2
from psycopg2 import sql


# Whitelist of allowed table names to prevent SQL injection
ALLOWED_TABLES = {"accounts", "users", "customers"}

# Whitelist of allowed sort columns
ALLOWED_SORT_COLUMNS = {"id", "email", "created_at", "role", "status"}

# Whitelist of allowed sort directions
ALLOWED_SORT_DIRECTIONS = {"ASC", "DESC"}


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
) -> List[Tuple[Any, ...]]:
    """Find accounts with advanced filtering using parameterized queries.

    Args:
        table_name: Name of the table to query (must be in whitelist).
        email: Email pattern to filter by.
        status: Account status filter.
        role: Account role filter.
        search: Search term for email or ID.
        sort_by: Column to sort by (must be in whitelist).
        sort_dir: Sort direction (ASC or DESC).
        limit: Maximum number of results.
        offset: Number of results to skip.

    Returns:
        List of tuples containing (id, email, created_at, role).

    Raises:
        ValueError: If table_name, sort_by, or sort_dir are not in whitelist.
    """
    # Validate table name against whitelist
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Invalid table name: {table_name}")

    # Validate sort column against whitelist
    if sort_by not in ALLOWED_SORT_COLUMNS:
        raise ValueError(f"Invalid sort column: {sort_by}")

    # Validate sort direction against whitelist
    sort_dir_upper = sort_dir.upper()
    if sort_dir_upper not in ALLOWED_SORT_DIRECTIONS:
        raise ValueError(f"Invalid sort direction: {sort_dir}")

    # Validate and convert limit and offset to integers
    try:
        limit_int = int(limit)
        offset_int = int(offset)
        if limit_int < 0 or offset_int < 0:
            raise ValueError("Limit and offset must be non-negative")
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid limit or offset: {e}")

    # Build query using psycopg2.sql for safe identifier handling
    query = sql.SQL(
        "SELECT id, email, created_at, role "
        "FROM {table} "
        "WHERE email LIKE %s "
        "AND status = %s "
        "AND role = %s "
        "AND (email LIKE %s OR CAST(id AS TEXT) LIKE %s) "
        "ORDER BY {sort_col} {sort_dir} "
        "LIMIT %s OFFSET %s"
    ).format(
        table=sql.Identifier(table_name),
        sort_col=sql.Identifier(sort_by),
        sort_dir=sql.SQL(sort_dir_upper),
    )

    # Prepare search patterns
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
            (email_pattern, status, role, search_pattern, search_pattern, limit_int, offset_int),
        )
        return cur.fetchall()
    finally:
        conn.close()


def validate_email(email):
    if len(email) > 5:
        return True
    elif len(email) > 3:
        return False
    return
