/*
* intro screen
* checks wich size the user's device got
*/

var imgObj = null;
var imgObj2 = null;
var animate ;
var width = window.innerWidth;
var height = window.innerHeight;

function init() {
	changeHref();
	imgObj = document.getElementById('myImage');
	imgObj.style.position= 'absolute'; 
	imgObj.style.left = '-500px'; 
	imgObj.style.width = '35%'; 
	imgObj.style.top = height/2.5;
	imgObj2 = document.getElementById('myImage2');
	imgObj2.style.position= 'absolute'; 
	imgObj2.style.left = '1280px'; 
	imgObj2.style.top = height/2.5;
	imgObj2.style.width = '35%'; 
	setTimeout(move, 1000);
	setTimeout(loadNext, 6000);
}

function move() {
	$("#myImage").animate({"left": (width/3)}, 2100);
	$("#myImage2").animate({"left": (width/3)}, 2100);
}

function changeHref() {
	// this size usally belongs to smartphones
 	if (window.innerWidth < 1024) {
		if(/iPad/i.test(navigator.userAgent)==false)
			$("a[href='HTML/karel_home.html']").attr('href', 'HTML/karel_home_mini.html');
	}
}

function loadNext() {
	// this size usally belongs to smartphones
 	if (window.innerWidth < 1024) {
		if(/iPad/i.test(navigator.userAgent)==false)
			this.document.location.href = "HTML/karel_home_mini.html";
		else
			this.document.location.href = "HTML/karel_home.html";
	// this size usally belongs to rest like desktop PCs, laptops and tablets
	} else
		this.document.location.href = "HTML/karel_home.html";
}

/*
* level selection partition
*/

function sichern () {
	if (level!=undefined) {
		storage.set("level", level);
		storage.set("speed", 20);
		storage.set("skill", skill);
		// usually smartphone size
	 	if ((window.innerWidth < 1024) && (window.innerWidth > 800))
			location.href = "../HTML/karel_game_mini.html";
		else if (window.innerWidth <= 800)
			location.href = "../HTML/karel_game_micro.html";
		// usually desktop, laptop or tablet size
		else
			location.href = "../HTML/karel_game.html";
	}
}	
var level;
var skill = "_1";
var isVisible = false;
var clickAway = false;


$(document).ready(function() {
	
	//
	// Initalize all functions before first call up
	//
	$('#confirmLevel').popover();
	
	$('#myCarousel').carousel({
		interval: 10000
	});	
	//
	// save level to submit it to next page.
	// change image of level preview
	//
	$('.alignment .lvl').bind("click", function(e) {
		$('#confirmLevel').popover('destroy');
		level = parseInt($(this).val());
		$('#levelPreview').attr('src','../images/lvl'+level+skill+'.png');
	});
	
	//
	// save skill to submit it to next page.
	// change image of level preview
	//
	$('.skill').bind("click", function(e) {
	//	$('#confirmLevel').popover('destroy');		
		skill = $(this).val();
		if (level != undefined)
			$('#levelPreview').attr('src','../images/lvl'+level+skill+'.png');
	});
	
	//
	// show popover (button id="confirmLevel") if there's no level selected
	//
	$('#confirmLevel').bind("click", function(e) {
		if (level==undefined) {
			$('#confirmLevel').popover();
			isVisible = true;
			clickAway = false;
			e.preventDefault();
		} else 
			$('#confirmLevel').popover('destroy');
	});
	
	//
	// close popover by clicking anywhere
	// instead of using .click(function() {}); we're using .bind("click touchstart", function() {});
	// with that we avoid the problem, that on an iPad/iPhone  $(document).click... doesn't work.
	//
	$(document).bind("click", function() {
		if(isVisible && clickAway) {
			$('#confirmLevel').popover('destroy');
			isVisible = false;
			clickAway = false;
		} else {
			clickAway = true;
		}
	});	
});