///////////////////////////////////////////////// UTILITY FUNCTIONS ///////////////////////////////////////

function datatabling(timeseries, beginning) {

    beginning = new Date(beginning);

    const datatable = _.reduce(timeseries, (result, value, key) => {

        const date = new Date(key);
        date < beginning ? result.push([date, value, null]) : result.push([date, null, value]);
        return result

    }, [])

    return datatable

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

google.charts.load('current', {'packages':['corechart']});

function drawChart(walletName, investmentName, timeseries, color, beginning) {

    const data = new google.visualization.DataTable();

    data.addColumn('date', "Date");
    data.addColumn('number', "Price");
    data.addColumn('number', "Price");

    data.addRows( datatabling(timeseries, beginning) );

    const table_height = document.getElementById('table '+walletName).offsetHeight;
    const chart_height = table_height > 200 ? table_height : 200; 
    const options = {
        series: {
                    0: {type: 'line', color: color},
                    1: {type: 'area', color: color}
                },
        legend: {position: 'none'},
        width: '100%',
        height: chart_height,
        hAxis: {title: "time", textStyle: {fontSize: 14}},
        vAxis: {title: "price", textStyle: {fontSize: 14}},
        chartArea: {width: '80%', height: '75%'}
    };

    const chart = new google.visualization.ComboChart( document.getElementById('chart '+walletName) );
    chart.draw(data, options);

    document.getElementById('chart title '+walletName).innerHTML = investmentName;

}