/*
* ===================================
* THIS DOCUMENT DOESN'T CONTAIN JSDOC COMMENTS
* ALL IMPORTANT ELEMENTS ALSO APPEAR IN GAME.JS
*/ 

//
// basic conditions
// 
//
// karel's direction of view
//
var facing = {
	"north" : false,
	"south" : false,
	"west"  : false,
	"east"  : true
};
//
//beeper conditions
//
var beepers = {
	"inBag"   : false, 
	"present" : false
};
//
// wall conditions
//
var clear = {
	"front" : false,
	"left"  : false,
	"right" : false
};

//
// variable, wich shows the amount of Beepers Karel got with him
//
var countBeeper = 1000;

/*
* The variables "rows" and "columns" describe the amount of rows and columns in Karel's world.
* Effectively there's one row and one column less in Karel's world,
* because one of each is reserved for the outer walls
*/
var time = 0;
var wait = 150;
var rows = 21;
var columns = 21;
var partition;
var level =1;
var startDirection;
var startX;
var startY;
var partition;
// 
// variable defines the amount of iterations of the "for-loop"
//
var forCounter = 0;


//
// show value of slider to user
//
function showValue(newValue) {

	if (newValue === 0) {
		$('#showRange').html("&nbsp;slow&nbsp;");
		wait = 250;
	} else if (newValue === 25) {
		$('#showRange').html("&nbsp;still slow&nbsp;");
		wait = 200;
	} else if (newValue === 50) {
		$('#showRange').html("&nbsp;medium&nbsp;");
		wait = 150;
	} else if (newValue === 75) {
		$('#showRange').html("&nbsp;fast&nbsp;");
		wait = 100;
	} else if (newValue === 100) {
		$('#showRange').html("&nbsp;faster&nbsp;");
		wait = 50;
	} else if (newValue === 125) {
		$('#showRange').html("&nbsp;warp 10&nbsp;");
		wait = 25;
	}	
}



/*
* Initialisation of the position arrays for karel, beeper and wall
* Because there's a significant time differnce between computing and drawing karel's single steps through its world, 
* it's necessary for this program to get two arrays for the positions of the beeper. 
* first beeper array:  "beeper[][]"
* second beeper array: "beeperToDraw[][]" 
*
* array for computing beeper positions
* with this beeper array the program computes all positions karel has to go
*/

var beeper = new Array(columns);
for(var j=0; j<columns; j++) 
	beeper[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(var i=0; i<rows; i++) {
		beeper[j][i] = false;
	}
}

//
// array for drawing beeper positions
// with this array the program is able to draw the single steps of karel after copmuting the whole way previously
// 
var beeperToDraw = new Array(columns);
for(j=0; j<columns; j++) 
	beeperToDraw[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
		beeperToDraw[j][i] = false;
	}
}

function beeperAtStart(posX, posY) {
	beeper[posX][posY] = true;
	beeperToDraw[posX][posY] = true;
}


//
// array for karel's position		
//
var karel = new Array(columns);
for(j=0; j<columns; j++) 
	karel[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
		karel[j][i]= false;
	}
}
//
// wall array
// for vertical walls		
//
var wallV = new Array(columns);
for(j=0.5; j<columns; j++) 
	wallV[j] = new Array(rows);
for(j=0.5; j<columns; j++) {
	for(i=0; i<rows; i++)
		wallV[j][i] = false;
}
//
// wall array
// for horizontal walls		
//
var wallH = new Array(columns);
for(j=0; j<columns; j++) 
	wallH[j] = new Array(rows);
for(j=0; j<columns; j++) {
	for(i=0.5; i<rows; i++)
		wallH[j][i] = false;
}



//
// switch command to choose between the different levels and thus to set walls, beeper(s) and Karel
//
switch (level) {
	// random level
	case 0:
		rows = Math.round(Math.random() * (15-2)) + 2;
		columns = Math.round(Math.random() * (15-2)) + 2;
		
		// Karel
		startX=Math.round(Math.random() * (columns-2)) + 1;
		startY=Math.round(Math.random() * (rows-2)) + 1;
	
		var startDir = Math.round(Math.random() * (4-1)) + 1;
		if (startDir===1) {
			startDirection="east";
			facing.east = true;
			facing.west = false;
			facing.south = false;
			facing.north = false;
		} else if (startDir===2) {
			startDirection="west";
			facing.east = false;
			facing.west = true;
			facing.south = false;
			facing.north = false;
		} else if (startDir===3) {
			startDirection="south";
			facing.east = false;
			facing.west = false;
			facing.south = true;
			facing.north = false;	
		} else {
			startDirection="north";
			facing.east = false;
			facing.west = false;
			facing.south = false;
			facing.north = true;
		}
		break;
		
	// Level 1: Get the beeper
	case 1:	
		// rows and columns
		rows = 11;
		columns = 11;
		// horizontal walls
		for (i=4; i<8; i++)
			wallH[i][3.5] = true;
		for (i=4; i<8; i++)
			wallH[i][7.5] = true;
			// vertical walls	
		for (i=4; i<8; i++)
			wallV[3.5][i] = true;
		for (i=4; i<6; i++)
			wallV[7.5][i] = true;
		wallV[7.5][7] = true;
		// Beeper
		beeperAtStart(8,6);
		// Karel
		startX=4;
		startY=7;
		startDirection="east";	
		break;
		
	// Level 2: Use a Condition to get the beeper
	case 2: 
		// rows and columns
		rows = 3;
		columns = 12;
		
		// Beeper
		beeperAtStart(10,1);
		
		// Karel
		startX=1;
		startY=1;
		startDirection="east";
		break;
		
	// Level 3: Let there be beepers
	case 3:
		// rows and columns
		rows = 3;
		columns = 11;
		// Beeper
		for (i=1; i<5; i++)
			beeperAtStart(i,1);
		for (i=6; i<11; i++)
			beeperAtStart(i,1);
			// Karel
		startX=1;
		startY=1;
		startDirection="east";
		break;
		
	// Level 4: Build columns out of beepers
	case 4:
		// rows and columns
		rows = 10;
		columns = 10;
		// horizontal walls
		for (i=1; i<10; i+=4)
			wallH[i][5.5] = true;
		for (i=2; i<10; i+=2)
			wallH[i][6.5] = true;
		for (i=3; i<10; i+=4)
			wallH[i][7.5] = true;
			// vertical walls
		wallV[1.5][6] = true;
		wallV[4.5][6] = true;
		wallV[5.5][6] = true;
		wallV[8.5][6] = true;
		wallV[2.5][7] = true;
		wallV[3.5][7] = true;
		wallV[6.5][7] = true;
		wallV[7.5][7] = true;
		// Beeper
		beeperAtStart(1,4);
		beeperAtStart(1,5);
		beeperAtStart(5,1);
		beeperAtStart(5,2);
		beeperAtStart(5,4);
		beeperAtStart(9,1);
		beeperAtStart(9,3);
		beeperAtStart(9,5);
		// Karel
		startX=1;
		startY=1;
		startDirection="east";
		break;
		
	// Level 5: Make a chessfield 
	case 5:
		// rows and columns
		rows = 10;
		columns = 10;
		// Karel
		startX=1;
		startY=1;
		startDirection="east";
		break;
		
	// Level 6: Find the middle
	case 6:
		// rows and columns
		rows = 3;
		columns = 10;
		// Karel
		startX=1;
		startY=1;
		startDirection="east";
		break;
}
//
// set horizontal outer walls true
//
for(j=0; j<columns; j++) {
	for(i=0.5; i<rows; i++) {
		//
		// if-query sets horizontal outer walls
		//
		if ((i===0.5 || i===rows-0.5) && (j>0 && j<columns)){
			wallH[j][i] = true;
		} 
	}
}

for(j=0.5; j<columns; j++) {
	for(i=0; i<rows; i++) {
		//
		// if query sets vertical outer walls
		//
		if ((j===0.5 || j===columns-0.5) && (i<rows && i>0)) {
			wallV[j][i] = true;
		} 
	}
}
/*
* The variable "partition" defines the distance between the single rows and columns.
* To ensure an appropriate playing field, the minimun distance from row to row is 1/10 of the convas' window height,
* respectively the minimum distance from column to column is 1/10 of the canvas' window width.
* If there're more than 10 rows or 10 columns the distance between those will be relative to the amount of them.
* e.g. If there're 20 rows, the distance beween those will be 1/20 of the canvas' window height.
*/

if ((rows>11) || (columns>11)) {
	if (rows > columns) {
		partition = rows;
	} else {
		partition = columns;
	}
} else {
	partition = 11;
}



//
// funtion which returns true if there's no wall on particular position
//
function frontIsClear() {
	return clear.front;
}
function leftIsClear() {
	return clear.left;
}
function rightIsClear() {
	return clear.right;
}


function frontIsBlocked() {
	return !clear.front;
}

function leftIsBlocked() {
	return !clear.left;
}

function rightIsBlocked() {
	return !clear.right;
}
var imgKarel = new Image();

/*
* draw function
* arguments: "karelX, karelY" represent the X and Y coordinate-
* arguments: "north, south, west, east" give informations to the draw function about Karel's viewing direction .
*/
function draw(karelX, karelY, direction) {	
	var canvas = document.getElementById("ausgabe");
	canvas.width = $("#rightScreen").width()-10;
	canvas.height = $("#rightScreen").height()-10;
	//
	// Check if the browser is able to display the canvas content. 
	// If not, a short alert message appears that the browser is unable to display canvas.
	//
	if (canvas.getContext) {
		var c = canvas.getContext("2d");
		//
		// clears the entire drawing area of canvas to draw a new scenery.
		//
		c.clearRect(0,0,canvas.width,canvas.height);
		/*
		* check every single position of the playing field if there's anything to draw.
		* at first, the draw function draws the playing field including the numbering and the coordinates.
		* Then the walls will be drawn, and after that the beeper(s).
		* At last, Karel itself will be drawn.
		* "j" depicts the x-axis' direction and "i" the y-axis' direction
		*/
		for (j=0; j<columns; j++) {
			for (i=0; i<rows; i++) {
				//
				// draw the X-axis' numbering
				//
				if (i===0 && j<columns) {
					c.fillStyle = "#000";
					c.font = "Arial";
					c.textBaseline = 'bottom';
					c.fillText (j,(j+0.5)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height);
				}
				//
				// draw the Y-axis' numbering
				//
				if (j===0 && i<rows) {
					c.fillStyle = "#000";
					c.font = "Arial";
					c.textBaseline = 'bottom';
					c.fillText (i,(j+0.5)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height);
				}	
				//
				// draw little crosses for the coordinate system
				//
				if ((j>0 && j<columns) && (i>0 && i< rows)){
					c.strokeStyle = "#000";
					c.lineWidth = 1;
					c.beginPath();
					//
					// horizontal lines of the coordinates' crosses
					//
					c.moveTo((j+0.5)/(partition)*canvas.width - 2.5, (partition-(i))/(partition)*canvas.height);
					c.lineTo((j+0.5)/(partition)*canvas.width + 2.5, (partition-(i))/(partition)*canvas.height);
					//
					// vertical lines of the coordinates' crosses
					//
					c.moveTo((j+0.5)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height -2.5);
					c.lineTo((j+0.5)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height +2.5);
					c.stroke();		
				}
				//
				// draw vertical walls
				//
				if (wallV[j+0.5][i]) {
					c.strokeStyle = "#000";
					c.lineWidth = 1;
					c.beginPath();
					c.moveTo((j+1)/(partition)*canvas.width, (partition-(i+0.5))/(partition)*canvas.height);
					c.lineTo((j+1)/(partition)*canvas.width, (partition-(i-0.5))/(partition)*canvas.height);
					c.stroke();
				}
				//
				// draw horizontal walls
				//
				if (wallH[j][i+0.5]) {
					c.strokeStyle = "#000";
					c.lineWidth = 1;
					c.beginPath();
					c.moveTo((j+1)/(partition)*canvas.width, (partition-(i+0.5))/(partition)*canvas.height);
					c.lineTo((j)/(partition)*canvas.width,   (partition-(i+0.5))/(partition)*canvas.height);
					c.stroke();
				}
				//
				// check position of beeper(s) and draw beeper
				//
				if (beeperToDraw[j][i]) {
					c.fillStyle = "#bbb"; //grey
					c.strokeStyle = "#000"; //black
					c.lineWidth = 2;
					c.beginPath();
					c.moveTo((j+0.5)/(partition)*canvas.width,  (partition-(i+0.25))/(partition)*canvas.height);
					c.lineTo((j+0.25)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height);
					c.lineTo((j+0.5)/(partition)*canvas.width,  (partition-(i-0.25))/(partition)*canvas.height);
					c.lineTo((j+0.75)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height);
					c.closePath();
					c.fill();
					c.stroke();
				}
			}
		}

	//
	// the short alert message that shows that the browser is unable to display canvas
	//
	} else
		alert("You're not able to play 'Karel the robot' with your current browser. Please switch browser.");

	
	if (direction === "north") 
		imgKarel.src = "../images/karelNorth.png";
	else if (direction === "south")
		imgKarel.src = "../images/karelSouth.png";
	else if (direction === "west") 
		imgKarel.src = "../images/karelWest.png";
	else
		imgKarel.src = "../images/karelEast.png";
		
	c.drawImage(imgKarel,(karelX+0.15)/(partition)*canvas.width, (partition-(karelY+0.5))/(partition)*canvas.height, 1/partition*canvas.height, 1/partition*canvas.height);	
}	

//
// All images will be loaded in the memory before the first call up 
// Source: http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml
//
function preloadimages(arr){
	var newimages=[], loadedimages=0;
	arr=(typeof arr!=="object")? [arr] : arr;

    function imageloadpost(){
		loadedimages++;
    }
	for (var i=0; i<arr.length; i++){
        newimages[i]=new Image();
        newimages[i].src=arr[i];
        newimages[i].onload=function(){
            imageloadpost();
        };
        newimages[i].onerror=function(){
        imageloadpost();
        };
    }
}
// sample run
preloadimages(['../images/karelEast.png','../images/karelWest.png','../images/karelSouth.png','../images/karelNorth.png','../images/glyphicons-halflings-white.png']);


//
// windowLoad()
// only called once at the very beginning of the game to initialise karel's position and its scenery
//
function windowLoad() {
	draw(startX, startY, startDirection);
	karel[startX][startY] = true;
//	checkWallAround(startX, startY);
//	checkBeepersPresent(startX, startY);
//	loadDatabase();
}
//
// we don't use "$(document).ready(...)" because at this time, no images are loaded
//
$(window).load(function(){
	windowLoad();
});

//
// initalise popovers before first call up
//
$('#queries').popover();
$('#conditions').popover();
$('#negConditions').popover();
$('#basics').popover();
$('#ownFunctions').popover();



// ================= Initilization of basics popovers  =====================

$('#basicsSurr').popover({
	html: true,
	title: "Basics",
	content: "Here you can find the four basic actions Karel is already able to perform.<hr> To learn more about each single action just click on the corresponding button.",
	placement: 'right'
});

$('#moveInfo').popover({
	html: true,
	title: "move",
	content: "The move function can be used to order Karel to do one single step.",
	placement: 'move'
});

$('#turnLeftInfo').popover({
	html: true,
	title: "turnLeft",
	content: "With this function you can order Karel to do a 90° rotation to the left.",
	placement: 'turnLeft'
});

$('#pickBeeperInfo').popover({
	html: true,
	title: "pickBeeper",
	content: "Use this function if you want Karel to pick up a beeper. If there is no beeper, he won't do nothing.",
	placement: 'pickBeeper'
});

$('#putBeeperInfo').popover({
	html: true,
	title: "putBeeper",
	content: "If you want Karel to put down a beeper on his current position use putBeeper",
	placement: 'putBeeper'
});

$('#braceleft_LInfo').popover({
	html: true,
	title: "braceleft",
	content: "If you want to write more than one function within a query, you have to use braces. If you don't do that, the query will only perform the very next function. See the difference by means of the following examples:<hr>for(var i=0; i<5; i++)&emsp;&#123;<br>&emsp;move();<br>&emsp;putBeeper();<br>&#125;<br><br>By using the braces, Karel will perform five steps and put down a beeper on each position.<br>Without the braces, Karel would perform five steps and after that he would put down one beeper on his final position.<br><br><b>Watch out!</b><br>Only put basic functions and your own ones in parentheses.",
	placement: 'braceleft_L'
});

$('#braceright_LInfo').popover({
	html: true,
	title: "braceright",
	content: "If you want to write more than one function within a query, you have to use braces. If you don't do that, the query will only perform the very next function. See the difference by means of the following examples:<hr>for(var i=0; i<5; i++)&emsp;&#123;<br>&emsp;move();<br>&emsp;putBeeper();<br>&#125;<br><br>By using the braces, Karel will perform five steps and put down a beeper on each position.<br>Without the braces, Karel would perform five steps and after that he would put down one beeper on his final position.<br><br><b>Watch out!</b><br>Only put basic functions and your own ones in parentheses.",
	placement: 'braceright_L'
});


// ================= Initilization of queries popovers  =====================

$('#queriesSurr').popover({
	html: true,
	title: "Queries",
	content: "Queries or also called control statements are used if you want Karel to do something, but only under certain circumstances.<hr> Therto it distinguishes between branches and loops.<br>A branch checks a condition only once and also perform the action that is within this query only once.<br><br>Whereas a loop checks a condition until it is false and so long it will repeat the action within the loop. ",
	placement: 'queriesSurr'
});

$('#ifInfo').popover({
	html: true,
	title: "if",
	content: "If you want Karel e.g. to move but only if he stands on a beeper, this can be done by using an 'if-query'.<hr> if( beepersPresent() )<br>&emsp;move();<hr> The query above checks if there's a beeper on Karel's position. If so, Karel will do a single step forward. If not, nothing will happen.",
	placement: 'if'
});

$('#elseInfo').popover({
	html: true,
	title: "else",
	content: "The 'else-query' is opposite of the 'if-query'. If the 'if-query' isn't true, the 'else-query' will be accomplished; e.g. Karel will move, if there's no wall in front of him. Otherwise he shall turn to the left:<hr>if( frontIsClear() )<br>&emsp;move();<br>else<br>&emsp;turnLeft();<hr>If there's no wall in front of Karel, he will only do a single step, but he will not turn to the left.",
	placement: 'else'
});

$('#forInfo').popover({
	html: true,
	title: "for",
	content: "With the 'for-loop' an action can be repeated up to 10 times. For instance if you want Karel to to do five steps you can either write five times move or more comfortable use the 'for-loop'.<hr>for(var i=0; i<5; i++)<br>&emsp;move();<hr>The 'for-loop' above defines a variable 'i' and assigns it the value '0'. After each iteration and performing the actions within the loop, 'i' counts one up. If 'i'=5 the loop cancels, because only values smaller than 5 are permitted in this example.",
	placement: 'for'
});

$('#whileInfo').popover({
	html: true,
	title: "while",
	content: "The 'while-loop' is simmilar to the 'if-query'. It checks a condition and if the condition is true, the function within the loop will be performed. Otherwise not.<br> But the big difference is that the 'while-loop' checks the condition repeatedly until it becomes false. Only then it also stops with executing the functions within.",
	placement: 'while'
});

$('#bitAndInfo').popover({
	html: true,
	title: "&&",
	content: "This is the AND-Operator.<br>If you want to check more than one condition, e.g. if Karel is facing west and standing on a beeper, these conditions can be combined by the AND-Operator as follows:<hr>if( facingWest() && beepersPresent() )<br>&emsp;move();<hr>Both conditions have to be true, otherwise Karel won't move.<br><br><b>Watch out!",
	placement: 'bitAnd'
});

$('#bitOrInfo').popover({
	html: true,
	title: "| |",
	content:"This is the OR-Operator.<hr>if( facingWest() || beepersPresent() )<br>&emsp;move();<hr>It also checks more than one condition, but the big difference to the AND-Operator is, that Karel will move if at least one condition is true. Only if none of them is true, he won't move.",
	placement: 'bitOr'
});



// ================= Initilization of conditions popovers  =====================

$('#conditionsSurr').popover({
	html: true,
	title: "Conditions",
	content: "Conditions are used in combination with queries. They can only be true or false.",
	placement: 'right'
});

$('#frontIsClearInfo').popover({
	html: true,
	title: "frontIsClear",
	content: "Is true if there's no wall in front of Karel; if so, the condition is false.",
	placement: 'frontIsClear'
});

$('#leftIsClearInfo').popover({
	html: true,
	title: "leftIsClear",
	content: "Is true if there's no wall to Karel's left; if so, the condition is false.",
	placement: 'leftIsClear'
});

$('#rightIsClearInfo').popover({
	html: true,
	title: "rightIsClear",
	content: "Is true if there's no wall to Karel's right; if so, the condition is false.",
	placement: 'rightIsClear'
});

$('#beepersPresentInfo').popover({
	html: true,
	title: "beepersPresent",
	content: "Is true if there's a beeper on Karel's position; if not, the condition is false.",
	placement: 'beepersPresent'
});

$('#beepersInBagInfo').popover({
	html: true,
	title: "beepersInBag",
	content: "Is true if Karel picked up at least one beeper; if not, the condition is false.",
	placement: 'beepersInBag'
});

$('#facingNorthInfo').popover({
	html: true,
	title: "facingNorth",
	content: "Is true if Karel's view is north-facing; if not, the condition is false.",
	placement: 'facingNorth'
});

$('#facingEastInfo').popover({
	html: true,
	title: "facingEast",
	content: "Is true if Karel's view is east-facing; if not, the condition is false.",
	placement: 'facingEast'
});

$('#facingSouthInfo').popover({
	html: true,
	title: "facingSouth",
	content: "Is true if Karel's view is south-facing; if not, the condition is false.",
	placement: 'facingSouth'
});

$('#facingWestInfo').popover({
	html: true,
	title: "facingWest",
	content: "Is true if Karel's view is west-facing; if not, the condition is false.",
	placement: 'facingWest'
});

// ================= Initilization of negativ conditions popovers  =====================
$('#negConditionsSurr').popover({
	html: true,
	title: "Negativ conditions",
	content: "Negativ conditions are used in combination with queries. They are the exact opposites of the conditions. They can only be true or false.",
	placement: 'left'
});

$('#frontIsBlockedInfo').popover({
	html: true,
	title: "frontIsBlocked",
	content: "Is true if there's a wall in front of Karel; if not, the condition is false.",
	placement: 'frontIsBlocked'
});

$('#leftIsBlockedInfo').popover({
	html: true,
	title: "leftIsBlocked",
	content: "Is true if there's a wall to Karel's left; if not, the condition is false.",
	placement: 'leftIsBlocked'
});

$('#rightIsBlockedInfo').popover({
	html: true,
	title: "rightIsBlocked",
	content: "Is true if there's no wall to Karel's right; if not, the condition is false.",
	placement: 'rightIsBlocked'
});

$('#noBeepersPresentInfo').popover({
	html: true,
	title: "noBeepersPresent",
	content: "Is true if there's no beeper on Karel's position; if so, the condition is false.",
	placement: 'noBeepersPresent'
});

$('#noBeepersInBagInfo').popover({
	html: true,
	title: "noBeepersInBag",
	content: "Is true if Karel picked up no beeper; if so, the condition is false.",
	placement: 'noBeepersInBag'
});

$('#notFacingNorthInfo').popover({
	html: true,
	title: "notFacingNorth",
	content: "Is true if Karel's view is not north-facing; if so, the condition is false.",
	placement: 'notFacingNorth'
});

$('#notFacingEastInfo').popover({
	html: true,
	title: "notFacingEast",
	content: "Is true if Karel's view is not east-facing; if so, the condition is false.",
	placement: 'notFacingEast'
});

$('#notFacingSouthInfo').popover({
	html: true,
	title: "notFacingSouth",
	content: "Is true if Karel's view is not south-facing; if so, the condition is false.",
	placement: 'notFacingSouth'
});

$('#notFacingWestInfo').popover({
	html: true,
	title: "notFacingWest",
	content: "Is true if Karel's view is not west-facing; if so, the condition is false.",
	placement: 'notFacingWest'
});


// ================= Initilization of own functions popovers  =====================
$('#ownFunctionsSurr').popover({
	html: true,
	title: "Own functions",
	content: "Your written by yourself functions will appear here.",
	placement: 'left'
});

$('#deleteOwnFunctionInfo').popover({
	html: true,
	title: "deleteOwnFunction",
	content: "If you want to delete one of your own functions, just click on this delete button. By clicking, a popover appears showing you that you're now able to delete any function.<br><br><b>Watch out!</b><br>Each function you click on now will be deleted. If you're done, either click on the 'delete' or on the 'Your functions' button",
	placement: 'deleteOwnFunction'
});

$('#editOwnFunctionInfo').popover({
	html: true,
	title: "editOwnFunction",
	content: "If you want to edit one of your own functions, just click on this edit button. By clicking, a popover appears showing you that you're now able to edit any function. Now just click on the function you want to edit. Your function appears to the left in the textarea. You're now able to edit your function as desired.<br><br><b>Watch out!</b><br>After editing you have to save your function again. If you don't do this, your whole function will be deleted.",
	placement: 'editOwnFunction'
});

$('#braceleft_RInfo').popover({
	html: true,
	title: "braceleft",
	content: "If you want to write more than one function within a query, you have to use braces. If you don't do that, the query will only perform the very next function. See the difference by means of the following examples:<hr>for(var i=0; i<5; i++)&emsp;&#123;<br>&emsp;move();<br>&emsp;putBeeper();<br>&#125;<br><br>By using the braces, Karel will perform five steps and put down a beeper on each position.<br>Without the braces, Karel would perform five steps and after that he would put down one beeper on his final position.<br><br><b>Watch out!</b><br>Only put basic functions and your own ones in parentheses.",
	placement: 'braceleft_R'
});

$('#braceright_RInfo').popover({
	html: true,
	title: "braceright",
	content: "If you want to write more than one function within a query, you have to use braces. If you don't do that, the query will only perform the very next function. See the difference by means of the following examples:<hr>for(var i=0; i<5; i++)&emsp;&#123;<br>&emsp;move();<br>&emsp;putBeeper();<br>&#125;<br><br>By using the braces, Karel will perform five steps and put down a beeper on each position.<br>Without the braces, Karel would perform five steps and after that he would put down one beeper on his final position.<br><br><b>Watch out!</b><br>Only put basic functions and your own ones in parentheses.",
	placement: 'braceright_R'
});

// ================= Initilization of control panel  =====================
$('#functionNameInfo').popover({
	html: true,
	title: "Function Name",
	content: "You can write the name of your function into this field.",
	placement: 'right'
});

$('#textareaInfo').popover({
	html: true,
	title: "Function Content",
	content: "This text area contains the whole code you write by clicking on the buttons to the right. If you want to insert code at a certain position of your written code just click on that position.",
	placement: 'right'
});

$('#rngInfo').popover({
	html: true,
	title: "Speed",
	content: "Here you can adjust the game speed.",
	placement: 'right'
});

$('#startInfo').popover({
	html: true,
	title: "Start",
	content: "Click this button and Karel will execute your code.",
	placement: 'right'
});

$('#saveFuncInfo').popover({
	html: true,
	title: "Save",
	content: "Click this button to save your function. Don't forget the function title.",
	placement: 'right'
});

$('#clearFuncInfo').popover({
	html: true,
	title: "Clear",
	content: "Click this button to clear the textarea.",
	placement: 'right'
});


// ================= Initilization of navigation and info menu  =====================
$('#homeInfo').popover({
	html: true,
	title: "Home",
	content: "If you want to go back to the home screen, click the home button.<hr>Do you? <button type='button' class='btn' id='homeConfirm'>Yes</button>",
	placement: 'home'
});

$('#infoInfo').popover({
	html: true,
	title: "Info",
	content: "Here you can find information about the levels aim.",
	placement: 'info'
});

$('#resetInfo').popover({
	html: true,
	title: "Reset",
	content: "Click here if you want to reset the level.",
	placement: 'reset'
});
// 
// animates the textarea
//
$(function(){
	$('.animated').autosize();
});

/*
* Popover for the selection buttons
* only one popover can be opened at once
* also hide all popovers by clicking the start button or saveFunc button
*/
$(document).bind("click", function(e) {
	
// ===========  Popover for the button "Queries" and its sub-buttons  =============			
	if (e.target.id==="queries") {
		$('button[id$="s"][id!=queries]').popover('hide');
		$('span[id$="Info"]').popover('hide');
		$('span[id$="Surr"][id!="queriesSurr"]').popover('hide');
		$('#queriesSurr').popover('toggle');
		
	} else if (e.target.id==='if') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="ifInfo"]').popover('hide');
		$('#ifInfo').popover('toggle');
		
	} else if (e.target.id==='else') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="elseInfo"]').popover('hide');
		$('#elseInfo').popover('toggle');
		
	} else if (e.target.id==='for') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="forInfo"]').popover('hide');
		$('#forInfo').popover('toggle');
		
	} else if (e.target.id==='while') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="whileInfo"]').popover('hide');
		$('#whileInfo').popover('toggle');
		
	} else if (e.target.id==='bitAnd') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="bitAndInfo"]').popover('hide');
		$('#bitAndInfo').popover('toggle');
		
	} else if (e.target.id==='bitOr') {
		$('#queriesSurr').popover('hide');
		$('span[id$="Info"][id!="bitOrInfo"]').popover('hide');
		$('#bitOrInfo').popover('toggle');
	
		
// ===========  Popover for the button "Conditions" and its sub-buttons
	} else if (e.target.id==="conditions") {
		$('button[id$="s"][id!=conditions]').popover('hide');
		$('span[id$="Info"]').popover('hide');
		$('span[id$="Surr"][id!="conditionsSurr"]').popover('hide');
		$('#conditionsSurr').popover('toggle');
		
	} else if (e.target.id==='frontIsClear') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="frontIsClearInfo"]').popover('hide');
		$('#frontIsClearInfo').popover('toggle');
		
	} else if (e.target.id==='leftIsClear') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="leftIsClearInfo"]').popover('hide');
		$('#leftIsClearInfo').popover('toggle');
		
	} else if (e.target.id==='rightIsClear') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="rightIsClearInfo"]').popover('hide');
		$('#rightIsClearInfo').popover('toggle');
		
	} else if (e.target.id==='beepersPresent') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="beepersPresentInfo"]').popover('hide');
		$('#beepersPresentInfo').popover('toggle');
		
	} else if (e.target.id==='beepersInBag') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="beepersInBagInfo"]').popover('hide');
		$('#beepersInBagInfo').popover('toggle');
		
	} else if (e.target.id==='facingNorth') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="facingNorthInfo"]').popover('hide');
		$('#facingNorthInfo').popover('toggle');
		
	} else if (e.target.id==='facingEast') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="facingEastInfo"]').popover('hide');
		$('#facingEastInfo').popover('toggle');
		
	} else if (e.target.id==='facingSouth') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="facingSouthInfo"]').popover('hide');
		$('#facingSouthInfo').popover('toggle');
		
	} else if (e.target.id==='facingWest') {
		$('#conditionsSurr').popover('hide');
		$('span[id$="Info"][id!="facingWestInfo"]').popover('hide');
		$('#facingWestInfo').popover('toggle');


// ===========  Popover for the button "Negativ Conditions" and its sub-buttons
	} else if (e.target.id==="negConditions") {
		$('button[id$="s"][id!=negConditions]').popover('hide');
		$('span[id$="Info"]').popover('hide');
		$('span[id$="Surr"][id!="negConditionsSurr"]').popover('hide');
		$('#negConditionsSurr').popover('toggle');
		
	} else if (e.target.id==='frontIsBlocked') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="frontIsBlockedInfo"]').popover('hide');
		$('#frontIsBlockedInfo').popover('toggle');
		
	} else if (e.target.id==='leftIsBlocked') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="leftIsBlockedInfo"]').popover('hide');
		$('#leftIsBlockedInfo').popover('toggle');
		
	} else if (e.target.id==='rightIsBlocked') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="rightIsBlockedInfo"]').popover('hide');
		$('#rightIsBlockedInfo').popover('toggle');
		
	} else if (e.target.id==='noBeepersPresent') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="noBeepersPresentInfo"]').popover('hide');
		$('#noBeepersPresentInfo').popover('toggle');
		
	} else if (e.target.id==='noBeepersInBag') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="noBeepersInBagInfo"]').popover('hide');
		$('#noBeepersInBagInfo').popover('toggle');
		
	} else if (e.target.id==='notFacingNorth') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="notFacingNorthInfo"]').popover('hide');
		$('#notFacingNorthInfo').popover('toggle');
		
	} else if (e.target.id==='notFacingEast') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="notFacingEastInfo"]').popover('hide');
		$('#notFacingEastInfo').popover('toggle');
		
	} else if (e.target.id==='notFacingSouth') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="notFacingSouthInfo"]').popover('hide');
		$('#notFacingSouthInfo').popover('toggle');
		
	} else if (e.target.id==='notFacingWest') {
		$('#negConditionsSurr').popover('hide');
		$('span[id$="Info"][id!="notFacingWestInfo"]').popover('hide');
		$('#notFacingWestInfo').popover('toggle');


// ===========  Popover for the button "Basics" and its sub-buttons  =============		
	} else if (e.target.id==="basics") {
		$('button[id$="s"][id!=basics]').popover('hide');
		$('span[id$="Info"]').popover('hide');
		$('span[id$="Surr"][id!="basicsSurr"]').popover('hide');
		$('#basicsSurr').popover('toggle');

	} else if (e.target.id==='move') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="moveInfo"]').popover('hide');
		$('#moveInfo').popover('toggle');	
		
	} else if (e.target.id==='turnLeft') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="turnLeftInfo"]').popover('hide');
		$('#turnLeftInfo').popover('toggle');
		
	} else if (e.target.id==='pickBeeper') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="pickBeeperInfo"]').popover('hide');
		$('#pickBeeperInfo').popover('toggle');
		
	} else if (e.target.id==='putBeeper') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="putBeeperInfo"]').popover('hide');
		$('#putBeeperInfo').popover('toggle');
		
	} else if (e.target.id==='braceleft_L') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="braceleft_LInfo"]').popover('hide');
		$('#braceleft_LInfo').popover('toggle');
		
	} else if (e.target.id==='braceright_L') {
		$('#basicsSurr').popover('hide');
		$('span[id$="Info"][id!="braceright_LInfo"]').popover('hide');
		$('#braceright_LInfo').popover('toggle');

		

// ===========  Popover for the button "own functions" and its sub-buttons  =============			
	} else if (e.target.id==='ownFunctions') {
		$('button[id$="s"][id!=ownFunctions]').popover('hide');
		$('span[id$="Info"]').popover('hide');
		$('span[id$="Surr"][id!="ownFunctionsSurr"]').popover('hide');
		$('#ownFunctionsSurr').popover('toggle');
		
	} else if (e.target.id==='deleteOwnFunction') {
		$('#ownFunctionsSurr').popover('hide');
		$('span[id$="Info"][id!="deleteOwnFunctionInfo"]').popover('hide');
		$('#deleteOwnFunctionInfo').popover('toggle');
		
	} else if (e.target.id==='editOwnFunction') {
		$('#ownFunctionsSurr').popover('hide');
		$('span[id$="Info"][id!="editOwnFunctionInfo"]').popover('hide');
		$('#editOwnFunctionInfo').popover('toggle');
		
	} else if (e.target.id==='braceleft_R') {
		$('#ownFunctionsSurr').popover('hide');
		$('span[id$="Info"][id!="braceleft_RInfo"]').popover('hide');
		$('#braceleft_RInfo').popover('toggle');
		
	} else if (e.target.id==='braceright_R') {
		$('#ownFunctionsSurr').popover('hide');
		$('span[id$="Info"][id!="braceright_RInfo"]').popover('hide');
		$('#braceright_RInfo').popover('toggle');


		

// ===========  Popover for the control panel  =============				
	} else if (e.target.id==='start') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="startInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#startInfo').popover('toggle');
		
	} else if (e.target.id==='saveFunc') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="saveFuncInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#saveFuncInfo').popover('toggle');
		
	} else if (e.target.id==='clearFunc') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="clearFuncInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#clearFuncInfo').popover('toggle');
		
	} else if (e.target.id==='functionName') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="functionNameInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#functionNameInfo').popover('toggle');
		
	} else if (e.target.id==='textarea') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="textareaInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#textareaInfo').popover('toggle');
		
	} else if ((e.target.id==='rng')||(e.target.id==='showRange')) {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="rngInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#rngInfo').popover('toggle');

// ===========  Popover for the navigation and info buttons  =============			
	}else if (e.target.id==="buttonBack") {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="homeInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#homeInfo').popover('toggle');

	} else if (e.target.id==='buttonInfo') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="infoInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#infoInfo').popover('toggle');

	} else if (e.target.id==='buttonReset') {
		$('button[id$="s"]').popover('hide');
		$('span[id$="Info"][id!="resetInfo"]').popover('hide');
		$('span[id$="Surr"]').popover('hide');
		$('#resetInfo').popover('toggle');		
		
	} else if (e.target.id==='homeConfirm') {
		this.location.href="./karel_home.html";
	
	} else {
		$('*').popover('hide');
	}
});

