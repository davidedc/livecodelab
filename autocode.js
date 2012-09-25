// We starts with some declarations and two functions that take
// care of the UI parts (showing the correct state of the button and making it blink).
// The remaining part then takes care of the mutations.

var autocodeOn = false;
var blinkingAutocoderTimeout;
var blinkingAutocoderStatus = false;
var numberOfResults = 0;
var whichOneToChange = 0;

function blinkAutocodeIndicator() {
  blinkingAutocoderStatus = !blinkingAutocoderStatus;
  if (blinkingAutocoderStatus) {
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    mutate();
  }
}

function toggleAutocodeAndUpdateButtonAndBlinking() {
  autocodeOn = !autocodeOn;

  if (!autocodeOn) {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: inactif");
    } else {
      $("#autocodeIndicator").html("Autocode: off");
    }
    clearInterval(blinkingAutocoderTimeout);
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: actif");
    } else {
      $("#autocodeIndicator").html("Autocode: on");
    }
    blinkingAutocoderTimeout = setInterval('blinkAutocodeIndicator();', 500);
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    if (editor.getValue() === '' || (
    (window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))

    ) loadDemoOrTutorial('cubesAndSpikes');
  }
}

// Every time a mutation is invoked, the following happens
//
// * the program is scanned by a lexer
// the lexer could maintain/change/act on an user-defined state based on what it
// encounters but for the time being that is not used. So for the time being in practice the lexer
// parses the tokens based on regular expressions without using states.
// The definitions of what constitutes a token is defined by regexes in the "rules" section
//
// * for each token, a function is added to the Token array. For example "rotate 20" creates two
// tokens, which are two functions TRANSLATE and NUM
//
// * each of the "token" functions contains a) a string representation from the text in the program
// e.g. in the example above "rotate" and "20" and b) an accessory function for printout of the token and
// c) optionally, a function mutate() that changes the string of the field of a) with a mutated string
//
// * the token list is scanned. Each function is checked for whether it contains a "mutate"
// function. If yes, then it's added as a candidate to an "mutatableTokens" array.
//
// * a random option is picked and mutate is ran for that token
//
// * the token list is traversed and the strings are appended one to another, creating the new
// mutated program.

function mutate() {
	var editorContent = editor.getValue();
	var newContent;

	Tokens = [];
	try {
	INIT.lex(editorContent)
	} catch(e) {console.log(e);} 

	pickMutatableTokenAndMutateIt(Tokens);
	newContent = emit(Tokens);

	editor.setValue(newContent);
}


// Lexing states. There are no particular states so far.
var INIT = new McLexer.State() ;


// We keep an array of colours as they can be mutated too!
// TODO this is duplicated somewhere else in livecodelab.
var colours = Array( "aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgrey","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen" );

// The Tokens array will contain all of the tokens in the form of functions.
var Tokens = [] ;

// Token types. If they contain a mutate() function, then they can be mutated.
function COMMENT(string) {
  this.string = string ;
  this.toString = function () { return "COMMENT(" + string + ")" ; } ;
}

function SPACE(string) {
  this.string = string ;
  this.toString = function () { return "SPACE(" + string + ")" ; } ;
}

function NEWLINE(string) {
  this.string = string ;
  this.toString = function () { return "<br/>" ; } ;
}

function TRANSLATION(string) {
  this.string = string ;
  this.toString = function () { return "TRANSLATION(" + string + ")" ; } ;
}

function VARIABLE(string) {
  this.string = string ;
  this.toString = function () { return "VARIABLE(" + string + ")" ; } ;
}

function NUM(string) {
  this.string = string ;
  this.toString = function () { return "NUM(" + string + ")" ; } ;

  this.mutate = function () {
  	var num = new Number(this.string);
	var scalar;

	if ( 0 == num )
		num = 0.1;

	if ( Math.random() > 0.5 )
	{
		scalar = 0 - Math.random();
	} else {
		scalar = Math.random();
	}
	var offset = num * Math.random();

	num += offset;
	num = num.toFixed(2);

	console.log("mutate number "+ this.string +" -> "+num.toString());
	this.string = num.toString();
  }
}

function OP(string){
  this.string = string ;
  this.toString = function () { return "OP(" + string + ")" ; } ;
}

function ARGDLIM(string){
  this.string = string ;
  this.toString = function () { return "ARGDLIM(" + string + ")" ; } ;
}

function TAB(string){
  this.string = string ;
  this.toString = function () { return "TAB(" + string + ")" ; } ;
}

function DOONCE(string){
  this.string = string ;
  this.toString = function () { return "DOONCE(" + string + ")" ; } ;
}

function COLOUROP(string){
  this.string = string ;
  this.toString = function () { return "COLOUROP(" + string + ")" ; } ;
}

function COLOUR(string){
  this.string = string ;
  this.toString = function () { return "COLOUR(" + string + ")" ; } ;

  this.mutate = function () {
	var idx = Math.floor(Math.random() * colours.length);

	while ( this.string == colours[idx] )
		idx = Math.floor(Math.random() * colours.length);

	console.log("mutate colour " + this.string + " -> " + colours[idx]);
	this.string = colours[idx];
  }
}

function MESH(string){
  this.string = string ;
  this.toString = function () { return "MESH(" + string + ")" ; } ;

  this.mutate = function () {
  	switch(this.string)
	{
		case 'box':
			this.string = 'ball'
			return;
		case 'ball':
			this.string = 'box'
			return;
		case 'line':
			this.string = 'rect'
			return;
		case 'rect':
			this.string = 'line'
			return;
	}
  }
}

function STATEFUN(string){
  this.string = string ;
  this.toString = function () { return "STATEFUN(" + string + ")" ; } ;
}

function ITERATION(string){
  this.string = string ;
  this.toString = function () { return "ITERATION(" + string + ")" ; } ;

  this.mutate = function () {
  	var pat = /\d/;
	var num = pat.exec(this.string);

	console.log("ITER NUM: "+num);
	if ( Math.random() > 0.5 )
	{
		num++;
	} else {
		num--;
	}

	this.string = num.toString()+" times ->"
  }
}


function UNKNOWN(string){
  this.string = string ;
  this.toString = function () { return "UNKNOWN(" + string + ")" ; } ;
}


// Rules are used to
//
// * define how tokens are picked up from text (i.e. which regex)
//
// * how the lexer behaves depending on different states. This is currently not used.

INIT (/\/\/.*\n/) (function (match,rest,state) {
    Tokens.push(new COMMENT(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/\t/) (function (match,rest,state) {
    Tokens.push(new TAB(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/-?[0-9]+\.?[0-9]*/) (function (match,rest,state) {
    Tokens.push(new NUM(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/[*|\/|+|-]/) (function (match,rest,state) {
    Tokens.push(new OP(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/,/) (function (match,rest,state) {
    Tokens.push(new ARGDLIM(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/[\n|\r]{1,2}/) (function (match,rest,state) {
    Tokens.push(new NEWLINE(match[0])); 
    return state.continuation(rest) ;
 }) ;

// translations
INIT (/rotate/) (function (match,rest,state) {
    Tokens.push(new TRANSLATION(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/move/) (function (match,rest,state) {
    Tokens.push(new TRANSLATION(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/scale/) (function (match,rest,state) {
    Tokens.push(new TRANSLATION(match[0])); 
    return state.continuation(rest) ;
 }) ;

// colour
for( var scanningAllColors=0; scanningAllColors < colours.length;scanningAllColors++)
{
	INIT (new RegExp( colours[scanningAllColors] )) (function (match,rest,state) { Tokens.push(new COLOUR(match[0])); return state.continuation(rest) ; }) ;
}

// colour ops
INIT (/background/) (function (match,rest,state) {
    Tokens.push(new COLOUROP(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/fill/) (function (match,rest,state) {
    Tokens.push(new COLOUROP(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/stroke/) (function (match,rest,state) {
    Tokens.push(new COLOUROP(match[0])); 
    return state.continuation(rest) ;
 }) ;

// hmm  TODO
INIT (/simpleGradient/) (function (match,rest,state) {
    Tokens.push(new COLOUROP(match[0])); 
    return state.continuation(rest) ;
 }) ;

// mesh
INIT (/box/) (function (match,rest,state) {
    Tokens.push(new MESH(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/ball/) (function (match,rest,state) {
    Tokens.push(new MESH(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/rect/) (function (match,rest,state) {
    Tokens.push(new MESH(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/line/) (function (match,rest,state) {
    Tokens.push(new MESH(match[0])); 
    return state.continuation(rest) ;
 }) ;

// state changes?
INIT (/ballDetail/) (function (match,rest,state) {
    Tokens.push(new STATEFUN(match[0])); 
    return state.continuation(rest) ;
 }) ;

INIT (/animationStyle\s\w+/) (function (match,rest,state) {
    Tokens.push(new STATEFUN(match[0])); 
    return state.continuation(rest) ;
 }) ;

// iteration
INIT (/\d+\s+times\s+->/) (function (match,rest,state) {
    Tokens.push(new ITERATION(match[0])); 
    return state.continuation(rest) ;
 }) ;

// vars
INIT (/time/) (function (match,rest,state) {
    Tokens.push(new VARIABLE(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/delay/) (function (match,rest,state) {
    Tokens.push(new VARIABLE(match[0])); 
    return state.continuation(rest) ;
 }) ;

// special
INIT (/\?doOnce\s+->\s*/) (function (match,rest,state) {
    Tokens.push(new DOONCE(match[0])); 
    return state.continuation(rest) ;
 }) ;


// ignore white space ?
INIT (/ +/) (function (match,rest,state) {
    Tokens.push(new SPACE(match[0])); 
    return state.continuation(rest) ;
 }) ;



// The bad stuff
INIT (/color\s*\(.+\)/) (function (match,rest,state) {
    Tokens.push(new UNKNOWN(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/noFill/) (function (match,rest,state) {
    Tokens.push(new UNKNOWN(match[0])); 
    return state.continuation(rest) ;
 }) ;
INIT (/strokeSize/) (function (match,rest,state) {
    Tokens.push(new UNKNOWN(match[0])); 
    return state.continuation(rest) ;
 }) ;


// Traverses the Tokens array and concatenates the strings, hence generating a possibly mutated program.

function emit( stream )
{
	var ret = "";

	for( var scanningTheStream=0; scanningTheStream<stream.length; scanningTheStream++ )
	{
		ret = ret + stream[scanningTheStream].string
	}

	return ret;
}

// Checks whether a token can mutate by checking whether the mutate function exists.
function canMutate( token )
{
	if ( typeof token.mutate == 'function' )
		return true;
	return false;
}

// Scans the tokens and collects the mutatable ones. Then picks one random and invokes its mutate().

function pickMutatableTokenAndMutateIt( stream )
{
	var mutatableTokens = Array();

	for( var scanningTheStream=0; scanningTheStream<stream.length; scanningTheStream++ )
	{
		if ( canMutate( stream[scanningTheStream] ) )
		{
			mutatableTokens.push(scanningTheStream);
		}
	}

	if ( 0 == mutatableTokens.length )
	{
		console.log('no possible mutations');
		return;
	}

	console.log(mutatableTokens);

	var idx = Math.floor(Math.random() * mutatableTokens.length);

	stream[ mutatableTokens[idx] ].mutate();
}


// Currently unused.

function replaceTimeWithAConstant() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(time)/gi;
  } else {
    rePattern = /(temps)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      return '' + Math.floor(Math.random() * 20) + 1;
    }
    return match;
  });
  editor.setValue(editorContent);
}
