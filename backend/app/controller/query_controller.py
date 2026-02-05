"""
Query Controller
Handles API requests for query execution
"""
from app.services.query_service import executor
from app.models.report_columns import ReportColumn
from config.utils import get_owned_column
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

def execute_report_column_query(
    db: Session,
    user_id: int,
    report_id: int,
    column_id: int,
    limit: int = 100
):
    """
    Execute a query from a report column
    Verifies user owns the report before executing
    """
    try:
        # Verify ownership and get column
        column = get_owned_column(db, user_id, report_id, column_id)
        
        if not column:
            return {
                "success": False,
                "error": "Column not found or access denied"
            }
        
        if not column.query:
            return {
                "success": False,
                "error": "Column has no query defined"
            }
        
        if not column.connection_id:
            return {
                "success": False,
                "error": "Column has no connection defined"
            }
        
        # Execute the query
        result = executor.execute_query(
            connection_name=column.connection_id,
            sql_query=column.query,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error executing column query: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def execute_custom_query(
    connection_name: str,
    sql_query: str,
    limit: int = 100
):
    """
    Execute a custom SQL query against a connection
    Used for query testing/previewing
    """
    try:
        result = executor.execute_query(
            connection_name=connection_name,
            sql_query=sql_query,
            limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"Error executing custom query: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
