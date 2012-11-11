
if (!frenchVersion) {

  var roseDemo = "" + "" + "// 'A rose' by Guy John\n" + "" + "// Mozilla Festival 2012\n" + "" + "// adapted by from 'A rose' by Lib4tech\n" + "" + "\n" + "" + "scale 1.5\n" + "" + "animationStyle paintOver\n"  + "" + "rotate time/1000\n" + "" + "fill 255-((frame/2)%255),0,0\n" + "" + "stroke 255-((frame/2)%255),0,0\n" + "" + "scale 1-((frame/2)%255) / 255\n" + "" + "box";

  var cheeseAndOlivesDemo = "" + "" + "// 'Cheese and olives' by\n" + "" + "// Davina Tirvengadum\n" + "" + "// Mozilla festival 2012\n" + "" + "\n" + "" + "background white\n" + "" + "scale .3\n" + "" + "move 0,-1\n" + "" + "fill yellow\n" + "" + "stroke black\n" + "" + "rotate\n" + "" + "strokeSize 3\n" + "" + "line 4\n" + "" + "box\n" + "" + "\n" + "" + "rotate 2,3\n" + "" + "move 0,3\n" + "" + "scale .3\n" + "" + "fill black\n" + "" + "stroke black\n" + "" + "ball\n" + "" + "\n" + "" + "rotate 3\n" + "" + "move 5\n" + "" + "scale 1\n" + "" + "fill green\n" + "" + "stroke green\n" + "" + "ball\n" + "" + "\n" + "" + "rotate 1\n" + "" + "move -3\n" + "" + "scale 1\n" + "" + "fill yellow\n" + "" + "stroke yellow\n" + "" + "ball";

  var simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "background yellow\n" + "" + "rotate 0,time/2000,time/2000\n" + "" + "box";

  var webgltwocubesDemo = "" + "" + "background 155,255,255\n" + "" + "2 times ->\n" + "\t" + "rotate 0, 1, time/2000\n" + "\t" + "box";

  var cubesAndSpikes = "" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 2.1\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "box 0.1,0.1,0.1\n" + "\t" + "move 0,0.1,0.1\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 0,1,1\n" + "\t\t" + "box 0.01,0.01,1";

  var webglturbineDemo = "" + "" + "background 155,55,255\n" + "" + "70 times ->\n" + "\t" + "rotate time/100000,1,time/100000\n" + "\t" + "box";

  var webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "scale 5\n" + "" + "rotate\n" + "" + "fill red\n" + "" + "box\n" + "" + "rotate 0.000001\n" + "" + "fill yellow\n" + "" + "box";

  var littleSpiralOfCubes = "" + "" + "background orange\n" + "" + "scale 0.1\n" + "" + "10 times ->\n" + "\t" + "rotate 0,1,time/1000\n" + "\t" + "move 1,1,1\n" + "\t" + "box";

  var tentacleDemo = "" + "" + "background 155,255,155\n" + "" + "scale 0.15\n" + "" + "3 times ->\n" + "\t" + "rotate 0,1,1\n" + "\t" + "10 times ->\n" + "\t\t" + "rotate 0,1,time/1000\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,1\n" + "\t\t" + "box";

  var lampDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient red,yellow,color(255,0,255)\n" + "" + "//animationStyle paintOver\n" + "" + "scale 2\n" + "" + "rotate time/4000, time/4000,  time/4000\n" + "" + "90 times ->\n" + "\t" + "rotate time/200000, time/200000,  time/200000\n" + "\t" + "line\n" + "\t" + "move 0.5,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line\n" + "\t" + "line";

  var trillionfeathersDemo = "" + "" + "animationStyle paintOver\n" + "" + "move 2,0,0\n" + "" + "scale 2\n" + "" + "rotate\n" + "" + "20 times ->\n" + "\t" + "rotate\n" + "\t" + "move 0.25,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line";

  var monsterblobDemo = "" + "" + "ballDetail 6\n" + "" + "animationStyle motionBlur\n" + "" + "rotate time/5000\n" + "" + "simpleGradient fuchsia,aqua,yellow\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "move 0.2,0,0\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 1\n" + "\t\t" + "ball -1";

  var industrialMusicDemo = "" + "" + "bpm 88\n" + "" + "play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "play 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "play 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "play 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "play 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "play 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "play 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  var trySoundsDemo = "" + "" + "bpm 88\n" + "" + "// leave this one as base\n" + "" + "play 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//play 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//play 'alienBeep','zzxz zzzz zzxz zzzz'";

  var springysquaresDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "5 times ->\n" + "\t\t" + "rotate time/2000\n" + "\t\t" + "move 0.7,0,0\n" + "\t\t" + "rect";

  var diceDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient color(255),moccasin,peachpuff\n" + "" + "stroke 255,100,100,255\n" + "" + "fill red,155\n" + "" + "move -0.5,0,0\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "1 times ->\n" + "\t\t" + "rotate time/1000\n" + "\t\t" + "move 2,0,0\n" + "\t\t" + "box";

  var webglalmostvoronoiDemo = "" + "" + "scale 10\n" + "" + "2 times ->\n" + "\t" + "rotate 0,1,time/10000\n" + "\t" + "ball -1";

  var webglshardsDemo = "" + "" + "scale 10\n" + "" + "fill 0\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/20000\n" + "\t" + "ball \n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball -1.01";

  var webglredthreadsDemo = "" + "" + "scale 10.5\n" + "" + "background black\n" + "" + "stroke red\n" + "" + "noFill\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate time/20000\n" + "\t" + "ball\n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball";

  var webglnuclearOctopusDemo = "" + "" + "simpleGradient black,color(0,0,(time/5)%255),black\n" + "" + "scale 0.2\n" + "" + "move 5,0,0\n" + "" + "animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "stroke 255,0,0,120\n" + "" + "fill time%255,0,0\n" + "" + "pushMatrix\n" + "" + "count = 0\n" + "" + "3 times ->\n" + "\t" + "count++\n" + "\t" + "pushMatrix\n" + "\t" + "rotate count+3+time/1000,2+count + time/1000,4+count\n" + "\t" + "120 times ->\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,0\n" + "\t\t" + "rotate time/100\n" + "\t\t" + "box\n" + "\t" + "popMatrix";
} else {
  // French demos **********************************

  simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "fond jaune\n" + "" + "tourne 0,temps/2000,temps/2000\n" + "" + "boite";

  webgltwocubesDemo = "" + "" + "fond 155,255,255\n" + "" + "2 fois ->\n" + "\t" + "tourne 0, 1, temps/2000\n" + "\t" + "boite";

  cubesAndSpikes = "" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 2.1\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "boite 0.1,0.1,0.1\n" + "\t" + "deplace 0,0.1,0.1\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 0,1,1\n" + "\t\t" + "boite 0.01,0.01,1";

  webglturbineDemo = "" + "" + "fond 155,55,255\n" + "" + "70 fois ->\n" + "\t" + "tourne temps/100000,1,temps/100000\n" + "\t" + "boite";

  webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "taille 5\n" + "" + "tourne\n" + "" + "remplissage rouge\n" + "" + "boite\n" + "" + "tourne 0.000001\n" + "" + "remplissage jaune\n" + "" + "boite";

  littleSpiralOfCubes = "" + "" + "fond orange\n" + "" + "taille 0.1\n" + "" + "10 fois ->\n" + "\t" + "tourne 0,1,temps/1000\n" + "\t" + "deplace 1,1,1\n" + "\t" + "boite";

  tentacleDemo = "" + "" + "fond 155,255,155\n" + "" + "taille 0.15\n" + "" + "3 fois ->\n" + "\t" + "tourne 0,1,1\n" + "\t" + "10 fois ->\n" + "\t\t" + "tourne 0,1,temps/1000\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,1\n" + "\t\t" + "boite";

  lampDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple rouge,jaune,couleur(255,0,255)\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "taille 2\n" + "" + "tourne temps/4000, temps/4000,  temps/4000\n" + "" + "90 fois ->\n" + "\t" + "tourne temps/200000, temps/200000,  temps/200000\n" + "\t" + "ligne\n" + "\t" + "deplace 0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "ligne";

  trillionfeathersDemo = "" + "" + "styleAnimation peindreAuDessus\n" + "" + "deplace 2,0,0\n" + "" + "taille 2\n" + "" + "tourne\n" + "" + "20 fois ->\n" + "\t" + "tourne\n" + "\t" + "deplace 0.25,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne";

  monsterblobDemo = "" + "" + "balleDetail 6\n" + "" + "styleAnimation flouMouvement\n" + "" + "tourne temps/5000\n" + "" + "dégradéSimple fuchsia,aqua,jaune\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "deplace 0.2,0,0\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 1\n" + "\t\t" + "balle -1";

  industrialMusicDemo = "" + "" + "bpm 88\n" + "" + "ajouteSon 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "ajouteSon 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "ajouteSon 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "ajouteSon 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  trySoundsDemo = "" + "" + "bpm 88\n" + "" + "// leave this one as base\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//ajouteSon 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'alienBeep','zzxz zzzz zzxz zzzz'";

  springysquaresDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "5 fois ->\n" + "\t\t" + "tourne temps/2000\n" + "\t\t" + "deplace 0.7,0,0\n" + "\t\t" + "rect";

  diceDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple couleur(255),moccasin,peche\n" + "" + "trait 255,100,100,255\n" + "" + "remplissage rouge,155\n" + "" + "deplace -0.5,0,0\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "1 fois ->\n" + "\t\t" + "tourne temps/1000\n" + "\t\t" + "deplace 2,0,0\n" + "\t\t" + "boite";

  webglalmostvoronoiDemo = "" + "" + "taille 10\n" + "" + "2 fois ->\n" + "\t" + "tourne 0,1,temps/10000\n" + "\t" + "balle -1";

  webglshardsDemo = "" + "" + "taille 10\n" + "" + "remplissage 0\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/20000\n" + "\t" + "balle \n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle -1.01";

  webglredthreadsDemo = "" + "" + "taille 10.5\n" + "" + "fond noir\n" + "" + "trait rouge\n" + "" + "sansRemplissage\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne temps/20000\n" + "\t" + "balle\n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle";

  webglnuclearOctopusDemo = "" + "" + "dégradéSimple noir,couleur(0,0,(temps/5)%255),noir\n" + "" + "taille 0.2\n" + "" + "deplace 5,0,0\n" + "" + "styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "trait 255,0,0,120\n" + "" + "remplissage temps%255,0,0\n" + "" + "sauveMatrice\n" + "" + "count = 0\n" + "" + "3 fois ->\n" + "\t" + "count++\n" + "\t" + "sauveMatrice\n" + "\t" + "tourne count+3+temps/1000,2+count + temps/1000,4+count\n" + "\t" + "120 fois ->\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,0\n" + "\t\t" + "tourne temps/100\n" + "\t\t" + "boite\n" + "\t" + "restaureMatrice";

  //*********************************************
}

if (!frenchVersion) {

  var introTutorial = "" + "" + "// Lines beginning with two\n" + "" + "// slashes (like these) are just comments.\n" + "" + '// Everything else is run\n' + "" + '// about 30 to 60 times per second\n' + "" + '// in order to create an animation.\n' + "" + "\n" + "" + "// Click the link below to start the tutorial.\n" + "" + "// next-tutorial:hello_world";

  var helloworldTutorial = "" + "" + "// type these three letters\n" + "" + "// in one of these empty lines below:\n" + "" + '// "b" and "o" and "x"\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (you should then see a box facing you)\n" + "" + "// click below for the next tutorial\n" + "" + "// next-tutorial:some_notes";

  var somenotesTutorial = "" + "" + "// If this makes sense to you:\n" + "" + "// the syntax is similar to Coffeescript\n" + "" + '// and the commands are almost\n' + "" + '// like Processing.\n' + "" + "\n" + "" + "// If this doesn't make sense to you\n" + "" + "// don't worry.\n" + "" + "// next-tutorial:rotate";

  var rotateTutorial = "" + "" + "// now that we have a box\n" + "" + "// let's rotate it:\n" + "" + '// type "rotate 1" in the\n' + "" + '// line before the "box"\n' + "" + "\n" + "" + "\n" + "" + "box\n" + "" + "\n" + "" + "// click for the next tutorial:\n" + "" + "// next-tutorial:frame";

  var frameTutorial = "" + "" + "// make the box spin\n" + "" + '// by replacing "1" with "frame"\n' + "" + "\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// "frame" contains a number\n' + "" + "// always incrementing as\n" + "" + "// the screen is re-drawn.\n" + "" + '// (use "frame/100" to slow it down)\n' + "" + "// next-tutorial:time";

  var timeTutorial = "" + "" + '// "frame/100" has one problem:\n' + "" + '// faster computers will make\n' + "" + '// the cube spin too fast.\n' + "" + '// Replace it with "time/2000".\n' + "" + "\n" + "" + "rotate frame/100\n" + "" + "box\n" + "" + "\n" + "" + '// "time" counts the\n' + "" + "// number of milliseconds since\n" + "" + "// the program started, so it's\n" + "" + "// independent of how fast\n" + "" + "// the computer is at drawing.\n" + "" + "// next-tutorial:move";

  var moveTutorial = "" + "" + "// you can move any object\n" + "" + '// by using "move"\n' + "" + "\n" + "" + "box\n" + "" + "move 1,1,0\n" + "" + "box\n" + "" + "\n" + "" + '// try to use a rotate before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:scale";

  var scaleTutorial = "" + "" + "// you can make an object bigger\n" + "" + '// or smaller by using "scale"\n' + "" + "\n" + "" + "rotate 3\n" + "" + "box\n" + "" + "move 1\n" + "" + "scale 2\n" + "" + "box\n" + "" + "\n" + "" + '// try to use scale or move before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:times";

  var timesTutorial = "" + "" + '// "times" (not to be confused with\n' + "" + '// "time"!) can be used to\n' + "" + '// repeat operations like so:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "box\n" + "" + "\n" + "" + '// note how the tabs indicate \n' + "" + "// exactly the block of code\n" + "" + "// to be repeated.\n" + "" + "// next-tutorial:fill";

  var fillTutorial = "" + "" + '// "fill" changes the\n' + "" + '// color of all the faces:\n' + "" + "\n" + "" + "fill 255,255,0\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers indicate \n' + "" + "// red green and blue values.\n" + "" + "// You can also use color names such as indigo\n" + "" + "// Try replacing the numbers with\n" + "" + '// "angleColor"\n' + "" + "// next-tutorial:stroke";

  var strokeTutorial = "" + "" + '// "stroke" changes all the\n' + "" + '// edges:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "strokeSize 5\n" + "" + "stroke 255,255,255\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers are RGB\n' + "" + "// but you can also use the color names\n" + "" + '// or the special color "angleColor"\n' + "" + '// Also you can use "strokeSize"\n' + "" + '// to specify the thickness.\n' + "" + "// next-tutorial:color_names";

  var colornamesTutorial = "" + "" + '// you can call colors by name\n' + "" + '// try to un-comment one line:\n' + "" + "\n" + "" + "//fill greenyellow\n" + "" + "//fill indigo\n" + "" + "//fill lemonchiffon // whaaaat?\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// more color names here:\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (just use them in lower case)\n' + "" + "// next-tutorial:lights";


  var lightsTutorial = "" + "" + '// "ambientLight" creates an\n' + "" + '// ambient light so things have\n' + "" + '// some sort of shading:\n' + "" + "\n" + "" + "ambientLight 0,255,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + '// you can turn that light on and \n' + "" + "// off while you build the scene\n" + "" + '// by using "lights" and "noLights"\n' + "" + "// next-tutorial:background";

  var backgroundTutorial = "" + "" + '// "background" creates a\n' + "" + '// solid background:\n' + "" + "\n" + "" + "background 0,0,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  var gradientTutorial = "" + "" + '// even nicer, you can paint a\n' + "" + '// background gradient:\n' + "" + "\n" + "" + "simpleGradient color(190,10,10),color(30,90,100),color(0)\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:line";

  var lineTutorial = "" + "" + '// draw lines like this:\n' + "" + "\n" + "" + "20 times ->\n" + "\t" + "rotate time/9000\n" + "\t" + "line\n" + "" + "\n" + "" + "// next-tutorial:ball";

  var ballTutorial = "" + "" + '// draw balls like this:\n' + "" + "\n" + "" + "ballDetail 10\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "ball\n" + "" + "\n" + "" + '// ("ballDetail" is optional)\n' + "" + "// next-tutorial:pushpopMatrix";

  var pushpopMatrixTutorial = "" + "" + '// pushMatrix creates a bookmark of\n' + "" + '// the position, which you can\n' + "" + '// return to later by using popMatrix.\n' + "" + '// You can reset using "resetMatrix".\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + 'pushMatrix // bookmark the position after the rotation\n' + "" + "line\n" + "" + "move 0.5,0,0\n" + "" + "line\n" + "" + "popMatrix // go back to the bookmarked position\n" + "" + "move -0.5,0,0\n" + "" + "line\n" + "" + "resetMatrix // resets the position\n" + "" + "line // not affected by initial rotation\n" + "" + "// next-tutorial:animation_style";

  var animationstyleTutorial = "" + "" + '// try uncommenting either line\n' + "" + '// with the animationStyle\n' + "" + "\n" + "" + "background 255\n" + "" + "//animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "rotate frame/10\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  var doonceTutorial = "" + "" + '// delete either check mark below\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + "✓doOnce ->\n" + "\t" + "background 255\n" + "\t" + "fill 255,0,0\n" + "" + "✓doOnce -> ball\n" + "" + "box\n" + "" + "\n" + "" + '// ...the line or block of code\n' + "" + '// are ran one time only, after that the\n' + "" + '// check marks immediately re-appear\n' + "" + '// P.S. keep hitting the delete button\n' + "" + '// on that first check mark for seizures.\n' + "" + "// next-tutorial:conditionals";

  var conditionalsTutorial = "" + "" + '// you can draw different things' + "" + "\n" + "" + "// (or in general do different things)" + "" + "\n" + "" + "// based on any" + "" + "\n" + "" + "// test condition you want:" + "" + "\n" + "" + "\n" + "rotate" + "" + "\n" + "" + "if frame%3 == 0" + "" + "\n" + "" + "\t"+"box" + "" + "\n" + "" + "else if frame%3 == 1" + "" + "\n" + "" + "\t"+"ball" + "" + "\n" + "" + "else" + "" + "\n" + "" + "\t"+"peg" + ""  + "\n" + ""+ ""  + "\n" + "" +"// next-tutorial:autocode";

  var autocodeTutorial = "" + "" + '// the Autocode button invents random\n' + "" + '// variations for you.\n' + "" + '\n' + "" + '// You can interrupt the Autocoder at\n' + "" + '// any time by pressing the button again,\n' + "" + '// or you can press CTRL-Z\n' + "" + '// (or CMD-Z on Macs) to undo (or re-do) some of\n' + "" + '// the steps even WHILE the autocoder is running,\n' + "" + '// if you see that things got\n' + "" + '// boring down a particular path of changes.';
} else {

  // ***************************** French tutorials
   introTutorial = "" + "" + "// Les lignes qui commencent avec deux slashes\n" + "" + "// (comme celle-ci) sont des commentaires.\n" + "" + '// Tout le reste est lancé\n' + "" + '// entre 30 et 60 fois par seconde\n' + "" + '// pour créer une animation\n' + "" + "\n" + "" + "// Cliquez sur le lien ci-dessous pour démarrer le tutorial.\n" + "" + "// next-tutorial:hello_world";

  helloworldTutorial = "" + "" + "// Tapez ces cinq lettres\n" + "" + "// sur une des lignes vides\n" + "" + '// b, o, i, t, e\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (vous devriez voir une belle boite apparaître)\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:some_notes";

  somenotesTutorial = "" + "" + "// Au cas où cela vous dit quelque chose :\n" + "" + "// la syntaxe est similaire à Coffeescript\n" + "" + '// et les commandes sont presque\n' + "" + '// comme Processing.\n' + "" + "\n" + "" + "// Si cela ne veut rien dire pour vous\n" + "" + "// pas de soucis.\n" + "" + "// next-tutorial:rotate";

  rotateTutorial = "" + "" + "// Maintenant nous avons une boite\n" + "" + "// faisons la tourner:\n" + "" + '// tapez "tourne 1" sur la ligne\n' + "" + '// au dessus de "boite"\n' + "" + "\n" + "" + "\n" + "" + "boite\n" + "" + "\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:frame";

  frameTutorial = "" + "" + "// faites tourner la boite\n" + "" + '// en remplaçant "1" par "image"\n' + "" + "\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// "image" contient un nombre\n' + "" + "// qui s’incrémente au fur et à mesure\n" + "" + "// que l’écran est re-dessiné.\n" + "" + '// (utilisez "image/100" pour la ralentir)\n' + "" + "// next-tutorial:time";

  timeTutorial = "" + "" + '// "image/100" a un problème :\n' + "" + '// les ordinateurs rapides vont faire\n' + "" + '// tourner le cube trop vite.\n' + "" + '// Remplacez le par "temps/2000".\n' + "" + "\n" + "" + "tourne image/100\n" + "" + "boite\n" + "" + "\n" + "" + '// "temps" compte le nombre de millisecondes\n' + "" + "// depuis que le programme  a démarré,\n" + "" + "// il est donc indépendent de la vitesse\n" + "" + "// à laquelle l’ordinateur dessine les images.\n" + "" + "// next-tutorial:move";

  moveTutorial = "" + "" + "// vous pouvez déplacer n’importe quel objet\n" + "" + '// en utilisant "deplace"\n' + "" + "\n" + "" + "boite\n" + "" + "deplace 1,1,0\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change.\n" + "" + "// next-tutorial:scale";

  scaleTutorial = "" + "" + "// vous pouvez changer la taille des objets\n" + "" + '// en utilisant "taille"\n' + "" + "\n" + "" + "tourne 3\n" + "" + "boite\n" + "" + "deplace 1\n" + "" + "taille 2\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change..\n" + "" + "// next-tutorial:times";

  timesTutorial = "" + "" + '// "fois" peut-être utilisé\n' + "" + '// pour répéter des opérations :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "boite\n" + "" + "\n" + "" + '// notez comme les tabulations indiquent \n' + "" + "// exactement le bloc de code\n" + "" + "// qui doit être répété.\n" + "" + "// next-tutorial:fill";

  fillTutorial = "" + "" + '// "remplissage" défini la\n' + "" + '// couleur de toutes les faces :\n' + "" + "\n" + "" + "remplissage 255,255,0\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres indiquent\n' + "" + "// les valeurs de rouge, vert et bleu.\n" + "" + "// Vous pouvez aussi utiliser\n" + "" + "// des noms de couleur comme indigo\n" + "" + "// Essayez de remplacer les nombres avec\n" + "" + '// "couleurAngle"\n' + "" + "// next-tutorial:stroke";

  strokeTutorial = "" + "" + '// "trait" change la couleur\n' + "" + '// des arrêtes :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "tailleTrait 5\n" + "" + "trait 255,255,255\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres sont les valeurs RVB\n' + "" + "// mais vous pouvez utiliser les noms des couleurs,\n" + "" + '// ou la couleur spéciale  "couleurAngle"\n' + "" + '// Vous pouvez aussi utiliser "tailleTrait"\n' + "" + '// pour préciser l’épaisseur.\n' + "" + "// next-tutorial:color_names";

  colornamesTutorial = "" + "" + '// vous pouvez indiquer les couleurs par nom\n' + "" + '// essayer de dé-commenter une ligne :\n' + "" + "\n" + "" + "//remplissage rouge\n" + "" + "//remplissage vert\n" + "" + "//remplissage pêche\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// plus de noms de couleurs ici :\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (utilisez en minuscule, pas de majuscules)\n' + "" + "// next-tutorial:lights";


  lightsTutorial = "" + "" + '// "eclairageAmbiant" créé un\n' + "" + '// éclairage ambiant de sorte que les objets\n' + "" + '// ont une sorte de d’ombrage:\n' + "" + "\n" + "" + "eclairageAmbiant 0,255,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + '// vous pouvez éteindre ou allumer cet éclairage\n' + "" + "// pendant que vous construisez la scène" + "" + '// en utilisant "eclairage" et "sansEclairage"\n' + "" + "// next-tutorial:background";

  backgroundTutorial = "" + "" + '// "fond" créé un\n' + "" + '// fond de couleur :\n' + "" + "\n" + "" + "fond 0,0,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  gradientTutorial = "" + "" + '// encore plus sympa, vous pouvez\n' + "" + '// créér un fond en dégradé:\n' + "" + "\n" + "" + "degradeSimple couleur(190,10,10),couleur(30,90,100),couleur(0)\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:line";

  lineTutorial = "" + "" + '// dessinez des lignes comme ceci :\n' + "" + "\n" + "" + "20 fois ->\n" + "\t" + "tourne temps/9000\n" + "\t" + "ligne\n" + "" + "\n" + "" + "// next-tutorial:ball";

  ballTutorial = "" + "" + '// dessinez des balles comme ceci :\n' + "" + "\n" + "" + "balleDetail 10\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "balle\n" + "" + "\n" + "" + '// ("balleDetail" est optionnel)\n' + "" + "// next-tutorial:pushpopMatrix";

  pushpopMatrixTutorial = "" + "" + '// sauveMatrice mémorise\n' + "" + '// la position, et vous pouvez\n' + "" + '// y revenir plus tard avec restaureMatrice.\n' + "" + '// Vous pouvez revenir à zéro avec "effaceMatrice".\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + 'sauveMatrice // mémorise la position après la rotation\n' + "" + "ligne\n" + "" + "deplace 0.5,0,0\n" + "" + "ligne\n" + "" + "restaureMatrice // revient à la position mémorisée\n" + "" + "deplace -0.5,0,0\n" + "" + "ligne\n" + "" + "effaceMatrice // remets la position à zéro\n" + "" + "ligne // cette ligne n’est donc pas affecté par la rotation\n" + "" + "// next-tutorial:animation_style";

  animationstyleTutorial = "" + "" + '// essayez de dé-commenter l’une ou l’autre\n' + "" + '// des deux lignes  avec styleAnimation\n' + "" + "\n" + "" + "fond 255\n" + "" + "//styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAudessus\n" + "" + "tourne image/10\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  doonceTutorial = "" + "" + '// effacez l’une ou l’autre des coches\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + "✓uneFois ->\n" + "\t" + "fond 255\n" + "\t" + "remplissage 255,0,0\n" + "" + "✓uneFois -> balle\n" + "" + "boite\n" + "" + "\n" + "" + '// …la ligne ou le bloc de code\n' + "" + '// n’est exécuté qu’une seule fois, et après cela\n' + "" + '// la coche réapparait immédiattement\n' + "" + '// P.S. continuez de supprimer la première coche\n' + "" + '// en continu pour provoquer un évanouissement :-)\n' + "" + "// next-tutorial:autocode";

  autocodeTutorial = "" + "" + '// le bouton Autocode invente pour vous\n' + "" + '// des variations aléatoires du code.\n' + "" + '\n' + "" + '// vous pouvez arrêter Autocode\n' + "" + '// à tout moment en ré-appuyant sur le bouton\n' + "" + '// ou vous pouvez faire CTRL-Z\n' + "" + '// (CMD-Z sur Mac) pour annuler (or rétablir) certainesn' + "" + '// des étapes y compris PENDANT que Autocode est actif\n' + "" + '// si par exemple vous trouvez que les choses\n' + "" + '// deviennent ennuyeuse dans la direction prise par Autocode.';

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

  if (fakeText) shrinkFakeText();
  undimEditor();

  doTheSpinThingy = false;

  var prependMessage = "";
  if ((!Detector.webgl || forceCanvasRenderer) && whichDemo.indexOf('webgl') === 0) {
    prependMessage = "" + "// this drawing makes much more sense\n" + "// in a WebGL-enabled browser\n" + "\n";
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

    // bring the cursor to the top
  editor.setCursor(0, 0);
  }

  // setting the value of the editor triggers the
  // codeMirror onChange callback, and that runs
  // the demo.
}