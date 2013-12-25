/*手势事件*/
(function(global) {
	var eventConfig = {
		// 'MoveStart': null,
		'Move': null,
		'MoveEnd': null,
		'SwipeLeft': null,
		'SwipeRight': null,
		'Scale': null,
		'ScaleEnd': null
	}
	var pow = function(num) {
		return Math.pow.call(Math, num, 2);
	}
	//得到两个手指点的直线长度
	var lineLength = function(touches) {
		var a = touches[0],
			b = touches[1];
		return Math.sqrt(pow(a.pageX - b.pageX) + pow(a.pageY - b.pageY));
	}
	var TouchEvent = function($obj) {
		$obj.on('touchstart', function(eStart) {
			// eStart.preventDefault();
			//防止事件重复绑定
			$obj.off('touchend');
			$obj.off('touchmove');
			var touches = eStart.originalEvent.touches;
			var len = touches.length;
			if (len == 2) {
				var startLineLen = lineLength(touches);
			} else if (len == 1) {
				var startTouchEvent = touches[0];
				var startX = startTouchEvent.pageX,
					startY = startTouchEvent.pageY;
			}
			var moveX, moveY;
			var scalecache;
			$obj.on('touchmove', function(eMove) {
				// eMove.preventDefault();
				var moveTouchEvent = eMove.originalEvent.touches;
				if (len == 2) {
					var moveLineLen = lineLength(moveTouchEvent);
					var scale = moveLineLen / startLineLen;
					scalecache = scale;
					// result.html(scale+'scale<br/>' + result.html());
					// return;
					$obj.trigger('Scale', {
						scale: scale
					});
				} else if (len == 1) {
					var eMove = moveTouchEvent[0];
					moveX = eMove.pageX;
					moveY = eMove.pageY;
					// result.html('Move'+(moveX - startX)+'<br/>'+result.html());
					$obj.trigger('Move', {
						xStep: moveX - startX,
						yStep: moveY - startY
					});
				}
			});
			$obj.on('touchend', function() {
				if (scalecache) {
					$obj.trigger('ScaleEnd', {
						scale: scalecache
					});
					scalecache = null;
				}
				if(Math.abs(moveY - startY) < 50){
					var eventType = moveX - startX < 0 ? 'SwipeLeft' : 'SwipeRight';
					$obj.trigger(eventType);
				}
				
				if (!isNaN(moveX) && !isNaN(startX)) {
					// result.html((moveX - startX)+'<br/>'+result.html());
					$obj.trigger('MoveEnd', {
						xStep: moveX - startX,
						yStep: moveY - startY
					});
					moveX = moveY = null;
				}

				$obj.off('touchend');
				$obj.off('touchmove');
			});
			// result.html(len+'<br/>'+result.html());
		});
	}
	global.TouchEvent = TouchEvent;
})(this);
/*简单播放器*/
(function(global){
	var $main_container;
	var progressWidth;
	$(function(){
		$main_container = $('#main_container');
		progressWidth = $main_container.width() - 50;
	})
	var delay = 1000;
	var Player = function(_totalNum,callback,tuli){
		var self = this;
		self.cIndex = -1;
		self.tIndex = _totalNum;
		var width = progressWidth / _totalNum - 5;
		self.pWidth = width;
		var $html = '<div class="fix_layer bottom_layer">';
					if(tuli){
						$html += '<div class="tuli_layer"><img src="'+tuli+'"/></div>';
					}
						$html +='<span class="btn_player"></span>'+
								'<div class="progress">';
						for(var i = 0;i<_totalNum;i++){
							$html += '<span data-index='+i+' style="width:'+width+'px"></span>'
						}
			$html +=			'</div>'+
							'</div>';
		$html = $($html).appendTo($main_container);
		self.playerTT;
		$html.find('.btn_player').click(function(){
			var $this = $(this);
			if($this.hasClass('pause')){
				self.stop();
				$this.removeClass('pause');
			}else{
				$this.addClass('pause');
				self.play();
			}
		});	
		self.progressBtns = $html.find('.progress span').click(function(){
			self.stop();
			self.play($(this).data('index'));
		});			
		self.playerHTML = $html;
		self.callback = callback || function(toIndex,fn){fn()};
	}
	var prop = Player.prototype;
	prop.play = function(index){
		var self = this;
		var callback = self.callback;
		var cIndex = self.cIndex;
		var tIndex = self.tIndex;
		var toIndex = index != null? index:cIndex+1<tIndex?cIndex+1:-1;
		var $span = self.progressBtns.removeClass('on');
		self.playerHTML.find('.progress .time').show();
		if(toIndex < 0){
			self.stop();
			callback(0);
		}else{
			$span.filter(':lt('+toIndex+'),:eq('+toIndex+')').addClass('on');
			self.cIndex = toIndex;
			callback(toIndex,function(){
				self.playerTT = setTimeout(function(){;
					self.play();
				},delay);
			});			
		}
	}	
	prop.stop = function(){
		var self = this;
		self.cIndex = -1;
		self.playerHTML.find('.progress .time').hide();
		self.progressBtns.removeClass('on');
		self.playerHTML.find('.btn_player').removeClass('pause');
		clearTimeout(this.playerTT);
	}
	prop.hide = function(){
		this.stop();
		this.playerHTML.remove();
	}
	prop.showText = function(text){
		var self = this;
		var $html = self.playerHTML;
		var $time = $html.find('.progress .time');
		if($time.length == 0){
			$time = $('<div class="time"><i></i><div></div></div>').appendTo($html.find('.progress'));
		}
		if(text){
			try{
				$time.css({
					left: $html.find('span.on').last().position().left - 100/self.tIndex
				}).show().find('i').text(text);
			}catch(e){}
		}else{
			$time.hide();
		}		
	}
	this.Player = Player;
})(this);
/*Loading*/
(function(global){
	var $loading;
	var Loading = {}
	Loading.show = function(){
		if(!$loading){
			$loading = $('<div>').addClass('loading').appendTo($('body'));
		}
		$loading.show();
	}
	Loading.hide = function(){
		if($loading){
			$loading.hide();
		}
	}
	global.Loading = Loading;
})(this);
/*缓存JSON数据*/
(function(global){
	var DOC = document;
	var head = document.head;
	var cache = {}
	var src_cache = {};
	global.getJson = function(url,callback){
		var val = cache[url];
		if(val){
			return val;
		}else{
			var src = document.createElement('script');
			src.src = url + '?2?!'+url;
			document.head.appendChild(src);
			src_cache[url] = callback;
		}
	}
	function getCurrentScript() {
      //取得正在解析的script节点
      if(DOC.currentScript) { //firefox 4+
          return DOC.currentScript.src;
      }
      var stack, e, nodes = head.getElementsByTagName("script"); //只在head标签中寻找
      //  参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
      try {
          a.b.c(); //强制报错,以便捕获e.stack
      } catch(e) {
          stack = e.stack;
      }
      if(stack) {
          // chrome IE10使用 at, firefox opera 使用 @
          e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
          while(stack.indexOf(e) !== -1) {
              stack = stack.substring(stack.indexOf(e) + e.length);
          }
          return stack.replace(/:\d+:\d+$/ig, "");
      }
      for(i = 0; node = nodes[i++];) {
          if( node.readyState === "interactive") {
              return node.className = node.src;
          }
      }
  }
	global['_callback'] = function(data){
		var url = getCurrentScript().split('?!')[1];
		var callback = src_cache[url];
		callback && callback(data);
	}
})(this);


// $(function(){
// 	result = $('<div style="position:fixed;z-index:101;left:10px;top:100px;width:300px;height:100px;background:rgba(100,100,100,0.3);"></div>').appendTo($('body'));
// });
$(function() {
	var win = $(window);
	var w = win.width();
	var h = win.height();
	$('#main').width(w).height(h);
	$('#sort_nav ul,#main_container').height(h);
	var $main_container = $('#main_container');

	var widthMain = $main_container.width();
	var heightMain = $main_container.height();
	
	var hide_nav = function() {
		$main_container.addClass('off').removeClass('on');
	}
	var show_nav = function() {
		$main_container.addClass('on').removeClass('off');
	}
	$('.btn_nav').click(function() {
		if ($main_container.hasClass('on')) {
			hide_nav();
		} else {
			show_nav();
		}
	});

	var $operator = $('#operator');
	var offset = $operator.position();
	var data = {
		scale: 1,
		width: $operator.width(),
		height: $operator.height(),
		left: offset.left,
		top: offset.top
	}
	var scale_total = 1;//重置后累计的缩放比
	var RESET_SCALE = 1.3;//达到这个缩放比后就重置
	var MAX_SCALE = 2;
	var MAX_WIDTH = MAX_SCALE*data.width;
	var MIN_WIDTH = w;
	var $middleDot = $operator.find('div');
	// $operator.css({
	// 	'transform-origin': '100px 30px',
	// 	// transform: 'scale(1.2,1.2)',
	// 	transform: 'scale(2,2)',
	// });
	
	/*绑定事件（缩放和拖拽）*/
	function resetScale (scale){
		var num = $operator.css('transform-origin').split(' ');
		var origin_x = parseFloat(num[0]);
		var origin_y = parseFloat(num[1]);
		var oldWidth = data.width;
		var oldHeight = data.height;
		var newWidth = oldWidth * scale;
		var newHeight = oldHeight * scale;
		var newLeft = data.left - (newWidth - oldWidth) * (origin_x / oldWidth);
		var newTop = data.top - (newHeight - oldHeight) * (origin_y / oldHeight);
		origin_x *= scale;
		origin_y *= scale;
		var transform_origin = origin_x + 'px ' + origin_y + 'px';
		$middleDot.css({
			left: origin_x,
			top: origin_y
		});
		$operator.css({
			transform: 'scale(1,1)',
			'transform-origin': transform_origin,
			width: newWidth,
			height: newHeight
			,
			left: newLeft,
			top: newTop
		});
		data = {
			scale: 1,
			width: newWidth,
			height: newHeight
			,
			left: newLeft,
			top: newTop
		}
		gm && gm.resize();
	}
	$operator.on('Scale', function(e, d) {
		var scale = d.scale * data.scale;
		// result.html(scale+'<br/>'+result.html());
		var toWidth = scale * data.width;
		if (toWidth > MAX_WIDTH || toWidth < MIN_WIDTH) {
			return;
		}
		$operator.css({
			transform: 'scale(' + scale + ',' + scale + ')'
		})
	}).on('ScaleEnd', function(e, d) {
		var scale = d.scale * data.scale;
		var toWidth = scale * data.width;
		scale_total *= scale;
		if (toWidth > MAX_WIDTH || toWidth < MIN_WIDTH) {
			scale = (toWidth > MAX_WIDTH?MAX_WIDTH:MIN_WIDTH)/data.width;
			resetScale(scale);
		}else if(scale_total > RESET_SCALE){
			resetScale(scale_total);
			scale_total = 1;
		}else{
			data.scale = scale;
		}
	})
	$main_container.on('Move', function(e, d) {
		var xStep = d.xStep,
			yStep = d.yStep;
		var scale = data.scale;
		var newLeft = data.left + xStep;
		var newTop = data.top + yStep;
		var width = data.width;
		var height = data.height;
		var mWidth = width * (scale - 1) / 2;//以中心点缩放
		var mHeight = height * (scale - 1) /2;

		// 拖拽时加边界限制
		if(newLeft - mWidth > 0){
			newLeft = mWidth;
		}else if(newLeft + mWidth + width < widthMain){
			newLeft = widthMain - mWidth - width;
		}

		if(height + mHeight < heightMain){//高度不够时，强制不让拖动
			newTop = data.top;
			// result.html(newTop - mHeight+'<br/>'+result.html());
			// if(newTop - mHeight < 0){
			// 	newTop = 0;
			// }else if(newTop + mHeight + height > heightMain){
			// 	newTop = heightMain - mHeight - height;
			// }
		}else{
			if(newTop - mHeight > 0){
				newTop = mHeight;
			}else if(newTop + mHeight + height < heightMain){
				newTop = heightMain - mHeight - height;
			}
		}

		$operator.css({
			'left': newLeft,
			'top': newTop
		});
	}).on('MoveEnd', function(e, d) {
		/*这里更新transform-origin时会改变位置!!!!!!*/
		var scale = data.scale;
		var width = data.width;
		var height = data.height;
		var mWidth = width * (scale - 1) / 2;//以中心点缩放
		var mHeight = height * (scale - 1) /2;
		var num = $operator.css('transform-origin').split(' ');
		var old_origin_x = parseFloat(num[0]);
		var old_origin_y = parseFloat(num[1]);
		var origin_x = old_origin_x - d.xStep/scale;
		var origin_y = old_origin_y - d.yStep/scale;

		var transform_origin = origin_x +'px '+(origin_y)+'px';
		// width/data.width * origin_x - width/data.width * old_origin_x
		// (scale - 1) * (origin_x - old_origin_x)
		var offset = $operator.position();
		var newLeft = data.left + d.xStep;// - d.xStep * (scale -1);
		var newTop = data.top + d.yStep;// - d.yStep * (scale -1);
		if(newLeft - mWidth > 0){
			newLeft = mWidth;
		}else if(newLeft + mWidth + width < widthMain){
			newLeft = widthMain - mWidth - width;
		}
		if(height + mHeight < heightMain){
			// result.html(newTop - mHeight+'end<br/>'+result.html());
			if(newTop - mHeight < 0){
				newTop = 0;
			}else if(newTop + mHeight + height > heightMain){
				newTop = heightMain - mHeight - height;
			}
		}else{
			if(newTop - mHeight > 0){
				newTop = mHeight;
			}else if(newTop + mHeight + height < heightMain){
				newTop = heightMain - mHeight - height;
			}
		}
		// var newLeft = data.left + d.xStep * (scale );
		// var newTop = data.top + d.yStep * (scale );
		// $operator.css({
		// 	'left': newLeft,
		// 	'top': newTop,
		// 	'transform-origin': transform_origin
		// });
		data.left = newLeft;
		data.top = newTop;
		// $middleDot.css({
		// 	'transform-origin': transform_origin,
		// 	left: origin_x
		// 	,
		// 	top: origin_y
		// })

		// var num = $operator.css('transform-origin').split(' ');
		// var origin_x = parseFloat(num[0]) - d.xStep/scale;
		// var origin_y = parseFloat(num[1]) - d.yStep/scale;
		// result.html(transform_origin+'<br/>'+result.html());
		// setTimeout(function(){
		// 	$operator.css({
		// 		'transform-origin': transform_origin
		// 	});	
		// },500)
		

	});	
	TouchEvent($operator);

	require.config({
        paths:{
            zrender:'./js/zrender' ,
			GeoMap:'./js/GeoMap3' ,
			"zrender/tool/util":'./js/zrender' 
        }
    });
    /*本色方案*/
	var COLOR = {
		'jiangshui': function(val){
			val = parseFloat(val);
			if(val >= 0 && val < 1){
				return 'rgba(46,173,6,1)';
			}else if(val >= 1 && val < 10){
				return 'rgba(0,0,0,1)';
			}else if(val >= 10 && val < 25){
				return 'rgba(9,1,236,1)';
			}else if(val >= 25 && val < 50){
				return 'rgba(200,4,200,1)';
			}else if(val >= 50){
				return 'rgba(197,7,36,1)';
			}
		},
		'wendu': function(val){
			val = parseFloat(val);
			return val > 0?'rgba(255,0,0,1)':val == 0?'rgba(0,0,0,1)':'rgba(0,0,255,1)'
		}
	};
	//初始化数据并绑定事件
	(function(){
		var initDataId = $('#sort_nav .init').data('id');
		var $operator = $('#operator');
		var player;
		var isInitMap = false;
		var init = function(data_id){
			if(player){
				player.hide();
				player = null;
			}
			var data = DATA_CONF[data_id];
			var type = data.type;
			var items = data.items;
			var renderFn = function(){}
			if(items){
				var len = items.length;
			}
			var showText = function(toIndex){
				var text = items[toIndex].time;
				player.showText(text||'');
			}
			if(type == 'img'){//渲染图片
				if(isInitMap && gm){
					gm.zr.clear();
					isInitMap = false;
				}
				renderFn = function(toIndex,nextFn){
					Loading.show();
					$operator.html($('<img>').on('load',function(){
						Loading.hide();
						nextFn && nextFn();
					}).attr('src',items[toIndex]['img']));
				}
			}else if(type == 'json'){//渲染地图数据
				var colorType = COLOR[data.color];
				var global_jsonid;
				renderFn = function(toIndex,nextFn){

					var fn = function(){
						getJson(items[toIndex]['src'],function(pointData){
							$.each(pointData.features,function(i,v){
								v.properties.color = colorType(v.properties.value);
							});
				 			gm.loadWeather(pointData,global_jsonid);
							gm.refresh();
							Loading.hide();
							nextFn && nextFn();
						});
					}
					Loading.show();
					if(!isInitMap){
						require(['GeoMap'],function(GeoMap) {
							gm = GeoMap.init({
								container: 'operator'
							});
							getJson('./data/map/china.geo.json',function(mapData){
								gm.load(mapData);
					 			gm.render();
					 			gm.zr.on("click",function(e){
								 	var target = e.target;
								 	if(target){
								 		var jsonid = target.id.replace('text','');
								 		global_jsonid = jsonid;
								 		if(isNaN(jsonid)){
								 			getJson('./data/map/'+jsonid+'.geo.json',function(json){
								 				var $btn_back = $('<div id="btn_back">返回</div>').appendTo($main_container).click(function(){
								 					gm.clear();
													gm.load(mapData);
													gm.refreshWeather();
													$btn_back.remove();
								 				});
									 			gm.clear();
												gm.load(json);
												gm.refreshWeather(jsonid);
									 		})
								 		}
								 	}
								 });
							});
							isInitMap = true;
							fn();
						});
					}else{
						fn();
					}
				}
			}else if(type == 'hightchart'){
				var fn = data.fnname;
				fn = fnObj[fn];
				fn && fn();
			}

			if(len > 1){
				player = new Player(len,function(toIndex,nextFn){
					renderFn(toIndex,nextFn);
					showText(toIndex);
				},data.tuli);
			}			
			renderFn(0);//初始化第一个数据
		}
		init(initDataId);
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
			'pm2.5': function(){
				draw_highChart("#operator", "全国实时空气质量指数(AQI) 后十名", "", ["西安", "渭南", "咸阳", "宝鸡", "哈尔滨", "菏泽", "济宁", "徐州", "枣庄", "沈阳"], [441, 365, 341, 340, 303, 269, 255, 248, 247, 245], "#B98A00");
			}
		}
		var header_title = $('.fix_layer:first h1');
		/*左侧导航点击事件*/
		var $sort_nav = $('#sort_nav ul').click(function(e){
			var target = $(e.target);
			if(target.is('li')){
				var data_id = target.data('id');
				if(data_id){
					hide_nav();
					init(data_id);
					header_title.html(target.text());
				}
			}
		}).on('SwipeLeft', hide_nav);
		TouchEvent($sort_nav);
	})();
})