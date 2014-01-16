function formateImg(conf){
	var result = {config:{auto:true,config:'last'},d:'',des:'',imgs:[],pub:'',time:'',type:'multipleimg'};
	conf.items.forEach(function(v){
		result.imgs.push({
			i: v.src,
			n: v.text
		})
	})
	return JSON.stringify(result)
}