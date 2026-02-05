"""
Query Execution Service
Handles executing SQL queries against different database connections
"""
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.pool import StaticPool
from config.connections import get_connection_url, validate_connection
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class QueryExecutor:
    """Execute SQL queries against different database connections"""
    
    def __init__(self):
        self.engines = {}
    
    def get_engine(self, connection_name: str):
        """Get or create engine for a connection"""
        if connection_name not in self.engines:
            if not validate_connection(connection_name):
                raise ValueError(f"Connection '{connection_name}' not found")
            
            try:
                url = get_connection_url(connection_name)
                # Use StaticPool to avoid connection issues in testing
                self.engines[connection_name] = create_engine(
                    url,
                    poolclass=StaticPool,
                    echo=False
                )
            except Exception as e:
                logger.error(f"Failed to create engine for {connection_name}: {str(e)}")
                raise
        
        return self.engines[connection_name]
    
    def execute_query(self, connection_name: str, sql_query: str, limit: int = 100) -> Dict[str, Any]:
        """
        Execute a SQL query and return results
        
        Args:
            connection_name: Name of the connection to use
            sql_query: SQL query to execute
            limit: Maximum number of rows to return
            
        Returns:
            Dictionary with columns and rows
        """
        try:
            if not sql_query or not sql_query.strip():
                return {"error": "Query cannot be empty", "columns": [], "rows": []}
            
            engine = self.get_engine(connection_name)
            
            with engine.connect() as connection:
                # Add LIMIT clause if not already present (basic check)
                query_upper = sql_query.upper().strip()
                if 'LIMIT' not in query_upper:
                    # Only add limit for SELECT queries
                    if query_upper.startswith('SELECT'):
                        sql_query = f"{sql_query.rstrip(';')} LIMIT {limit}"
                
                result = connection.execute(text(sql_query))
                
                # Get column names
                columns = list(result.keys()) if result.keys() else []
                
                # Get rows
                rows = []
                for row in result.fetchall():
                    rows.append(list(row))
                
                return {
                    "success": True,
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows)
                }
                
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "columns": [],
                "rows": []
            }
    
    def test_connection(self, connection_name: str) -> bool:
        """Test if a connection is valid"""
        try:
            engine = self.get_engine(connection_name)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False

# Global executor instance
executor = QueryExecutor()
