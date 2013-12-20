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
	var TouchEvent = function($obj){
		$obj.on('touchstart',function(eStart){
			eStart.preventDefault();
			$obj.trigger('TouchStart',eStart);
			var touches = eStart.originalEvent.touches;
			var len = touches.length;
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
				var startTime = new Date().getTime();
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
					var endTime = new Date().getTime();
					if(endTime - startTime < 500){
						var eventType = moveX - startX < 0?'SwipeLeft': 'SwipeRight';
						$obj.trigger(eventType);
					}
					$obj.trigger('TouchEnd');
					$obj.trigger('MoveEnd');
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

	var oldWidth,oldHeight;
	var marginLeft,marginTop;
	var oldMarginLeft,oldMarginTop;
	var $img = $('#testImg').on('Scale',function(e,d){
		var scale = d.scale;
		var newW = oldWidth*scale;
		var newH = oldHeight*scale;
		$img.css({
			width: newW,
			height: newH,
			'margin-left': -newW / 2,
			'margin-top': -newH/2
		})
	}).on('ScaleEnd',function(e,d){
		var scale = d.scale;
		oldWidth = oldWidth*scale;
		oldHeight = oldHeight*scale;
		oldMarginLeft = parseFloat($img.css('margin-left'));
		oldMarginTop = parseFloat($img.css('margin-top'));
	}).on('MoveStart',function(){

	}).on('Moving',function(e,d){
		var xStep = d.xStep,
			yStep = d.yStep;
		$img.css({
			'margin-left': oldMarginLeft + xStep,
			'margin-top': oldMarginTop + yStep
		})
	}).on('MoveEnd',function(){
		oldMarginLeft = parseFloat($img.css('margin-left'));
		oldMarginTop = parseFloat($img.css('margin-top'));
	}).on('load',function(){
		oldWidth = $img.width();
		oldHeight = $img.height();
		// var offset = $img.position();
		// oldLeft = offset.left;
		// oldTop = offset.top;
		marginLeft = oldMarginLeft = parseFloat($img.css('margin-left'));
		marginTop = oldMarginTop = parseFloat($img.css('margin-top'));
	});
	TouchEvent($img);
})