var apikey;

async function getApiKey() {

    if (apikey) {
      return apikey;
    }

    const apikey_raw = await fetch("./apikey.json");
    const apikey_dict = await apikey_raw.json();
    apikey = apikey_dict["apikey"];
    return apikey;

}

function propertiesPick(object) {

  const reducedObject = _.reduce(object, (result, value, index) => {
    result[index] = _.pick(value, ["2. high", "3. low"]);
    return result;
  }, {});

  return reducedObject

}

function datesPick(object, bigbang) {

  const bigbang_ms = Date.parse(bigbang);

  const reducedObject = _.reduce(object, (result, value, date) => {
    const date_ms = Date.parse(date)
    if (date_ms >= bigbang_ms) {
      result[date] = value;
    }
    return result;
  }, {});

  return reducedObject;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////

async function pageBuilder() {

  try {

    /* Get the data entries and the key to make the queries */
    const data_entry_raw = await fetch("./data_entry.json");
    const data_entry = await data_entry_raw.json();

    /* Create the (empty) tables */
    _.forEach(data_entry, (walletContent, walletName) => {

      createTable(walletName);

      _.forEach(walletContent, (investmentContent, investmentName) => {
        beginning = investmentContent[1];
        prepareTable(walletName, investmentName, beginning);
      });

    });

    /* Get the data and fill the tables */
    _.forEach(data_entry, (walletContent, walletName) => {
      _.forEach(walletContent, ([ticker, beginning, bought_at, [split_date = 'no one', split_factor = 1] = []], investmentName) => {

          getTimeSerie(ticker, bigbang = "2020-01-01")
          .then((timeserie_dict) => {
            const [dates_array, prices_array] = processTimeSerie(timeserie_dict, beginning, bought_at, split_date, split_factor);
            fillTable(dates_array, prices_array, investmentName, walletName);
          });

      });
    });

  } catch(error) {
    console.error(error);
  }

}

/* Search in the local storage and in the Alpha Vantage DB for the requested data */
async function getTimeSerie(ticker, bigbang) {

  const stored = localStorage.getItem(ticker) || "{}";
  const storedData = JSON.parse(stored);
  const now = (new Date()).getTime();

  // if data already caught
  if (storedData.data && now < storedData.expire) {
    return Promise.resolve(storedData.data);
  }

  // if the stock is italian
  if (ticker=="_FITALIA") {
    return Promise.resolve("_FITALIA");
  }

  const apikey = await getApiKey();
  const url_request = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apikey}`;
  
  return fetch(url_request)
  .then(async (result) => {

    const responseData = await result.json();
    

    if (!responseData["Time Series (Daily)"]) {

      if (responseData["Error Message"]) {
        return "ticker not found";
      } else {
        return "{}";
      }

    } else {

      var data = responseData["Time Series (Daily)"];

      data = propertiesPick(data);
      data = datesPick(data, bigbang);

      const one_day = 24 * 60 * 60 * 1000;
      const expire = now + one_day;

      localStorage.setItem(ticker, JSON.stringify( {expire, data} ));

      return data;
    }

  })
  .catch((err) => console.error(err));

}

/* Extract the interesting interval from a time serie's dictionary */
function processTimeSerie(timeserie_dict, beginning, bought_at, split_date, split_factor) {

  if (timeserie_dict == "_FITALIA") {
    return [["_FITALIA"], ["_FITALIA"]];
  }
  
  if (timeserie_dict == "ticker not found") {
    return [["ticker not found"], ["ticker not found"]];
  }

  if (timeserie_dict == "{}" ) {
    return [[], []];
  }

  var prices_array = [];
  var dates_array = [];
  var split = false;
  for (let date in timeserie_dict) {

    const date_dict = timeserie_dict[date];
    if (date != beginning) {
      const highest_price = parseFloat(date_dict["2. high"]);
      const lowest_price = parseFloat(date_dict["3. low"]);
      var middle_price = (highest_price + lowest_price) / 2;
      if (split == true) {
        middle_price /= split_factor;
      }
      dates_array.push(date.slice(5));
      prices_array.push(middle_price);
      if (date == split_date) {
        split = true;
      }
    } else {
      dates_array.push(date.slice(5));
      prices_array.push(bought_at);
    }

  }

  return [dates_array.reverse(), prices_array.reverse()];

}

/* Compute the performance of the investment in percentage */
function gain_loss(prices_array) {

  var percentage = (prices_array[prices_array.length - 1] / prices_array[0]) * 100 - 100;
  return percentage;

}