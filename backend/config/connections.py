# Database connection configurations
# Map connection names to SQLAlchemy connection strings

AVAILABLE_CONNECTIONS = {
    'PostgreSQL_Main': {
        'url': 'postgresql://user:password@localhost:5432/reportdb',
        'type': 'postgresql',
        'description': 'PostgreSQL Main Database'
    },
    'MySQL_Sales': {
        'url': 'mysql+pymysql://oopuser:Pass123.@localhost:3306/reportdb',
        'type': 'mysql',
        'description': 'MySQL Sales Database'
    },
    'Oracle_ERP': {
        'url': 'oracle+cx_oracle://user:password@localhost:1521/ORCL',
        'type': 'oracle',
        'description': 'Oracle ERP System'
    },
    'Firebird_Legacy': {
        'url': 'firebird+fdb://user:password@localhost/path/to/database.fdb',
        'type': 'firebird',
        'description': 'Firebird Legacy System'
    },
}

def get_connection_url(connection_name: str) -> str:
    """Get connection URL by name"""
    if connection_name not in AVAILABLE_CONNECTIONS:
        raise ValueError(f"Connection '{connection_name}' not found")
    return AVAILABLE_CONNECTIONS[connection_name]['url']

def get_available_connections() -> list:
    """Get list of available connection names"""
    return list(AVAILABLE_CONNECTIONS.keys())

def validate_connection(connection_name: str) -> bool:
    """Validate if connection exists"""
    return connection_name in AVAILABLE_CONNECTIONS
