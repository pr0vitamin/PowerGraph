$(document).ready(function() {
  $('#power_file').bind('change', handleDialog);
});
	
var controlled_data = [];
var uncontrolled_data = [];
	
function handleDialog(event) {
	var files = event.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(event){
	var csv = event.target.result;
	var data = $.csv.toArrays(csv);
	for (var i=1; i < data.length; i++) {
		var date_start = moment(data[i][9].split(" ")[0], "DD/MM/YYYY");
		var date_end = moment(data[i][10].split(" ")[0], "DD/MM/YYYY");
		var date_diff = date_end.diff(date_start, 'days');
		var total_kwh = Number(data[i][12]);
		var daily_kwh = date_diff > 1 ? Math.round((total_kwh/date_diff) * 10) / 10 : total_kwh;
		while (!date_start.isSame(date_end)) {
			date_start = date_start.add(1, 'days');
			if (data[i][7] == "CN") {
				controlled_data.push({'x': date_start.format('MM/DD/YYYY'), 'y': daily_kwh});
			} else if (data[i][7] == "UN") {
				uncontrolled_data.push({'x': date_start.format('MM/DD/YYYY'), 'y': daily_kwh});
			}
		}
	}
	
	controlled_data.sort(function(a, b) {
		return moment(a.x, 'MM/DD/YYYY').diff(moment(b.x, 'MM/DD/YYYY'), 'days');
	});
	uncontrolled_data.sort(function(a, b) {
		return moment(a.x, 'MM/DD/YYYY').diff(moment(b.x, 'MM/DD/YYYY'), 'days');
	});
	
	draw_graph();
  }
}

function draw_graph() {
	var options = {
		series: [{
			name: 'Controlled',
			data: controlled_data
		}, {
			name: 'Uncontrolled',
			data: uncontrolled_data
		}],
		chart: {
			type: 'area',
			zoom: {
				type: 'x',
				autoScaleYaxis: true,
				enabled: true
			}
		},
		dataLabels: {
			enabled: false
		},
		title: {
			text: 'Power Usage Graph'
		},
		yaxis: {
			title: {
				text: 'kWh/day'
			},
			min: 0,
			forceNiceScale: true
		},
		xaxis: {
			type: 'datetime'
		}
	}
	var chart = new ApexCharts(document.getElementById("chart"), options);
	chart.render();
}