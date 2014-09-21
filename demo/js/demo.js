jQuery(document).ready(function($){
	

	// FIRE CODE TAGS

	var codes = $('code.eval');
	for(var i=0; i<codes.length; i++){
		eval($(codes[i]).html());
	}

});