// sticky.js
//
// O2 WEB
// o2web.ca
// Tous droits réservés
// All rights reserved
// 2014

(function($){
	$.extend($.fn, {
		sticky :function(args, option){
			var $el = $(this);
			var options = $.extend(true,{
					container: $el.parent(),
					offset: 0,
					ofsetBottom: 0,
					reset: undefined,
					sticked: undefined,
					contained: undefined
				}, args);

			// STICKED
			$el.scrollEvents({
				flag: 'sticked',
				offset: options.offset,
				topIn: options.reset,
				topOut: options.sticked
			});

			$el.scrollEvents({
				flag: 'contained',
				offset:  -options.container.outerHeight() + $el.outerHeight() + options.offsetBottom + options.offset + options.offset ,
				topIn: options.sticked,
				topOut: options.contained,
				// topIsVisible: true
			})
			
			function updateOptions(){
				$el.scrollEvents('set','contained', {
					offset: -options.container.outerHeight() + $el.outerHeight() + options.offsetBottom + options.offset + options.offset
				});
			}

			$(window).on('hardResize', updateOptions);
		}
	});
})(jQuery);