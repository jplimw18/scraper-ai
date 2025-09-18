from pydantic import BaseModel, Field
from typing import Optional

class ProductData(BaseModel):
    marca: str = Field(..., min_length=1)
    modelo: str = Field
