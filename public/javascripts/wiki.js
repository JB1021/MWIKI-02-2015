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

var Error = {
  auth : "로그인 먼저 하세요.",
  invalidYear : "0~2100 사이의 숫자를 입력하세요.",
  invalidSigninInfo: "패스워드와 아이디를 확인하세요.",
  invalidEmail : "형식에 맞지 않습니다. 이메일을 입력하세요.",
  invalidPassword : "형식에 맞지 않습니다. 영대/소문자, 숫자 및 특수문자 조합 비밀번호 8자리이상 15자리 이하로 만드세요. 암호화는 하지 않습니다."
}

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
UTIL.isInvalidYear = function(year){
  var numRegex = /^[0-9+]*$/; 
  if(!numRegex.test(year) || (year < 0 || year > 2100) || UTIL.isEmpty(year)) return true;
  return false;
}
UTIL.isValidEmail = function(email){
  var emailRegex = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;
  if(email.length == 0) return false;
  if(!email.match(emailRegex)) return false;
  return true;
}
UTIL.isValidPassword = function(password){
  var passwordRegex = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
  if(!password.match(passwordRegex)) return false;
  return true;
}

var WIKI = function(){
  var url = "http://localhost:3000";
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
    init : function(){
      var modals = $("#modals");
      modals.on("click", ".new-map .submit", this.addMap);
      modals.on("click", ".sign-up .submit", this.signUp);
      modals.on("click", ".sign-in .submit", this.signIn);
      markerModal.on("click", ".submit", this.addMarker);
      btnSignOut.on("click", this.signOut);
      addMarkerModalEvents();
    }, 
    addMap : function(){
      var year = $("#modals .new-map .year").val();
      if(UTIL.isInvalidYear(year)){
        alert(Error.invalidYear);
        return;
      }
      $.post(url+"/map", {year : year}, function(result){
        var flag = new FLAG(result.year, wiki);
        flag.changeMap(result.year);
        flag.movePointer(result.year);
        timenav.prepend(flag.element);
        $('#modals .mask, .window').hide();  
      }); 
    },      
    getMap : function(){
      $.get(url+"/map", {}, function(result){
        var maps = result.maps;
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

      if(!UTIL.isValidEmail(email)){
        alert(Error.invalidEmail);
        return;
      }
      if(!UTIL.isValidPassword(password)){
        alert(Error.invalidPassword);
        return;
      }
      $.post(url+"/user", {email : email, password : password}, function(result){
        if(!UTIL.isEmpty(result.error)) alert(result.error);
        $('#modals .mask, .window').hide();
      })      
    },
    signIn : function(){
      var email = $("#modals .sign-in .email").val();
      var password = $("#modals .sign-in .password").val();
      $.get(url+"/auth", {email : email, password : password}, function(result){
        if(UTIL.isEmpty(result.user)) {
            alert(Error.invalidSigninInfo);
            return;
        }
        btnSignUp.hide();
        btnSignIn.hide();
        btnSignOut.show();
        $("#timenav .flag").remove();
        $("#map .marker").remove();
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
      $.delete(url+"/auth", {}, function(){
        btnSignOut.hide();
        btnSignIn.show();
        btnSignUp.show();
        $("#timenav .flag").remove();
        $("#map .marker").remove();
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

      $.post(url+"/marker", {title:title, description:description, year:year, xPos:xPos, yPos:yPos}, function(result){
        drawMarker(result.xPos, result.yPos, result.title, result.description);
        markerModal.hide();
      })
    },
    getMarkers : function(year){
      $.get(url+"/marker", {year:year}, function(result){
        var markers = result.markers;
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
  var pointer = $("#timenav .flag-pointer");
  var oldPos = pointer.position();
  var start = null;
  var goal = year/2;

  if(oldPos.left < year/2){
      window.requestAnimationFrame(moveToPositive);
  } else {
      window.requestAnimationFrame(moveToNegative);
  }

  function moveToPositive(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var currentPos = parseFloat(oldPos.left) + progress;
    pointer.css('left', Math.min(currentPos, goal));
    if (Math.min(currentPos, year/2)===currentPos) {
      window.requestAnimationFrame(moveToPositive);
    }
  }
  function moveToNegative(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var currentPos = parseFloat(oldPos.left) - progress;
    pointer.css('left', Math.max(currentPos, goal));
    if (Math.max(currentPos, year/2)===currentPos) {
      window.requestAnimationFrame(moveToNegative);
    }
  }
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