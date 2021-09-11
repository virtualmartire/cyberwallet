# ...work in progress...

cyberwallet

This is my web app to monitor the investments that I've made. It reads my diary from *data_entry.json*, searches the economic data in the AlphaVantage DB (https://www.alphavantage.co/) and finally visualizes them in a table-chart fashion.

The code is entirely commented.

data_entry input format

{
    wallet name: {
        investment name: [ticker, initial date of the investment, price of the object at that moment, [first day of the new splitted price, split factor]],
        ...
    },
    ...
}

# data_entry example

{
    "Chips' crysis": {
        "NVDA1": ["NVDA", "2020-11-25", 132.35, ["2021-07-20", 4]],
        "STM": ["STM", "2021-04-26", 37.54]
    },
    "Digitalization": {
        "TNXT": ["TNXT", "2021-09-01", 46.82],
        "NEXI": ["NEXI", "2021-09-01", 21.07],
        "DAL": ["DAL", "2021-09-01", 23.93]
    }
}
