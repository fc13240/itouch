(function(global){
	var eventConfig = {
		'TouchStart': null,
		'TouchMove': null,
		'TouchEnd': null,
		'MoveStart': null,
		'Moving': null,
		'MoveEnd': null,
		'SwipeLeft': null,
		'SwipeRight': null,
		'Scale': null,
		'ScaleEnd':null
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
	$(function(){
		result = $('<div style="position:fixed;z-index:101;left:10px;top:100px;width:300px;height:100px;background:rgba(100,100,100,0.3);"></div>').appendTo($('body'));
	});
	var TouchEvent = function($obj){
		var touchLenName = 't_l';
		$obj.on('touchstart',function(eStart){
			eStart.preventDefault();
			$obj.trigger('TouchStart',eStart);
			var touches = eStart.originalEvent.touches;
			var len = touches.length;
			$obj.data(touchLenName,len);
			
			result.html(len+'<br/>'+result.html());
			if(len == 2){
				var startLineLen = lineLength(touches);
				var fnMove = function(eMove){
					eMove.preventDefault();
					$obj.trigger('TouchMove',eMove);
					var touchesMove = eMove.originalEvent.touches;
					var moveLineLen = lineLength(touchesMove);

					var scale = moveLineLen/startLineLen;
					scalecache = scale;
					$obj.trigger('Scale',{
						scale: scale
					});
				}
				var fnEnd = function(){
					$obj.trigger('ScaleEnd',{
						scale: scalecache
					});
					$obj.trigger('TouchEnd');
					$obj.off('touchend',fnEnd);
					$obj.off('touchmove',fnMove);
				};
				$obj.on('touchmove',fnMove);
				$obj.on('touchend',fnEnd);
			}
			else if(len == 1){
				$obj.trigger('MoveStart',eStart);
				var startTouchEvent = touches[0];
				var startX = startTouchEvent.pageX,
					startY = startTouchEvent.pageY;
				var moveX,moveY;
				var fnMove = function(eMove){
					eMove.preventDefault();
					$obj.trigger('TouchMove',eMove);
					var moveTouchEvent = eMove.originalEvent.touches[0];
					moveX = moveTouchEvent.pageX;
					moveY = moveTouchEvent.pageY;
					$obj.trigger('Moving',{
						xStep: moveX - startX,
						yStep: moveY - startY
					});
				};
				var fnEnd = function(){
					var eventType = moveX - startX < 0?'SwipeLeft': 'SwipeRight';
					$obj.trigger(eventType);
				
					$obj.trigger('MoveEnd',{
						xStep: moveX - startX,
						yStep: moveY - startY
					});
					$obj.trigger('TouchEnd');
					$obj.off('touchend',fnEnd);
					$obj.off('touchmove',fnMove);
				}

				$obj.on('touchmove',fnMove);
				$obj.on('touchend',fnEnd);
			}
		});
	}
	global.TouchEvent = TouchEvent;
})(this);

$(function(){
	var $main_container = $('#main_container');
	var hide_nav = function(){
		$main_container.addClass('off').removeClass('on');
	}
	var show_nav = function(){
		$main_container.addClass('on').removeClass('off');
	}
	$('.btn_nav').click(function(){
		if($main_container.hasClass('on')){
			hide_nav();
		}else{
			show_nav();
		}
	});

	var $sort_nav = $('#sort_nav').on('SwipeLeft',hide_nav);
	TouchEvent($sort_nav);

	var $operator = $('#operator');
	var offset = $operator.position();
	var data = {
		scale: 1,
		width: $operator.width(),
		height: $operator.height(),
		left: offset.left,
		top: offset.top
	}
	var MAX_SCALE = 3;
	$operator.on('Scale',function(e,d){return;
		var scale = d.scale*data.scale;
		if(scale > MAX_SCALE){
			return;
		}
		$operator.css({
			transform: 'scale('+scale+','+scale+')'
		})
	}).on('ScaleEnd',function(e,d){return;
		var scale = d.scale * data.scale;
		if(scale > MAX_SCALE){
			return;
		}
		data.scale = scale;
		
		// var newWidth = data.width * scale;
		// var newHeight = data.height * scale;
		// var newLeft = data.left - (newWidth - data.width)/2;
		// var newTop = data.top - (newHeight - data.height)/2;
		// $operator.css({
		// 	transform: 'scale(1,1)',
		// 	width: newWidth,
		// 	height: newHeight,
		// 	left: newLeft,
		// 	top: newTop
		// });
		// data = {
		// 	scale: 1,
		// 	width: newWidth,
		// 	height: newHeight,
		// 	left: newLeft,
		// 	top: newTop
		// }
	}).on('MoveStart',function(){

	}).on('Moving',function(e,d){
		var xStep = d.xStep,
			yStep = d.yStep;
		var newLeft = data.left + xStep;
		var newTop = data.top + yStep
		$operator.css({
			'left': newLeft,
			'top': newTop
		});
	}).on('MoveEnd',function(e,d){
		data.left += d.xStep;
		data.top += d.yStep;
		// alert(data.left+' '+data.top);
		// movingData = {};
	});
	TouchEvent($operator);
})