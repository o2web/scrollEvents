// scrollEvents.js
//
// O2 WEB
// o2web.ca
// Tous droits réservés
// All rights reserved
// 2014

(function($){
	window.se = {
		items: [],
		t:$(window).scrollTop(),
		b:$(window).height(),
		wh:$(window).height()
	};

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
					window.items = [];
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
						var it = selection[i];
						if(it.ev){
							var ev = it.ev;
							if(args=='remove'){
								removed.push(it);
							}else{
								ev.disabled = args=='disable';
							}
						}
					}
					if(args=='remove'){
						removed.sort(function(a, b){return b-a});
						for(var k=0;k<removed.length; k++){
							var e = e.ev;
							if(e.ev && !e.ev.once) $(window).off('scroll', e.ev.visibleFn);
							se.items.splice(removed[k],1);
						}
						for(var i=0; i<se.items.length; i++){
							se.items[i].ev.se = i;
						}
					}
				}
				return this;
			}
			
			$(this).each(function(k,v){	
				var e = $.extend(true,{
						selector: $(this),
						visibleFn: false,
						upFn:false,
						downFn:false,
						topUpFn: false,
						topDownFn: false,
						once:true,
						offset:0,
						visible:false,
						topVisible: false,
						h:$(this).outerHeight(),
						t:0,
						b:$(this).outerHeight(),
						i: k,
						disabled: false
					}, args);
				e.visibleFn = e.visibleFn ? args.visibleFn.clone() : function(){};
				
				var duplicate = false;
				for(var i=0; i<se.items.length; i++ ){
					if(se.items[i]==this){
						duplicate = true;
					}
				}
				if(!duplicate){
					se.items.push(this);
					e.se = se.items.length;
				}				
				if(!this.ev){
					this.ev = [];
				}
				this.ev.push(e);	
				
			});

			$(window).off('scroll', eventScroller).off('resize',resizeScroller);
			$(window).on('scroll', eventScroller).on('resize',resizeScroller);
			
			return this;
		}			
	});

	function eventScroller(arg){
		se.t = $(window).scrollTop();
		se.b = se.t+se.wh;
		for(var i=0; i<se.items.length; i++){
			var it = se.items[i];
			for(var j=0; j<it.ev.length; j++){
				var e = it.ev[j];
				if(!e.disabled){
					// IF UP
					if((e.visible||arg=='update') && e.b <= se.t){
						e.visible=false;
						if(!e.once){
							container.off('scroll', e.visibleFn);
						}
						if(e.upFn){
							e.upFn(e);
						}
					}
					// IF DOWN
					else if((e.visible||arg=='update') && e.t >= se.b){
						e.visible=false;
						if(!e.once&&arg!='update'){
							container.off('scroll', e.visibleFn);
						}
						if(e.downFn){
							e.downFn(e);
						}	
					}
					// IF VISIBLE
					else if((!e.visible||arg=='update') && e.t < se.b && e.b > se.t && e.visibleFn){
						e.visible=true;
						if(!e.once){
							var j = i+0;
							container.on('scroll', {
									delta: function(){return Math.round( ( se.t - (se.events[j].t - se.h) ) / ( se.events[j].h + se.h) *100)/100 },
									selector: e.selector,
									index: e.i,
									height: e.h
								}, e.visibleFn);

							if(arg=='update') e.visibleFn({
								data:{
									delta: function(){return Math.round( ( se.t - (se.events[j].t - se.h) ) / ( se.events[j].h + se.h) *100)/100 },
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
					// IF topUP
					if(e.topUpFn && (e.topVisible||arg=='update') && e.t <= se.t){
						e.topVisible = false;
						e.topUpFn(e);
					}
					// IF topDOWN
					else if(e.topDownFn && (!e.topVisible||arg=='update') && e.t > se.t){
						e.topVisible = true;
						e.topDownFn(e);
					}
				}
			}
		}
	}

	var resizeTimeout;

	function recalculate(){
		se.wh = $(window).height();
		for(var i=0; i<se.items.length; i++){

			var it = $(se.items[i]);

			var h =  it.outerHeight();
			var tmp = it[0].style.display;
			it[0].style.display = 'initial';
			var t = Math.round(it.offset().top);
			it[0].style.display = tmp;
			if(it.attr('style')== '') it.removeAttr('style');

			for(var j=0; j<it[0].ev.length;j++){
				var e = it[0].ev[j];
				e.h = h;
				e.t = t - e.offset;
				e.b = e.t+e.h;
			}
			
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