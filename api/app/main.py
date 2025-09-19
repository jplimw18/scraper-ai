from fastapi import FastAPI, Depends, HTTPException, status
from typing import List

from .database import data_collection
from .models import ProductData
from .security import get_api_key

app = FastAPI(
    title="Scraper AI API",
    description="API to manage scraped data and provide predictions services",
    version="1.0.0"
)

@app.get("/", tags=["Root"])
async def read_root(api_key: str = Depends(get_api_key)):
    return { "message": "The prediction API is online" }

@app.post(
    "/api/ingest",
    tags=["Ingestion"],
    summary="Receive and storage scraped data",
    status_code=status.HTTP_201_CREATED
)
async def ingest_data(products: List[ProductData], api_key: str = Depends(get_api_key)):
    if not products:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The product list cannot not be empty"
        )

    
    try:
        products_dict = [p.model_dump() for p in products]
        result = data_collection.insert_many(products_dict)

        return {
            "message": "Data received",
            "inserted_count": len(result.inserted_ids)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


    return { "message": "Ok, data received" }