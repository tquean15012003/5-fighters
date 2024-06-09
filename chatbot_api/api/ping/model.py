from pydantic import BaseModel


class PingReponse(BaseModel):
    message: str
