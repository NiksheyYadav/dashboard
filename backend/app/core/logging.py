import logging
import sys

from pythonjsonlogger import jsonlogger

from app.utils.request_context import get_request_id


class RequestIdJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record.setdefault("level", record.levelname)
        log_record.setdefault("logger", record.name)
        request_id = get_request_id()
        if request_id:
            log_record["request_id"] = request_id


def configure_logging(level: str = "INFO") -> None:
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(level.upper())

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(RequestIdJsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s"))

    root_logger.addHandler(handler)
