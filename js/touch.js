(function(global){
	var doc = document.documentElement;
	var isSupportTouchEvent = 'ontouchstart' in doc;
	var isSupportGuestEvent = '';
	var bindEvent = function(node,name,callback){
		node.addEventListener(name, callback, false);
	}
	var unbindEvent = function(node,name,callback){
		node.removeEventListener(name, callback, false);
	}
	var pow = function(num){
		return Math.pow.call(Math,num,2);
	}
	var lineLength = function(touches){
		var a = touches[0],
			b = touches[1];
		return Math.sqrt(pow(a.pageX-b.pageX)+pow(a.pageY-b.pageY));
	}
	var Scale = function(node,callback,endcallback){
		if(isSupportTouchEvent){
			if(isSupportGuestEvent){

			}else{
				var scalecache = 1;
				bindEvent(node,'touchstart',function(e){
					e.preventDefault();
					var touches = e.touches;
					if(touches.length == 2){
						var startLineLen = lineLength(touches);
						var handleMove = function(eMove){
							eMove.preventDefault();
							var touchesMove = eMove.touches;
							var moveLineLen = lineLength(touchesMove);

							var scale = moveLineLen/startLineLen;
							
							scalecache = scale;
							callback({
								scale: scale
							});
						}
						var handleEnd = function(eEnd){
							eEnd.preventDefault();
		  					unbindEvent(node,handleMove);
		  					unbindEvent(node,handleEnd);
		  					endcallback({
								scale: scalecache
							});
		  					scalecache = null;
						}
						bindEvent(node,'touchmove',handleMove);
						bindEvent(node,'touchend',handleEnd);
					}
				});
			}
		}
	}
	global.Scale = Scale;
})(window)