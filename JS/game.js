/*
* +++ ANDROID FIX +++
* fix Android indexedDB problem
* Keine (aktuelle) Implementierung von Indexed DB vorhanden?
*/
var requireShim = typeof window.IDBVersionChangeEvent == 'undefined';

// WebSQL vorhanden?
var supportsWebSql = typeof window.openDatabase != 'undefined';

if(requireShim && supportsWebSql){
  window.shimIndexedDB.__useShim(); // Verwendung des Polyfills erwzingen
}

//
// basic conditions
// 
//
// karel's direction of view
//
facing = {
	"north" : false,
	"south" : false,
	"west"  : false,
	"east"  : true
}
//
//beeper conditions
//
beepers = {
	"inBag"   : false, 
	"present" : false
}
//
// wall conditions
//
clear = {
	"front" : false,
	"left"  : false,
	"right" : false
}

//
// show value of slider to user
//
function showValue(newValue) {

	if (newValue == 0) {
		$('#showRange').html("&nbsp;slow&nbsp;");
		wait = 250;
	} else if (newValue == 25) {
		$('#showRange').html("&nbsp;still slow&nbsp;");
		wait = 200;
	} else if (newValue == 50) {
		$('#showRange').html("&nbsp;medium&nbsp;");
		wait = 150;
	} else if (newValue == 75) {
		$('#showRange').html("&nbsp;fast&nbsp;");
		wait = 100;
	} else if (newValue == 100) {
		$('#showRange').html("&nbsp;faster&nbsp;");
		wait = 50;
	} else if (newValue == 125) {
		$('#showRange').html("&nbsp;warp 10&nbsp;");
		wait = 25;
	}	
}

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

// 
// var liste receives all variables from text input of home screen
//
var liste = storage.getAll();
for (i in liste) {
	var level = parseInt(liste["level"]);
	var speed = parseInt(liste["speed"]);
	var skill = liste["skill"];
	
}

//
// variable that contains the content the "basics" popover
// it has to be in this unorganized structure, otherwise JS will not accept the string
//
var functionToButton = '<div class="structure"><span>braces</span></div><br><div class="btn-group"><button type="button" class="btn btn-default braces" value="{" id="braceleft_R">{</button><button type="button" class="btn btn-default braces" value="}" id="braceright_R">}</button></div><br><br><div class="structure"><span>delete/edit</span><br></div><br><div class="btn-group"><button type="button" class="btn btn-danger" data-toggle="button" value="" id="deleteOwnFunction" rel="popover" data-content="!!!&nbsp;Warning&nbsp;!!!" data-placement="top"><i class="icon-trash icon-white"></i> delete</button><button type="button" class="btn btn-warning" data-toggle="button" value="" id="editOwnFunction" rel="popover" data-content="!!!&nbsp;Edit&nbsp;!!!" data-placement="top"><i class="icon-pencil icon-white"></i> edit</button></div><br><br><div class="structure"><span>own functions</span><br></div>';

var forLoop = 'Hello';
//
// generates a new button for action selection.
// automatically gives the button the name of the self made function.
//
function newButton(title) {
	functionToButton += '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+title+'" value="'+title+'()">'+title+'</button>';
	
	// **** NOT NECESSARY ANYMORE *****
	// $(document).bind("click", function(e) {
	// 			$('#newBtn').text(title).attr('id', title).val(title + '()');
	// 	})
}


/*
* This function allows the user to dynamically create new functions within the game.
* it uses the name within the textfield given by the user to generate a function,
* this new function gets the content of the textarea below.
*/ 
function saveFunction() {
	
	var title = $('#functionName').val();
	var content = $('#textarea').val();
	
	window[title] = new Function(content);
	
	$('#functionName').val('');
	$('#textarea').val('').trigger('autosize.resize');
	cursorPos == null;
	
	newButton(title);
	
	// Datenbank anlegen
	var request = indexedDB.open('html5', 1);

	// Änderungs/Erzeugungs-Event
	request.onupgradeneeded = function(){
		console.log('Datenbank angelegt');
		var db = this.result;
		if(!db.objectStoreNames.contains('features')){
			store = db.createObjectStore('features', {
	      		keyPath: 'key',
	     		autoIncrement: true
	    	});
	  	}
	};

	// Öffnungs-Event (feuert nach upgradeneeded)
	request.onsuccess = function(){
		console.log('Datenbank geöffnet');
		var db = this.result;

		// Zu speichernder Datensatz
		var item = { 
			title: title,
	 		content: content
		};

		// Speicher-Transaktion
		var trans = db.transaction(['features'], 'readwrite');
		var store = trans.objectStore('features')
		var request = store.put(item); // `item` in dem Store ablegen

		// Erfolgs-Event
		request.onsuccess = function(counter){
		console.log('Eintrag ' + counter.target.result + ' gespeichert');
/*
	    	// Auslese-Transaktion
		    var trans = db.transaction(['features'], 'readonly');
		    var store = trans.objectStore('features');

		    // Cursor für alle Einträge von 0 bis zum Ende
		    var range = IDBKeyRange.lowerBound(0);
		    var cursorRequest = store.openCursor(range);

		    // Wird für jeden gefundenen Datensatz aufgerufen... und einmal extra
		    cursorRequest.onsuccess = function(e){
			var result = e.target.result;
			if(result){
		    	console.log('Eintrag gefunden:', result.value);
			
				// creates new function and new button
				window[result.value.title] = new Function(result.value.content);
				newButton(result.value.title);
		
			//  console.log(result.value.title);
			//	console.log(result.value.content);

		        // Eintrag wieder löschen
		        var trans = db.transaction(['features'], 'readwrite');
		        var store = trans.objectStore('features');
		        // var key = result.value.key;	
				var request = store.delete(counter.target.result);
		        
				request.onsuccess = function(){
		        	console.log('Eintrag ' + counter.target.result + ' gelöscht');
		        }

		        // Cursor zum nächsten Eintrag bewegen
		        result.continue();

				}
			};
			*/
		};
	}
}

//
// function belongs to "Clear" button and is called by clicking on on the same
// clears the entire textarea and text field of function name
// 
function clearTextarea() {
	$('#functionName').val('');
	$('#textarea').val('').trigger('autosize.resize');
	cursorPos = null;
}
//
// dynamically match popover to button "your functions", so popover will be updated with own functions
//
$('#ownFunctions').popover({
	placement: 'bottom',
	html: true,
	content: function() { 
		return functionToButton; 
	} 
});

var z=1;

/*
* Initialisation of the position arrays for karel, beeper and wall 
* Falls eine Postition im Array "true" ist, ist diese belegt, ansonsnten leer.	
*
* Because there's a significant time differnce between computing and drawing karel's single steps through its world, 
* it's necessary for this program to get two arrays for the positions of the beeper. 
* first beeper array:  "beeper[][]"
* second beeper array: "beeperToDraw[][]" 
*
* array for computing beeper positions
* with this beeper array the program computes all positions karel has to go
*/

var beeper = new Array(columns);
for(j=0; j<columns; j++) 
	beeper[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
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
	wallV[j] = new Array(rows)
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
	wallH[j] = new Array(rows)
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
		if (startDir==1) {
			startDirection="east";
			facing.east = true;
			facing.west = false;
			facing.south = false;
			facing.north = false;
		} else if (startDir==2) {
			startDirection="west";
			facing.east = false;
			facing.west = true;
			facing.south = false;
			facing.north = false;
		} else if (startDir==3) {
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
		if ((i==0.5 || i==rows-0.5) && (j>0 && j<columns)){
			wallH[j][i] = true;
		} else {
		//	wallH[j][i] = false;
		}
	}
}

for(j=0.5; j<columns; j++) {
	for(i=0; i<rows; i++) {
		//
		// if query sets vertical outer walls
		//
		if ((j==0.5 || j==columns-0.5) && (i<rows && i>0)) {
			wallV[j][i] = true;
		} else {
			//wallV[j][i] = false;
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
// basic functions karel know
//
function move() {
	//
	//  check karel's position
	//		
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			if (karel[j][i] && facing.east && wallV[j+0.5][i]==false) {
				// previous position became false, so Karel will not be showed on this spot anymore
				karel[j][i] = false;
				j+=1;
				if (beeper[j][i]) {
					beepers.present = true;
				} else { 
					beepers.present = false;
				}
				karel[j][i] = true;	
				checkWallAround(j,i);	
				time += wait;
				setTimeout(draw, time, j , i, "east");
				//draw(j,i);					
			} else if (karel[j][i] && facing.west && wallV[j-0.5][i]==false) {
				// previous position became false, so Karel will not be showed on this spot anymore
				karel[j][i] = false;
				j-=1;
				if (beeper[j][i]) {
					beepers.present = true;
				} else { 
					beepers.present = false;
				}
				karel[j][i] = true;	
				checkWallAround(j,i);	
				time += wait;
				setTimeout(draw, time, j , i, "west");
				//draw(j,i);
				
			} else if (karel[j][i] && facing.north && wallH[j][i+0.5]==false) {
				// previous position became false, so Karel will not be showed on this spot anymore
				karel[j][i] = false;
				i+=1;
				if (beeper[j][i]) {
					beepers.present = true;
				} else { 
					beepers.present = false;
				}
				karel[j][i] = true;	
				checkWallAround(j,i);	
				time += wait;
				setTimeout(draw, time, j , i, "north");
				//draw(j,i);					
				
			} else if (karel[j][i] && facing.south && wallH[j][i-0.5]==false) {
				// previous position became false, so Karel will not be showed on this spot anymore
				karel[j][i] = false;
				i-=1;
				if (beeper[j][i]) {
					beepers.present = true;
				} else { 
					beepers.present = false;
				}
				karel[j][i] = true;	
				checkWallAround(j,i);	
				time += wait;
				setTimeout(draw, time, j , i, "south");
				//draw(j,i);
			}		
		}	
	}				
}

function turnLeft() {
	if (facing.north) {
		//setTimeout('facing.north  = false',time);
		//setTimeout('facing.west = true', time);
		facing.north = false;
		facing.west  = true;
	} else if (facing.south) {
		facing.south = false;
		facing.east  = true;
	} else if (facing.west) {
		//setTimeout('facing.west  = false',time);
		//setTimeout('facing.south = true', time);
		facing.west  = false;
		facing.south = true;
	} else {
		//setTimeout('facing.east  = false',time);
		//setTimeout('facing.north = true', time);
		facing.east  = false;
		facing.north = true;
	}
	//	
	// check karel's position
	// set Timeout to draw karel
	//
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			if (karel[j][i]) {
				if (facing.north) {
					//draw(j,i);
					checkWallAround(j,i);	
					time += wait;
					setTimeout(draw, time, j , i, "north");
				} else if (facing.south) {
					//draw(j,i);
					checkWallAround(j,i);	
					time += wait;
					setTimeout(draw, time, j , i, "south");
				} else if (facing.west) {
					//draw(j,i);
					checkWallAround(j,i);	
					time += wait;
					setTimeout(draw, time, j , i, "west");
				} else {
					//draw(j,i);
					checkWallAround(j,i);	
					time += wait;
					setTimeout(draw, time, j , i, "east");
				}
			}
		}
	}
}


function pickBeeper() {
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			if (karel[j][i] && beeper[j][i]) {
				beeper[j][i] = false;
				countBeeper += 1;
				beepers.inBag = true;
				beepers.present = false;
				// time += wait;
				setTimeout(setBeeperFalse, time, j ,i);
				
				if (facing.north) {
					time += wait;
					setTimeout(draw, time, j, i, "north");
				} else if (facing.south) {
					time += wait;
					setTimeout(draw, time, j, i, "south");
				} else if (facing.west) {
					time += wait;
					setTimeout(draw, time, j, i, "west");
				} else {
					time += wait;
					setTimeout(draw, time, j, i, "east");
				}
			}
		}
	}
}

function putBeeper() {
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			// check if karel got at least one beeper and if there's already one on the actual postition
			if (karel[j][i] && beeper[j][i]==false && countBeeper > 0) {
				beeper[j][i] = true;
				countBeeper -= 1;
				beepers.present = true;
				if (countBeeper == 0) {
					beepers.inBag = false;
				}
				// time += wait;
				setTimeout(setBeeperTrue, time, j ,i);
				
				if (facing.north) {
					time += wait;
					setTimeout(draw, time, j, i, "north");
				} else if (facing.south) {
					time += wait;
					setTimeout(draw, time, j, i, "south");
				} else if (facing.west) {
					time += wait;
					setTimeout(draw, time, j, i, "west");
				} else {
					time += wait;
					setTimeout(draw, time, j, i, "east");	
				}
			}
		}
	}
}

function setBeeperTrue (beeperX, beeperY) {
	beeperToDraw[beeperX][beeperY] = true;
}

function setBeeperFalse (beeperX, beeperY) {
	beeperToDraw[beeperX][beeperY] = false;
}



// functions, wich return karel's direction of view

function facingNorth() {
	return facing.north;
}
function facingSouth() {
	return facing.south;
}
function facingWest() {
	return facing.west;
}
function facingEast() {
	return facing.east;
}

//
// negated functions, wich return karel's non-direction of view
//

function notFacingNorth() {
	return !facing.north;
}
function notFacingSouth() {
	return !facing.south;
}
function notFacingWest() {
	return !facing.west;
}
function notFacingEast() {
	return !facing.east;
}

// function which checks if there's a beeper in karel's bag
// returns TRUE if there's at least one beeper in bag

function beepersInBag() {
	return beepers.inBag;
}

// negated function which checks if there's no beeper in karel's bag
// returns TRUE if there's no beeper in bag

function noBeepersInBag() {
	return !beepers.inBag; 
}

// function which checks if there's a beeper on karel's position
// returns TRUE if there's a beeper on karel's position

function beepersPresent() {
	return beepers.present;
}
function _beepersPresent() {
	time += wait;
	return beepersPresent(); 
} 
//
// function that checks if there's no beeper on karel's position
// returns TRUE if there's no beeper on karel's position
//
function noBeepersPresent() {
	return !beepers.present;
}
 
//
// function which checks if there's a wall in front of or besides Karel
// returns true if there's no wall
//
function checkWallAround(j,i) {
	if (facing.north) {
	 	if (wallH[j][i+0.5]==false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallV[j-0.5][i]==false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallV[j+0.5][i]==false)
			clear.right = true;
		else 
			clear.right = false;
	} else if (facing.south) {
		if (wallH[j][i-0.5]==false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallV[j+0.5][i]==false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallV[j-0.5][i]==false)
			clear.right = true;
		else 
			clear.right = false;
	} else if (facing.west) {
		if (wallV[j-0.5][i]==false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallH[j][i-0.5]==false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallH[j][i+0.5]==false)
			clear.right = true;
		else 
			clear.right = false;
	} else {
		if (wallV[j+0.5][i]==false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallH[j][i+0.5]==false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallH[j][i-0.5]==false)
			clear.right = true;
		else 
			clear.right = false;
	}
}

function checkBeepersPresent(j,i) {
	if (beeper[j][i])
		beepers.present = true;
	else
		beepers.present = false;
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
				if (i==0 && j<columns) {
					c.fillStyle = "#000";
					c.font = "Arial";
					c.textBaseline = 'bottom';
					c.fillText (j,(j+0.5)/(partition)*canvas.width, (partition-(i))/(partition)*canvas.height);
				}
				//
				// draw the Y-axis' numbering
				//
				if (j==0 && i<rows) {
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
					c.fillStyle = "#bbb" //grey
					c.strokeStyle = "#000" //black
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
		alert("You're not able to play 'Karel the robot' with your current browser. Please switch browser.")

	
	if (direction == "north") 
		imgKarel.src = "../images/karelNorth.png";
	else if (direction == "south")
		imgKarel.src = "../images/karelSouth.png";
	else if (direction == "west") 
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
    var newimages=[], loadedimages=0
    var arr=(typeof arr!="object")? [arr] : arr

    function imageloadpost(){
    	loadedimages++
		// shows how many pictures are loaded
      	if (loadedimages==arr.length){
	 	// alert(arr.length);
	  	}
    }
 	for (var i=0; i<arr.length; i++){
        newimages[i]=new Image()
        newimages[i].src=arr[i]
        newimages[i].onload=function(){
            imageloadpost()
        }
        newimages[i].onerror=function(){
        imageloadpost()
        }
    }
}
// sample run
preloadimages(['../images/karelEast.png','../images/karelWest.png','../images/karelSouth.png','../images/karelNorth.png','../images/glyphicons-halflings-white.png']);



var a = 0;
var calls = new Array('move()', 'move()', 'turnLeft()', 'move()', 'putBeeper()');

function myRecrusiveFunction () {
	eval(calls[a]);
	if (a < calls.length) {
		setTimeout("myRecrusiveFunction()", time);
		a++;
	} else {
		a = 0;
	}
}


function sleep(milliSeconds){
	var startTime = new Date().getTime(); // get the current time
	while (new Date().getTime() < startTime + milliSeconds); // hog cpu
}

function _move() {
	time += wait;
	setTimeout('move()',time);
}

function _turnLeft() {
	time += wait;
	setTimeout('turnLeft()',time);
}

function trippleMove() {
	move();
	move();
	move();
	time = 0;
}
function _test2() {
	time += wait;
	setTimeout('test2()',time);
}
function _test() {
	time += wait;
	setTimeout('test()',time);
}

function test2() {
	if (beepers.present) {
	_move();
	test2(); 
	}	
	_turnLeft();
	_turnLeft();
	
}
z=-1;
function test() {
	z++;
if (z==0) {
	move();
} if(z==1) {
	move();
} if(z==3) {
	turnLeft();
} if (z==2) {
	if(beepersPresent()) {
	_move();
	z--;
	_test();}
} setTimeout('test()',300);
}

function turnRight() {
	turnLeft();
	turnLeft();
	turnLeft();
}

function turnAround() {
	if (facingEast()) {
		turnLeft();
		move();
		turnLeft();
	}
	else if (facingWest()) {
		turnRight();
		move();
		turnRight();
	}
}

function beeperWalk() {
	putBeeper();
	move();
}

function antiBeeperWalk() {
	pickBeeper();
	move();
}

function fillField() {
	while ((leftIsClear() && facingEast()) || (rightIsClear() && facingWest())) { 
		while (frontIsClear()) 
			beeperWalk();
			putBeeper();
			turnAround();
	}
}

function clearField() {
	while ((frontIsClear() && rightIsClear()) && (frontIsClear() && rightIsClear())) { 
	while (frontIsClear()) 
		antiBeeperWalk();
		pickBeeper();
		turnAround();
	}
}

function test3() {
	while(beepersPresent()){
		move();
	}
	turnLeft();
	for (var i=0; i < 3; i++) {
		move();
	}
	while (frontIsClear()) {
		move();
	}
	turnLeft();
	turnLeft();
	while (frontIsClear()) {
		move();
	}
}
// ==== LOOP ALERT ====
// popover for loop alert
$('#loopAlert').popover({
	html: true,
	content: "<br><hr><span class='bigText'>Infinite loop!!!</span><hr><span id='smallText'>Karel wouldn't stop putting beepers down.</span>",
	placement: 'middle'
});

/*
* ===== INFINITE LOOPS ======
* to avoid a system freeze we have to cancel infinte loops
* for that reason the program avoids to perform "wrong" code, that would lead to infinite loops
*/

// ===== INF. LOOPS - PUTBEEPER =====
var put0 = "while(frontIsClear())\n   putBeeper();";
var put1 = "while(leftIsClear())\n   putBeeper();";
var put2 = "while(rightIsClear())\n   putBeeper();";
var put3 = "while(beepersPresent())\n   putBeeper();";
var put4 = "while(beepersInBag())\n   putBeeper();";
var put5 = "while(facingNorth())\n   putBeeper();";
var put6 = "while(facingSouth())\n   putBeeper();";
var put7 = "while(facingWest())\n   putBeeper();";
var put8 = "while(facingEast())\n   putBeeper();";

var negPut0 = "while(frontIsBlocked())\n   putBeeper();";
var negPut1 = "while(leftIsBlocked())\n   putBeeper();";
var negPut2 = "while(rightIsBlocked())\n   putBeeper();";
var negPut3 = "while(noBeepersPresent())\n   putBeeper();";
var negPut4 = "while(noBeepersInBag())\n   putBeeper();";
var negPut5 = "while(notFacingNorth())\n   putBeeper();";
var negPut6 = "while(notFacingSouth())\n   putBeeper();";
var negPut7 = "while(notFacingWest())\n   putBeeper();";
var negPut8 = "while(notFacingEast())\n   putBeeper();";

// ===== INF. LOOPS - PICKBEEPER =====
var pick0 = "while(frontIsClear())\n   pickBeeper();";
var pick1 = "while(leftIsClear())\n   pickBeeper();";
var pick2 = "while(rightIsClear())\n   pickBeeper();";
var pick3 = "while(beepersPresent())\n   pickBeeper();";
var pick4 = "while(beepersInBag())\n   pickBeeper();";
var pick5 = "while(facingNorth())\n   pickBeeper();";
var pick6 = "while(facingSouth())\n   pickBeeper();";
var pick7 = "while(facingWest())\n   pickBeeper();";
var pick8 = "while(facingEast())\n   pickBeeper();";

var negPick0 = "while(frontIsBlocked())\n   pickBeeper();";
var negPick1 = "while(leftIsBlocked())\n   pickBeeper();";
var negPick2 = "while(rightIsBlocked())\n   pickBeeper();";
var negPick3 = "while(noBeepersPresent())\n   pickBeeper();";
var negPick4 = "while(noBeepersInBag())\n   pickBeeper();";
var negPick5 = "while(notFacingNorth())\n   pickBeeper();";
var negPick6 = "while(notFacingSouth())\n   pickBeeper();";
var negPick7 = "while(notFacingWest())\n   pickBeeper();";
var negPick8 = "while(notFacingEast())\n   pickBeeper();";

// ===== INF. LOOPS - MOVE =====
var move0 = "while(beepersInBag())\n   move();";
var move1 = "while(facingNorth())\n   move();";
var move2 = "while(facingSouth())\n   move();";
var move3 = "while(facingWest())\n   move();";
var move4 = "while(facingEast())\n   move();";

var negMove0 = "while(noBeepersInBag())\n   move();";
var negMove1 = "while(notFacingNorth())\n   move();";
var negMove2 = "while(notFacingSouth())\n   move();";
var negMove3 = "while(notFacingWest())\n   move();";
var negMove4 = "while(notFacingEast())\n   move();";

// ===== INF. LOOPS - TURNLEFT =====
var turnLeft0 = "while(beepersPresent())\n   turnLeft();";
var turnLeft1 = "while(beepersInBag())\n   turnLeft();";

var negTurnLeft0 = "while(noBeepersPresent())\n   turnLeft();";
var negTurnLeft1 = "while(noBeepersInBag())\n   turnLeft();";




function loopAlert() {
	$('#loopAlert').popover('toggle');
}

function userInput() {
	var input = $('#textarea').val();
	
	if ((input.indexOf(put0)!='-1') || (input.indexOf(put1)!='-1') || (input.indexOf(put2)!='-1') || (input.indexOf(put3)!='-1') || (input.indexOf(put4)!='-1') || (input.indexOf(put5)!='-1') || (input.indexOf(put6)!='-1') || (input.indexOf(put7)!='-1') || (input.indexOf(put8)!='-1') || (input.indexOf(negPut0)!='-1') || (input.indexOf(negPut1)!='-1') || (input.indexOf(negPut2)!='-1') || (input.indexOf(negPut3)!='-1') || (input.indexOf(negPut4)!='-1') || (input.indexOf(negPut5)!='-1') || (input.indexOf(negPut6)!='-1') || (input.indexOf(negPut7)!='-1') || (input.indexOf(negPut8)!='-1')) {
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to put down beepers.");
		setTimeout (loopAlert, 3000);
	
	} else if ((input.indexOf(pick0)!='-1') || (input.indexOf(pick1)!='-1') || (input.indexOf(pick2)!='-1') || (input.indexOf(pick3)!='-1') || (input.indexOf(pick4)!='-1') || (input.indexOf(pick5)!='-1') || (input.indexOf(pick6)!='-1') || (input.indexOf(pick7)!='-1') || (input.indexOf(pick8)!='-1') || (input.indexOf(negPick0)!='-1') || (input.indexOf(negPick1)!='-1') || (input.indexOf(negPick2)!='-1') || (input.indexOf(negPick3)!='-1') || (input.indexOf(negPick4)!='-1') || (input.indexOf(negPick5)!='-1') || (input.indexOf(negPick6)!='-1') || (input.indexOf(negPick7)!='-1') || (input.indexOf(negPick8)!='-1')) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to pick up beepers.");
		setTimeout (loopAlert, 3000);
		
	} else if ((input.indexOf(move0)!='-1') || (input.indexOf(move1)!='-1') || (input.indexOf(move2)!='-1') || (input.indexOf(move3)!='-1') || (input.indexOf(move4)!='-1') || (input.indexOf(negMove0)!='-1') || (input.indexOf(negMove1)!='-1') || (input.indexOf(negMove2)!='-1') || (input.indexOf(negMove3)!='-1') || (input.indexOf(negMove4)!='-1')) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to move.");
		setTimeout (loopAlert, 3000);
		
	} else if ((input.indexOf(turnLeft0)!='-1') || (input.indexOf(turnLeft1)!='-1') || (input.indexOf(negTurnLeft0)!='-1') || (input.indexOf(negTurnLeft1)!='-1')) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to turn to the left.");
		setTimeout (loopAlert, 3000);
		
	} else
		eval(input);
			
	time = 0;
}
//
// windowLoad()
// only called once at the very beginning of the game to initialise karel's position and its scenery
//
function windowLoad() {
	draw(startX, startY, startDirection);
	karel[startX][startY] = true;
	checkWallAround(startX, startY);
	checkBeepersPresent(startX, startY);
	loadDatabase();
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
//$('#deleteOwnFunction').popover();
//$('#editOwnFunction').popover();

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
	if (e.target.id=="queries") {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#basics').popover('hide');
		$('#for').popover(); // because it's a popover within a popover, it has to be initalised within the same
		$('#queries').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') == false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id=="conditions") {
		$('#negConditions').popover('hide');
		$('#basics').popover('hide');
		$('#queries').popover('hide');
		$('#conditions').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') == false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id=="negConditions") {
		$('#conditions').popover('hide');
		$('#basics').popover('hide');
		$('#queries').popover('hide');
		$('#negConditions').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') == false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id=="basics") {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') == false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id=='ownFunctions') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover();
		$('#deleteOwnFunction').popover(); // because it's a popover within a popover, it has to be initalised within the same
		$('#editOwnFunction').popover(); // because it's a popover within a popover, it has to be initalised within the same
	
	} else if (e.target.id=='start') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover('hide');
		
	} else if (e.target.id=='saveFunc') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover('hide');
	
	} else if (e.target.id=='for') {
		$('#for').popover();
	}
});
// 
// variable defines the amount of iterations of the "for-loop"
//
var forCounter = 0;
// lastBracePos defines the legth of the string when operator is set.
// lastBracePos -1 ergo is the position of the last right brace. 
var lastBracePos = -1;

// current position off cursor
var cursorPos = null;
// // insert text into textarea at cursor's position
// $( '#textarea' ).on('click', function(){
//             cursorPos = $('#textarea').prop('selectionStart');
//             var v = $('#textarea').val();
//             var textBefore = v.substring(0,  cursorPos );
//             var textAfter  = v.substring( cursorPos, v.length );
//             $('#textarea').val( textBefore+ '&&' +textAfter );
//         });


//
// insert the value of the selection buttons by clicking into textarea
//
$(document).bind("click", function(e) {
	
	// check if user clicked in the texarea
	// if so, he probably want to edit the his code at a certain position
	// in this case it's necessary to insert the function at the cursor position and not as usual at the end of the textarea
	if (e.target.id == 'textarea') {
		cursorPos = $('#textarea').prop('selectionStart');
	}
	
	
	
	// ==== DOCUMENT OBJECTS ==== 
	// avoid to insert value of the following buttons and document objects
	if ((e.target.value != undefined) && (e.target.id != "textarea") && (e.target.id != "functionName")) {
		
		// ==== CATEGORIZATION BUTTONS ====
		// avoid to insert empty value of the categorization buttons
		if ((e.target.id != "queries") && (e.target.id!= "basics") && (e.target.id!= "conditions") && (e.target.id!= "negConditions") && (e.target.id != "saveFunc") && (e.target.id != "start") && (e.target.id != "clearFunc") && (e.target.id != "rng") && (e.target.id != "ownFunctions") && (e.target.id != "deleteOwnFunction") && ($('#deleteOwnFunction').hasClass('btn btn-danger active') == false) && (e.target.id != "editOwnFunction") && (e.target.id != "for") && (e.target.id != "for_2") && (e.target.id != "for_3") && (e.target.id != "for_4") && (e.target.id != "for_5") && (e.target.id != "for_6") && (e.target.id != "for_7") && (e.target.id != "for_8") && (e.target.id != "for_9") && (e.target.id != "for_10")) {
				
			// ==== OWN FUNCTIONS ==== 
			// check if it's own function so we have to add a semicolon
			if (e.target.className == 'btn btn-default conditions ownFunctions') {
				if (cursorPos == null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() == '')
						$('#textarea').val('   '+ e.target.value + ';').trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val() + '\n' +'   '+ e.target.value + ';').trigger('autosize.resize');
				} else {
					//cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + '\n' + '   ' + e.target.value +';' + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 5; // +5 because of the line break, the 3 spaces and the semicolon
				}
			// ==== BASIC FUNCTIONS ====
			// check if it's a basic function so we indent this part in the textarea
			// so the function will be easier to read in the textarea for user
			} else if ((e.target.id == "move") || (e.target.id == "turnLeft") || (e.target.id == "pickBeeper") || (e.target.id == "putBeeper")) {
				if (cursorPos == null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() == '')
						$('#textarea').val('   '+ e.target.value).trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val()+ '\n' +'   '+ e.target.value).trigger('autosize.resize');
				} else {
					//cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + '\n' + '   ' + e.target.value + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 4; // +4 because of the line break and the 3 spaces
				}
			// ==== QUERIES ====
			// check if it's a query
			// in that case we don't need a semicolon.		
			}else if((e.target.id == 'if') || (e.target.id == 'while') || (e.target.id == 'else')) {
				if (cursorPos == null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() == '')
						$('#textarea').val(e.target.value).trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val() + '\n' + e.target.value).trigger('autosize.resize');
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + '\n' + e.target.value + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +1 because of one line break
				}
					
			// ===== OPERATORS ====
			// check if there's already a query with its condition in the code
			// if not, there's no need of '&&' or '||'
			} else if ((e.target.id == 'bitAnd') || (e.target.id == 'bitOr')) {
				if ((lastBracePos != -1) && (cursorPos == null)) {
					// cut off the last right brace and insert operator
					$('#textarea').val($('#textarea').val().substring(0,lastBracePos-1));
					$('#textarea').val($('#textarea').val() + ' ' + e.target.value + ' ').trigger('autosize.resize');
				
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos-1 );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + ' ' + e.target.value + ' ' + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +2 because of two spaces, but -1 because of the shortening of textBefore
				}
		
			// ===== BRACES ====
			// left brace doesn't need line break, just space.
			// right brace needs one.
			} else if ((e.target.id == 'braceleft_L') || (e.target.id == 'braceleft_R')) {
				if (cursorPos == null) {
					$('#textarea').val($('#textarea').val() + ' ' + e.target.value).trigger('autosize.resize');
				} else {
					//cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + ' ' + e.target.value + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +1 because of one space
				}
			} else if ((e.target.id == 'braceright_L') || (e.target.id == 'braceright_R')) {
				if (cursorPos == null) {
					$('#textarea').val($('#textarea').val() + '\n' + e.target.value).trigger('autosize.resize');
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + '\n' + e.target.value + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +1 because of one line break
				}
			// ======= REST = CONDITIONS ========
			// the rest don't get a line break
			} else {
				if (cursorPos == null) {
					$('#textarea').val($('#textarea').val() + e.target.value).trigger('autosize.resize');
					lastBracePos = $('#textarea').val().length;
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
		            var v = $('#textarea').val();
		            var textBefore = v.substring(0,  cursorPos );
		            var textAfter  = v.substring( cursorPos, v.length );
		            $('#textarea').val( textBefore + e.target.value + textAfter ).trigger('autosize.resize');
					lastBracePos = $('#textarea').val().length;
					cursorPos += e.target.value.length;
				}
			}
		}
	}
	
	// check how many increments the user want for the "for-loop"
	//
	switch (e.target.id) {
		case 'for_2':
			forCounter = 2;
			break;
		case 'for_3':
			forCounter = 3;
			break;
		case 'for_4':
			forCounter = 4;
			break;
		case 'for_5':
			forCounter = 5;
			break;
		case 'for_6':
			forCounter = 6;
			break;
		case 'for_7':
			forCounter = 7;
			break;
		case 'for_8':
			forCounter = 8;
			break;
		case 'for_9':
			forCounter = 9;
			break;
		case 'for_10':
			forCounter = 10;
			break;
	}
	if (forCounter!=0) {
		if (cursorPos == null) {
			// check if there's already code within the textarea. If not, there's no line break necessary.
			if ($('#textarea').val() == '')
				$('#textarea').val('for(var i=0; i<' + forCounter + '; i++)').trigger('autosize.resize');
			else
				$('#textarea').val($('#textarea').val() + '\n' + 'for(var i=0; i<' + forCounter + '; i++)').trigger('autosize.resize');
		} else {
			var v = $('#textarea').val();
            var textBefore = v.substring(0,  cursorPos );
            var textAfter  = v.substring( cursorPos, v.length );
            $('#textarea').val( textBefore + '\n' + 'for(var i=0; i<' + forCounter + '; i++)' + textAfter ).trigger('autosize.resize');
			if (forCounter <10)
				cursorPos += e.target.value.length + 23;
			else
				cursorPos += e.target.value.length + 24;
		}
		$('#for').popover('hide');
		forCounter = 0;
	}
});

/*
* EDIT OWN FUNCTION
* =================
* function to enable editing own functions as long as button "edit" is pressed
*/
$(document).bind("click", function(e) {
	if (e.target.id == 'editOwnFunction') {
		if($('#editOwnFunction').hasClass('btn btn-warning active')) {
			$('#deleteOwnFunction').attr('class', 'btn btn-danger').popover('hide'); // close delete button and its popover
			$('#editOwnFunction').popover();
			console.log('editable');
		} else if ($('#editOwnFunction').hasClass('btn btn-warning'))
				$('#editOwnFunction').popover('hide');
	}
	
	/*
	* check if button "edit" is pressed
	* only then it's possible to edit a self made function
	*/
	if ( ($('#editOwnFunction').hasClass('btn btn-warning active')) && $(e.target).hasClass('btn btn-default conditions ownFunctions') ) {
		console.log(e.target.id);
		
		
		
		// Datenbank anlegen
		var request = indexedDB.open('html5', 1);

		// Änderungs/Erzeugungs-Event
		request.onupgradeneeded = function(){
			console.log('Datenbank angelegt');
			var db = this.result;
			if(!db.objectStoreNames.contains('features')){
				store = db.createObjectStore('features', {
		      		keyPath: 'key',
		     		autoIncrement: true
		    	});
		  	}
		};

		// Öffnungs-Event (feuert nach upgradeneeded)
		request.onsuccess = function(){
			console.log('Datenbank geöffnet');
			var db = this.result;
/*
			// Zu speichernder Datensatz
			var item = { 
				title: title,
		 		content: content
			};

			// Speicher-Transaktion
			var trans = db.transaction(['features'], 'readwrite');
			var store = trans.objectStore('features')
			var request = store.put(item); // `item` in dem Store ablegen

			// Erfolgs-Event
			request.onsuccess = function(counter){
			console.log('Eintrag ' + counter.target.result + ' gespeichert');
*/	
		    	// Auslese-Transaktion
			    var trans = db.transaction(['features'], 'readonly');
			    var store = trans.objectStore('features');

			    // Cursor für alle Einträge von 0 bis zum Ende
			    var range = IDBKeyRange.lowerBound(0);
			    var cursorRequest = store.openCursor(range);

			    // Wird für jeden gefundenen Datensatz aufgerufen... und einmal extra
			    cursorRequest.onsuccess = function(evt){
				var result = evt.target.result;
				if(result){
			    	console.log('Funktion ' + result.value.title + '() gefunden');

					// creates new function and new button
					//window[result.value.title] = new Function(result.value.content);
					//newButton(result.value.title);
					
					// check if pressed button coincide with a function in database
					// if so, it can be edited by reference to its title
					//
					if (result.value.title == e.target.id) {
						// fill the function's content and title into text field, so it can be editable
						$('#functionName').val(result.value.title);
						$('#textarea').val(result.value.content).trigger('autosize.resize');
						
						// Eintrag wieder löschen
				        var trans = db.transaction(['features'], 'readwrite');
				        var store = trans.objectStore('features');
				       
				 		// var key = result.value.key;	
						var request = store.delete(result.key);
						
						// we have to hide and delete the button seperatly, otherwise it won't disapear in "your functions"
						// because after deleting something from the database, the DB only refreshes after the page reloads
						//
						var removeFromButtons = '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+result.value.title+'" value="'+result.value.title+'()">'+result.value.title+'</button>';
						functionToButton = functionToButton.replace(removeFromButtons,'');
						
						request.onsuccess = function(result){
				        	console.log('Funktion ' + e.target.id + '() gelöscht');

				        } 
					}

/*					console.log('database key is: ' + result.key); // returns the key position in database
					console.log('das ist: ' , result.value); // ref to entire object
					console.log('target.id is : ' + e.target.id); // id of pressed button
				  	console.log('title is : ' + result.value.title); // title of the pressed button's object 
					console.log('content is : ' + result.value.content); // content of the pressed button's object
*/
/*
			        // Eintrag wieder löschen
			        var trans = db.transaction(['features'], 'readwrite');
			        var store = trans.objectStore('features');
			        // var key = result.value.key;	
					var request = store.delete(counter.target.result);

					request.onsuccess = function(){
			        	console.log('Eintrag ' + counter.target.result + ' gelöscht');
			        }
*/
			        // Cursor zum nächsten Eintrag bewegen
			        result.continue();

					}
				};	
			//};
		} 
	} 	
});

/*
* DELETE OWN FUNCTION
* ===================
* function to enable deleting own functions as long as button "delete" is pressed
*/
$(document).bind("click", function(e) {
	if (e.target.id == 'deleteOwnFunction') {
		if ($('#deleteOwnFunction').hasClass('btn btn-danger active')) {
			$('#editOwnFunction').attr('class', 'btn btn-warning').popover('hide'); // close edit button and its popover
			$('#deleteOwnFunction').popover();
			console.log('deletable');
		} else if ($('#deleteOwnFunction').hasClass('btn btn-danger'))
			$('#deleteOwnFunction').popover('hide');
	} 
	
	//
	// check if button "delete a function" is pressed
	// only then it's possible to delete a self made function
	if ( ($('#deleteOwnFunction').hasClass('btn btn-danger active')) && $(e.target).hasClass('btn btn-default conditions ownFunctions') ) {
				
		// Datenbank anlegen
		var request = indexedDB.open('html5', 1);

		// Änderungs/Erzeugungs-Event
		request.onupgradeneeded = function(){
			console.log('Datenbank angelegt');
			var db = this.result;
			if(!db.objectStoreNames.contains('features')){
				store = db.createObjectStore('features', {
		      		keyPath: 'key',
		     		autoIncrement: true
		    	});
		  	}
		};

		// Öffnungs-Event (feuert nach upgradeneeded)
		request.onsuccess = function(){
			console.log('Datenbank geöffnet');
			var db = this.result;

		    	// Auslese-Transaktion
		    var trans = db.transaction(['features'], 'readonly');
		    var store = trans.objectStore('features');

		    // Cursor für alle Einträge von 0 bis zum Ende
		    var range = IDBKeyRange.lowerBound(0);
		    var cursorRequest = store.openCursor(range);

		    // Wird für jeden gefundenen Datensatz aufgerufen... und einmal extra
			cursorRequest.onsuccess = function(evt){
				var result = evt.target.result;
				if(result){
			    	console.log('Funktion ' + result.value.title + '() gefunden');
			
					// check if pressed button coincide with a function in database
					// if so, it can be deleted by reference to its title
					//
					if (result.value.title == e.target.id) {
						// Eintrag wieder löschen
				        var trans = db.transaction(['features'], 'readwrite');
				        var store = trans.objectStore('features');
						var request = store.delete(result.key);
						
						// we have to hide and delete the button seperatly, otherwise it won't disapear in "your functions"
						// because after deleting something from the database, the DB only refreshes after the page reloads
						//
						$(e.target).css({'display':'none'}); 
						var removeFromButtons = '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+result.value.title+'" value="'+result.value.title+'()">'+result.value.title+'</button>';
						functionToButton = functionToButton.replace(removeFromButtons,'');
						
						request.onsuccess = function() {
				        	console.log('Funktion ' + e.target.id + '() gelöscht');
				        } 
					}
			        // Cursor zum nächsten Eintrag bewegen
			        result.continue();
				}
			};	
		}	
	}
});


function loadDatabase() {
	
	var title = $('#functionName').val();
	var content = $('#textarea').val();
	
	// Datenbank anlegen
	var request = indexedDB.open('html5', 1);

	// Änderungs/Erzeugungs-Event
	request.onupgradeneeded = function(){
		console.log('Datenbank angelegt');
		var db = this.result;
		if(!db.objectStoreNames.contains('features')){
			store = db.createObjectStore('features', {
	      		keyPath: 'key',
	     		autoIncrement: true
	    	});
	  	}
	};

	// Öffnungs-Event (feuert nach upgradeneeded)
	request.onsuccess = function() {
		console.log('Datenbank geöffnet');
		var db = this.result;

	    // Auslese-Transaktion
	    var trans = db.transaction(['features'], 'readonly');
	    var store = trans.objectStore('features');

	    // Cursor für alle Einträge von 0 bis zum Ende
	    var range = IDBKeyRange.lowerBound(0);
	    var cursorRequest = store.openCursor(range);

	    // Wird für jeden gefundenen Datensatz aufgerufen... und einmal extra
	    cursorRequest.onsuccess = function(e){
			var result = e.target.result;
			if(result){
		    	console.log('Eintrag gefunden:', result.value);

				// creates new function and new button
				window[result.value.title] = new Function(result.value.content);
				newButton(result.value.title);

		        // Cursor zum nächsten Eintrag bewegen
		        result.continue();
			}
		};
	}
}