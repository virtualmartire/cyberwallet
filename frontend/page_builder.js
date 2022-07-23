///////////////////////////////////////////////// UTILITY FUNCTIONS /////////////////////////////////////////////////////////////////////

/* Creates the HMTL mess for a table */
function createTable(walletName) {

  const html_to_insert = `
      <div class="w3-panel">
          <div class="w3-row-padding" style="margin:0 -16px">
              <div class="w3-half">
                  <h5>`+walletName+`</h5>
                  <table class="w3-table w3-striped w3-bordered w3-border w3-hoverable w3-white" id="table `+walletName+`"></table>
              </div>
              <div class="w3-half">
                  <h5 id="chart title `+walletName+`"></h5>
                  <div id="chart `+walletName+`"></div>
              </div>
          </div>
      </div>`;

  document.getElementById('page_content').insertAdjacentHTML('afterbegin', html_to_insert);

}

/* Create and fill a row */
function fillRow(walletName, investmentName, beginning, timeseries) {

  const row = document.getElementById('table '+walletName).insertRow();

  row.insertCell().innerHTML = investmentName;
  row.insertCell().innerHTML = beginning;

  const cell3 = row.insertCell();
  cell3.style.textAlign = "center";
  
  const percentage = compute_percentage(timeseries, beginning);

  const color = percentage > 0 ? "green" : "red";
  cell3.style.color = color;
  const string_percentage = percentage > 0 ? "+"+String(percentage.toFixed(2))+"%" : String(percentage.toFixed(2))+"%";
  cell3.innerHTML = string_percentage;

  row.onclick = function () { drawChart(walletName, investmentName, timeseries, color, beginning); }
  
}

function compute_percentage(timeseries, beginning) {

  const prices_array = _.values(timeseries);
  const last_price = prices_array[prices_array.length - 1];
  const percentage = (last_price / timeseries[beginning]) * 100 - 100;
  
  return percentage;

}

//////////////////////////////////////////////////////////// THE ROUTINE ///////////////////////////////////////////////////////////////

/* The main function, called when the website is loading */
async function pageBuilder() {

  try {

    /* Fetch the investments coordinates */
    const data_entry_raw = await fetch("./data_entry.json");
    const data_entry = await data_entry_raw.json();

    /* Fetch the data */
    const database_raw = await fetch("./database.json");
    const database = await database_raw.json();

    document.getElementById("date").innerHTML = database.upDATE;

    /* Create one table per wallet */
    _.forEach(data_entry, (walletContent, walletName) => {

      createTable(walletName);

      /* Create one row per investment */
      _.forEach(walletContent, (investmentContent, investmentName) => {
        
        const [ticker, beginning] = investmentContent;
        const timeseries = database[ticker];

        fillRow(walletName, investmentName, beginning, timeseries);

      });

    });

  } catch(error) {
    console.error(error);
  }

}