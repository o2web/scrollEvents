// scrollEvents.js
// o2web.ca

// Tous droits réservés
// All rights reserved
// 2014

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
				else if(args=='resize'){
					resizeScroller();
				}
				else if(args=='trigger'){
					eventScroller('update');
				}
				else if(args=='update'){
					resizeScroller(eventScroller);
				}
				else if(args=='disable' || args=='enable' || args=='remove'){
					var selection = $(this);
					var removed = [];
					for(var i=0; i<selection.length; i++){
						var element = selection[i];
						if(element.se){
							var ev = window.se.events[element.se];
							if(args=='remove'){
								removed.push(element.se);
							}else{
								ev.disabled = args=='disable';
							}
						}
					}
					if(args=='remove'){
						var es = window.se.events;
						removed.sort(function(a, b){return b-a});
						for(var k=0;k<removed.length; k++){
							var e = es[removed[k]];
							if(e && !e.once) $(window).off('scroll', e.visibleFn);
							es.splice(removed[k],1);
						}
						for(var i=0; i<window.se.events.length; i++){
							window.se.events[i].selector[0].se = i;
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
			
			for(var i=0; i<window.se.events.length; i++){
				window.se.events[i].selector[0].se = i;
			}

			$(window).off('scroll', eventScroller).off('resize',resizeScroller);
			$(window).on('scroll', eventScroller).on('resize',resizeScroller);
			
			return this;
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
					e.visible=false;
					if(!e.once){
						$(window).off('scroll', e.visibleFn);
					}
					if(e.upFn && typeof(e.upFn)=='function'){
						e.upFn();
					}
					
				}else if((e.visible||arg=='update') && e.t >= se.b){
					e.visible=false;
					if(!e.once&&arg!='update'){
						$(window).off('scroll', e.visibleFn);
					}
					if(e.downFn && typeof(e.downFn)=='function'){
						e.downFn();
					}
					
				}else if((!e.visible||arg=='update') && e.t < se.b && e.b > se.t && e.visibleFn){
					e.visible=true;
					if(!e.once){
						var j = i+0;
						$(window).on('scroll', {
								delta: function(){return Math.round( ( se.t - (se.events[j].t - se.wh) ) / ( se.events[j].h + se.wh) *100)/100 },
								selector: e.selector,
								index: e.i,
								height: e.h
							}, e.visibleFn);

						if(arg=='update') e.visibleFn({
							data:{
								delta: function(){return Math.round( ( se.t - (se.events[j].t - se.wh) ) / ( se.events[j].h + se.wh) *100)/100 },
								selector: e.selector,
								index: e.i,
								height: e.h
							},
							visible: e.visible
						});
					}
					if(e.once){
						e.visibleFn(e);
					}
					
				}
			}
		}
	}

	var resizeTimeout;

	function recalculate(){
		var se = window.se;
		se.wh = $(window).height();
		for(var i=0; i<se.events.length;i++){
			var e = se.events[i];
			var o = e.selector;
			e.h =  $(o).outerHeight();
			var tmp = $(o)[0].style.display;
			$(o)[0].style.display = 'initial';
			e.t = $(o).offset().top - e.offset;
			$(o)[0].style.display = tmp;
			if($(o).attr('style')== '') $(this).removeAttr('style');
			e.b = e.t+e.h;
		}
	}

	function resizeScroller(e){
			if(typeof(e)=='function'){
				recalculate();
				e('update');
			}
			else{
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function(){
					recalculate();
					if(typeof(e)=='object'&&e.type=='resize') eventScroller('update');
				},150);
				
			}
	}

	resizeScroller();	

})(jQuery);