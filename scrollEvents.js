// scrollEvents.js
// by ctibo

window.se = {
		events:[],
		t:$(window).scrollTop(),
		b:$(window).height(),
		wh:$(window).height()
	};

(function($){

	$.extend($.fn, {
		scrollEvents :function(args){
			if(args=='destroy'){
				$(window).off('scroll', eventScroller).off('resize',resizeScroller);
				window.events = [];
				return;
			}
			if(args=='refresh'){
				eventScroller('refresh');
				return;
			}
			$(this).each(function(){	
				var e = $.extend(true,{
						selector: $(this),
						visibleFn:function(){},
						upFn:null,
						downFn:null,
						once:true,
						offset:0,
						visible:false,
						h:$(this).outerHeight(),
						t:0,
						b:$(this).outerHeight()
					}, args);
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
			var j = i;
			
			if((e.visible||arg=='refresh') && e.b <= se.t){
				if(!e.once){
					$(window).off('scroll',e.visibleFn);
				}
				else if(e.upFn && typeof(e.upFn)=='function'){
					e.upFn();
				}
				e.visible=false;
			}else if((e.visible||arg=='refresh') && e.t >= se.b){
				if(e.once && e.downFn && typeof(e.downFn)=='function'){
					e.downFn();
				}
				e.visible=false;
			}else if((!e.visible||arg=='refresh') && e.t < se.b && e.b > se.t && e.visibleFn){
				if(!e.once)
					$(window).on('scroll', {
							delta:function(){return Math.round((se.b-se.events[j].t)/(se.wh+se.events[j].h)*100)/100 },
							selector:e.selector
						}, e.visibleFn)
				else{
					e.visibleFn();
				}
				e.visible=true;
			}
		}
	}

	var resizeTimeout;
	
	function resizeScroller(){
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
	}

	resizeScroller();
	window.scroll(0,1);
	

})(jQuery);