FROM python:3.10.9-slim

WORKDIR /app

RUN apt-get -y update && apt-get -y upgrade

RUN pip install --upgrade pip
RUN pip install yfinance==0.2.54

COPY backend /app/backend

# CMD while true; do python ./backend/update_routine.py; sleep 86400; done
CMD python ./backend/update_routine.py
