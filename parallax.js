// parallax.js
//
// O2 WEB
// o2web.ca
// Tous droits réservés
// All rights reserved
// 2015



(function($){
	$win = $(window);

  // global variable for parallax.js
  window.parallax = {};
  parallax.items = [];
  parallax.options = {
    perspective: 200,
    transform: Modernizr.prefixed('transform')
  }

  // jquery function
  $.fn.parallax = function(args, options){
    $selection = $(this);
    $selection.each(function(){
      var $el = $(this);
      $el[0].z = parseFloat($el.attr('z'));

    }).scrollEvents({
      flag: 'parallax',
      travel: function(e){
        var $el = e.data.selection;
        var delta = 1 - e.data.delta();
        var z = $el[0].z;
        var travel = (parallax.options.perspective*z)
        var y = delta*travel - (travel/2);

        $el[0].style[parallax.options.transform] = 'translate3d(0,'+y+'px, 0)';
      }
    });
  }



})(jQuery);