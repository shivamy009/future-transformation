from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    total_searches_performed: int
