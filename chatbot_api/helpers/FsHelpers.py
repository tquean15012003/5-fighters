import os
import json
import decimal  
import logging
import datetime 

class CustomEncoder(json.JSONEncoder):  
    def default(self, obj):  
        if isinstance(obj, decimal.Decimal):  
            return float(obj)  
        if isinstance(obj, datetime.date):  
            return obj.isoformat()  
        return super(CustomEncoder, self).default(obj)

logger = logging.getLogger(__name__)


def write_json_file(filename: str, data: list | dict) -> None:
    with open(f"{filename}", "w") as f:
        json.dump(data, f, cls=CustomEncoder)


def load_json_file(filename: str) -> dict | list:
    data = []
    if os.path.isfile(f"{filename}"):
        f = open(f"{filename}")
        data = json.load(f)
    else:
        with open(f"{filename}", 'w'):
            logger.info("messages.json is created!")
    return data