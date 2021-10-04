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

/* Prepares a row to receive the data */
function prepareTable(walletName, investmentName, beginning) {
    
    const row = document.getElementById('table '+walletName).insertRow();
    row.id = investmentName+" row";

    row.insertCell().innerHTML = investmentName;
    row.insertCell().innerHTML = beginning;

    const cell3 = row.insertCell();
    cell3.id = investmentName+" cell3";
    cell3.style.textAlign = "center";
    cell3.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    
}

/* Fills a row with the received data */
function fillTable(dates_array, prices_array, investmentName, walletName) {
    
    const cell3 = document.getElementById(investmentName+" cell3");

    if (dates_array[0] == "call limit exceeded") {
        cell3.innerHTML = "👮🏻‍♀️";
        return;
    }

    if (dates_array[0] == "error message") {
        cell3.innerHTML = "❌";
        return;
    }

    if (dates_array[0] == "_FITALIA") {
        cell3.innerHTML = "🇮🇹";
        return;
    }
    
    const percentage = gain_loss(prices_array);

    const color = percentage > 0 ? "green" : "red";
    cell3.style.color = color;
    const string_percentage = percentage > 0 ? "+"+String(percentage.toFixed(2))+"%" : String(percentage.toFixed(2))+"%";
    cell3.innerHTML = string_percentage;

    const row = document.getElementById(investmentName+" row");
    row.onclick = function () { drawChart(
                                    dates_array,
                                    prices_array,
                                    investmentName,
                                    walletName,
                                    color);
                                }
    
}

/* Draws the corresponding chart */
google.charts.load('current', {'packages':['corechart']});
function drawChart(dates_array, prices_array, investment, walletName, color) {

    const x = dates_array;
    const y = prices_array;
    const datatable = zip_arrays(x, y);

    const data = new google.visualization.DataTable();
    data.addColumn('date', "Date");
    data.addColumn('number', "Price");

    data.addRows(datatable);

    const table_height = document.getElementById('table '+walletName).offsetHeight;
    const chart_height = table_height > 200 ? table_height : 200; 
    const options = {
        colors: [color],
        legend: {position: 'none'},
        width: '100%',
        height: chart_height,
        hAxis: {title: "time", textStyle: {fontSize: 14}},
        vAxis: {title: "price", textStyle: {fontSize: 14}},
        chartArea: {width: '80%', height: '75%'}
    };

    const chart = new google.visualization.LineChart( document.getElementById('chart '+walletName) );
    chart.draw(data, options);

    document.getElementById('chart title '+walletName).innerHTML = investment;

}

/* Fuses an x array with its y in order to plot them */
function zip_arrays(x, y) {
    return x.map( 
        function(e,i) { return [e, y[i]]; }
                )
}