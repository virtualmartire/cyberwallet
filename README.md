This is the web app that I use to monitor my investments. It reads my diary from *data_entry.json*, searches for the economic data with the yfinance Python API (https://pypi.org/project/yfinance/) and finally visualizes them in a table-chart fashion.

# backend
It consists of a python script that downloads the investments' coordinates contained in *data_entry.json* from the server and updates (and uploads) the timeseries database every 24 hours.

# frontend
Some HTML and CSS to construct the tables and a javascript snippet that pictures the graphs with the Google Chatrs API.

# data_entry input format

{\
    wallet name: {\
        investment name: [ticker, initial date of the investment, price of the object at that moment],\
        ...\
    },\
    ...\
}