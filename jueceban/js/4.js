(function(global){
	var eventConfig = {
		// 'MoveStart': null,
		'Move': null,
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
	// $(function(){
	// 	result = $('<div style="position:fixed;z-index:101;left:10px;top:100px;width:300px;height:100px;background:rgba(100,100,100,0.3);"></div>').appendTo($('body'));
	// });
	var TouchEvent = function($obj){
		$obj.on('touchstart',function(eStart){
			eStart.preventDefault();
			//防止事件重复绑定
			$obj.off('touchend');
			$obj.off('touchmove');
			var touches = eStart.originalEvent.touches;
			var len = touches.length;
			if(len == 2){
				var startLineLen = lineLength(touches);
			}else if(len == 1){
				var startTouchEvent = touches[0];
				var startX = startTouchEvent.pageX,
					startY = startTouchEvent.pageY;
			}
			var moveX,moveY;
			var scalecache;
			$obj.on('touchmove',function(eMove){
				eMove.preventDefault();
				var moveTouchEvent = eMove.originalEvent.touches;
				if(len == 2){
					var moveLineLen = lineLength(moveTouchEvent);
					var scale = moveLineLen/startLineLen;
					scalecache = scale;
					$obj.trigger('Scale',{
						scale: scale
					});
				}else if(len == 1){
					var eMove = moveTouchEvent[0];
					moveX = eMove.pageX;
					moveY = eMove.pageY;
					$obj.trigger('Move',{
						xStep: moveX - startX,
						yStep: moveY - startY
					});
				}
			});
			$obj.on('touchend',function(){
				if(scalecache){
					$obj.trigger('ScaleEnd',{
						scale: scalecache
					});
					scalecache = null;
				}
				var eventType = moveX - startX < 0?'SwipeLeft': 'SwipeRight';
				$obj.trigger(eventType);
				if(!isNaN(moveX) && !isNaN(startX)){
					$obj.trigger('MoveEnd',{
						xStep: moveX - startX,
						yStep: moveY - startY
					});
				}
				
				$obj.off('touchend');
				$obj.off('touchmove');
			});
			// result.html(len+'<br/>'+result.html());
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
	var $middleDot = $operator.find('div');
	$operator.on('Scale',function(e,d){
		var scale = d.scale*data.scale;
		if(scale > MAX_SCALE){
			return;
		}
		$operator.css({
			transform: 'scale('+scale+','+scale+')'
		})
	}).on('ScaleEnd',function(e,d){
		var scale = d.scale * data.scale;
		if(scale > MAX_SCALE){
			return;
		}
		data.scale = scale;
		
		var newWidth = data.width * scale;
		var newHeight = data.height * scale;
		/*这里保证缩放点在屏幕中间即可*/
		var newLeft = data.left - (newWidth - data.width)/2;
		var newTop = data.top - (newHeight - data.height)/2;
		var num = $operator.css('transform-origin').split(' ');
		var middle_x = parseFloat(num[0]);
		var middle_y = parseFloat(num[1]);
		var transform_origin = middle_x*scale+'px '+(middle_y*scale)+'px';
		$middleDot.css({
			left: middle_x*scale,
			top: middle_y*scale
		})
		// var newLeft = data.left - middle_x*scale/2;
		// var newTop = data.top - middle_y*scale/2;
		// alert(parseFloat(num[0])/newWidth);
		$operator.css({
			transform: 'scale(1,1)',
			'transform-origin': transform_origin,
			width: newWidth,
			height: newHeight,
			left: newLeft,
			top: newTop
		});
		data = {
			scale: 1,
			width: newWidth,
			height: newHeight,
			left: newLeft,
			top: newTop
		}
	}).on('MoveStart',function(){

	}).on('Move',function(e,d){
		var xStep = d.xStep,
			yStep = d.yStep;
		var newLeft = data.left + xStep;
		var newTop = data.top + yStep;
		$operator.css({
			'left': newLeft,
			'top': newTop
		});
	}).on('MoveEnd',function(e,d){
		data.left += d.xStep;
		data.top += d.yStep;
		var num = $operator.css('transform-origin').split(' ');
		var transform_origin = parseFloat(num[0]) - d.xStep+'px '+(parseFloat(num[1])-d.yStep)+'px';
		// alert((parseFloat(num[0]))/data.width+'  '+transform_origin+' '+parseFloat(num[0]));
		$operator.css('transform-origin',transform_origin);
		$middleDot.css({
			left: parseFloat(num[0]) - d.xStep,
			top: parseFloat(num[1])-d.yStep
		})
		var num = $operator.css('transform-origin').split(' ');
		// alert(transform_origin+"\n"+num);
	});
	TouchEvent($operator);
})