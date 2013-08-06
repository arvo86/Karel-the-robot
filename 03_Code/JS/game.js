/**
* @overview This is Karel the robot for JavaScript
* @file manages the whole game logic.
* @author Armin Voit
*/

/*
* ==== ANDROID FIX ======
* fix Android indexedDB problem
*/
var requireShim = typeof window.IDBVersionChangeEvent === 'undefined';

// WebSQL avaiable?
var supportsWebSql = typeof window.openDatabase !== 'undefined';

if(requireShim && supportsWebSql){
  window.shimIndexedDB.__useShim(); // Verwendung des Polyfills erwzingen
}


// ===== LIST OF ALL VARIABLES =====
// variable, wich shows the amount of Beepers Karel got with him
var countBeeper = 1000;

/**
* This is used for setTimeout functions
* @type {number} 
*/
var time = 0;

/**
* This increases time
* @type {number} 
*/
var wait = 150;

var imgKarel = new Image();

/**
* The variables "rows" and "columns" describe the amount of rows and columns in Karel's world.
* Effectively there's one row and one column less in Karel's world,
* because one of each is reserved for the outer walls
* @type {number} 
*/
var rows = 21;

/**
* The variables "rows" and "columns" describe the amount of rows and columns in Karel's world.
* Effectively there's one row and one column less in Karel's world,
* because one of each is reserved for the outer walls
* @type {number} 
*/
var columns = 21;

/**
* Start position of Karel when level is loaded. x-value
* @type {number} 
*/
var startX;

/**
* Start position of Karel when level is loaded. y-value
* @type {number} 
*/
var startY;

var store;

/**
* Start viewing direction of Karel when level is loaded.
* @type {string} 
*/
var startDirection;

/**
* The variable "partition" defines the distance between the single rows and columns.
* To ensure an appropriate playing field, the minimun distance from row to row is 1/10 of the convas' window height,
* respectively the minimum distance from column to column is 1/10 of the canvas' window width.
* If there're more than 10 rows or 10 columns the distance between those will be relative to the amount of them.
* e.g. If there're 20 rows, the distance beween those will be 1/20 of the canvas' window height.
* @type {number}
*/
var partition;

/**
* This contains the level and sill the user has chosen
* @function liste
* @see level
* @see skill 
*/
var liste = storage.getAll();
for (var i in liste) {
	var level = parseInt(liste.level,10);
	var speed = parseInt(liste.speed,10);
	var skill = liste.skill;	
}

/**
* Variable that contains the content the "Basics" popover.
* It has to be in this unorganized structure, otherwise JS will not accept it as a the string.
* @type {string}
*/
var functionToButton = '<div class="structure"><span>braces</span></div><br><div class="btn-group"><button type="button" class="btn btn-default braces" value="{" id="braceleft_R">{</button><button type="button" class="btn btn-default braces" value="}" id="braceright_R">}</button></div><br><br><div class="structure"><span>delete/edit</span><br></div><br><div class="btn-group"><button type="button" class="btn btn-danger" data-toggle="button" value="" id="deleteOwnFunction" rel="popover" data-content="!!!&nbsp;Warning&nbsp;!!!" data-placement="top"><i class="icon-trash icon-white"></i> delete</button><button type="button" class="btn btn-warning" data-toggle="button" value="" id="editOwnFunction" rel="popover" data-content="!!!&nbsp;Edit&nbsp;!!!" data-placement="top"><i class="icon-pencil icon-white"></i> edit</button></div><br><br><div class="structure"><span>own functions</span><br></div>';

/**
* Reference to the value of the text area
* @type {string}
*/
var input;

// 
// variable defines the amount of iterations of the "for-loop"
//
var forCounter = 0;
// lastBracePos defines the legth of the string when operator is set.
// lastBracePos -1 ergo is the position of the last right brace. 
var lastBracePos = -1;

// current position off cursor
var cursorPos = null;
var v;
var textAfter;
var textBefore;




// ==== BASIC CONDITIONS ====
/**
* This represents karel's direction view
* @type {object} 
* @property {boolean} north - The default value is false.
* @property {boolean} south - The default value is false.
* @property {boolean} west - The default value is false.
* @property {boolean} east - The default value is true.
*/
var facing = {
	"north" : false,
	"south" : false,
	"west"  : false,
	"east"  : true
};

/**
* This contains all conditions that belong to beeper
* @property {boolean} inBag - The default value is false.
* @property {boolean} present - The default value is false.
* @type {object} 
*/
var beepers = {
	"inBag"   : false, 
	"present" : false
};

/**
* This contains all conditions that belong to wall
* @property {boolean} front - The default value is false.
* @property {boolean} right - The default value is false.
* @property {boolean} left - The default value is false.
* @type {object} 
*/
var clear = {
	"front" : false,
	"left"  : false,
	"right" : false
};

/**
* This shows the current speed if slider is changed
* @function showValue 
* @param {number} newValue A number between 0 and 125
* @see wait
*/
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



/**
* Variable that contains the content the "Basics" popover.
* Generates a new button for action selection.
* Automatically gives the button the name of the self made function.
* It has to be in this unorganized structure, otherwise JS will not accept it as a the string.
* @function newButton
* @param {string} title contains the HTML content for the new button of own function
* @see functionToButton
*/
function newButton(title) {
	functionToButton += '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+title+'" value="'+title+'()">'+title+'</button>';
}


/**
* This function allows the user to dynamically create new functions within the game.
* it uses the name within the textfield given by the user to generate a function,
* this new function gets the content of the textarea below.
* @type {number} 
*/
function saveFunction() {
	
	
	var title = $('#functionName').val();
	var content = $('#textarea').val();
	
	// checks if function title is set
	if (title != '') {
		window[title] = new Function(content);
	
		$('#functionName').val('');
		$('#textarea').val('').trigger('autosize.resize');
		cursorPos = null;
		lastBracePos = -1;
	
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
			var store = trans.objectStore('features');
			var request = store.put(item); // `item` in dem Store ablegen

			// Erfolgs-Event
			request.onsuccess = function(counter){
			console.log('Eintrag ' + counter.target.result + ' gespeichert');

			};
		};
		
	} else {
		functionTitleInfo();
		setTimeout(functionTitleInfo,3000);
	}
}


 
/**
* Function belongs to "Clear" button and is called by clicking on on the same.
* Clears the entire textarea and text field of function name.
* @function clearTextarea
*/
function clearTextarea() {
	$('#functionName').val('');
	$('#textarea').val('').trigger('autosize.resize');
	cursorPos = null;
	lastBracePos = -1;
}
//
// Dynamically matches popover to button "your functions", so popover will be updated with own functions.
//
$('#ownFunctions').popover({
	placement: 'bottom',
	html: true,
	content: function() { 
		return functionToButton; 
	} 
});


/*
* Initialisation of the position arrays for karel, beeper and wall 
* Because there's a significant time differnce between computing and drawing karel's single steps through its world, 
* it is necessary for this program to get two arrays for the positions of the beeper. 
* first beeper array:  "beeper[][]"
* second beeper array: "beeperToDraw[][]" 
*
*/

/**
* Array for computing beeper positions.
* With this beeper array the program computes all positions karel has to go.
* With this array the program is able to draw the single steps of karel after copmuting the whole way previously.
* @type {array}
*/
var beeper = new Array(columns);
for(var j=0; j<columns; j++) 
	beeper[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
		beeper[j][i] = false;
	}
}


/**
* Array for drawing beeper positions.
* With this array the program is able to draw the single steps of karel after copmuting the whole way previously.
* @type {array}
*/
var beeperToDraw = new Array(columns);
for(j=0; j<columns; j++) 
	beeperToDraw[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
		beeperToDraw[j][i] = false;
	}
}
/**
* This passes the start positions of the beepers
* @function beeperAtStart
* @param {number} posX x-position of Karel
* @param {number} posY y-position of Karel
*/
function beeperAtStart(posX, posY) {
	beeper[posX][posY] = true;
	beeperToDraw[posX][posY] = true;
}


/**
* Array for Karel's position.
* @type {array}
*/
var karel = new Array(columns);
for(j=0; j<columns; j++) 
	karel[j] = new Array(rows);

for(j=0; j<columns; j++) {
	for(i=0; i<rows; i++) {
		karel[j][i]= false;
	}
}


/**
* Wall array for vertical walls
* @type {array}
*/
var wallV = new Array(columns);
for(j=0.5; j<columns; j++) 
	wallV[j] = new Array(rows);
for(j=0.5; j<columns; j++) {
	for(i=0; i<rows; i++)
		wallV[j][i] = false;
}
/**
* Wall array for vertical walls
* @type {array}
*/
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
	
	case 0:	
			// rows and columns
			rows = 10;
			columns = 10;
			// Beeper
			beeperAtStart(4,3);
			// horizontal walls
			wallH[3][6.5] = true;
			wallH[4][6.5] = true;
			wallH[5][6.5] = true;
			wallH[3][2.5] = true;
			wallH[4][2.5] = true;
			wallH[5][2.5] = true;
			//vertical walls
			wallV[2.5][3] = true;
			wallV[2.5][4] = true;
			wallV[2.5][5] = true;
			wallV[2.5][6] = true;
			// Karel
			startX=3;
			startY=3;
			startDirection="east";	
			break;
	
	// Level 1: 
	case 1:	
		if(skill === '_1') {
			// rows and columns
			rows = 6;
			columns = 10;
			// Beeper
			beeperAtStart(3,1);
			// Karel
			startX=1;
			startY=1;
			startDirection="east";	
			break;
		
		} else if (skill === '_2') {
			// rows and columns
			rows = 4;
			columns = 7;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";	
			break;
			
		} else if (skill === '_3') {
			// rows and columns
			rows = 12;
			columns = 12;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";	
		} break;
		
	// Level 2: 
	case 2: 
		if (skill === '_1') {
			// rows and columns
			rows = 6;
			columns = 10;
			// Beeper
			beeperAtStart(3,1);
			beeperAtStart(3,2);
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
			break;
			
		} else if (skill === '_2') {
			// rows and columns
			rows = 4;
			columns = 15;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";	
			break;
			
		} else if (skill === '_3') {
			// rows and columns
			rows = 12;
			columns = 12;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";	
		} break;
		
	// Level 3: 
	case 3:
		if (skill === '_1') {
			// rows and columns
			rows = 6;
			columns = 10;
			// Beeper
			beeperAtStart(3,1);
			// Karel
			startX=1;
			startY=3;
			startDirection="east";
			break;
			
		} else if (skill === '_2') {
			// rows and columns
			rows = 12;
			columns = 12;
			// Beeper
			beeperAtStart(1,1);
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
			break;
			
		} else if (skill === '_3') {
				// rows and columns
				rows = 12;
				columns = 12;
				// Karel
				startX=1;
				startY=1;
				startDirection="east";
		} break;
		
	// Level 4: 
	case 4:
		if (skill === '_1') {
			// rows and columns
			rows = 7;
			columns = 10;
			// Beeper
			beeperAtStart(3,4);
			// Karel
			startX=1;
			startY=4;
			startDirection="east";
			break;
			
		} else if (skill ==='_2') {
			// rows and columns
			rows = 6;
			columns = 10;
			// horizontal walls
			for (i=1;i<5;i++)
				wallH[i][4.5] = true;
			for (i=6;i<10;i++)
				wallH[i][4.5] = true;
			// vertical walls
			for (i=1;i<5;i++)
				wallV[4.5][i] = true;
			for (i=1;i<5;i++)
				wallV[5.5][i] = true;
			// beeper
			for (j=1;j<5;j++) {
				for (i=1;i<5;i++) {
					beeperAtStart(j,i);
				}
			}
			for (j=6;j<10;j++) {
				for (i=1;i<5;i++) {
					beeperAtStart(j,i);
				}
			}
			// karel
			startX=1;
			startY=5;
			startDirection="east";
			break;
			
		} else if (skill === '_3') {
			// rows and columns
			rows = 12;
			columns = 12;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
		} break;
		
	// Level 5: 
	case 5:
		if (skill === '_1') {
			// rows and columns
			rows = 6;
			columns = 10;
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
			break;
			
		} else if (skill === '_2') {
			// rows and columns
			rows = 12;
			columns = 12;
			// vertical walls
			wallV[5.5][5] = true;
			wallV[4.5][5] = true;
			wallV[4.5][4] = true;
			wallV[6.5][4] = true;
			wallV[6.5][5] = true;
			wallV[6.5][6] = true;
			for (i=3;i<7;i++){
				wallV[3.5][i] = true;
			}
			for (i=3;i<8;i++){
				wallV[7.5][i] = true;
			}
			for (i=2;i<8;i++){
				wallV[2.5][i] = true;
			}
			for (i=2;i<9;i++){
				wallV[8.5][i] = true;
			}
			// horizontal walls
			wallH[5][5.5] = true;
			wallH[5][3.5] = true;
			wallH[6][3.5] = true;
			wallH[6][6.5] = true;
			wallH[5][6.5] = true;
			wallH[4][6.5] = true;
			wallH[4][2.5] = true;
			wallH[5][2.5] = true;
			wallH[6][2.5] = true;
			wallH[7][2.5] = true;
			for (j=3;j<8;j++){
				wallH[j][7.5] = true;
			}
			for (j=3;j<9;j++){
				wallH[j][1.5] = true;
			}
			for (j=3;j<9;j++){
				wallH[j][8.5] = true;
			}
			// beeper
			beeperAtStart(2,8);
			// Karel
			startX=5;
			startY=5;
			startDirection="east";
			break;	
			
		} else if (skill === '_3') {
			// rows and columns
			rows = 11;
			columns = 11;
			// beepers
			for (j=6;j<11;j++) {
				for (i=1;i<11;i++) {
					beeperAtStart(j,i);
				}
			}
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
		} break;
		
	// Level 6: Find the middle
	case 6:
		if (skill === '_1') {
			// rows and columns
			rows = 6;
			columns = 10;
			// beepers
			for (i=1;i<5;i++)
				beeperAtStart(i,1);
			for (i=6;i<10;i++)
				beeperAtStart(i,1);
			// Karel
			startX=1;
			startY=1;
			startDirection="east";
			break;
			
		} else if (skill === '_2') {
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
			
		} else if (skill === '_3') {
			// rows and columns
			rows = 12;
			columns = 12;
			// horizontal walls
			for (j=1; j<2; j++) {
				for(i=1; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for(i=1; i<10; i+=3) {
				wallH[3][i+0.5] = true;
			}
			for (j=5; j<9; j++) {
				for(i=1; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for (j=10; j<12; j++) {
				for(i=1; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for (j=1; j<2; j++) {
				for(i=2; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for(i=2; i<10; i+=3) {
				wallH[3][i+0.5] = true;
			}
			for (j=5; j<9; j++) {
				for(i=2; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for (j=10; j<12; j++) {
				for(i=2; i<10; i+=3) {
					wallH[j][i+0.5] = true;
				}
			}
			for (j=3; j<12; j++) {
				wallH[j][10.5] = true;
			}
			wallH[2][1.5] = true;
			wallH[2][2.5] = true;
			wallH[2][4.5] = true;
			wallH[2][5.5] = true;
			wallH[2][7.5] = true;
			wallH[1][10.5] = true;
			wallH[4][5.5] = true;
			wallH[4][7.5] = true;
			wallH[4][8.5] = true;
			wallH[9][1.5] = true;
			wallH[9][2.5] = true;
			wallH[9][4.5] = true;
			wallH[9][8.5] = true;
			// vertical walls
			wallV[3.5][3] = true;
			wallV[3.5][4] = true;
			wallV[4.5][3] = true;
			wallV[4.5][4] = true;
			wallV[4.5][1] = true;
			wallV[8.5][6] = true;
			wallV[9.5][7] = true;
			wallV[8.5][7] = true;
			wallV[9.5][6] = true;
			wallV[1.5][9] = true;
			wallV[1.5][10] = true;
			wallV[2.5][9] = true;
			wallV[2.5][10] = true;
			wallV[3.5][1] = true;
			// beeper
			for (j=1;j<12;j++) {
				for (i=2;i<12;i+=3) {
					beeperAtStart(j,i);
				}
			}
			beeperAtStart(4,1);
			beeperAtStart(4,3);
			beeperAtStart(4,4);
			beeperAtStart(9,6);
			beeperAtStart(9,7);
			beeperAtStart(2,9);
			beeperAtStart(2,10);
			// Karel
			startX=4;
			startY=1;
			startDirection="east";	
			break;
		}
}

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

if ((rows>11) || (columns>11)) {
	if (rows > columns) {
		partition = rows;
	} else {
		partition = columns;
	}
} else {
	partition = 11;
}

// ======== KAREL'S BASIC FUNCTIONS =========
/**
* This let Karel move
* @function move
*/
function move() {
	//
	//  check karel's position
	//		
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			if (karel[j][i] && facing.east && wallV[j+0.5][i]===false) {
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
			} else if (karel[j][i] && facing.west && wallV[j-0.5][i]===false) {
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
				
			} else if (karel[j][i] && facing.north && wallH[j][i+0.5]===false) {
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
				
			} else if (karel[j][i] && facing.south && wallH[j][i-0.5]===false) {
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
/**
* This let Karel turn left
* @function turnLeft
*/
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

/**
* This let Karel pick up a beeper
* @function pickBeeper
*/
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
/**
* This let Karel put down a beeper
* @function putBeeper
*/
function putBeeper() {
	for(j=0; j<columns; j++) {
		for(i=0; i<rows; i++) {
			// check if karel got at least one beeper and if there's already one on the actual postition
			if (karel[j][i] && beeper[j][i]===false && countBeeper > 0) {
				beeper[j][i] = true;
				countBeeper -= 1;
				beepers.present = true;
				if (countBeeper === 0) {
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
/**
* This sets certain beepers in beeperToDraw true
* @function setBeeperTrue
* @see beeperToDraw
*/
function setBeeperTrue (beeperX, beeperY) {
	beeperToDraw[beeperX][beeperY] = true;
}
/**
* This sets certain beepers in beeperToDraw false
* @function setBeeperFalse
* @see beeperToDraw
*/
function setBeeperFalse (beeperX, beeperY) {
	beeperToDraw[beeperX][beeperY] = false;
}



/**
* @function facingNorth
* @return {Boolean} true if Karel is facing-north
* @see facing
*/
function facingNorth() {
	return facing.north;
}
/**
* @function facingSouth
* @return {Boolean} true if Karel is facing-south
* @see facing
*/
function facingSouth() {
	return facing.south;
}
/**
* @function facingWest
* @return {Boolean} true if Karel is facing-west
* @see facing
*/
function facingWest() {
	return facing.west;
}
/**
* @function facingEast
* @return {Boolean} true if Karel is facing-east
* @see facing
*/
function facingEast() {
	return facing.east;
}


/**
* @function notFacingNorth
* @return {Boolean} true if Karel is not facing-east
* @see facing
*/
function notFacingNorth() {
	return !facing.north;
}
/**
* @function notFacingSouth
* @return {Boolean} true if Karel is not facing-south
* @see facing
*/
function notFacingSouth() {
	return !facing.south;
}
/**
* @function notFacingWest
* @return {Boolean} true if Karel is not facing-west
* @see facing
*/
function notFacingWest() {
	return !facing.west;
}
/**
* @function notFacingEast
* @return {Boolean} true if Karel is not facing-east
* @see facing
*/
function notFacingEast() {
	return !facing.east;
}


/**
* @function beepersInBag
* @return {Boolean} true if there's at least one beeper in bag
* @see beepers
*/
function beepersInBag() {
	return beepers.inBag;
}


/**
* @function noBeepersInBag
* @return {Boolean} true if there's no beeper in bag
* @see beepers
*/
function noBeepersInBag() {
	return !beepers.inBag; 
}


/**
* @function beepersPresent
* @return {Boolean} true if there's a beeper on Karel's position
* @see beepers
*/
function beepersPresent() {
	return beepers.present;
}

/**
* @function noBeepersPresent
* @return {Boolean} true if there's no beeper on Karel's position
* @see beepers
*/
function noBeepersPresent() {
	return !beepers.present;
}
 

/**
* This function checks if there's a wall in front of or besides Karel
* @function checkWallAround
* @param {number} j value of x-axis
* @param {number} i value of y-axis
*/
function checkWallAround(j,i) {
	if (facing.north) {
		if (wallH[j][i+0.5]===false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallV[j-0.5][i]===false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallV[j+0.5][i]===false)
			clear.right = true;
		else 
			clear.right = false;
	} else if (facing.south) {
		if (wallH[j][i-0.5]===false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallV[j+0.5][i]===false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallV[j-0.5][i]===false)
			clear.right = true;
		else 
			clear.right = false;
	} else if (facing.west) {
		if (wallV[j-0.5][i]===false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallH[j][i-0.5]===false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallH[j][i+0.5]===false)
			clear.right = true;
		else 
			clear.right = false;
	} else {
		if (wallV[j+0.5][i]===false)
			clear.front = true;
		else 
			clear.front = false;
		if (wallH[j][i+0.5]===false)
			clear.left = true;
		else 
			clear.left = false;
		if (wallH[j][i-0.5]===false)
			clear.right = true;
		else 
			clear.right = false;
	}
}
/**
* This function checks if there's a wall in front of or besides Karel
* @function checkBeepersPresent
* @param {number} j value of x-axis
* @param {number} i value of y-axis
*/
function checkBeepersPresent(j,i) {
	if (beeper[j][i])
		beepers.present = true;
	else
		beepers.present = false;
}


/**
* @function frontIsClear
* @return {Boolean} true if front is clear
* @see clear
*/
function frontIsClear() {
	return clear.front;
}
/**
* @function leftIsClear
* @return {Boolean} true if left is clear
* @see clear
*/
function leftIsClear() {
	return clear.left;
}
/**
* @function rightIsClear
* @return {Boolean} true if right is clear
* @see clear
*/
function rightIsClear() {
	return clear.right;
}
/**
* @function frontIsBlocked
* @return {Boolean} true if front is blocked
* @see clear
*/
function frontIsBlocked() {
	return !clear.front;
}
/**
* @function leftIsBlocked
* @return {Boolean} true if left is blocked
* @see clear
*/
function leftIsBlocked() {
	return !clear.left;
}
/**
* @function rightIsBlocked
* @return {Boolean} true if right is blocked
* @see clear
*/
function rightIsBlocked() {
	return !clear.right;
}



/**
* This draws Karel's world
* @function draw
* @param {number} karelX x-position of Karel
* @param {number} karelY y-position of Karel
* @param {number} direction viewing direction of Karel
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
// 
// Source: http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml
//
/**
* All images will be loaded in the memory before the first call up  
* @function preloadimages
* @author http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml
*/
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



// ====== INIZIALISATION OF ALL POPOVERS =====
// ==== LOOP ALERT ====
// popover for loop alert
$('#loopAlert').popover({
	html: true,
	content: "<br><hr><span class='bigText'>Infinite loop!!!</span><hr><span id='smallText'>placeholder</span>",
	placement: 'loopAlert'
});

// ==== LEVEL INFO ====
// popover for level info
$('#levelInfoFalse').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'><b>Oh! Something went wrong. <br><br>Please try it again.</b></span>",
	placement: 'levelInfo'
});
$('#levelInfo0_0').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>This is Karel's world. As you can see it is very simple.<br>Karel waits for you to give him some commands. He only knows 4 commands. He is able to <b>move</b>, to <b>turn left</b>, to <b>pick up</b> and to <b>put down</b> a beeper. You find these commands by clicking on the <b>Basics</b>-button.<br><br>Now try it yourself! Let Karel take one step forward with the <b>move</b> command. Just click on <b>move</b>. To let Karel begin click on the <b>Start<b>-button.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_1').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Great! You see, that was quite easy. Now tell Karel to <b>pick up</b> the beeper he's standing on. Remember, you can find all comands using the <b>Basics</b>-button.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_2').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Really good! Now let's combine two commands. Let Karel take <b>one step forward</b> and <b>put down</b> a beeper after that.<br></span>",
	placement: 'levelInfo'
});
$('#levelInfo0_3').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Great! You learn very fast! You already know how to control Karel. Now it is time to learn something new.<br><br>In the next exercise we want Karel to decide himself what he'll do. Sounds difficult? Actually, it is very easy.<br>We want Karel to move one step forward, but only if he stands on a beeper. Take a look at the <b>Queries</b>-button; there you can find the <b>if</b>-button, with whom Karel can check things. The things Karel can check are called <b>conditions</b>. Now let's check if Karel stands on a beeper.<br>To do this click on the <b>if</b>-button and add a <b>condition</b> Karel shall check after that. In our case the condition <b>beepersPresent</b>. Only add <b>move</b> and we are done. Now Karel will check if he stands on a beeper and if so, he will make a step forward.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_4').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Very good! Now write the same function again and see what happens.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_5').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>As you see you see nothing. :)<br>That's because Karel would have moved only if he would have stood on a beeper. As it was not the case, Karel did not do anything. When Karel checks a condition and it is not true, we can give Karel an alternative command for this case. To give Karel an alternative command you can use the <b>else</b>-button.<br>Now check one more time if Karel stands on a beeper and if so let him <b>move</b>. After that click on the <b>else</b>-button to give Karel an <b>alternative command</b> and then click <b>putBeeper</b>. Karel will now check if he stands on a beeper; if so, he will make a step, if not, he'll put a <b>beeper down</b>.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_6').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Very fascinating, isn't it?<br>Okay enough <b>if</b>-queries for now. Let Karel walk to the wall. But instead of writing three times <b>move</b> we use a <b>for</b>-loop. A <b>for</b>-loop will reapeat a command as often as you say.<br>So let Karel repeat one <b>move</b> three times. Click on the <b>for</b>-button and choose 3. After that choose a command. In our case <b>move</b>.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_7').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Very good. Now you know the <b>for</b>-loop.<br>Let's try to save a function. As we stand against the wall write a function so Karel will turn around. Click twice on <b>turnLeft</b> and give your function a name. Call it <b>turnAround</b> and write it in the textfield above your function. Then click on <b>Save</b>. After you saved it, you can see your function at the <b>Own functions</b>-button. Click on the function <b>turnAround</b> and execute the code.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_8').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Nice job! There's only one more <b>query</b> to learn. Karel's now facing west. We want Karel to walk forward until he stands in front of a wall. To do that, we use the <b>while</b>-loop. Basically the <b>while</b>-loop works like the <b>if</b>-query. It checks a condition and if the condition is true, the function within the loop will be performed. Otherwise not.<br> But the big difference is that the <b>while</b>-loop checks the <b>condition</b> again and again until it is <b>false.</b> Only then it also stops with executing the function within.<br>So now click on the <b>while</b>-button and then on the <b>frontIsClear</b>-button. This condition is true, if there's no wall in front of Karel. Finally you have to tell Karel what to do after check the condition. So click on <b>move</b>. <br></span>",
	placement: 'levelInfo'
});
$('#levelInfo0_9').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Perfect! You're very good. Sometimes you want to check more than one conditions. So let's try it.<br> For this purpose we got the <b>operators</b>. Therby we can distinguish between the <b>&&</b>- and the <b>| |</b>- operator. The first one is the <b>AND</b>-operator. It is been used to check two conditions. <b>Only</b> if <b>both conditions</b> are <b>true</b>, the query will execute the function within. The second operator is the <b>OR</b>-operator. It also checks more than one condition, but in contrast to the <b>AND</b>-operator, the function within will be already executed if <b>at least one condition</b> is <b>true</b>. Only if none of them is true, he will not do anything.<br>Try to check if Karel <b>stands on a beeper</b> <b>and</b> if he's <b>facing west</b>. Then tell him to <b>turn around</b>.</span>",
	placement: 'levelInfo'
});
$('#levelInfo0_10').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Well, it really seems that you have got the knack!<br> One last thing to learn. If you want to give Karel more than one command in a query you have to use braces. Otherwise your function will not work correctly. At the end let's use a <b>negativ condition</b> and check if Karel's <b>right side</b> is <b>blocked</b>. As there's a wall, Karel will perform your functions. After clicking the <b>negativ condition</b> insert an <b>open brace</b>. Add the functions <b>move</b> and <turnLeft</b> subsequently. Finally add a <b>close brace</b><br></span>",
	placement: 'levelInfo'
});
$('#levelInfo0_11').popover({
	html: true,
	title: "<span class='levelHead'>Tutorial</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'><b>Congratulations!!!</b> <br> You've completed the tutorial! Now go to the actual game and try to complete all levels.<br><br><b>GOOD LUCK!!</b></span>",
	placement: 'levelInfo'
});




$('#levelInfo1_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 1</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>At the beginning you get a very easy task. As you can see, Karel stands bottom left in the corner. On position [3,1] there's a beeper. <br>(The 3 stands for the value of the x-axis, wich proceeds horizontally and the 1 stands for the value of the y-axis, wich proceeds vertically.)<br><br>Now just order Karel to move to the beeper and pick it up.</span>",
	placement: 'levelInfo'
});
$('#levelInfo2_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 2</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>This one is also quite easy. You have to go with Karel to the beeper and pick it up. After that you have to pick up the second beeper.</span>",
	placement: 'levelInfo'
});
$('#levelInfo3_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 3</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>You just learned the basic movements. <br>Now it is time to write your <b>first own function</b>.<br>In that level you have to do something Karel is not able to do yet. To reach the beeper you have to turn to the right. Just write a function called turnRight and save it. Now use this new function to pick up the beeper.</span>",
	placement: 'levelInfo'
});
$('#levelInfo4_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 4</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>In this level you're going to learn how to use the <b>if-query.</b><br> Move Karel to the beeper and then say Karel that he shall turn to the left but only if he stands on a beeper. If you use this <b>if-query</b> while Karel is positioned on a beeper, you will see that Karel will not move.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo5_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 5</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>We want Karel to move from left to right. One way to order Karel this is to write a number of 'move'-functions. But you shall know: most programmers are lazy people. :-) They don't like to write much code. So what's shorter than to wirite a lot of move's to get Karel to the other side?<br> The answer is the <b>for-loop</b>.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo6_1').popover({
	html: true,
	title: "<span class='levelHead'> Beginner: Level 6</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Now it is time for your first <b>while-loop</b>.<br> As you might already know the <b>while-loop</b> checks a condition and executes the function within the loop as long as the condition is checkn as true.<br> In this level Karel stands in a row full of beepers except of one position. Say Karel he shall move as long as he stands on a beeper and than stop at the position where no beeper is and put one beeper down.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo1_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 1</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>You've already gained some experiences with the <b>while-loop</b>. Now try to write and save another function wich you could name walkToWall.<br> This function is supposed to order Karel to move until the other end of his world. <br>But it also should work in different sized levels.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo2_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 2</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>In the level before you saved a new function which orders Karel to walk to the opposite wall. All you got to do now is try your function in this world and see if it still works. If so, your function works just perfectly.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo3_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 3</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Karel stands in the buttom left corner again. Try to write a function which let Karel walk from corner to corner until he stands again bottom left on his beeper. To make it a bit harder, try to put down a beeper in each corner.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo4_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 4</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Karel stands on a street made of beepers. But there's a hole in the street where no beepers are. Try to fill up the hole with beepers and then go to the opposite wall.<br> Little hint: Use the <b>while-loop</b> and check the wall to the right of you, while you walk along.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo5_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 5</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Karel is in the middle of a helix. Write a function that will lead out of the helix and get the beeper.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo6_2').popover({
	html: true,
	title: "<span class='levelHead'> Advanced: Level 6</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>As you can see there's a roof. The beeper shall form columns wich hold the roof. But the columns aren't completely yet. <br>Write a function to fill up the remaining holes of the coulumns with beepers.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo1_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 1</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>This level is completely empty yet. Your job is to put down beepers in the complete level in form of a chessboard.<br> That means that you're not allowed to put two beepers next to each other in a row or a cloumn, only diagonally. </span> ",
	placement: 'levelInfo'
});
$('#levelInfo2_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 2</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Write a function so Karel will form a huge 'X' out of beepers from buttom left to top right and top left to buttom right. <br>The middle of this cross will be position [6,6]</span> ",
	placement: 'levelInfo'
});
$('#levelInfo3_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 3</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Try to find the middle [6,6] of this level and put down a beeper.<br>Little hint: First try to find the middle of the horizontal plain and after that of the vertical.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo4_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 4</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Do you remember the level before where you put a beeper in the middle? Now we do the opposite. Write some code that let Karel put down beepers on every single position of the level except of the middle [6,6].</span> ",
	placement: 'levelInfo'
});
$('#levelInfo5_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 5</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>Half of this level is full of beepers, the other half is empty. Write a function for Karel, so he will pick up all the beepers from the right and put it down on the left.</span> ",
	placement: 'levelInfo'
});
$('#levelInfo6_3').popover({
	html: true,
	title: "<span class='levelHead'> Expert: Level 6</span><button type='button' class='close' aria-hidden='false'>x</button>",
	content: "<br><span class='levelBody'>This is the last level. If you're able to complete this one too, your programming skills are already quite good.<br> The task is very simple. Just collect all beepers.</span> ",
	placement: 'levelInfo'
});

// ==== FUNCTION TITLE INFO ====
// popover for function title info
$('#functionTitleInfo').popover({
	html: true,
	content: "<br><span class='levelBody'>Oh, you forgot to set a title for your function.<br> You can not save your function without a title.</span> ",
	placement: 'levelInfo'
});
/*
* this will open the popover with the info for the current level
* @function levelInfo
*/
function levelInfo() {
	$('#levelInfo'+level+skill).popover('toggle');
}

/**
* This will open a popover if the user did not enter the correct code.
* @function levelInfoFalse
*/
function levelInfoFalse() {
	$('#levelInfoFalse').popover('toggle');
}
/**
* This will open a popover if the user did not set a title for his own function.
* @function functionTitleInfo
*/
function functionTitleInfo() {
	$('#functionTitleInfo').popover('toggle');
}

/*
* ===== MENU BUTTONS =======
* event listenter for the menu buttons in the upper right corner
*/
$(document).bind('click', function(e) {
	
	// this will show inofrmation about the level and how the player is able to solve it
	if(e.target.id === 'buttonInfo') {
		levelInfo();
	
	// this will the player redirect to the level selection
	} else if (e.target.id === 'buttonBack') {
		window.location.href = 'karel_home.html';
	
	// this will the player redirect to the level selection
	} else if (e.target.id === 'buttonReset') {
		window.location.href = 'karel_game.html';
	
	// hide the levelInfo popover by clicking anywhere
	} else
		$('#levelInfo'+level+skill).popover('hide');
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


/**
* This will  show a popover if the player wants to run a infinite loop
* @function loopAlert
*/
function loopAlert() {
	$('#loopAlert').popover('toggle');
}


/*
* ====Tutorial variables =====
* these variable check if the user writes the correct code in the tutorial
*/
var step0 = "   move();";
var step1 = "   pickBeeper();";
var step2 = "   move();\n   putBeeper();";
var step3 = "if(beepersPresent())\n   move();";
var step4 = "if(beepersPresent())\n   move();";
var step5 = "if(beepersPresent())\n   move();\nelse\n   putBeeper();";
var step6 = "for(var i=0; i<3; i++)\n   move();";
var step7 = "   turnAround();";
var step8 = "while(frontIsClear())\n   move();";
var step9 = "if(rightIsClear() && facingWest())\n   turnAround();";
var step10 = "if(rightIsBlocked()) {\n   move();\n   turnLeft();\n}";




/**
* This will be called if the user wants to execute code
* @function userInput
*/
function userInput() {
	
	input = $('#textarea').val();
	
	
	/*
	* ====Tutorial =====
	* this is only important for level zero aka tutorial
	*/
	if(level === 0) {

		if (skill === '_0'){
			if (input.indexOf(step0)!==-1) {
				clearTextarea();
				skill = '_1';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}	
		} else if (skill === '_1'){
			if (input.indexOf(step1)!==-1) {
				clearTextarea();
				skill = '_2';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_2'){
			if (input.indexOf(step2)!==-1) {
				clearTextarea();
				skill = '_3';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_3'){
			if (input.indexOf(step3)!==-1) {
				clearTextarea();
				skill = '_4';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_4'){
			if (input.indexOf(step4)!==-1) {
				clearTextarea();
				skill = '_5';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_5'){
			if (input.indexOf(step5)!==-1) {
				clearTextarea();
				skill = '_6';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_6'){
			if (input.indexOf(step6)!==-1) {
				clearTextarea();
				skill = '_7';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_7'){
			if (input.indexOf(step7)!==-1) {
				clearTextarea();
				skill = '_8';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_8'){
			if (input.indexOf(step8)!==-1) {
				clearTextarea();
				skill = '_9';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_9'){
			if (input.indexOf(step9)!==-1) {
				clearTextarea();
				skill = '_10';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		} else if (skill === '_10'){
			if (input.indexOf(step10)!==-1) {
				clearTextarea();
				skill = '_11';
				eval(input);
				setTimeout(levelInfo,1000);
			} else {
				clearTextarea();
				levelInfoFalse();
				setTimeout(levelInfoFalse, 2000);
			}
		}
	
	/*
	* ===== DETECT INFINITE LOOPS ===== 
	* these queries are used to detect the infinte loops
	*/
	} else if ((input.indexOf(put0)!==-1) || (input.indexOf(put1)!==-1) || (input.indexOf(put2)!==-1) || (input.indexOf(put3)!==-1) || (input.indexOf(put4)!==-1) || (input.indexOf(put5)!==-1) || (input.indexOf(put6)!==-1) || (input.indexOf(put7)!==-1) || (input.indexOf(put8)!==-1) || (input.indexOf(negPut0)!==-1) || (input.indexOf(negPut1)!==-1) || (input.indexOf(negPut2)!==-1) || (input.indexOf(negPut3)!==-1) || (input.indexOf(negPut4)!==-1) || (input.indexOf(negPut5)!==-1) || (input.indexOf(negPut6)!==-1) || (input.indexOf(negPut7)!==-1) || (input.indexOf(negPut8)!==-1)) {
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to put down beepers.");
		setTimeout (loopAlert, 3000);
	
	} else if ((input.indexOf(pick0)!==-1) || (input.indexOf(pick1)!==-1) || (input.indexOf(pick2)!==-1) || (input.indexOf(pick3)!==-1) || (input.indexOf(pick4)!==-1) || (input.indexOf(pick5)!==-1) || (input.indexOf(pick6)!==-1) || (input.indexOf(pick7)!==-1) || (input.indexOf(pick8)!==-1) || (input.indexOf(negPick0)!==-1) || (input.indexOf(negPick1)!==-1) || (input.indexOf(negPick2)!==-1) || (input.indexOf(negPick3)!==-1) || (input.indexOf(negPick4)!==-1) || (input.indexOf(negPick5)!==-1) || (input.indexOf(negPick6)!==-1) || (input.indexOf(negPick7)!==-1) || (input.indexOf(negPick8)!==-1)) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to pick up beepers.");
		setTimeout (loopAlert, 3000);
		
	} else if ((input.indexOf(move0)!==-1) || (input.indexOf(move1)!==-1) || (input.indexOf(move2)!==-1) || (input.indexOf(move3)!==-1) || (input.indexOf(move4)!==-1) || (input.indexOf(negMove0)!==-1) || (input.indexOf(negMove1)!==-1) || (input.indexOf(negMove2)!==-1) || (input.indexOf(negMove3)!==-1) || (input.indexOf(negMove4)!==-1)) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to move.");
		setTimeout (loopAlert, 3000);
		
	} else if ((input.indexOf(turnLeft0)!==-1) || (input.indexOf(turnLeft1)!==-1) || (input.indexOf(negTurnLeft0)!==-1) || (input.indexOf(negTurnLeft1)!==-1)) {	
		$('#loopAlert').popover('toggle');
		$('#smallText').text("Karel wouldn't stop trying to turn to the left.");
		setTimeout (loopAlert, 3000);	
	
	//
	// if everything's fine the code will be executed
	//	
	} else
		eval(input);
			
	time = 0;
}

/**
* Only called once at the very beginning of the game to initialise Karel's position and its scenery
* @function windowLoad
*/
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


// 
// animates the text area
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
	if (e.target.id==="queries") {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#basics').popover('hide');
		$('#for').popover(); // because it is a popover within a popover, it has to be initalised within the same
		$('#queries').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') === false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id==="conditions") {
		$('#negConditions').popover('hide');
		$('#basics').popover('hide');
		$('#queries').popover('hide');
		$('#conditions').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') === false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id==="negConditions") {
		$('#conditions').popover('hide');
		$('#basics').popover('hide');
		$('#queries').popover('hide');
		$('#negConditions').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') === false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id==="basics") {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover();
		if($('#editOwnFunction').hasClass('btn btn-warning active') === false)
			$('#ownFunctions').popover('hide');
		
	} else if (e.target.id==='ownFunctions') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover();
		$('#deleteOwnFunction').popover(); // because it is a popover within a popover, it has to be initalised within the same
		$('#editOwnFunction').popover(); // because it is a popover within a popover, it has to be initalised within the same
	
	} else if (e.target.id==='start') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover('hide');
		
	} else if (e.target.id==='saveFunc') {
		$('#conditions').popover('hide');
		$('#negConditions').popover('hide');
		$('#queries').popover('hide');
		$('#basics').popover('hide');
		$('#ownFunctions').popover('hide');
	
	} else if (e.target.id==='for') {
		$('#for').popover();
	}
});

//
// insert the value of the selection buttons by clicking into textarea
//
$(document).bind("click", function(e) {
	
	// check if user clicked in the texarea
	// if so, he probably want to edit the his code at a certain position
	// in this case it is necessary to insert the function at the cursor position and not as usual at the end of the textarea
	if (e.target.id === 'textarea') {
		cursorPos = $('#textarea').prop('selectionStart');
	}
	
	
	
	// ==== DOCUMENT OBJECTS ==== 
	// avoid to insert value of the following buttons and document objects
	if ((e.target.value !== undefined) && (e.target.id !== "textarea") && (e.target.id !== "functionName")) {
		
		// ==== CATEGORIZATION BUTTONS ====
		// avoid to insert empty value of the categorization buttons
		if ((e.target.id !== "queries") && (e.target.id!== "basics") && (e.target.id!== "conditions") && (e.target.id!== "negConditions") && (e.target.id !== "saveFunc") && (e.target.id !== "start") && (e.target.id !== "clearFunc") && (e.target.id !== "rng") && (e.target.id !== "ownFunctions") && (e.target.id !== "deleteOwnFunction") && ($('#deleteOwnFunction').hasClass('btn btn-danger active') === false) && (e.target.id !== "editOwnFunction") && (e.target.id !== "for") && (e.target.id !== "for_2") && (e.target.id !== "for_3") && (e.target.id !== "for_4") && (e.target.id !== "for_5") && (e.target.id !== "for_6") && (e.target.id !== "for_7") && (e.target.id !== "for_8") && (e.target.id !== "for_9") && (e.target.id !== "for_10")) {
				
			// ==== OWN FUNCTIONS ==== 
			// check if it is own function so we have to add a semicolon
			if (e.target.className === 'btn btn-default conditions ownFunctions') {
				if (cursorPos === null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '')
						$('#textarea').val('   '+ e.target.value + ';').trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val() + '\n' +'   '+ e.target.value + ';').trigger('autosize.resize');
				} else {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '') {
						$('#textarea').val('   '+ e.target.value + ';').trigger('autosize.resize');
						cursorPos += e.target.value.length +4; //+4 because of the 4 spaces
					} else {
						//cursorPos = $('#textarea').prop('selectionStart');
						v = $('#textarea').val();
						textBefore = v.substring(0,  cursorPos );
						textAfter  = v.substring( cursorPos, v.length );
						$('#textarea').val( textBefore + '\n' + '   ' + e.target.value +';' + textAfter ).trigger('autosize.resize');
						cursorPos += e.target.value.length + 5; // +5 because of the line break, the 3 spaces and the semicolon
					}
				}
			// ==== BASIC FUNCTIONS ====
			// check if it is a basic function so we indent this part in the textarea
			// so the function will be easier to read in the textarea for user
			} else if ((e.target.id === "move") || (e.target.id === "turnLeft") || (e.target.id === "pickBeeper") || (e.target.id === "putBeeper")) {
				if (cursorPos === null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '')
						$('#textarea').val('   '+ e.target.value).trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val()+ '\n' +'   '+ e.target.value).trigger('autosize.resize');
				} else {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '') {
						$('#textarea').val('   '+ e.target.value).trigger('autosize.resize');
						cursorPos += e.target.value.length + 3;// +3 because of the 3 spaces
					} else {
						//cursorPos = $('#textarea').prop('selectionStart');
						v = $('#textarea').val();
						textBefore = v.substring(0,  cursorPos );
						textAfter  = v.substring( cursorPos, v.length );
						$('#textarea').val( textBefore + '\n' + '   ' + e.target.value + textAfter ).trigger('autosize.resize');
						cursorPos += e.target.value.length + 4; // +4 because of the line break and the 3 spaces
					}
				}
			// ==== QUERIES ====
			// check if it is a query
			// in that case we don't need a semicolon.		
			}else if((e.target.id === 'if') || (e.target.id === 'while') || (e.target.id === 'else')) {
				if (cursorPos === null) {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '')
						$('#textarea').val(e.target.value).trigger('autosize.resize');
					else
						$('#textarea').val($('#textarea').val() + '\n' + e.target.value).trigger('autosize.resize');
				} else {
					// check if there's already code within the textarea. If not, there's no line break necessary.
					if ($('#textarea').val() === '') {
						$('#textarea').val(e.target.value).trigger('autosize.resize');
						cursorPos += e.target.value.length;
					} else {
						v = $('#textarea').val();
						textBefore = v.substring(0,  cursorPos );
						textAfter  = v.substring( cursorPos, v.length );
						$('#textarea').val( textBefore + '\n' + e.target.value + textAfter ).trigger('autosize.resize');
						cursorPos += e.target.value.length + 1; // +1 because of one line break
					}
				}
					
			// ===== OPERATORS ====
			// check if there's already a query with its condition in the code
			// if not, there's no need of '&&' or '||'
			} else if ((e.target.id === 'bitAnd') || (e.target.id === 'bitOr')) {
				if ((lastBracePos !== -1) && (cursorPos === null)) {
					// cut off the last right brace and insert operator
					$('#textarea').val($('#textarea').val().substring(0,lastBracePos-1));
					$('#textarea').val($('#textarea').val() + ' ' + e.target.value + ' ').trigger('autosize.resize');
				
				} else if ((lastBracePos !== -1) && (cursorPos !== null)) {
				//	cursorPos = $('#textarea').prop('selectionStart');
					v = $('#textarea').val();
					textBefore = v.substring(0,  cursorPos-1 );
					textAfter  = v.substring( cursorPos, v.length );
					$('#textarea').val( textBefore + ' ' + e.target.value + ' ' + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +2 because of two spaces, but -1 because of the shortening of textBefore
				}
		
			// ===== BRACES ====
			// left brace doesn't need line break, just space.
			// right brace needs one.
			} else if ((e.target.id === 'braceleft_L') || (e.target.id === 'braceleft_R')) {
				if (cursorPos === null) {
					$('#textarea').val($('#textarea').val() + ' ' + e.target.value).trigger('autosize.resize');
				} else {
					//cursorPos = $('#textarea').prop('selectionStart');
					v = $('#textarea').val();
					textBefore = v.substring(0,  cursorPos );
					textAfter  = v.substring( cursorPos, v.length );
					$('#textarea').val( textBefore + ' ' + e.target.value + textAfter ).trigger('autosize.resize');
					cursorPos += e.target.value.length + 1; // +1 because of one space
				}
			} else if ((e.target.id === 'braceright_L') || (e.target.id === 'braceright_R')) {
				if (cursorPos === null) {
					$('#textarea').val($('#textarea').val() + '\n' + e.target.value).trigger('autosize.resize');
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
				v = $('#textarea').val();
				textBefore = v.substring(0,  cursorPos );
				textAfter  = v.substring( cursorPos, v.length );
				$('#textarea').val( textBefore + '\n' + e.target.value + textAfter ).trigger('autosize.resize');
				cursorPos += e.target.value.length + 1; // +1 because of one line break
				}
			// ======= REST = CONDITIONS ========
			// the rest don't get a line break
			} else {
				if (cursorPos === null) {
					$('#textarea').val($('#textarea').val() + e.target.value).trigger('autosize.resize');
					lastBracePos = $('#textarea').val().length;
				} else {
				//	cursorPos = $('#textarea').prop('selectionStart');
				v = $('#textarea').val();
				textBefore = v.substring(0,  cursorPos );
				textAfter  = v.substring( cursorPos, v.length );
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
	if (forCounter!==0) {
		if (cursorPos === null) {
			// check if there's already code within the textarea. If not, there's no line break necessary.
			if ($('#textarea').val() === '')
				$('#textarea').val('for(var i=0; i<' + forCounter + '; i++)').trigger('autosize.resize');
			else
				$('#textarea').val($('#textarea').val() + '\n' + 'for(var i=0; i<' + forCounter + '; i++)').trigger('autosize.resize');
		} else {
			v = $('#textarea').val();
			textBefore = v.substring(0,  cursorPos );
			textAfter  = v.substring( cursorPos, v.length );
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
	if (e.target.id === 'editOwnFunction') {
		if($('#editOwnFunction').hasClass('btn btn-warning active')) {
			$('#deleteOwnFunction').attr('class', 'btn btn-danger').popover('hide'); // close delete button and its popover
			$('#editOwnFunction').popover();
			console.log('editable');
		} else if ($('#editOwnFunction').hasClass('btn btn-warning'))
				$('#editOwnFunction').popover('hide');
	}
	
	/*
	* check if button "edit" is pressed
	* only then it is possible to edit a self made function
	*/
	if ( ($('#editOwnFunction').hasClass('btn btn-warning active')) && $(e.target).hasClass('btn btn-default conditions ownFunctions') ) {
		console.log(e.target.id);
		
		
		
		// create database
		var request = indexedDB.open('html5', 1);

		// onchange and create event
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

		// opening event. fires after upradeneeded
		request.onsuccess = function(){
			console.log('Datenbank geöffnet');
			var db = this.result;
			
			// read action
			var trans = db.transaction(['features'], 'readonly');
			var store = trans.objectStore('features');
			
			// cursor for all entries from 0 to end
			var range = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(range);
			
			// Is called for each dataset...and once more
			cursorRequest.onsuccess = function(evt){
				var result = evt.target.result;
				if(result){
					console.log('Funktion ' + result.value.title + '() gefunden');
					
					
					// check if pressed button coincide with a function in database
					// if so, it can be edited by reference to its title
					//
					if (result.value.title === e.target.id) {
						// fill the function's content and title into text field, so it can be editable
						$('#functionName').val(result.value.title);
						$('#textarea').val(result.value.content).trigger('autosize.resize');
						
						// delete entry
						var trans = db.transaction(['features'], 'readwrite');
						var store = trans.objectStore('features');
						
						// var key = result.value.key;	
						var request = store.delete(result.key);
						
						// we have to hide and delete the button seperatly, otherwise it will not disapear in "your functions"
						// because after deleting something from the database, the DB only refreshes after the page reloads
						//
						var removeFromButtons = '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+result.value.title+'" value="'+result.value.title+'()">'+result.value.title+'</button>';
						functionToButton = functionToButton.replace(removeFromButtons,'');
						
						request.onsuccess = function(result){
							console.log('Funktion ' + e.target.id + '() gelöscht');
						
						};
					}
					
						// move cursor to next position
					result.continue();

				}
			};	
		};
	} 	
});

/*
* DELETE OWN FUNCTION
* ===================
* function to enable deleting own functions as long as button "delete" is pressed
*/
$(document).bind("click", function(e) {
	if (e.target.id === 'deleteOwnFunction') {
		if ($('#deleteOwnFunction').hasClass('btn btn-danger active')) {
			$('#editOwnFunction').attr('class', 'btn btn-warning').popover('hide'); // close edit button and its popover
			$('#deleteOwnFunction').popover();
			console.log('deletable');
		} else if ($('#deleteOwnFunction').hasClass('btn btn-danger'))
			$('#deleteOwnFunction').popover('hide');
	} 
	
	//
	// check if button "delete a function" is pressed
	// only then it is possible to delete a self made function
	if ( ($('#deleteOwnFunction').hasClass('btn btn-danger active')) && $(e.target).hasClass('btn btn-default conditions ownFunctions') ) {
				
		// create database
		var request = indexedDB.open('html5', 1);

		// nchange and create event
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

		// opening event. fires after upradeneeded
		request.onsuccess = function(){
			console.log('Datenbank geöffnet');
			var db = this.result;

			// read action
			var trans = db.transaction(['features'], 'readonly');
			var store = trans.objectStore('features');

			// cursor for all entries from 0 to end
			var range = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(range);

			// Is called for each dataset...and once more
			cursorRequest.onsuccess = function(evt){
				var result = evt.target.result;
				if(result){
					console.log('Funktion ' + result.value.title + '() gefunden');
			
					// check if pressed button coincide with a function in database
					// if so, it can be deleted by reference to its title
					//
					if (result.value.title === e.target.id) {
						// Eintrag wieder löschen
						var trans = db.transaction(['features'], 'readwrite');
						var store = trans.objectStore('features');
						var request = store.delete(result.key);
						
						// we have to hide and delete the button seperatly, otherwise it will not disapear in "your functions"
						// because after deleting something from the database, the DB only refreshes after the page reloads
						//
						$(e.target).css({'display':'none'}); 
						var removeFromButtons = '<br><button type="button" class="btn btn-default conditions ownFunctions" id="'+result.value.title+'" value="'+result.value.title+'()">'+result.value.title+'</button>';
						functionToButton = functionToButton.replace(removeFromButtons,'');
						
						request.onsuccess = function() {
							console.log('Funktion ' + e.target.id + '() gelöscht');
						};
					}
					// move cursor to next entry
					result.continue();
				}
			};	
		};	
	}
});

/**
* This loads the content of the database for creating buttons in "Own functions"
* @function loadDatabase
*/
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

	// opening event
	request.onsuccess = function() {
		console.log('Datenbank geöffnet');
		var db = this.result;
		
		// read action
		var trans = db.transaction(['features'], 'readonly');
		var store = trans.objectStore('features');
		
		// cursor for all entries from 0 to end
		var range = IDBKeyRange.lowerBound(0);
		var cursorRequest = store.openCursor(range);
		
		// Wis called for each dataset...and once more
		cursorRequest.onsuccess = function(e){
			var result = e.target.result;
			if(result){
				console.log('Eintrag gefunden:', result.value);
				
				// creates new function and new button
				window[result.value.title] = new Function(result.value.content);
				newButton(result.value.title);
				
				// move cursor to next position
				result.continue();
			}
		};
	};
}