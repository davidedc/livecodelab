
var totalCreatedSoundObjects = 0;
var soundSystemIsMangled = false;
var CHANNELSPERSOUND = 6;
var soundDef = [];
var soundDefCounter = 0;

// first value here below of soundDefCounter is zero.

soundDef[soundDefCounter++] = {soundName: 'bing', soundFile: './sound/audioFiles/start_bing'};

soundDef[soundDefCounter++] = {soundName: 'toc', soundFile: './sound/audioFiles/AMB_BD_1'};
soundDef[soundDefCounter++] = {soundName: 'highHatClosed', soundFile: './sound/audioFiles/AMB_HHCL'};
soundDef[soundDefCounter++] = {soundName: 'highHatOpen', soundFile: './sound/audioFiles/AMB_HHOP'};
soundDef[soundDefCounter++] = {soundName: 'toc2', soundFile: './sound/audioFiles/AMB_HTM'};
soundDef[soundDefCounter++] = {soundName: 'toc3', soundFile: './sound/audioFiles/AMB_LTM2'};
soundDef[soundDefCounter++] = {soundName: 'toc4', soundFile: './sound/audioFiles/AMB_RIM1'};
soundDef[soundDefCounter++] = {soundName: 'snare', soundFile: './sound/audioFiles/AMB_SN13'};
soundDef[soundDefCounter++] = {soundName: 'snare2', soundFile: './sound/audioFiles/AMB_SN_5'};
soundDef[soundDefCounter++] = {soundName: 'china', soundFile: './sound/audioFiles/CHINA_1'};
soundDef[soundDefCounter++] = {soundName: 'crash', soundFile: './sound/audioFiles/CRASH_1'};
soundDef[soundDefCounter++] = {soundName: 'crash2', soundFile: './sound/audioFiles/CRASH_5'};
soundDef[soundDefCounter++] = {soundName: 'crash3', soundFile: './sound/audioFiles/CRASH_6'};
soundDef[soundDefCounter++] = {soundName: 'ride', soundFile: './sound/audioFiles/RIDE_1'};

soundDef[soundDefCounter++] = {soundName: 'glass', soundFile: './sound/audioFiles/glass2'};
soundDef[soundDefCounter++] = {soundName: 'glass1', soundFile: './sound/audioFiles/glass3'};
soundDef[soundDefCounter++] = {soundName: 'glass2', soundFile: './sound/audioFiles/glass4'};
soundDef[soundDefCounter++] = {soundName: 'glass3', soundFile: './sound/audioFiles/glass5'};

soundDef[soundDefCounter++] = {soundName: 'thump', soundFile: './sound/audioFiles/8938__patchen__piano-hits-hand-03v2'};
soundDef[soundDefCounter++] = {soundName: 'lowFlash', soundFile: './sound/audioFiles/9569__thanvannispen__industrial-low-flash04'};
soundDef[soundDefCounter++] = {soundName: 'lowFlash2', soundFile: './sound/audioFiles/9570__thanvannispen__industrial-low-flash07'};
soundDef[soundDefCounter++] = {soundName: 'tranceKick2', soundFile: './sound/audioFiles/24004__laya__dance-kick3'};
soundDef[soundDefCounter++] = {soundName: 'tranceKick', soundFile: './sound/audioFiles/33325__laya__trance-kick01'};
soundDef[soundDefCounter++] = {soundName: 'wosh', soundFile: './sound/audioFiles/33960__krlox__pudricion-4'};
soundDef[soundDefCounter++] = {soundName: 'voltage', soundFile: './sound/audioFiles/49255__keinzweiter__bonobob-funk'};
soundDef[soundDefCounter++] = {soundName: 'beepA', soundFile: './sound/audioFiles/100708__steveygos93__bleep_a'};
soundDef[soundDefCounter++] = {soundName: 'beepB', soundFile: './sound/audioFiles/100708__steveygos93__bleep_b'};
soundDef[soundDefCounter++] = {soundName: 'beepC', soundFile: './sound/audioFiles/100708__steveygos93__bleep_c'};
soundDef[soundDefCounter++] = {soundName: 'beepD', soundFile: './sound/audioFiles/100708__steveygos93__bleep_d'};
soundDef[soundDefCounter++] = {soundName: 'beep', soundFile: './sound/audioFiles/116508_Beep'};
soundDef[soundDefCounter++] = {soundName: 'hello', soundFile: './sound/audioFiles/116508_Hello'};
soundDef[soundDefCounter++] = {soundName: 'alienBeep', soundFile: './sound/audioFiles/132389__blackie666__alienbleep'};

var numberOfSounds = soundDefCounter;

var soundBank = {};
var soundFiles = {};
var endedFirstPlay = 0;