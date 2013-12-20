$(function(){
	var $nav_btn = $('.nav-btn');
	var $nav_list = $($nav_btn.find('nav'));
	var hide_nav = function(){
		$nav_btn.addClass('off');
		$nav_btn.removeClass('on');
	}
	var show_nav = function(){
		$nav_btn.addClass('on');
		$nav_btn.removeClass('off');
	}
	$nav_btn.find('div').addClass('noline').click(function(){
		if($nav_btn.hasClass('on')){
			hide_nav();
		}else{
			show_nav();
		}
	});
	// $nav_list.swipeLeft(function(){
	// 	$nav_btn.addClass('off');
	// 	$nav_btn.removeClass('on');
	// });
	$nav_list.find('ul').addClass('noline').click(function(e){
		var target = $(e.target);
		if(target.is('li')){
			hide_nav();
			target.siblings().removeClass();
			target.addClass('on');
			var dataType = target.data('id');
			initData(dataType);
		}
	});
	var $sub_item = $('.sub-item');
	$sub_item.delegate('li','click',function(){
		var $this = $(this).addClass('on');
		$this.siblings().removeClass('on');
		changeSub($this.data('type'),$this.data('num'));
	});
	var $img = $('.pic img');
	var $desc = $('.desc');
	var $header = $('#main-container header');
	function initData(dataType){
		var _data = data[dataType];
		if(_data){
			$sub_item.children().remove();
			$.each(_data,function(i,v){
				$sub_item.append($('<li class="noline'+(i == 0?' on':'')+'">'+v.name+'</li>').data('type',dataType).data('num',i));
			});
			changeSub(dataType,0);
		}
	}
	initData(initedData.type);
	function changeSub(dataType,index){
		var showData = data[dataType][index];
		$img.attr('src',showData.pic+'?'+Math.random()).parent().show();
		$('.btn_c').show();
		$desc.text(showData.desc);
		$header.text(showData.name);
		var fn = showData.fn;
		if(fn){
			if(!$.isFunction(fn)){
				fn = fnObj[fn];
			}
			fn(showData);
		}else{
			$('#chart_container').html('').hide();
		}
		
	}
	var pow = function(num){
		return Math.pow.call(Math,num,2);
	}
	//得到两个手指点的直线长度
	var lineLength = function(touches){
		var a = touches[0],
			b = touches[1];
		return Math.sqrt(pow(a.pageX-b.pageX)+pow(a.pageY-b.pageY));
	}

	var oldWidth = oldHeight = 0;
	var maxWidth = 1000,
		minWidth = 320;
	//根据最大最小尺寸得到最亲的尺寸
	function getNewOffset(scale){
		var newWidth = oldWidth * scale,
			newHeight = oldHeight * scale;
		if(newWidth > maxWidth){
			newHeight = newHeight*maxWidth/newWidth;
			newWidth = maxWidth;
		}else if(newWidth < minWidth){
			newHeight = newHeight*minWidth/newWidth;
			newWidth = minWidth;
		}
		return {
			w: newWidth,
			h: newHeight
		}
	}
	//缩放图片
	function scaleImg(scale){
		var offset = getNewOffset(scale);
		var newWidth = offset.w,
			newHeight = offset.h;
		// print('move',scale,newWidth,newHeight,oldWidth,oldHeight);
		$img.css({
			'width': newWidth,
			'height': newHeight,
			'margin-left': -newWidth/2,
			'margin-top': -newHeight/2
		})
	}

	function resetScaleData(scale){
		if(scale){
			var offset = getNewOffset(scale);
			var newWidth = offset.w,
				newHeight = offset.h;
			// print('end',scale,newWidth,newHeight,oldWidth,oldHeight);
			oldWidth = newWidth;
			oldHeight = newHeight;
		}
	}

	//移动图片
	function moveImg(stepX,stepY){
		var oldMarginLeft = parseFloat($img.css('margin-left')),
			oldMarginTop = parseFloat($img.css('margin-top'));
		$img.css({
			'margin-left': oldMarginLeft + stepX,
			'margin-top': oldMarginTop + stepY
		})
	}
	// var $result = $('<div id="result" style="opacity: 0.5;background-color:#ccc;width:300px;height:200px;border:1px solid blue;position:fixed;left:10px;top:300px;z-index:100;"></div>').appendTo($('body'));
	// var print = function(){
	// 	$result.html([].slice.call(arguments).join('<br/>'));
	// }
	$img.on('touchstart',function(e){
		e.preventDefault();
		var touches = e.originalEvent.touches;
		var len = touches.length;
		//缩放事件
		if(len == 2){
			var startLineLen = lineLength(touches);
			$img.on('touchmove',function(eMove){
				eMove.preventDefault();
				var touchesMove = eMove.originalEvent.touches;
				var moveLineLen = lineLength(touchesMove);

				var scale = moveLineLen/startLineLen;
				
				scalecache = scale;
				scaleImg(scale);
			});
			$img.on('touchend',function(){
				resetScaleData(scalecache);
				$img.off('touchend');
				$img.off('touchmove');
			});
		}else if(len == 1){//移动事件
			var startTouchEvent = touches[0];
			var startX = startTouchEvent.pageX,
				startY = startTouchEvent.pageY;
			var oldMarginLeft = parseFloat($img.css('margin-left')),
				oldMarginTop = parseFloat($img.css('margin-top'));
			$img.on('touchmove',function(eMove){
				var moveTouchEvent = eMove.originalEvent.touches[0];
				var moveX = moveTouchEvent.pageX,
					moveY = moveTouchEvent.pageY;
				$img.css({
					'margin-left': oldMarginLeft + moveX - startX,
					'margin-top': oldMarginTop + moveY - startY
				})
			})
		}
	}).on('load',function(){
		oldWidth = $(this).width();
		oldHeight = $(this).height();
		scaleImg(1)
	});

	$('.btn_in').click(function(){
		var scale = 0.9;
		scaleImg(scale);
		resetScaleData(scale);
	});
	$('.btn_out').click(function(){
		var scale = 1.1;
		scaleImg(scale);
		resetScaleData(scale);
	});
	var draw_highChart = function(id, title, subtitle, city_names, aqi_data, color, chart_width) {
		$(id).highcharts({
			colors: [color, "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
				"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
			],
			chart: {
				type: 'column',
				width: chart_width,
				marginBottom: 75
			},
			credits: {
				text: subtitle,
				// href: 'http://www.pm25.in',
				position: {
					align: 'left',
					x: 20,
					y: -17,
					verticalAlign: 'bottom',
				},
				style: {
					color: '#AAA',
					font: '14px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif',
				}
			},
			title: {
				text: title,
				y: 20
			},
			// subtitle: {
			//     text: 'http://www.pm25.in',
			//     y: 40
			// },
			xAxis: {
				categories: city_names,
				labels: {
					y: 20
				}
			},
			yAxis: {
				min: 0,
				max: 500,
				title: {
					text: '数据来源于国家环境保护部网站'
				}
			},
			legend: {
				enabled: false
			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y}</b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0,
					dataLabels: {
						enabled: true,
						color: '#BBB'
					},
					shadow: true
				}
			},
			series: [{
				name: 'AQI',
				data: aqi_data

			}]
		});
	};

	var fnObj = {
		'pm2.5': function(d){
			if(!d.src){
				$img.parent().hide();
				$('.btn_c').hide();
			}
			// $img.attr('src',showData.pic);
			// $desc.text(showData.desc+showData.name);
			$("#chart_container").show();
			draw_highChart("#chart_container", "全国实时空气质量指数(AQI) 后十名", "", ["西安", "渭南", "咸阳", "宝鸡", "哈尔滨", "菏泽", "济宁", "徐州", "枣庄", "沈阳"], [441, 365, 341, 340, 303, 269, 255, 248, 247, 245], "#B98A00");
		}
	}
})