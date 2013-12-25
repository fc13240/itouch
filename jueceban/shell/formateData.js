var fs = require('fs');
var path = require('path');
var station = require('./station.json');

var CONF = {
	'type_2': {
		begin_num: 2,
		longitude_num: 0,
		latitude_num: 1,
		value_num: 3
	},
	'type_3': {
		begin_num: 11,
		longitude_num: 1,
		latitude_num: 2,
		value_num: 4,
		getProvId: function(colsArr){
			var isChina = colsArr[0].charAt(0) == 5;
			if(isChina){
				var provId = station[colsArr[0]];
				return provId;
			}
		}
	}
}
// 1 05点24小时变温
// 2 24小时降雨实况
var source_floder = 'E:/source/map/itouch/jueceban/data/source/';

var to_floader = path.join(source_floder,'../');
fs.readdir(source_floder,function(err,files){
	if(err){
		console.log(err);
	}else{
		files.forEach(function(v,i){
			var file_name = path.join(source_floder,v);
			
			var file_content = fs.readFileSync(file_name);
			var line_arr = file_content.toString().split(/[\r\n]+/);
			if(line_arr.length > 1){
				var m = /diamond\s+(\d+)/.exec(line_arr[0]);
				if(m){
					var type = 'type_'+m[1];
					var conf = CONF[type];
					var dataArr = [];
					line_arr.splice(conf.begin_num).forEach(function(line){
						var clos = line.replace(/^\s+|\s+$/,'').split(/\s+/);
						var getProvId = conf['getProvId'];
						if(getProvId){
							var provId = getProvId(clos);
							if(provId){
								var longitude = clos[conf.longitude_num];
								var latitude = clos[conf.latitude_num];
								var value = clos[conf.value_num];
								if(longitude && latitude && value){
									var val = { "type": "Feature",
									      "geometry": {"type": "Point", "coordinates": [parseFloat(longitude), parseFloat(latitude)]},
									      "properties": {"value": parseFloat(value),'prov_name': provId}
									      }
									dataArr.push(val);
								}
							}
						}						
					});
					if(dataArr.length > 0){
						var to_file_name = path.join(to_floader,v+'.json');
						if(fs.existsSync(to_file_name)){
							fs.unlinkSync(to_file_name);
						}
						fs.appendFileSync(to_file_name,'_callback('+JSON.stringify({"type":"FeatureCollection","features":dataArr})+')');
						console.log(to_file_name);
					}
					
				}
			}			
		});
		console.log('down');
	}
});