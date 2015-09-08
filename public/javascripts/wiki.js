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
  wiki.getMap();
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

  var url = "http://localhost:3000/";
  var btnSignIn = $('#nav .btn-sign-in');
  var btnSignOut = $('#nav .btn-sign-out');
  var btnSignUp = $('#nav .btn-sign-up');
  var timenav = $('#timenav');
  var markerModal = $("#marker-modal");

  function deleteMarkerInfo(){
    $("#map .marker-info").remove();
  }
  function showMarkerInfo() {
    var target = $(d3.event.target);
    var targetPos = target.offset();
    var title = target.data("title");
    var description = target.data("description");
    var markerInfo = new MAKRERINFO(title, description, targetPos.left-200, targetPos.top-80);
    $("#map").prepend(markerInfo.element);
  }
  function addMarkerModalEvents() {
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
        markerModal.hide();
      });        
  }
  function drawMarker(xPos, yPos, title, description) {
    MAP.container.append("image")
      .attr("xlink:href","../images/marker.png")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", xPos)
      .attr("y", yPos)
      .attr("data-title", title)
      .attr("data-description", description)
      .attr("class", "marker")
      .on("mouseover", showMarkerInfo)
      .on("mouseout", deleteMarkerInfo);
  }

  var wiki = {
    addMap : function(){
      var year = $("#modals .new-map .year").val();
      $.post(url+"map", {year : year}, function(result){
        if(UTIL.isEmpty(result)){
          alert("로그인 먼저 하세요");
          return;          
        }
        var flag = new FLAG(result.year, wiki);
        flag.changeMap(result.year);
        flag.movePointer(result.year);
        timenav.prepend(flag.element);
        $('#modals .mask, .window').hide();  
      }); 
    },      
    getMap : function(){
      $.get(url+"map", {}, function(result){
        if(UTIL.isEmpty(result)){
          return;          
        }
        var maps = result.user.maps;
        if(!UTIL.isEmpty(maps)){
          for(var i=0; i<maps.length;i++){
            var flag = new FLAG(maps[i].year, wiki);
            timenav.prepend(flag.element);
          }  
        }
      });
    }, 
    signUp : function(){
      var email = $("#modals .sign-up .email").val();
      var password = $("#modals .sign-up .password").val();
      $.post(url+"user", {email : email, password : password}, function(){
        $('#modals .mask, .window').hide();
      })      
    },
    signIn : function(){
      var email = $("#modals .sign-in .email").val();
      var password = $("#modals .sign-in .password").val();
      $.get(url+"auth", {email : email, password : password}, function(result){
        if(UTIL.isEmpty(result)) {
            alert("패스워드 혹은 아이디가 틀렸습니다.");
            return;
        }
        btnSignUp.hide();
        btnSignIn.hide();
        btnSignOut.show();
        var maps = result.user.maps;
        if(!UTIL.isEmpty(maps)){
          maps.forEach(function(map){
            var flag = new FLAG(map.year, wiki);
            timenav.prepend(flag.element);
          })
        }
        $('#modals .mask, .window').hide();
      });
    },
    signOut : function(){
      $.delete(url+"auth", {}, function(){
        btnSignOut.hide();
        btnSignIn.show();
        btnSignUp.show();
      })
    },
    addMarker : function(){
      var xPos = markerModal.data("markerXPos");
      var yPos = markerModal.data("markerYPos");
      var title = $("#marker-modal .title").val();
      var description = $("#marker-modal .description").val();
      var year = $("#map .year").text();
      var regex = /[^0-9]/g;
      year = year.replace(regex, '');

      $.post(url+"marker", {title:title, description:description, year:year, xPos:xPos, yPos:yPos}, function(result){
        drawMarker(result.xPos, result.yPos, result.title, result.description);
        markerModal.hide();
      })
    },
    init : function(){
      var modals = $("#modals");
      modals.on("click", ".new-map .submit", this.addMap);
      modals.on("click", ".sign-up .submit", this.signUp);
      modals.on("click", ".sign-in .submit", this.signIn);
      markerModal.on("click", ".submit", this.addMarker);
      btnSignOut.on("click", this.signOut);
      addMarkerModalEvents();
    }, 
    getMarkers : function(year){
      $.get(url+"marker", {year:year}, function(result){
        var markers = result.maps[0].markers;
        if(UTIL.isEmpty(markers)) return;

        markers.forEach(function(marker){
          drawMarker(marker.xPos, marker.yPos, marker.title, marker.description);
        })
      })
    }
  }
  return wiki;
}

var FLAG = function(year, wiki){
  var flagObj = { position : year/2, year:year};
  var template = Handlebars.compile(Templates.flag);
  this.year = year;
  this.wiki = wiki;
  this.element = $(template(flagObj));
  this.element.on("click", function(){
    this.wiki.getMarkers(year);
    this.movePointer(year);
    this.changeMap(year);
  }.bind(this));
}

FLAG.prototype.movePointer = function(year){
  $("#timenav .flag-pointer").css('left', year/2);
}

FLAG.prototype.changeMap = function(year){
  $("#map .year").text("AD."+year);
  $("#map .marker").remove();
}

MAKRERINFO = function(title, description, left, top){
  var markerInfoObj = { title : title, description:description, left:left, top:top };
  var template = Handlebars.compile(Templates.markerInfo);
  this.element = $(template(markerInfoObj));
}

Templates = {}; 
Templates.flag = [
	'<li class="flag">',
		'<div class="bar" style="left: {{position}}px;">',
      '<div class="year">AD.{{year}}</div>',
    '</div>',
	'</li>'
].join("\n");
Templates.markerInfo = [
  '<div class="marker-info" style="left: {{left}}px; top: {{top}}px">',
    '<div class="title">title: {{title}}</div>',
    '<div class="description">description: {{description}}</div>',
  '</div>'
].join("\n");