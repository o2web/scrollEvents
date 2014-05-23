// scrollEvents.js
// by ctibo

window.se = {
		events:[],
		t:$(window).scrollTop(),
		b:$(window).height(),
		wh:$(window).height()
	};

(function($){

	Function.prototype.clone = function() {
	    var that = this;
	    var temp = function temporary() { return that.apply(this, arguments); };
	    for(var key in this) {
	        if (this.hasOwnProperty(key)) {
	            temp[key] = this[key];
	        }
	    }
	    return temp;
	};

	$.extend($.fn, {
		scrollEvents :function(args){
			if(typeof(args)=='string'){
				if(args=='destroy'){
					$(window).off('scroll', eventScroller).off('resize',resizeScroller);
					window.events = [];
				}
				else if(args=='trigger'){
					eventScroller('update');
				}
				else if(args=='resize'){
					resizeScroller();
				}
				else if(args=='update'){
					resizeScroller(eventScroller('update'));
				}
				else if(args=='disable' || args=='enable' || args=='remove'){
					var elements = $(this);
					var removed = [];
					for(var i=0; i<window.se.events.length; i++){
						var e = window.se.events[i];
						for(var j=0; j<elements.length; j++){
							var element = elements[j];
							if(e.selector[0] == element){
								if(args=='remove'){
									removed.push(i);
								}else{
									e.disabled = args=='disable';
								}
							}
						}
					}
					if(args=='remove'){
						var ev = window.se.events;
						for(var k=0;k<removed.length; k++){
							ev.splice(removed[k],1);
						}
					}
				}
				return this;
			}
			
			$(this).each(function(k,v){	

				var e = $.extend(true,{
						selector: $(this),
						visibleFn: false,
						upFn:null,
						downFn:null,
						once:true,
						offset:0,
						visible:false,
						h:$(this).outerHeight(),
						t:0,
						b:$(this).outerHeight(),
						i: k,
						disabled: false
					}, args);
				e.visibleFn = e.visibleFn ? args.visibleFn.clone() : function(){};
				window.se.events.push(e);
			});
			
			$(window).off('scroll', eventScroller).off('resize',resizeScroller);
			$(window).on('scroll', eventScroller).on('resize',resizeScroller);
		}			
	});

	function eventScroller(arg){
		var se = window.se;
		se.t = $(window).scrollTop();
		se.b = se.t+se.wh;
		for(var i=0; i<se.events.length; i++){
			var e = se.events[i];
			if(!e.disabled){
				if((e.visible||arg=='update') && e.b <= se.t){
					if(!e.once&&arg!='update'){
						$(window).off('scroll', e.visibleFn);
					}
					if(e.upFn && typeof(e.upFn)=='function'){
						e.upFn();
					}
					e.visible=false;
				}else if((e.visible||arg=='update') && e.t >= se.b){
					if(!e.once&&arg!='update'){
						$(window).off('scroll', e.visibleFn);
					}
					if(e.downFn && typeof(e.downFn)=='function'){
						e.downFn();
					}
					e.visible=false;
				}else if((!e.visible||arg=='update') && e.t < se.b && e.b > se.t && e.visibleFn){
					if(!e.once){
						var j = i+0;
						$(window).on('scroll', {
								delta: function(){return Math.round( ( se.t - (se.events[j].t - se.wh) ) / ( se.events[j].h + se.wh) *100)/100 },
								selector: e.selector,
								index: e.i,
								height: e.h
							}, e.visibleFn);
					}
					if(e.once||arg=='update'){
						e.visibleFn(e);
					}
					e.visible=true;
				}
			}
		}
	}

	var resizeTimeout;
	
	function resizeScroller(e){
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function(){
			var se = window.se;
			se.wh = $(window).height();
			for(var i=0; i<se.events.length;i++){
				var e = se.events[i];
				var o = e.selector;
				e.h =  $(o).outerHeight();
				var tmp = $(o)[0].style.display;
				$(o)[0].style.display = 'block';
				e.t = $(o).offset().top - e.offset;
				$(o)[0].style.display = tmp;
				if($(o).attr('style')== '') $(this).removeAttr('style');
				e.t = $(o).offset().top - e.offset;
				e.b = e.t+e.h;
			}
		},300);
		if(typeof(e)=='function') e();
	}

	resizeScroller();	

})(jQuery);