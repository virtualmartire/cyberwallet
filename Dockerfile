FROM virtualmartire/pi_zero:pandas1.1.5

RUN apt-get -y update && apt-get -y upgrade
RUN pip install --upgrade pip

RUN pip install yfinance

WORKDIR /cyberwallet
COPY . .
RUN chmod +x ./backend/timescript.sh
CMD ./backend/timescript.sh