import urllib
import datetime
import json
import yfinance as yf
import ftplib

#
##
###
##
#

DATABASE = {}

# Fetch the investments' coordinates from the server
with urllib.request.urlopen('https://www.stefanomartire.it/cyberwallet/data_entry.json') as data_entry_file:
    data_entry = json.load(data_entry_file)

for wallet in data_entry.values():
	for investment in wallet.values():

		ticker = investment[0]
		if ticker not in DATABASE:		# because some investments are on the same asset
			
			# Get the data
			dataframe = yf.Ticker(ticker).history(period='5y')

			# Compute the mean prices, simplify the dataframe and remove NaN
			dataframe["mean_price"] = (dataframe['High'] + dataframe['Low']) / 2
			dataframe = dataframe['mean_price']
			dataframe = dataframe.interpolate().fillna(method='ffill').fillna(method='bfill')

			# Export the python dictionary
			dataframe = dataframe.round(2)
			dataframe.index = dataframe.index.map(lambda x: str(x)[:10])
			time_series = dataframe.to_dict()

			DATABASE[ticker] = time_series

DATABASE["upDATE"] = datetime.date.today().strftime('%d/%m/%Y')

# Update the database locally
with open('frontend/database.json', 'w') as db_file:
	json.dump(DATABASE, db_file)

# Upload the database on the server
with open('backend/credentials.json', 'r') as credentials_file:
	credentials = json.load(credentials_file)
session = ftplib.FTP('ftp.stefanomartire.it', credentials['id'], credentials['password'])
with open('frontend/database.json', 'rb') as db_file:
    session.storbinary('STOR cyberwallet/database.json', db_file)
session.quit()

print("The data had been updated.")