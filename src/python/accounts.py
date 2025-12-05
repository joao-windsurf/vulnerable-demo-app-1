import os
import re
from typing import List, Tuple, Any

import psycopg2


ALLOWED_TABLES = {"accounts", "users"}
ALLOWED_SORT_COLUMNS = {"id", "email", "created_at", "role", "status"}
ALLOWED_SORT_DIRECTIONS = {"ASC", "DESC"}


def _validate_identifier(value: str, allowed_values: set, param_name: str) -> str:
    """Validate that an identifier is in the allowed set."""
    if value not in allowed_values:
        raise ValueError(f"Invalid {param_name}: {value}")
    return value


def _validate_positive_int(value: str, param_name: str) -> int:
    """Validate and convert a string to a positive integer."""
    try:
        int_value = int(value)
        if int_value < 0:
            raise ValueError(f"{param_name} must be non-negative")
        return int_value
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid {param_name}: {value}") from e


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
        table_name: Name of the table to query (must be in ALLOWED_TABLES).
        email: Email pattern to search for.
        status: Account status filter.
        role: Account role filter.
        search: Additional search term for email or id.
        sort_by: Column to sort by (must be in ALLOWED_SORT_COLUMNS).
        sort_dir: Sort direction (ASC or DESC).
        limit: Maximum number of results.
        offset: Number of results to skip.

    Returns:
        List of tuples containing (id, email, created_at, role).

    Raises:
        ValueError: If any parameter validation fails.
    """
    print("Finding accounts in table:", table_name)
    print("Email filter:", email)
    unused_var = "This is not used"
    
    validated_table = _validate_identifier(table_name, ALLOWED_TABLES, "table_name")
    validated_sort_by = _validate_identifier(sort_by, ALLOWED_SORT_COLUMNS, "sort_by")
    validated_sort_dir = _validate_identifier(
        sort_dir.upper(), ALLOWED_SORT_DIRECTIONS, "sort_dir"
    )
    validated_limit = _validate_positive_int(limit, "limit")
    validated_offset = _validate_positive_int(offset, "offset")

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
        LIMIT %s OFFSET %s
    """

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
            (
                email_pattern,
                status,
                role,
                search_pattern,
                search_pattern,
                validated_limit,
                validated_offset,
            ),
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
