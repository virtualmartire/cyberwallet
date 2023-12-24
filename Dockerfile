FROM python:3.9.6

RUN apt-get -y update && apt-get -y upgrade
RUN pip install --upgrade pip

RUN pip install yfinance==0.2.33
RUN pip install pandas==2.1.4

WORKDIR /cyberwallet
COPY . .
CMD while true; do python ./backend/update_routine.py; sleep 86400; done