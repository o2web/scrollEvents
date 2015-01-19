jQuery(document).ready(function($){



  // générer des cercles, parce que les placer à la main c'est trop long
  var $circles = $('.demo-parallax .circles');
  var count = 50;
  var colors = ['turquoise','blue','violet'];
  var zMax = 5;
  for(var i=0; i<count; i++){
    var $circle = $('<div class="circle"></div>');
    $circle.addClass( colors[Math.floor(Math.random()*(colors.length))] );
    $circle.attr('z', Math.floor(Math.random()*zMax) );
    $circle.css({
      top: Math.round(Math.random()*100)+'%',
      left: Math.round(Math.random()*100)+'%'
    });
    $circles.append($circle);
  }

	// FIRE CODE TAGS
  $(window).on('load', function(){
  	var codes = $('code.eval');
  	for(var i=0; i<codes.length; i++){
  		eval($(codes[i]).html());
  	}

  });

});