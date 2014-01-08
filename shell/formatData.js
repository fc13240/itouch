var fs = require('fs');
var path = require('path');
var util = require('util');

var station = require('./station.json');

var getProvId = function(colsArr){
	var id = ''+parseInt(colsArr[0]);
	var isChina = id.charAt(0) == 5;
	if(isChina){
		var provId = station[id];
		return provId;
	}
}
var filter = function(colsArr){
	var id = colsArr[0];
	return /^0?5\d{4}$/.test(id);
}
var CONF = {
	'type_1': {
		begin_num: 2,
		longitude_num: 1,
		latitude_num: 2,
		value_num: [
			{'name': 'rotation',
			'v_num': 6},
			{'name': 'speed',
			'v_num': 7},
		],
		type: 'PointImage',
		filter: function(colsArr){
			if(filter(colsArr)){
				if(colsArr[7] > 0){
					return true;
				}
			}
		},
		getProvId: getProvId
	},
	'type_2': {
		begin_num: 2,
		longitude_num: 2,
		latitude_num: 3,
		value_num: [
			{'name': 'direction',
			'v_num': 8},
			{'name': 'speed',
			'v_num': 9},
		],
		filter: filter,
		getProvId: getProvId
	},
	'type_3': {
		begin_num: 11,
		longitude_num: 1,
		latitude_num: 2,
		value_num: 4,
		filter: filter,
		getProvId: getProvId
	}
}
// 1 05点24小时变温
// 2 24小时降雨实况
var source_floder = 'E:/source/map/itouch/shell/data/';

var to_floader = 'E:/source/map/itouch/jueceban/data/';
var noProvIds = [];
function parseData(from_f,to_f){
	if(!fs.existsSync(to_f)){
		fs.mkdirSync(to_f);
	}
	var files = fs.readdirSync(from_f);
	files.forEach(function(v,i){
		var file_name = path.join(from_f,v);
		if(fs.statSync(file_name).isDirectory()){
			parseData(file_name,path.join(to_f,v));
			return;
		}

		var file_content = fs.readFileSync(file_name);
		var line_arr = file_content.toString().split(/[\r\n]+/);
		if(line_arr.length > 1){
			var m = /diamond\s+(\d+)/.exec(line_arr[0]);
			if(m){
				var type = 'type_'+m[1];
				var conf = CONF[type];
				var filter = conf['filter'] || function(){return true};
				var dataType = conf['type'] || 'Point';
				var dataArr = [];
				var illegalIds = [];
				line_arr.splice(conf.begin_num).forEach(function(line){
					var cols = line.replace(/^\s+|\s+$/,'').split(/\s+/);
					if(!filter(cols)){
						return;
					}
					var getProvId = conf['getProvId'];
					if(getProvId){
						var provId = getProvId(cols);
						// console.log(provId);
						if(provId){
							var longitude = cols[conf.longitude_num];
							var latitude = cols[conf.latitude_num];
							var properties = {'prov_name': provId};
							var value_num = conf.value_num;
							if(util.isArray(value_num)){
								value_num.forEach(function(v){
									properties[v.name] = cols[v.v_num];
								});
							}else{
								properties['value'] = cols[value_num];
							}
							
							if(longitude && latitude){
								var val = { "type": "Feature",
								      "geometry": {"type": dataType, "coordinates": [parseFloat(longitude), parseFloat(latitude)]},
								      "properties": properties}
								dataArr.push(val);
							}
						}else{
							illegalIds.push(cols[0]);
						}
					}					
				});
				if(dataArr.length > 0){
					var to_file_name = path.join(to_f,v+'.json');
					if(fs.existsSync(to_file_name)){
						fs.unlinkSync(to_file_name);
					}
					fs.appendFileSync(to_file_name,'_callback('+JSON.stringify({"type":"FeatureCollection","features":dataArr})+')');
					console.log(to_file_name);
				}
				if(illegalIds.length > 0){
					noProvIds.push({f:file_name,v:illegalIds});
				}
			}
		}			
	});
	console.log('down');
}

parseData(source_floder,to_floader);
if(noProvIds.length){
	console.log('--',noProvIds,'--');
}