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
	var wiki = new WIKI();
  wiki.init();
});

var UTIL = UTIL || {}
UTIL.isEmpty = function(obj){
  if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

var WIKI = function(){

  return {
    btnSignIn : $('#nav .btn-sign-in'),
    btnSignOut : $('#nav .btn-sign-out'),
    btnSignUp : $('#nav .btn-sign-up'),
    timenav : $('#timenav'),
    markerModal : $("#marker-modal"),
    addMap : function(){
      var year = $("#newmap .year").val();
      $.post("http://localhost:3000/map", {year : year}, function(result){
        if(UTIL.isEmpty(result)){
          alert("로그인 먼저 하세요");
          return;          
        }
        var flag = new FLAG(result.year);
        timenav.prepend(flag.element);
        $('#modals .mask, .window').hide();  
      }); 
    },
    signUp : function(){
      var email = $("#modals .sign-up .email").val();
      var password = $("#modals .sign-up .password").val();
      $.post("http://localhost:3000/user", {email : email, password : password}, function(){
        $('#modals .mask, .window').hide();
      })      
    },
    signIn : function(){
      var email = $("#modals .sign-in .email").val();
      var password = $("#modals .sign-in .password").val();
      var self = this;
      $.get("http://localhost:3000/auth", {email : email, password : password}, function(result){
        if(UTIL.isEmpty(result)) {
            alert("패스워드 혹은 아이디가 틀렸습니다.");
            return;
        }
        self.btnSignUp.hide();
        self.btnSignIn.hide();
        self.btnSignOut.show();
        var maps = result.user.maps;
        for(var i=0; i<maps.length;i++){
          var flag = new FLAG(maps[i].year);
          self.timenav.prepend(flag.element);
        }
        $('#modals .mask, .window').hide();
      });
    },
    signOut : function(){
      var self = this;
      $.delete("http://localhost:3000/auth", {}, function(){
        self.btnSignOut.hide();
        self.btnSignIn.show();
        self.btnSignUp.show();
      })
    },
    init : function(){
      var timenav = $("#timenav");
      var modals = $("#modals");
      modals.on("click", ".new-map .submit", this.addMap.bind(this));
      modals.on("click", ".sign-up .submit", this.signUp.bind(this));
      modals.on("click", ".sign-in .submit", this.signIn.bind(this));
      this.btnSignOut.on("click", this.signOut.bind(this));


      $('div[name=modal]').click(function(e) {
        var modalClass = $(this).attr('href');   
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
        
        var mask = $('#modals .mask');
          mask.css({'width':maskWidth,'height':maskHeight});
          mask.fadeIn(800);    
          mask.fadeTo("slow",0.8);    
        
          var windowHeight = $(window).height();
          var windowWidth = $(window).width();
          var modal = $(modalClass);
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
    }
  }
}

var FLAG = function(year){
  var flagObj = { position : year/2 };
  var template = Handlebars.compile(Templates.flag);
  this.year = year;
  this.element = $(template(flagObj));
  this.element.on("click", function(){
    this.movePointer(this.year/2);
    this.changeMap(year);
  }.bind(this));
}

FLAG.prototype.movePointer = function(left){
  $("#timenav .flag-pointer").css('left', left)
}

FLAG.prototype.changeMap = function(year){
    container = d3.select("#map svg g").append("text")
    .attr("x", 20)
    .attr("y", 50)
    .style("font-size","50px")
    .text("AD."+year);
}

Templates = {}; 
Templates.flag = [
	'<li class="flag">',
		'<div class="bar" style="left: {{position}}px;"></div>',
		'<div class="year"></div>',
	'</li>'
].join("\n");