var apikey;
const bigbang = new Date("2020-01-01");

async function getApiKey() {

    if (apikey) {
      return apikey;
    }

    const apikey_raw = await fetch("./apikey.json");
    const apikey_dict = await apikey_raw.json();
    apikey = apikey_dict["apikey"];
    return apikey;

}

function string_to_date(object) {
  const transformedObject = _.mapKeys(object, (value, key) => {
    return new Date(key);
  });
  return transformedObject;
}

function date_to_string(object) {
  const transformedObject = _.mapKeys(object, (value, key) => {
    const date_obj = new Date(key);
    return date_obj.toISOString().slice(0, 10);
  });
  return transformedObject;
}

function propertiesPick(object) {

  const reducedObject = _.reduce(object, (result, value, date) => {
    result[date] = _.pick(value, ["2. high", "3. low"]);
    return result;
  }, {});

  return reducedObject

}

function datesPick(object, origin) {

  const reducedObject = _.reduce(object, (result, value, date) => {
    var date_obj = new Date(date);
    if (date_obj >= origin) {
      result[date_obj] = value;
    }
    return result;
  }, {});

  return reducedObject;

}

function cut_process_split(object, beginning, bought_at, split_date, split_factor) {

  var reducedObject = _.reduce(object, (result, value, date) => {

    var date_obj = new Date(date);
    if (date_obj >= beginning) {

      const highest_price = parseFloat(value["2. high"]);
      const lowest_price = parseFloat(value["3. low"]);
      var middle_price = (highest_price + lowest_price) / 2;

      if (date_obj < split_date) {      // split_date is the first day of the new splitted price
        middle_price /= split_factor;
      }

      result[date_obj] = middle_price;

    }

    return result;

  }, {});

  reducedObject[beginning] = bought_at;

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
      _.forEach(walletContent, ([ticker, beginning, bought_at, [split_date = "1996-01-11", split_factor = 1] = []], investmentName) => {

        var beginning = new Date(beginning);
        var split_date = new Date(split_date);
        
        getTimeSerie(ticker, bigbang)
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

  // if the stock is italian
  if (ticker=="_FITALIA") {
    return Promise.resolve("_FITALIA");
  }

  const stored = localStorage.getItem(ticker) || "{}";
  const storedData = JSON.parse(stored);
  const now = (new Date()).getTime();

  // if data already caught
  if (storedData.data && now < storedData.expire) {
    return Promise.resolve(storedData.data);
  }

  const apikey = await getApiKey();
  const url_request = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apikey}`;
  
  return fetch(url_request)
  .then(async (result) => {

    const responseData = await result.json();
    
    if (!responseData["Time Series (Daily)"]) {

      if (responseData["Error Message"]) {
        return "error message";           // if an error happens
      } else {
        return "call limit exceeded";    // if the call limit was exceeded
      }

    } else {

      var data = responseData["Time Series (Daily)"];
      data = string_to_date(data);

      data = propertiesPick(data);
      data = datesPick(data, bigbang);

      const one_day = 24 * 60 * 60 * 1000;
      const expire = now + one_day;

      localStorage.setItem(ticker, JSON.stringify( {expire, data} ));   // save the data in the localStorage for future usage

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
  
  if (timeserie_dict == "error message") {
    return [["error message"], ["error message"]];
  }

  if (timeserie_dict == "call limit exceeded") {
    return [["call limit exceeded"], ["call limit exceeded"]];
  }

  const processedTimeSerie = cut_process_split(timeserie_dict, beginning, bought_at, split_date, split_factor);

  const stringifiedTimeSerie = date_to_string(processedTimeSerie);

  const dates_array = _.keys(stringifiedTimeSerie).reverse().map(x => new Date(x));
  const prices_array = _.values(stringifiedTimeSerie).reverse();

  return [dates_array, prices_array];

}

/* Compute the performance of the investment in percentage */
function gain_loss(prices_array) {

  var percentage = (prices_array[prices_array.length - 1] / prices_array[0]) * 100 - 100;
  return percentage;

}