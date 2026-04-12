import random
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class SaleRecord(BaseModel):
    date: str
    sales: int
    isFestival: bool

class ForecastRequest(BaseModel):
    product: str
    sales_history: List[SaleRecord]
    upcoming_festivals: List[bool]

class ForecastResponse(BaseModel):
    product: str
    forecast: List[float]

@app.get("/")
def read_root():
    return "ML service running"

@app.post("/forecast", response_model=ForecastResponse)
def generate_forecast(request: ForecastRequest):
    history = request.sales_history
    upcoming = request.upcoming_festivals
    
    # 1. Calculate average of last 7 days targeting the structured dictionary value payload
    last_7 = history[-7:] if len(history) >= 7 else history
    avg_7_days = sum(item.sales for item in last_7) / len(last_7) if last_7 else 0
    
    forecast = []
    
    # 2. Predict next 10 days mapping explicitly mapping natively to the backend metadata generated
    for i in range(10):
        daily_prediction = avg_7_days + random.uniform(-1.5, 2.0)
        daily_prediction = max(0, daily_prediction)
        
        # Checking actual upcoming flag injected from the generator!
        is_confirmed_festival = upcoming[i] if i < len(upcoming) else False
        
        if is_confirmed_festival:
            daily_prediction += random.uniform(20.0, 40.0) # Massive additive spike securely validated
            
        forecast.append(round(daily_prediction, 2))
        
    return ForecastResponse(
        product=request.product,
        forecast=forecast
    )
