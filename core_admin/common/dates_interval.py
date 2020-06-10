
from datetime import datetime, timedelta


def get_days_interval(start_date, end_date):
    """
        Retorna todos os dias entre a data final e inicial
    """
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    delta = end - start
    days = list()
    for i in range(delta.days + 1):
        day = start + timedelta(days=i)
        days.append(day.date())
    return days