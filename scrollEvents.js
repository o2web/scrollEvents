// scrollEvents.js
//
// O2 WEB
// o2web.ca
// Tous droits réservés
// All rights reserved
// 2014

(function($){
	$win = $(window);

	window.se = {
		items: [],
		t:$win.scrollTop(),
		b:$win.height(),
		wh:$win.height()
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



	function checkUp(e, activate, callback){
		if(e.isVisible && e.b <= se.t){
			if(activate) e.isVisible=false;
			if(callback) e.up(e);
		}
	}
	function checkDown(e, activate, callback){
		if(e.isVisible && e.t >= se.b){
			if(activate) e.isVisible=false;
			if(callback) e.down(e);
		}
	}
	function checkVisible(e, activate, callback){
		if(!e.isVisible && e.t < se.b && e.b > se.t){
			if(activate) e.isVisible=true;
			if(callback) e.visible(e);
		}
	}
	function checkTopOut(e, activate, callback){
		if(e.topIsVisible && e.t <= se.t){
			if(activate) e.topIsVisible = false;
			if(callback) e.topOut(e);
		}
	}
	function checkTopIn(e, activate, callback){
		if(!e.topIsVisible && e.t > se.t){
			if(activate) e.topIsVisible = true;
			if(callback) e.topIn(e);
		}
	}
	function checkTravel(e, activate, callback){
		if(e.isVisible && e.b <= se.t){
			if(activate&&!e.up) e.isVisible=false;
			if(callback) e.container.off('scroll', e.travel);
		}
		if(e.isVisible && e.t >= se.b){
			if(activate&&!e.down) e.isVisible=false;
			if(callback) e.container.off('scroll', e.travel);
		}
		if(!e.isVisible && e.t < se.b && e.b > se.t){
			if(activate&&!e.visible) e.isVisible=true;
			if(callback){
				e.container.on('scroll', {
					delta: function(){return Math.round( ( se.t - (e.t - se.wh) ) / ( e.h + se.wh) *100)/100 },
					selection: e.selection,
					index: e.i,
					height: e.h
				}, e.travel);
			}
		}
	}

	//
	function parseChecks(e){
		e.checks = [];

		if(e.travel){
			e.checks.push(
				{	
					fn: checkTravel,
					activate: true,
					callback: !!e.travel
				}
			)
		}
		if(e.up || e.checkdown || e.visible){
			e.checks.push(
				{	
					fn: checkUp,
					activate: true,
					callback: !!e.up
				},
				{
					fn: checkDown,
					activate: true,
					callback: !!e.down
				},
				{
					fn: checkVisible,
					activate: true,
					callback: !!e.visible
				}

			)
		}
		if(e.topOut || e.topIn){
			e.checks.push(
				{	
					fn: checkTopOut,
					activate: true,
					callback: !!e.topOut
				},
				{
					fn: checkTopIn,
					activate: true,
					callback: !!e.topIn
				}
			)
		}
	}



	$.extend($.fn, {
		scrollEvents :function(args, flag, options){
			if(typeof(args)=='string'){
				if(args=='destroy'){
					$win.off('scroll', eventScroller).off('resize',resizeScroller);
					window.items = [];
				}
				else if(args=='resize'){
					resizeScroller();
				}
				else if(args=='trigger'){
					eventScroller('update');
				}
				else if(args=='update'){
					resizeScroller('update');
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
											if(args=='disable'){
												ev.disabled = true;
												if(e.travel) e.container.off('scroll', e.travel);
											}
											else if(args=='enable'){
												ev.disabled = false;
												if(e.travel){
													e.isVisible = false;
													checkTravel(ev, true, true);
												}
											}
											else if(args=='set') $.extend(true, ev, options);

										}
									}
									else{
										if(args=='disable'){
											ev.disabled = true;
											if(ev.travel) ev.container.off('scroll', ev.travel);
										}
										else if(args=='enable'){
											ev.disabled = false;
											if(ev.travel){
												ev.isVisible = false;
												checkTravel(ev, true, true);
											}
										}
										else if(args=='set') $.extend(true, ev, options);
									}
									
								}
							}
						}
					}
					if(args=='remove'){
						removed.sort(function(a, b){return b.ev.se-a.ev.se});
						for(var k=0;k<removed.length; k++){
							var e = removed[k];
							if(e.ev && !e.ev.once) $win.off('scroll', e.ev.visibleFn);
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
						//
						visible: false,
						up:false,
						down:false,
						topOut: false,
						topIn: false,
						travel: false,
						//
						offset:0,
						isVisible:false,
						topIsVisible: false,
						container: $win,
						h:$(this).outerHeight(),
						t:0,
						b:$(this).outerHeight(),
						i: k,
						disabled: false,
						checks: []
					}, args);
				e.travel = e.travel ? args.travel.clone() : false;
				
				parseChecks(e);
					
				//
				//
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
					 	top: $(this).css('top')
					};
				}
				if(!this.ev){
					this.ev = [];
				}
				this.ev.push(e);

				
			});

			$win.off('scroll', eventScroller).off('resize',resizeScroller);
			$win.on('scroll', eventScroller).on('resize',resizeScroller);
			
			return this;
		}			
	});

	

	function eventScroller(){
		se.t = $win.scrollTop();
		se.b = se.t+se.wh;
		for(var i=0; i<se.items.length; i++){
			var it = se.items[i];
			for(var j=0; j<it.ev.length; j++) (function(e){
				if(!e.disabled){
					for(var k=0; k<e.checks.length; k++){
						var c = e.checks[k];
						c.fn(e, c.activate, c.callback);
					}
				}
			})(it.ev[j]);
		};
	}

	function updateScroller(){
		se.t = $win.scrollTop();
		se.b = se.t+se.wh;
		for(var i=0; i<se.items.length; i++){
			var it = se.items[i];
			for(var j=0; j<it.ev.length; j++) (function(e){
				if(!e.disabled){
					for(var k=0; k<e.checks.length; k++){
						var c = e.checks[k];
						c.fn(e, c.activate, false);
					}
				}
			})(it.ev[j]);
		};
	}

	var resizeTimeout;

	function recalculate(){
		se.wh = $win.height();
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

	function resizeScroller(arg){
			if(arg=='update'){
				recalculate();
				updateScroller();
			}
			else{
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function(){
					recalculate();
					$win.trigger('hardResize');
					// if(typeof(e)=='object'&&e.type=='resize') eventScroller('update');
				},150);
				
			}
	}

	resizeScroller();	

})(jQuery);