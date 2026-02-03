from config.database import engine, Base 
from app.models.reports import Reports
from app.models.report_columns import ReportColumn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.report_route import router as report_router
from routes.auth_route import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:9000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
app.include_router(report_router)
app.include_router(auth_router)