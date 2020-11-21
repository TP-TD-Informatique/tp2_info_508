function Pie(data, id) {
    data = JSON.parse(data);
    var d = [];
    for (val in data) {
        var j = data[val];
        if (j._id != null) {
            d.push({_id:j._id, y:j.value});
        }
    }

    Highcharts.chart(id, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point._id}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: [{
            colorByPoint: true,
            data: d
        }]
    });
}

function VerticalBar(data, id, title, serie) {
    var cat = [];
    var values = [];
    data = JSON.parse(data);
    for (val in data) {
        var j = data[val];
        if (j._id != null) {
            cat.push(j._id);
            values.push(j.value);
        }
    }

    Highcharts.chart(id, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: cat,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: title
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.y:.1f}</b>',
            footerFormat: '',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: serie,
            data: values

        }]
    });
}