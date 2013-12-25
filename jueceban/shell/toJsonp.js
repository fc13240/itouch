var fs = require('fs');
var path = require('path');

var floder = 'E:/source/map/itouch/jueceban/data/map1/';
var toFloader = 'E:/source/map/itouch/jueceban/data/map/';
fs.readdir(floder,function(err,files){
	if(err){
		console.log(err);
	}else{
		files.forEach(function(v,i){
			var file_name = path.join(floder,v);
			var file_content = fs.readFileSync(file_name).toString();
			if(file_content.indexOf('_callback') == -1){
				file_content = '_callback('+file_content+')';
			}
			fs.appendFileSync(path.join(toFloader,v),file_content);
		})
	}
})