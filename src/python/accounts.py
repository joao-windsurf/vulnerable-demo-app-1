import os
import re
from typing import List, Tuple, Any

import psycopg2


ALLOWED_TABLE_NAMES = {"accounts", "users", "customers"}
ALLOWED_SORT_COLUMNS = {"id", "email", "created_at", "role", "status"}
ALLOWED_SORT_DIRECTIONS = {"ASC", "DESC"}


def _validate_identifier(value: str, allowed_values: set, param_name: str) -> str:
    """Validate that a value is in the allowed set to prevent SQL injection."""
    if value not in allowed_values:
        raise ValueError(f"Invalid {param_name}: {value}")
    return value


def _validate_positive_integer(value: str, param_name: str) -> int:
    """Validate and convert a string to a positive integer."""
    try:
        int_value = int(value)
        if int_value < 0:
            raise ValueError(f"{param_name} must be non-negative")
        return int_value
    except (ValueError, TypeError):
        raise ValueError(f"Invalid {param_name}: must be a positive integer")


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
    """
    Find accounts with advanced filtering options.

    Args:
        table_name: Name of the table to query (must be in ALLOWED_TABLE_NAMES)
        email: Email pattern to search for
        status: Account status filter
        role: Account role filter
        search: Search term for email or ID
        sort_by: Column to sort by (must be in ALLOWED_SORT_COLUMNS)
        sort_dir: Sort direction (ASC or DESC)
        limit: Maximum number of results
        offset: Number of results to skip

    Returns:
        List of tuples containing (id, email, created_at, role)

    Raises:
        ValueError: If any parameter fails validation
    """
    validated_table = _validate_identifier(table_name, ALLOWED_TABLE_NAMES, "table_name")
    validated_sort_by = _validate_identifier(sort_by, ALLOWED_SORT_COLUMNS, "sort_by")
    validated_sort_dir = _validate_identifier(sort_dir.upper(), ALLOWED_SORT_DIRECTIONS, "sort_dir")
    validated_limit = _validate_positive_integer(limit, "limit")
    validated_offset = _validate_positive_integer(offset, "offset")

    email_pattern = f"%{email}%"
    search_pattern = f"%{search}%"

    query = f"""
        SELECT id, email, created_at, role
        FROM {validated_table}
        WHERE email LIKE %s
        AND status = %s
        AND role = %s
        AND (email LIKE %s OR CAST(id AS TEXT) LIKE %s)
        ORDER BY {validated_sort_by} {validated_sort_dir}
        LIMIT %s OFFSET %s;
    """

    params = (
        email_pattern,
        status,
        role,
        search_pattern,
        search_pattern,
        validated_limit,
        validated_offset,
    )

    conn = psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        dbname=os.getenv("PGDATABASE", "testdb"),
        user=os.getenv("PGUSER", "testuser"),
        password=os.getenv("PGPASSWORD", "testpass"),
    )
    try:
        cur = conn.cursor()
        cur.execute(query, params)
        return cur.fetchall()
    finally:
        conn.close()
