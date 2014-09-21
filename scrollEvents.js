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
		scrollEvents :function(args, flag, options){
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
				else if(args=='disable' || args=='enable' || args=='remove' || args=='set'){
					var selection = $(this);
					var removed = [];
					for(var i=0; i<selection.length; i++){
						var it = selection[i];
						if(it.ev){
							if(args=='remove'){
								removed.push(it);
							}
							else{
								for(var j=0;j<it.ev.length;j++){
									var ev = it.ev[j];
									if(flag && typeof(flag=='string')){

										if(ev.flag==flag){
											if(args=='disable'||args=='enable') ev.disabled = (args=='disable')
											else if(args=='set') $.extend(true, ev, options);

										}
									}
									else{
										if(args=='disable'||args=='enable') ev.disabled = (args=='disable')
										else if(args=='set') $.extend(true, ev, flag);
									}
									
								}
							}
						}
					}
					if(args=='remove'){
						removed.sort(function(a, b){return b.ev.se-a.ev.se});
						for(var k=0;k<removed.length; k++){
							var e = removed[k];
							if(e.ev && !e.ev.once) $(window).off('scroll', e.ev.visibleFn);
							se.items.splice(e.ev.se,1);
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
						selection: $(this),
						flag: false,
						visible: false,
						up:false,
						down:false,
						topOut: false,
						topIn: false,
						once:true,
						offset:0,
						isVisible:false,
						topIsVisible: false,
						container: $(window),
						h:$(this).outerHeight(),
						t:0,
						b:$(this).outerHeight(),
						i: k,
						disabled: false
					}, args);
				e.visible = e.visible ? args.visible.clone() : function(){};
				
				var duplicate = false;
				for(var i=0; i<se.items.length; i++ ){
					if(se.items[i]==this){
						duplicate = true;
					}
				}
				if(!duplicate){
					se.items.push(this);
					e.se = se.items.length;
					this.initialStates = {
					 	position: $(this).css('position'),
					 	top: parseInt($(this).css('top').replace(['px', '%'], ''))
					};
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
			for(var j=0; j<it.ev.length; j++) (function(e){
				if(!e.disabled){
					// IF UP
					if((e.isVisible||arg=='update') && e.b <= se.t){
						e.isVisible=false;
						if(!e.once){
							e.container.off('scroll', e.visible);
						}
						if(e.up){
							e.up(e);
						}
					}
					// IF DOWN
					else if((e.isVisible||arg=='update') && e.t >= se.b){
						e.isVisible=false;
						if(!e.once&&arg!='update'){
							e.container.off('scroll', e.visible);
						}
						if(e.down){
							e.down(e);
						}	
					}
					// IF isVisible
					else if((!e.isVisible||arg=='update') && e.t < se.b && e.b > se.t && e.visible){
						e.isVisible=true;
						if(!e.once){
							var k = i+0;
							e.container.on('scroll', {
									delta: function(){return Math.round( ( se.t - (e.t - se.wh) ) / ( e.h + se.wh) *100)/100 },
									selection: e.selection,
									index: e.i,
									height: e.h
								}, e.visible);

							if(arg=='update') e.visible({
								data:{
									delta: function(){return Math.round( ( se.t - (e.t - se.wh) ) / ( e.h + se.wh) *100)/100 },
									selection: e.selection,
									index: e.i,
									height: e.h
								},
								isVisible: e.isVisible
							});
						}
						if(e.once){
							e.visible(e);
						}
					}
					// IF topOut
					if(e.topOut && (e.topIsVisible||arg=='update') && e.t <= se.t){
						e.topIsVisible = false;
						e.topOut(e);
					}
					// IF topIn
					else if(e.topIn && (!e.topIsVisible||arg=='update') && e.t > se.t){
						e.topIsVisible = true;
						e.topIn(e);
					}
				}
			})(it.ev[j]);
		};
	}

	var resizeTimeout;

	function recalculate(){
		se.wh = $(window).height();
		for(var i=0; i<se.items.length; i++){

			var $it = $(se.items[i]);
			var it = $it[0];
			var h =  $it.outerHeight();
			var tmpPos = it.style.position;
			var tmpTop = it.style.top;
			it.style.position = it.initialStates.position;
			it.style.top = it.initialStates.top;
			var t = Math.round($it.offset().top);
			it.style.position = tmpPos;
			it.style.top = tmpTop;
			for(var j=0; j<it.ev.length;j++){
				var e = it.ev[j];
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
					$(window).trigger('hardResize');
					// if(typeof(e)=='object'&&e.type=='resize') eventScroller('update');
				},150);
				
			}
	}

	resizeScroller();	

})(jQuery);