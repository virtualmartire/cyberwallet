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