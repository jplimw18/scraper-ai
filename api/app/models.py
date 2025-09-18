from pydantic import BaseModel

class ProductData(BaseModel):
    mark: str 
    model: str
    cpu: str
    storage: str
    mem: str
    price: str

    class Config:
        json_schema_extra = {
            "example": {
                "mark": "MyMark",
                "model": "XXXXXXXX",
                "cpu": "XXX 4 threads XXX",
                "storage": "XXX GB/TB/MB",
                "mem": "9999 GB/s 999999mhz",
                "price": "X$ 999999,99"
            }
        }
