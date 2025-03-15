"""This script updates frontend/database.json with new data from the yfinance API."""

import datetime
import json
import yfinance as yf

#
##
###
##
#

DATABASE = {}

# Fetch the investments' coordinates from the server
with open("frontend/data_entry.json", "r") as f:
    data_entry = json.load(f)

# Fetch the data from the yfinance API
for wallet in data_entry.values():
	for investment in wallet.values():

		ticker = investment[0]
		if ticker not in DATABASE:		# because some investments are on the same asset
			# Get the data
			dataframe = yf.Ticker(ticker).history(period='5y')
			# Take the mean prices, remove NaN and round
			dataframe = (dataframe['High'] + dataframe['Low']) / 2
			dataframe = dataframe.interpolate().ffill().bfill()
			dataframe = dataframe.round(2)
			# Export the python dictionary
			dataframe.index = dataframe.index.map(lambda x: str(x)[:10])
			time_series = dataframe.to_dict()
			# Add the data to the global dictionary
			DATABASE[ticker] = time_series

DATABASE["upDATE"] = datetime.date.today().strftime('%d/%m/%Y')
with open('frontend/database.json', 'w') as db_file:
	json.dump(DATABASE, db_file)
