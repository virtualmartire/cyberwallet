This is the web app that I use to monitor my investments. It reads the coordinates from *frontend/data_entry.json*, searches for the economic data with the yfinance Python API (https://pypi.org/project/yfinance/) and finally visualizes them in a table+chart fashion.

# backend
It consists of a python script that downloads the investments' coordinates contained in *frontend/data_entry.json* and updates (and uploads) the timeseries database every 24 hours.

# frontend
Some HTML and CSS to construct the tables and a javascript snippet that pictures the graphs with the Google Charts API.
