/*jslint browser: true, nomen: true, devel: true */
/*global frenchVersion, $, Detector, forceCanvasRenderer, userWarnedAboutWebglExamples: true, fakeText, undimEditor, editor, doTheSpinThingy: true, shrinkFakeText*/

'use strict';

if (!frenchVersion) {

    var roseDemo = [
        "// 'A rose' by Guy John",
        "// Mozilla Festival 2012",
        "// adapted from 'A rose' by Lib4tech",
        "",
        "scale 1.5",
        "animationStyle paintOver",
        "rotate frame/100",
        "fill 255-((frame/2)%255),0,0",
        "stroke 255-((frame/2)%255),0,0",
        "scale 1-((frame/2)%255) / 255",
        "box"
    ].join("\n");

    var cheeseAndOlivesDemo = [
        "// 'Cheese and olives' by",
        "// Davina Tirvengadum",
        "// Mozilla festival 2012",
        "",
        "background white",
        "scale .3",
        "move 0,-1",
        "fill yellow",
        "stroke black",
        "rotate",
        "strokeSize 3",
        "line 4",
        "box",
        "",
        "rotate 2,3",
        "move 0,3",
        "scale .3",
        "fill black",
        "stroke black",
        "ball",
        "",
        "rotate 3",
        "move 5",
        "scale 1",
        "fill green",
        "stroke green",
        "ball",
        "",
        "rotate 1",
        "move -3",
        "scale 1",
        "fill yellow",
        "stroke yellow",
        "ball"
    ].join("\n");

    var simpleCubeDemo = [
        "// there you go!",
        "// a simple cube!",
        "",
        "background yellow",
        "rotate 0,time/2000,time/2000",
        "box"
    ].join("\n");

    var webgltwocubesDemo = [
        "background 155,255,255",
        "2 times ->",
        "\trotate 0, 1, time/2000",
        "\tbox"
    ].join("\n");

    var cubesAndSpikes = [
        "simpleGradient fuchsia,color(100,200,200),yellow",
        "scale 2.1",
        "5 times ->",
        "\trotate 0,1,time/5000",
        "\tbox 0.1,0.1,0.1",
        "\tmove 0,0.1,0.1",
        "\t3 times ->",
        "\t\trotate 0,1,1",
        "\t\tbox 0.01,0.01,1"
    ].join("\n");

    var webglturbineDemo = [
        "background 155,55,255",
        "70 times ->",
        "\trotate time/100000,1,time/100000",
        "\tbox"
    ].join("\n");

    var webglzfightartDemo = [
        "// Explore the artifacts",
        "// of your GPU!",
        "// Go Z-fighting, go!",
        "scale 5",
        "rotate",
        "fill red",
        "box",
        "rotate 0.000001",
        "fill yellow",
        "box"
    ].join("\n");

    var littleSpiralOfCubes = [
        "background orange",
        "scale 0.1",
        "10 times ->",
        "\trotate 0,1,time/1000",
        "\tmove 1,1,1",
        "\tbox"
    ].join("\n");

    var tentacleDemo = [
        "background 155,255,155",
        "scale 0.15",
        "3 times ->",
        "\trotate 0,1,1",
        "\t10 times ->",
        "\t\trotate 0,1,time/1000",
        "\t\tscale 0.9",
        "\t\tmove 1,1,1",
        "\t\tbox"
    ].join("\n");

    var lampDemo = [
        "animationStyle motionBlur",
        "simpleGradient red,yellow,color(255,0,255)",
        "//animationStyle paintOver",
        "scale 2",
        "rotate time/4000, time/4000,  time/4000",
        "90 times ->",
        "\trotate time/200000, time/200000,  time/200000",
        "\tline",
        "\tmove 0.5,0,0",
        "\tline",
        "\tmove -0.5,0,0",
        "\tline",
        "\tline"
    ].join("\n");

    var trillionfeathersDemo = [
        "animationStyle paintOver",
        "move 2,0,0",
        "scale 2",
        "rotate",
        "20 times ->",
        "\trotate",
        "\tmove 0.25,0,0",
        "\tline",
        "\tmove -0.5,0,0",
        "\tline"
    ].join("\n");

    var monsterblobDemo = [
        "ballDetail 6",
        "animationStyle motionBlur",
        "rotate time/5000",
        "simpleGradient fuchsia,aqua,yellow",
        "5 times ->",
        "\trotate 0,1,time/5000",
        "\tmove 0.2,0,0",
        "\t3 times ->",
        "\t\trotate 1",
        "\t\tball -1"
    ].join("\n");

    var industrialMusicDemo = [
        "bpm 88",
        "play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'",
        "play 'beepC'  ,'zxzz zzzz xzzx xxxz'",
        "play 'beepA'  ,'zzxz zzzz zzxz zzzz'",
        "play 'lowFlash'  ,'zzxz zzzz zzzz zzzz'",
        "play 'beepB'  ,'xzzx zzzz zxzz zxzz'",
        "play 'voltage'  ,'xzxz zxzz xzxx xzxx'",
        "play 'tranceKick'  ,'zxzx zzzx xzzz zzxx'"
    ].join("\n");

    var trySoundsDemo = [
        "bpm 88",
        "// leave this one as base",
        "play 'tranceKick'  ,'zxzx zzzx xzzz zzxx'",
        "",
        "// uncomment the sounds you want to try",
        "//play 'toc'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'highHatClosed'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'highHatOpen'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'toc2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'toc3'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'toc4'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'snare'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'snare2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'china'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'crash'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'crash2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'crash3'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'ride'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'glass'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'glass1'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'glass2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'glass3'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'thump'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'lowFlash'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'lowFlash2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'tranceKick2'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'tranceKick'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'wosh'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'voltage'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'beepA'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'beepB'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'beepC'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'beepD'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'beep'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'hello'  ,'zzxz zzzz zzxz zzzz'",
        "//play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'"
    ].join("\n");

    var springysquaresDemo = [
        "animationStyle motionBlur",
        "simpleGradient fuchsia,color(100,200,200),yellow",
        "scale 0.3",
        "3 times ->",
        "\tmove 0,0,0.5",
        "\t5 times ->",
        "\t\trotate time/2000",
        "\t\tmove 0.7,0,0",
        "\t\trect"
    ].join("\n");

    var diceDemo = [
        "animationStyle motionBlur",
        "simpleGradient color(255),moccasin,peachpuff",
        "stroke 255,100,100,255",
        "fill red,155",
        "move -0.5,0,0",
        "scale 0.3",
        "3 times ->",
        "\tmove 0,0,0.5",
        "\t1 times ->",
        "\t\trotate time/1000",
        "\t\tmove 2,0,0",
        "\t\tbox"
    ].join("\n");

    var webglalmostvoronoiDemo = [
        "scale 10",
        "2 times ->",
        "\trotate 0,1,time/10000",
        "\tball -1"
    ].join("\n");

    var webglshardsDemo = [
        "scale 10",
        "fill 0",
        "strokeSize 7",
        "5 times ->",
        "\trotate 0,1,time/20000",
        "\tball ",
        "\trotate 0,1,1",
        "\tball -1.01"
    ].join("\n");

    var webglredthreadsDemo = [
        "scale 10.5",
        "background black",
        "stroke red",
        "noFill",
        "strokeSize 7",
        "5 times ->",
        "\trotate time/20000",
        "\tball",
        "\trotate 0,1,1",
        "\tball"
    ].join("\n");

    var webglnuclearOctopusDemo = [
        "simpleGradient black,color(0,0,(time/5)%255),black",
        "scale 0.2",
        "move 5,0,0",
        "animationStyle motionBlur",
        "//animationStyle paintOver",
        "stroke 255,0,0,120",
        "fill time%255,0,0",
        "pushMatrix",
        "count = 0",
        "3 times ->",
        "\tcount++",
        "\tpushMatrix",
        "\trotate count+3+time/1000,2+count + time/1000,4+count",
        "\t120 times ->",
        "\t\tscale 0.9",
        "\t\tmove 1,1,0",
        "\t\trotate time/100",
        "\t\tbox",
        "\tpopMatrix"
    ].join("\n");

} else {
  // French demos **********************************

    simpleCubeDemo = [
        "// there you go!",
        "// a simple cube!",
        "",
        "fond jaune",
        "tourne 0,temps/2000,temps/2000",
        "boite"
    ].join("\n");

    webgltwocubesDemo = [
        "fond 155,255,255",
        "2 fois ->",
        "\ttourne 0, 1, temps/2000",
        "\tboite"
    ].join("\n");

    cubesAndSpikes = [
        "dégradéSimple fuchsia,couleur(100,200,200),jaune",
        "taille 2.1",
        "5 fois ->",
        "\ttourne 0,1,temps/5000",
        "\tboite 0.1,0.1,0.1",
        "\tdeplace 0,0.1,0.1",
        "\t3 fois ->",
        "\t\ttourne 0,1,1",
        "\t\tboite 0.01,0.01,1"
    ].join("\n");

    webglturbineDemo = [
        "fond 155,55,255",
        "70 fois ->",
        "\ttourne temps/100000,1,temps/100000",
        "\tboite"
    ].join("\n");

    webglzfightartDemo = [
        "// Explore the artifacts",
        "// of your GPU!",
        "// Go Z-fighting, go!",
        "taille 5",
        "tourne",
        "remplissage rouge",
        "boite",
        "tourne 0.000001",
        "remplissage jaune",
        "boite"
    ].join("\n");


    littleSpiralOfCubes = [
        "fond orange",
        "taille 0.1",
        "10 fois ->",
        "\ttourne 0,1,temps/1000",
        "\tdeplace 1,1,1",
        "\tboite"
    ].join("\n");


    tentacleDemo = [
        "fond 155,255,155",
        "taille 0.15",
        "3 fois ->",
        "\ttourne 0,1,1",
        "\t10 fois ->",
        "\t\ttourne 0,1,temps/1000",
        "\t\ttaille 0.9",
        "\t\tdeplace 1,1,1",
        "\t\tboite"
    ].join("\n");

    lampDemo = [
        "styleAnimation flouMouvement",
        "dégradéSimple rouge,jaune,couleur(255,0,255)",
        "//styleAnimation peindreAuDessus",
        "taille 2",
        "tourne temps/4000, temps/4000,  temps/4000",
        "90 fois ->",
        "\ttourne temps/200000, temps/200000,  temps/200000",
        "\tligne",
        "\tdeplace 0.5,0,0",
        "\tligne",
        "\tdeplace -0.5,0,0",
        "\tligne",
        "\tligne"
    ].join("\n");

    trillionfeathersDemo = [
        "styleAnimation peindreAuDessus",
        "deplace 2,0,0",
        "taille 2",
        "tourne",
        "20 fois ->",
        "\ttourne",
        "\tdeplace 0.25,0,0",
        "\tligne",
        "\tdeplace -0.5,0,0",
        "\tligne"
    ].join("\n");


    monsterblobDemo = [
        "balleDetail 6",
        "styleAnimation flouMouvement",
        "tourne temps/5000",
        "dégradéSimple fuchsia,aqua,jaune",
        "5 fois ->",
        "\ttourne 0,1,temps/5000",
        "\tdeplace 0.2,0,0",
        "\t3 fois ->",
        "\t\ttourne 1",
        "\t\tballe -1"
    ].join("\n");

    industrialMusicDemo = [
        "bpm 88",
        "ajouteSon 'alienBeep'  ,'zzxz zzzz zzxz zzzz'",
        "ajouteSon 'beepC'  ,'zxzz zzzz xzzx xxxz'",
        "ajouteSon 'beepA'  ,'zzxz zzzz zzxz zzzz'",
        "ajouteSon 'lowFlash'  ,'zzxz zzzz zzzz zzzz'",
        "ajouteSon 'beepB'  ,'xzzx zzzz zxzz zxzz'",
        "ajouteSon 'voltage'  ,'xzxz zxzz xzxx xzxx'",
        "ajouteSon 'tranceKick'  ,'zxzx zzzx xzzz zzxx'"
    ].join("\n");

    trySoundsDemo = [
        "bpm 88",
        "// leave this one as base",
        "ajouteSon 'tranceKick'  ,'zxzx zzzx xzzz zzxx'",
        "",
        "// uncomment the sounds you want to try",
        "//ajouteSon 'toc'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'highHatClosed'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'highHatOpen'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'toc2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'toc3'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'toc4'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'snare'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'snare2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'china'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'crash'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'crash2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'crash3'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'ride'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'glass'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'glass1'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'glass2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'glass3'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'thump'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'lowFlash'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'lowFlash2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'tranceKick2'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'tranceKick'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'wosh'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'voltage'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'beepA'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'beepB'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'beepC'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'beepD'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'beep'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'hello'  ,'zzxz zzzz zzxz zzzz'",
        "//ajouteSon 'alienBeep'  ,'zzxz zzzz zzxz zzzz'"
    ].join("\n");

    springysquaresDemo = [
        "styleAnimation flouMouvement",
        "dégradéSimple fuchsia,couleur(100,200,200),jaune",
        "taille 0.3",
        "3 fois ->",
        "\tdeplace 0,0,0.5",
        "\t5 fois ->",
        "\t\ttourne temps/2000",
        "\t\tdeplace 0.7,0,0",
        "\t\trect"
    ].join("\n");

    diceDemo = [
        "styleAnimation flouMouvement",
        "dégradéSimple couleur(255),moccasin,peche",
        "trait 255,100,100,255",
        "remplissage rouge,155",
        "deplace -0.5,0,0",
        "taille 0.3",
        "3 fois ->",
        "\tdeplace 0,0,0.5",
        "\t1 fois ->",
        "\t\ttourne temps/1000",
        "\t\tdeplace 2,0,0",
        "\t\tboite"
    ].join("\n");

    webglalmostvoronoiDemo = [
        "taille 10",
        "2 fois ->",
        "\ttourne 0,1,temps/10000",
        "\tballe -1"
    ].join("\n");

    webglshardsDemo = [
        "taille 10",
        "remplissage 0",
        "traitSize 7",
        "5 fois ->",
        "\ttourne 0,1,temps/20000",
        "\tballe ",
        "\ttourne 0,1,1",
        "\tballe -1.01"
    ].join("\n");

    webglredthreadsDemo = [
        "taille 10.5",
        "fond noir",
        "trait rouge",
        "sansRemplissage",
        "traitSize 7",
        "5 fois ->",
        "\ttourne temps/20000",
        "\tballe",
        "\ttourne 0,1,1",
        "\tballe"
    ].join("\n");

    webglnuclearOctopusDemo = [
        "dégradéSimple noir,couleur(0,0,(temps/5)%255),noir",
        "taille 0.2",
        "deplace 5,0,0",
        "styleAnimation flouMouvement",
        "//styleAnimation peindreAuDessus",
        "trait 255,0,0,120",
        "remplissage temps%255,0,0",
        "sauveMatrice",
        "count = 0",
        "3 fois ->",
        "\tcount++",
        "\tsauveMatrice",
        "\ttourne count+3+temps/1000,2+count + temps/1000,4+count",
        "\t120 fois ->",
        "\t\ttaille 0.9",
        "\t\tdeplace 1,1,0",
        "\t\ttourne temps/100",
        "\t\tboite",
        "\trestaureMatrice"
    ].join("\n");

  //*********************************************
}

if (!frenchVersion) {

    var introTutorial = [
        "// Lines beginning with two",
        "// slashes (like these) are just comments.",
        "// Everything else is run",
        "// about 30 to 60 times per second",
        "// in order to create an animation.",
        "// Click the link below to start the tutorial.",
        "// next-tutorial:hello_world"
    ].join("\n");

    var helloworldTutorial = [
        "// type these three letters",
        "// in one of these empty lines below:",
        "// 'b' and 'o' and 'x'",
        "",
        "",
        "// (you should then see a box facing you)",
        "// click below for the next tutorial",
        "// next-tutorial:some_notes"
    ].join("\n");

    var somenotesTutorial = [
        "// If this makes sense to you:",
        "// the syntax is similar to Coffeescript",
        "// and the commands are almost",
        "// like Processing.",
        "// If this doesn't make sense to you",
        "// don't worry.",
        "// next-tutorial:rotate"
    ].join("\n");

    var rotateTutorial = [
        "// now that we have a box",
        "// let's rotate it:",
        "// type 'rotate 1' in the",
        "// line before the 'box'",
        "",
        "box",
        "",
        "// click for the next tutorial:",
        "// next-tutorial:frame"
    ].join("\n");

    var frameTutorial = [
        "// make the box spin",
        "// by replacing '1' with 'frame'",
        "rotate 1",
        "box",
        "",
        "// 'frame' contains a number",
        "// always incrementing as",
        "// the screen is re-drawn.",
        "// (use 'frame/100' to slow it down)",
        "// next-tutorial:time"
    ].join("\n");

    var timeTutorial = [
        "// 'frame/100' has one problem:",
        "// faster computers will make",
        "// the cube spin too fast.",
        "// Replace it with 'time/2000'.",
        "rotate frame/100",
        "box",
        "",
        "// 'time' counts the",
        "// number of milliseconds since",
        "// the program started, so it's",
        "// independent of how fast",
        "// the computer is at drawing.",
        "// next-tutorial:move"
    ].join("\n");

    var moveTutorial = [
        "// you can move any object",
        "// by using 'move'",
        "box",
        "move 1,1,0",
        "box",
        "",
        "// try to use a rotate before",
        "// the first box to see how the",
        "// scene changes.",
        "// next-tutorial:scale"
    ].join("\n");

    var scaleTutorial = [
        "// you can make an object bigger",
        "// or smaller by using 'scale'",
        "rotate 3",
        "box",
        "move 1",
        "scale 2",
        "box",
        "",
        "// try to use scale or move before",
        "// the first box to see how the",
        "// scene changes.",
        "// next-tutorial:times"
    ].join("\n");

    var timesTutorial = [
        "// 'times' (not to be confused with",
        "// 'time'!) can be used to",
        "// repeat operations like so:",
        "rotate 1",
        "3 times ->",
        "\tmove 0.2,0.2,0.2",
        "\tbox",
        "",
        "// note how the tabs indicate",
        "// exactly the block of code",
        "// to be repeated.",
        "// next-tutorial:fill"
    ].join("\n");

    var fillTutorial = [
        "// 'fill' changes the",
        "// color of all the faces:",
        "rotate 1",
        "fill 255,255,0",
        "box",
        "",
        "// the three numbers indicate ",
        "// red green and blue values.",
        "// You can also use color names such as 'indigo'",
        "// Try replacing the numbers with",
        "// 'angleColor'",
        "// next-tutorial:stroke"
    ].join("\n");

    var strokeTutorial = [
        "// 'stroke' changes all the",
        "// edges:",
        "rotate 1",
        "strokeSize 5",
        "stroke 255,255,255",
        "box",
        "",
        "// the three numbers are RGB",
        "// but you can also use the color names",
        "// or the special color 'angleColor'",
        "// Also you can use 'strokeSize'",
        "// to specify the thickness.",
        "// next-tutorial:color_names"
    ].join("\n");

    var colornamesTutorial = [
        "// you can call colors by name",
        "// try to un-comment one line:",
        "//fill greenyellow",
        "//fill indigo",
        "//fill lemonchiffon // whaaaat?",
        "rotate 1",
        "box",
        "",
        "// more color names here:",
        "// http://html-color-codes.info/color-names/",
        "// (just use them in lower case)",
        "// next-tutorial:lights"
    ].join("\n");


    var lightsTutorial = [
        "// 'ambientLight' creates an",
        "// ambient light so things have",
        "// some sort of shading:",
        "ambientLight 0,255,255",
        "rotate time/1000",
        "box",
        "",
        "// you can turn that light on and ",
        "// off while you build the scene",
        "// by using 'lights' and 'noLights'",
        "// next-tutorial:background"
    ].join("\n");

    var backgroundTutorial = [
        "// 'background' creates a",
        "// solid background:",
        "background 0,0,255",
        "rotate time/1000",
        "box",
        "",
        "// next-tutorial:gradient"
    ].join("\n");

    var gradientTutorial = [
        "// even nicer, you can paint a",
        "// background gradient:",
        "simpleGradient color(190,10,10),color(30,90,100),color(0)",
        "rotate time/1000",
        "box",
        "",
        "// next-tutorial:line"
    ].join("\n");

    var lineTutorial = [
        "// draw lines like this:",
        "20 times ->",
        "\trotate time/9000",
        "\tline",
        "",
        "// next-tutorial:ball"
    ].join("\n");

    var ballTutorial = [
        "// draw balls like this:",
        "ballDetail 10",
        "3 times ->",
        "\tmove 0.2,0.2,0.2",
        "\tball",
        "",
        "// ('ballDetail' is optional)",
        "// next-tutorial:pushpopMatrix"
    ].join("\n");

    var pushpopMatrixTutorial = [
        "// pushMatrix creates a bookmark of",
        "// the position, which you can",
        "// return to later by using popMatrix.",
        "// You can reset using 'resetMatrix'.",
        "rotate time/1000",
        "pushMatrix // bookmark the position after the rotation",
        "line",
        "move 0.5,0,0",
        "line",
        "popMatrix // go back to the bookmarked position",
        "move -0.5,0,0",
        "line",
        "resetMatrix // resets the position",
        "line // not affected by initial rotation",
        "// next-tutorial:animation_style"
    ].join("\n");

    var animationstyleTutorial = [
        "// try uncommenting either line",
        "// with the animationStyle",
        "background 255",
        "//animationStyle motionBlur",
        "//animationStyle paintOver",
        "rotate frame/10",
        "box",
        "",
        "// next-tutorial:do_once"
    ].join("\n");

    var doonceTutorial = [
        "// delete either check mark below",
        "rotate time/1000",
        "✓doOnce ->",
        "\tbackground 255",
        "\tfill 255,0,0",
        "✓doOnce -> ball",
        "box",
        "",
        "// ...the line or block of code",
        "// are ran one time only, after that the",
        "// check marks immediately re-appear",
        "// P.S. keep hitting the delete button",
        "// on that first check mark for seizures.",
        "// next-tutorial:conditionals"
    ].join("\n");

    var conditionalsTutorial = [
        "// you can draw different things",
        "// (or in general do different things)",
        "// based on any",
        "// test condition you want:",
        "",
        "rotate",
        "if frame%3 == 0",
        "\tbox",
        "else if frame%3 == 1",
        "\tball",
        "else",
        "\tpeg",
        "// next-tutorial:autocode"
    ].join("\n");

    var autocodeTutorial = [
        "// the Autocode button invents random",
        "// variations for you.",
        "",
        "// You can interrupt the Autocoder at",
        "// any time by pressing the button again,",
        "// or you can press CTRL-Z",
        "// (or CMD-Z on Macs) to undo (or re-do) some of",
        "// the steps even WHILE the autocoder is running,",
        "// if you see that things got",
        "// boring down a particular path of changes."
    ].join("\n");
} else {

  // ***************************** French tutorials
    introTutorial = [
        "// Les lignes qui commencent avec deux slashes",
        "// (comme celle-ci) sont des commentaires.",
        "// Tout le reste est lancé",
        "// entre 30 et 60 fois par seconde",
        "// pour créer une animation",
        "// Cliquez sur le lien ci-dessous pour démarrer le tutorial.",
        "// next-tutorial:hello_world"
    ].join("\n");

    helloworldTutorial = [
        "// Tapez ces cinq lettres",
        "// sur une des lignes vides",
        "// b, o, i, t, e",
        "",
        "",
        "// (vous devriez voir une belle boite apparaître)",
        "// cliquez pour le prochain tutorial :",
        "// next-tutorial:some_notes"
    ].join("\n");

    somenotesTutorial = [
        "// Au cas où cela vous dit quelque chose :",
        "// la syntaxe est similaire à Coffeescript",
        "// et les commandes sont presque",
        "// comme Processing.",
        "// Si cela ne veut rien dire pour vous",
        "// pas de soucis.",
        "// next-tutorial:rotate"
    ].join("\n");

    rotateTutorial = [
        "// Maintenant nous avons une boite",
        "// faisons la tourner:",
        "// tapez 'tourne 1' sur la ligne",
        "// au dessus de 'boite'",
        "",
        "boite",
        "",
        "// cliquez pour le prochain tutorial :",
        "// next-tutorial:frame"
    ].join("\n");

    frameTutorial = [
        "// faites tourner la boite",
        "// en remplaçant '1' par 'image'",
        "tourne 1",
        "boite",
        "",
        "// 'image' contient un nombre",
        "// qui s’incrémente au fur et à mesure",
        "// que l’écran est re-dessiné.",
        "// (utilisez 'image/100' pour la ralentir)",
        "// next-tutorial:time"
    ].join("\n");

    timeTutorial = [
        "// 'image/100' a un problème :",
        "// les ordinateurs rapides vont faire",
        "// tourner le cube trop vite.",
        "// Remplacez le par 'temps/2000'.",
        "tourne image/100",
        "boite",
        "",
        "// 'temps' compte le nombre de millisecondes",
        "// depuis que le programme  a démarré,",
        "// il est donc indépendent de la vitesse",
        "// à laquelle l’ordinateur dessine les images.",
        "// next-tutorial:move"
    ].join("\n");

    moveTutorial = [
        "// vous pouvez déplacer n’importe quel objet",
        "// en utilisant 'deplace'",
        "boite",
        "deplace 1,1,0",
        "boite",
        "",
        "// essayez d’utiliser tourne",
        "// avant la première boite pour voir",
        "// comment la scène change.",
        "// next-tutorial:scale"
    ].join("\n");

    scaleTutorial = [
        "// vous pouvez changer la taille des objets",
        "// en utilisant 'taille'",
        "tourne 3",
        "boite",
        "deplace 1",
        "taille 2",
        "boite",
        "",
        "// essayez d’utiliser tourne",
        "// avant la première boite pour voir",
        "// comment la scène change..",
        "// next-tutorial:times"
    ].join("\n");

    timesTutorial = [
        "// 'fois' peut-être utilisé",
        "// pour répéter des opérations :",
        "tourne 1",
        "3 fois ->",
        "\tdeplace 0.2,0.2,0.2",
        "\tboite",
        "",
        "// notez comme les tabulations indiquent ",
        "// exactement le bloc de code",
        "// qui doit être répété.",
        "// next-tutorial:fill"
    ].join("\n");

    fillTutorial = [
        "// 'remplissage' défini la",
        "// couleur de toutes les faces :",
        "remplissage 255,255,0",
        "boite",
        "",
        "// les trois nombres indiquent",
        "// les valeurs de rouge, vert et bleu.",
        "// Vous pouvez aussi utiliser",
        "// des noms de couleur comme indigo",
        "// Essayez de remplacer les nombres avec",
        "// 'couleurAngle'",
        "// next-tutorial:stroke"
    ].join("\n");

    strokeTutorial = [
        "// 'trait' change la couleur",
        "// des arrêtes :",
        "tourne 1",
        "tailleTrait 5",
        "trait 255,255,255",
        "boite",
        "",
        "// les trois nombres sont les valeurs RVB",
        "// mais vous pouvez utiliser les noms des couleurs,",
        "// ou la couleur spéciale  'couleurAngle'",
        "// Vous pouvez aussi utiliser 'tailleTrait'",
        "// pour préciser l’épaisseur.",
        "// next-tutorial:color_names"
    ].join("\n");

    colornamesTutorial = [
        "// vous pouvez indiquer les couleurs par nom",
        "// essayer de dé-commenter une ligne :",
        "//remplissage rouge",
        "//remplissage vert",
        "//remplissage pêche",
        "tourne 1",
        "boite",
        "",
        "// plus de noms de couleurs ici :",
        "// http://html-color-codes.info/color-names/",
        "// (utilisez en minuscule, pas de majuscules)",
        "// next-tutorial:lights"
    ].join("\n");


    lightsTutorial = [
        "// 'eclairageAmbiant' créé un",
        "// éclairage ambiant de sorte que les objets",
        "// ont une sorte de d’ombrage:",
        "eclairageAmbiant 0,255,255",
        "tourne temps/1000",
        "boite",
        "",
        "// vous pouvez éteindre ou allumer cet éclairage",
        "// pendant que vous construisez la scène",
        "// en utilisant 'eclairage' et 'sansEclairage'",
        "// next-tutorial:background"
    ].join("\n");

    backgroundTutorial = [
        "// 'fond' créé un",
        "// fond de couleur :",
        "fond 0,0,255",
        "tourne temps/1000",
        "boite",
        "",
        "// next-tutorial:gradient"
    ].join("\n");

    gradientTutorial = [
        "// encore plus sympa, vous pouvez",
        "// créér un fond en dégradé:",
        "degradeSimple couleur(190,10,10),couleur(30,90,100),couleur(0)",
        "tourne temps/1000",
        "boite",
        "",
        "// next-tutorial:line"
    ].join("\n");

    lineTutorial = [
        "// dessinez des lignes comme ceci :",
        "20 fois ->",
        "\ttourne temps/9000",
        "\tligne",
        "",
        "// next-tutorial:ball"
    ].join("\n");

    ballTutorial = [
        "// dessinez des balles comme ceci :",
        "balleDetail 10",
        "3 fois ->",
        "\tdeplace 0.2,0.2,0.2",
        "\tballe",
        "",
        "// ('balleDetail' est optionnel)",
        "// next-tutorial:pushpopMatrix"
    ].join("\n");

    pushpopMatrixTutorial = [
        "// sauveMatrice mémorise",
        "// la position, et vous pouvez",
        "// y revenir plus tard avec restaureMatrice.",
        "// Vous pouvez revenir à zéro avec 'effaceMatrice'.",
        "tourne temps/1000",
        "sauveMatrice // mémorise la position après la rotation",
        "ligne",
        "deplace 0.5,0,0",
        "ligne",
        "restaureMatrice // revient à la position mémorisée",
        "deplace -0.5,0,0",
        "ligne",
        "effaceMatrice // remets la position à zéro",
        "ligne // cette ligne n’est donc pas affecté par la rotation",
        "// next-tutorial:animation_style"
    ].join("\n");

    animationstyleTutorial = [
        "// essayez de dé-commenter l’une ou l’autre",
        "// des deux lignes  avec styleAnimation",
        "fond 255",
        "//styleAnimation flouMouvement",
        "//styleAnimation peindreAudessus",
        "tourne image/10",
        "boite",
        "",
        "// next-tutorial:do_once"
    ].join("\n");

    doonceTutorial = [
        "// effacez l’une ou l’autre des coches",
        "tourne temps/1000",
        "✓uneFois ->",
        "\tfond 255",
        "\tremplissage 255,0,0",
        "✓uneFois -> balle",
        "boite",
        "",
        "// …la ligne ou le bloc de code",
        "// n’est exécuté qu’une seule fois, et après cela",
        "// la coche réapparait immédiattement",
        "// P.S. continuez de supprimer la première coche",
        "// en continu pour provoquer un évanouissement :-)",
        "// next-tutorial:autocode"
    ].join("\n");

    autocodeTutorial = [
        "// le bouton Autocode invente pour vous",
        "// des variations aléatoires du code.",
        "// vous pouvez arrêter Autocode",
        "// à tout moment en ré-appuyant sur le bouton",
        "// ou vous pouvez faire CTRL-Z",
        "// (CMD-Z sur Mac) pour annuler (or rétablir) certainesn",
        "// des étapes y compris PENDANT que Autocode est actif",
        "// si par exemple vous trouvez que les choses",
        "// deviennent ennuyeuse dans la direction prise par Autocode."
    ].join("\n");

}

function loadDemoOrTutorial(whichDemo) {

    if ((!Detector.webgl || forceCanvasRenderer) && !userWarnedAboutWebglExamples && whichDemo.indexOf('webgl') === 0) {
        userWarnedAboutWebglExamples = true;
        $('#exampleNeedsWebgl').modal();
        $('#simplemodal-container').height(200);
    }


    // set the demo as a hash state
    // so that ideally people can link directly to
    // a specific demo they like.
    // (in the document.ready function we check for
    // this hash value and load the correct demo)
    window.location.hash = 'bookmark=' + whichDemo;

    if (fakeText) {
        shrinkFakeText();
    }

    undimEditor();

    doTheSpinThingy = false;

    var prependMessage = "";
    if ((!Detector.webgl || forceCanvasRenderer) && whichDemo.indexOf('webgl') === 0) {
        prependMessage = [
            "// this drawing makes much more sense",
            "// in a WebGL-enabled browser"
        ].join("\n");
    }

    switch (whichDemo) {
    case 'roseDemo':
        editor.setValue(prependMessage + roseDemo);
        break;
    case 'cheeseAndOlivesDemo':
        editor.setValue(prependMessage + cheeseAndOlivesDemo);
        break;
    case 'simpleCubeDemo':
        editor.setValue(prependMessage + simpleCubeDemo);
        break;
    case 'webgltwocubesDemo':
        editor.setValue(prependMessage + webgltwocubesDemo);
        break;
    case 'cubesAndSpikes':
        editor.setValue(prependMessage + cubesAndSpikes);
        break;
    case 'webglturbineDemo':
        editor.setValue(prependMessage + webglturbineDemo);
        break;
    case 'webglzfightartDemo':
        editor.setValue(prependMessage + webglzfightartDemo);
        break;
    case 'littleSpiralOfCubes':
        editor.setValue(prependMessage + littleSpiralOfCubes);
        break;
    case 'tentacleDemo':
        editor.setValue(prependMessage + tentacleDemo);
        break;
    case 'lampDemo':
        editor.setValue(prependMessage + lampDemo);
        break;
    case 'trillionfeathersDemo':
        editor.setValue(prependMessage + trillionfeathersDemo);
        break;
    case 'monsterblobDemo':
        editor.setValue(prependMessage + monsterblobDemo);
        break;
    case 'industrialMusicDemo':
        editor.setValue(prependMessage + industrialMusicDemo);
        break;
    case 'trySoundsDemo':
        editor.setValue(prependMessage + trySoundsDemo);
        break;
    case 'springysquaresDemo':
        editor.setValue(prependMessage + springysquaresDemo);
        break;
    case 'diceDemo':
        editor.setValue(prependMessage + diceDemo);
        break;
    case 'webglalmostvoronoiDemo':
        editor.setValue(prependMessage + webglalmostvoronoiDemo);
        break;
    case 'webglshardsDemo':
        editor.setValue(prependMessage + webglshardsDemo);
        break;
    case 'webglredthreadsDemo':
        editor.setValue(prependMessage + webglredthreadsDemo);
        break;
    case 'webglnuclearOctopusDemo':
        editor.setValue(prependMessage + webglnuclearOctopusDemo);
        break;
    case 'introTutorial':
        editor.setValue(prependMessage + introTutorial);
        break;
    case 'helloworldTutorial':
        editor.setValue(prependMessage + helloworldTutorial);
        break;
    case 'somenotesTutorial':
        editor.setValue(prependMessage + somenotesTutorial);
        break;
    case 'rotateTutorial':
        editor.setValue(prependMessage + rotateTutorial);
        break;
    case 'frameTutorial':
        editor.setValue(prependMessage + frameTutorial);
        break;
    case 'timeTutorial':
        editor.setValue(prependMessage + timeTutorial);
        break;
    case 'moveTutorial':
        editor.setValue(prependMessage + moveTutorial);
        break;
    case 'scaleTutorial':
        editor.setValue(prependMessage + scaleTutorial);
        break;
    case 'timesTutorial':
        editor.setValue(prependMessage + timesTutorial);
        break;
    case 'fillTutorial':
        editor.setValue(prependMessage + fillTutorial);
        break;
    case 'strokeTutorial':
        editor.setValue(prependMessage + strokeTutorial);
        break;
    case 'colornamesTutorial':
        editor.setValue(prependMessage + colornamesTutorial);
        break;
    case 'lightsTutorial':
        editor.setValue(prependMessage + lightsTutorial);
        break;
    case 'backgroundTutorial':
        editor.setValue(prependMessage + backgroundTutorial);
        break;
    case 'gradientTutorial':
        editor.setValue(prependMessage + gradientTutorial);
        break;
    case 'lineTutorial':
        editor.setValue(prependMessage + lineTutorial);
        break;
    case 'ballTutorial':
        editor.setValue(prependMessage + ballTutorial);
        break;
    case 'pushpopMatrixTutorial':
        editor.setValue(prependMessage + pushpopMatrixTutorial);
        break;
    case 'animationstyleTutorial':
        editor.setValue(prependMessage + animationstyleTutorial);
        break;
    case 'doonceTutorial':
        editor.setValue(prependMessage + doonceTutorial);
        break;
    case 'conditionalsTutorial':
        editor.setValue(prependMessage + conditionalsTutorial);
        break;
    case 'autocodeTutorial':
        editor.setValue(prependMessage + autocodeTutorial);
        break;
    }

    // bring the cursor to the top
    editor.setCursor(0, 0);

    // setting the value of the editor triggers the
    // codeMirror onChange callback, and that runs
    // the demo.
}
