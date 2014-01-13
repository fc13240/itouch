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
					eMove.preventDefault();
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
	var isShowedNotice = false;//是否已经显示过提示
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
					$html +='<span class="btn_player">';
					if(!isShowedNotice){
						isShowedNotice = true;
						$html += '<div class="notice" id="n_play"><i>点击这里播放</i><div><div></div></div></div>';
					}
					$html += '</span>';
						$html +='<div class="progress">';
						for(var i = 0;i<_totalNum;i++){
							$html += '<span data-index='+i+' style="width:'+width+'px"></span>'
						}
			$html +=			'</div>'+
							'</div>';
		$html = $($html).appendTo($main_container);
		self.playerTT;
		var $btn_play = $html.find('.btn_player').click(function(){
			var $this = $(this);
			$('#n_play').hide();
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
			self.play($(this).data('index'),true);
		});			
		self.playerHTML = $html;
		self.callback = callback || function(toIndex,fn){fn()};
	}
	var prop = Player.prototype;
	prop.play = function(index,isFromProgress){
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
				if(!isFromProgress){//当点击进度条上的按钮时不继续播放
					self.playerTT = setTimeout(function(){;
						self.play();
					},delay);
				}
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
(function(global) {
	var DOC = document;
	var head = document.head;
	var cache = {}
	 src_cache = {};
	var anonymity;
	var isSafari = $.browser.safari;
	function getScriptAbsoluteSrc(node) {
	  return node.hasAttribute ? // non-IE6/7
	      node.src :
	    	// see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
	      node.getAttribute("src", 4)
	}
	global.getJson = function(url, callback) {
		var val = cache[url];
		if (val) {
			return val;
		} else {
			var node = document.createElement('script');
			if(isSafari){//safari使用onload事件得到匿名数据
				node.onload = function() {
					exec(getScriptAbsoluteSrc(this));
					anonymity = null;
				}
			}
			
			node.src = url;
			head.appendChild(node);
			src_cache[getScriptAbsoluteSrc(node)] = callback;
		}
	}
	/*执行回调*/
	function exec(url,data){
		// url = url.split('?!')[1];
		data = data || anonymity;
		var callback = src_cache[url];
		delete src_cache[url];
		callback && callback(data);
	}
	function getCurrentScript() {
		//取得正在解析的script节点
		if (DOC.currentScript) { //firefox 4+
			return DOC.currentScript.src;
		}

		var stack, e;
		//  参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
		try {
			a.b.c(); //强制报错,以便捕获e.stack
		} catch (e) {
			stack = e.stack;
			if (!stack && window.opera) {
				//opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
				stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
			}
		}

		if (stack) {
			// chrome IE10使用 at, firefox opera 使用 @
			e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
			while (stack.indexOf(e) !== -1) {
				stack = stack.substring(stack.indexOf(e) + e.length);
			}
			return stack.replace(/:\d+:\d+$/ig, "");
		}
		var nodes = head.getElementsByTagName("script"); //只在head标签中寻找
		for (i = 0; node = nodes[i++];) {
			if (node.readyState === "interactive") {
				return node.src;
			}
		}
	}
	global['_callback'] = function(data) {
		if(isSafari){
			anonymity = data;
		}else{
			var url = getCurrentScript();
			url && exec(url,data);
		}
	}
})(this);


// $(function(){
// 	result = $('<div style="position:fixed;z-index:101;left:10px;top:100px;width:300px;height:100px;background:rgba(100,100,100,0.3);"></div>').appendTo($('body'));
// });
$(function() {
	var gm;//定义GeoMap对象
	var win = $(window);
	var w = win.width();
	var h = win.height();
	var $body = $('body').width(w).height(h);
	var $doc = $(document)
	function scrollBy(x,y){
		var sLeft = win.scrollLeft();
		var sTop = win.scrollTop();

		scrollTo(sLeft + x,sTop + y);
	}
	function scrollTo(x,y){
		window.scrollTo(x,y);
	}
	setTimeout(function(){
		scrollTo(w/2,0);
	},200);
	
	$('#sort_nav ul,#main_container').height(h);
	$body.on('Move',function(e){
		if(isShowNav){
			e.preventDefault();
		}
	}).on('SwipeLeft',hide_nav);
	TouchEvent($body);
	$('#operator_container').width(w).height(h);
	var $top_layer = $('.top_layer');
	var $main_container = $('#main_container');

	var widthMain = $main_container.width();
	var heightMain = $main_container.height();
	var hide_nav = function(){
		isShowNav = false;
		$body.removeClass('show_nav').addClass('off');
		setTimeout(function(){
			$body.removeClass('off');
		},520);
	}
	var show_nav = function() {
		isShowNav = true;
		$body.addClass('show_nav').removeClass('off');
	}
	var $main = $('#main');
	var isShowNav = false;
	$('.btn_nav').click(function() {
		$('#n_menu').fadeOut();
		if(isShowNav){
			hide_nav();
		}else{
			show_nav();
		}		
	});

	var $operator = $('#operator');
	$doc.scrollLeft(w/2);
	var offset = $operator.position();
	var data = {
		scale: 1,
		width: $operator.width(),
		height: $operator.height()
	}
	var scale_total = 1;//重置后累计的缩放比
	var RESET_SCALE = 1.2;//达到这个缩放比后就重置
	var MAX_SCALE = 3;
	var MAX_WIDTH = MAX_SCALE*data.width;
	var MIN_WIDTH = w;
	var $middleDot = $operator.find('div');
	var oldData = $.extend({},data);
	// 重置到原始尺寸和位置及缩放
	function resetToOldOffset(callback){
		var scale = oldData.scale;
		$operator.css({
			transform: 'scale('+scale+','+scale+')',
			width: oldData.width,
			height: oldData.height
		});
		scale_total = 1;
		data = $.extend({},oldData);
		$body.css('padding-top',0);
		scrollTo(w/2,0);
		gm && gm.resize();
		callback && callback();
		
	}
	
	/*绑定事件（缩放和拖拽）*/
	function resetScale (scale,type){
		if(scale == 1){
			return;
		}
		scale_total = 1;
		var oldWidth = data.width;
		var oldHeight = data.height;
		var newWidth = oldWidth * scale;
		var newHeight = oldHeight * scale;
		$operator.css({
			transform: 'scale(1,1)',
			width: newWidth,
			height: newHeight
		});
		
		$body.css('padding-top',newHeight < h?(h- newHeight )/2:0);
		scrollBy((newWidth - oldWidth)/2,(newHeight - oldHeight)/2);
		data = {
			scale: 1,
			width: newWidth,
			height: newHeight
		}
		gm && gm.resize();
	};
	
	var lastScale = 1;
	$body.on('Scale', function(e, d) {
		isChanging = true;
		var scale = d.scale * data.scale;
		
		var toWidth = scale * data.width;
		if (toWidth > MAX_WIDTH || toWidth < MIN_WIDTH) {
			return;
		}
		lastScale = scale;
		// result.html(lastScale+'scale<br/>'+result.html());
		$operator.css({
			transform: 'scale(' + scale + ',' + scale + ')'
		});

	})
	.on('ScaleEnd', function(e, d) {
		if(!isChanging){
			return;
		}
		isChanging = false;
		var scale = lastScale * data.scale;
		var w = data.width;
		var toWidth = scale * w;
		scale_total *= scale;
		if (toWidth > MAX_WIDTH || toWidth < MIN_WIDTH) {
			resetScale((toWidth > MAX_WIDTH?MAX_WIDTH:MIN_WIDTH)/w,1);
		}else if(scale_total > RESET_SCALE || scale_total < 1/RESET_SCALE){//放大或缩小一定倍数都进行重绘
			resetScale(scale_total,2+' '+data.scale+' '+lastScale);
		}else{
			data.scale = scale;
			// resetScale(scale,3);
		}
	});
	var isChanging = false;
	

	require.config({
        paths:{
            zrender:'./js/zrender' ,
			GeoMap:'./js/GeoMap' ,
			"zrender/tool/util":'./js/zrender' 
        }
    });
    /*配色方案*/
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
		},
		'radar': function(){
			return '#f0f';
		},
		'shidu': function(val){
			// return '#000';
			val = parseFloat(val);
			if(val >= 0 && val < 10){
				return 'rgba(255,96,0,1)';
			}else if(val >= 10 && val < 30){
				return 'rgba(254,165,26,1)';
			}else if(val >= 30 && val < 50){
				return 'rgba(255,252,159,1)';
			}else if(val >= 50){
				return '#D6E6DA';
			}
		}
	};
	//初始化数据并绑定事件
	(function(){
		var initDataId = $('#sort_nav .init').data('id');
		var $operator = $('#operator');
		var header_title = $('.fix_layer:first h1');

		var player;
		var isInitMap = false;
		var global_jsonid;
		/*对外提供可调用的接口*/
		window.initData = function(data,title){
			if(title){
				var unit = data.unit;
				header_title.html(title + (unit?' ('+unit+')':''));
			}
			
			var type = data.type;
			var items = data.items;
			var renderFn;
			/*显示提示文字*/
			var showText = function(toIndex,itemsData){
				var text = (itemsData || items)[toIndex].text;
				player.showText(text||'');
			}
			/*清除map相关数据*/
			var clearMap = function(){
				$operator.html('');
				$('#n_back').remove();
				$('#btn_back').remove();
				if(isInitMap && gm){
					gm.zr.clear();
					isInitMap = false;
					global_jsonid = null;
				}
			}
			/*根据数据得到一个渲染函数*/
			var renderImg = function(img_items){
				return function(toIndex,nextFn){
					Loading.show();
					$operator.html($('<img>').on('load',function(){
						Loading.hide();
						nextFn && nextFn();
					}).attr('src',img_items[toIndex]['src']));
				}
			}
			/*初始化播放器*/
			var initPlayer = function(items_arr,renderFn,tuli){
				var len = items_arr.length;
				if(len > 1){
					player = new Player(len,function(toIndex,nextFn){
						renderFn(toIndex,nextFn);
						showText(toIndex,items_arr);
					},data.tuli);
				}			
				renderFn(0);//初始化第一个数据
			}
			if(type == 'img_json'){//外部图片列表文件
				clearMap();
				var url = data.url;
				if(url){
					Loading.show();
					getJson(url,function(imgData){
						Loading.hide();
						renderFn = renderImg(imgData);
						initPlayer(imgData,renderFn);
					});
				}
				return;
			}else if(type == 'img'){//渲染图片
				clearMap();
				renderFn = renderImg(items);
			}else if(type == 'json'){//渲染地图数据
				var conf = $.extend(true,{ 
					container: 'operator'
				},data.config);
				var colorType = COLOR[data.color];
				var parseFn = fnObj[data.fnname];
				renderFn = function(toIndex,nextFn){
					var fn = function(){
						getJson(items[toIndex]['src'],function(pointData){
							if(colorType){
								$.each(pointData.features,function(i,v){
									v.properties.color = colorType(v.properties.value);
								});
							}
							if($.isFunction(parseFn)){
								pointData = parseFn(pointData);
							}
				 			gm.loadWeather(pointData,global_jsonid);
							gm.refresh();
							Loading.hide();
							nextFn && nextFn();
						});
					}
					Loading.show();
					if(!isInitMap){
						require(['GeoMap'],function(GeoMap) {
							gm = GeoMap.init(conf);
							getJson('./data/map/china.geo.json',function(mapData){
								isInitMap = true;
								fn();
								gm.load(mapData);
					 			gm.render();
					 			gm.zr.on("click",function(e){
					 				if(global_jsonid || isChanging){//防止多次点击
					 					return;
					 				}
								 	var target = e.target;
								 	if(target){
									 	/*暂时以此来区分单站雷达点击*/
						 				if(target.pshapeId && target.pshapeId != target.id){
						 					return;
						 				}
								 		var jsonid = target.id.replace('text','');
								 		if(isNaN(jsonid)){
									 		global_jsonid = jsonid;
								 			getJson('./data/map/'+jsonid+'.geo.json',function(json){
								 				resetToOldOffset(function(){
								 					var $n_back = $('#n_back').show();
								 					gm.clear();
													gm.load(json,{showName:true});
													gm.refreshWeather(jsonid);
													var back = function(){
														$n_back.remove();//删除提示
														resetToOldOffset(function(){
															global_jsonid = null;
									 						gm.clear();
															gm.load(mapData,{showName:false});
															gm.refreshWeather();
															$btn_back.remove();
									 					});
													}
													var $btn_back = $('<div id="btn_back">返回</div>').appendTo($top_layer).click(back);
								 				});
									 		})
								 		}
								 	}
								 });
							});
						});
					}else{
						gm.updateCfg(conf,true);
						fn();
					}
				}
			}else if(type == 'hightchart'){
				clearMap();
				var fn = data.fnname;
				fn = fnObj[fn];
				fn && fn();
				return;
			}else if (type == 'weburl'){
				window.location.href='wisp://pUrl.wi?url='+data.url;
				return;
			}
			if(renderFn){
				initPlayer(items,renderFn);
			}
		}
		var _init = function(data_id){
			var clickTarget = $('li[data-id='+data_id+']');
			if(clickTarget.length > 1){
				clickTarget = clickTarget.filter(':not(.big)');
			}
			if(player){
				player.hide();
				player = null;
			}
			initData(DATA_CONF[data_id],clickTarget.text());
		}
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
			},
			'parseWind': function(data){
				$.each(data.features,function(i,v){
					var properties = v.properties;
					var speed = properties.speed;
					var imgName = '';
					if(speed >= 1 && speed <=2){
						imgName = '1_2';
					}else if(speed >= 3 && speed <=4){
						imgName = '3_4';
					}else if(speed >= 5 && speed <=6){
						imgName = '5_6';
					}else if(speed >= 7 && speed <=8){
						imgName = '7_8';
					}else if(speed >8){
						imgName = '8_';
					}
					
					properties.rotation = -properties.rotation;//画图为逆时针画，而风数据里为顺时针
					properties.image = './img/wind_icon/'+imgName+'.gif';
					properties.width = 11;
					properties.height = 13;
				});
				return data;
			}
		}
		/*左侧导航点击事件*/
		var $sort_nav = $('#sort_nav ul').click(function(e){
			var target = $(e.target);
			if(target.is('li')){
				hide_nav();
				var data_id = target.data('id');
				if(data_id){
					_init(data_id);
				}
			}
		}).on('SwipeLeft', hide_nav);
		TouchEvent($sort_nav);

		_init(initDataId);
	})();
})