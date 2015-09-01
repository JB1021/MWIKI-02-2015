jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

document.addEventListener("DOMContentLoaded", function(e) {
	WIKI.methods.init();
});

var WIKI = WIKI || {};
WIKI.methods = WIKI.methods || {};
WIKI.elements = WIKI.elements || {};
WIKI.elements.markerModal = $("#marker-modal");

WIKI.methods.init = function() {
	var btnNewmap = $("#newmap .submit");
  var submitSignIn = $('#sign-in .submit');
  var submitSignUp = $('#sign-up .submit');
  var btnSignOut = $('#nav .btn-sign-out');
  var btnSignIn = $('#nav .btn-sign-in');
  var btnSignUp = $('#nav .btn-sign-up');
	var timenav = $("#timenav");

  submitSignUp.click(function(){
    var email = $("#sign-up .email").val();
    var password = $("#sign-up .password").val();

    $.post("http://localhost:3000/user", {email : email, password : password}, function(){
        $('#modals .mask, .window').hide();
    })
  });
	
  submitSignIn.click(function(){
    var email = $("#sign-in .email").val();
    var password = $("#sign-in .password").val();

    $.get("http://localhost:3000/auth", {email : email, password : password}, function(result){
      btnSignUp.hide();
      btnSignIn.hide();
      btnSignOut.show();
      $('#modals .mask, .window').hide();
    })
  });

  btnSignOut.click(function(){
    $.delete("http://localhost:3000/auth", {}, function(){
      btnSignOut.hide();
      btnSignIn.show();
      btnSignUp.show();
    })
  });

	btnNewmap.click(function(){
		var year = $("#newmap .year").val();
    $.post("http://localhost:3000/map", {year : year}, function(result){
      if(result.year === undefined || result.year === null){
        alert(result.auth);
        return;
      };
      var flag = new WIKI.flag(result.year);
      timenav.prepend(flag.element);
      $('#modals .mask, .window').hide();  
    });	
	});

 	$('div[name=modal]').click(function(e) {
    var modalId = $(this).attr('href');   
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    
    var mask = $('#modals .mask');
      mask.css({'width':maskWidth,'height':maskHeight});
      mask.fadeIn(800);    
      mask.fadeTo("slow",0.8);    
    
      var windowHeight = $(window).height();
      var windowWidth = $(window).width();
      var modal = $(modalId);
      modal.css('top',  windowHeight/2-modal.height()/2);
      modal.css('left', windowWidth/2-modal.width()/2);
      modal.fadeIn(800); 
  });
    
  $('.window .close').click(function (e) {
    $('#modals .mask, .window').hide();
  });        
    
  $('#modals .mask').click(function () {
    $(this).hide();
    $('.window').hide();
  });            
    
  $(window).resize(function () {
 		var modal = $('#modals .window');
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    modal.css('top',  windowHeight/2 - modal.height()/2);
    modal.css('left', windowWidth/2 - modal.width()/2);
	});

  $('#marker-modal .close').click(function (e) {
    WIKI.elements.markerModal.hide();
  });        

};


WIKI.flag = {};
WIKI.flag.year = 0;
WIKI.flag = function(year) {
	this.flagPointer = $("#timenav .flag-pointer");
	this.year = year;
	var template = Handlebars.compile(Templates.mapFlag);
	var flagObj = { position : year/2 };
	this.element = $(template(flagObj));
	this.element.on("click", function(){
		this.movePointer(this.year/2);
	}.bind(this));
};
WIKI.flag.prototype.movePointer = function(left){
	this.flagPointer.css('left',left);	
};


Templates = {}; 
Templates.mapFlag = [
	'<li class="mapFlag">',
		'<div class="bar" style="left: {{position}}px;"></div>',
		'<div class="year"></div>',
	'</li>'
].join("\n");