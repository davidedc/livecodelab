
programs = {}
programs.demos = {}
programs.tutorials = {}

programs.demos.roseDemo =
    submenu: "Basic"
    title: "Rose"
    code: """
            // 'B rose' by Guy John (@rumblesan)
            // Mozilla Festival 2012
            // adapted from 'A rose' by Lib4tech

            background red
            scale 1.5
            animationStyle paintOver
            rotate frame / 100
            v = (frame / 2) % 255
            fill 255 - v, 0, 0
            stroke 255 - v, 0, 0
            scale 1 - (v / 255)
            box
            """


programs.demos.simpleCubeDemo =
    submenu: "Basic"
    title: "Simple cube"
    code: """
        // there you go!
        // a simple cube!

        background yellow
        rotate 0, time / 2, time / 2
        box
        """


programs.demos.cubesAndSpikes =
    submenu: "Basic"
    title: "Cubes and spikes"
    code: """
        simpleGradient fuchsia, (color 100, 200, 200), yellow
        scale 2.1
        5 times
        \trotate 0, 1, time / 5
        \tbox 0.1, 0.1, 0.1
        \tmove 0, 0.1, 0.1
        \t3 times
        \t\trotate 0, 1, 1
        \t\tbox 0.01, 0.01, 1
        """

programs.demos.redthreadsDemo =
    submenu: "Basic"
    title: "Red threads"
    code: """
        scale 4.5
        background black
        stroke red
        noFill
        strokeSize 7
        2 times
        \trotate time / 20
        \tball
        \trotate 0, 1, 1
        \tball
        """


programs.demos.ringBall =
    submenu: "Complex"
    title: "Ring ball"
    code: """
        ringDetail = 45
        ambientLight 255
        noStroke
        fill orange
        background black
        rotate time / 5
        scale 0.7
        9 times with i
        \trotate (time / 5) + i
        \tringDetail times
        \t\trotate 0, 0, (2 * pi) / ringDetail
        \t\tmove 2, 0, 0
        \t\t\trect 1, 0.3 + (1 / ringDetail)
        """

programs.demos.crazyRibbon =
    submenu: "Complex"
    title: "Crazy ribbon"
    code: """
        noStroke
        fill red
        background black
        rotate time
        200 times with i
        \trotate time * 2 + sin(i)
        \t\tmove 2, 0, 0
        \t\t\tbox 1, 0.4, 0.07
        """

programs.demos.acidTown =
    submenu: "Complex"
    title: "Acid town"
    code: """
        absin = (x) -> 255 * abs(sin(time * x))
        animationStyle paintOver
        scale 3.5
        background black
        stroke absin(1), absin(2), absin(3)
        noFill
        strokeSize 7
        2 times
        \trotate time / 20
        \tbox
        """

programs.demos.theGrid =
    submenu: "Complex"
    title: "The grid"
    code: """
        background magenta
        gridSize = 4 * abs(wave(0.05))
        scale 1 / (abs(gridSize) + 2) // fit the screen
        pad = 1 + abs(2 * wave(0.5))
        ambientLight
        fill yellow, 230
        rotate time
        // center everything
        move -(pad * gridSize / 2)
        gridSize times with rows
        \tgridSize times with columns
        \t\tgridSize times with slices
        \t\t\tmove pad * rows, pad * columns, pad * slices
        \t\t\t\tbox
        """

programs.demos.tube =
    submenu: "Complex"
    title: "Tube"
    code: """
        background black
        rotate time / 10
        move 0, -1.2, -1
        rotate pi / 2, 0, 0
        scale 0.5
        noStroke
        8 times with j
        \tmove 0, 0.5, 0
        \t31 times with i
        \t\trotate 0, 0.2, 0
        \t\tr = ((i  * 3) + (time * 12)) % 255
        \t\tg = ((i * 7) + (time * 30 + 20) * 7) % 255
        \t\tb = ((j * 17) + (time * 30 + 40) * 3) % 255
        \t\tfill r, g, b
        \t\trect 0.3, 0.3
        \t\tmove 0.5, 0, 0
        """

programs.demos.movingBlocks =
    submenu: "Complex"
    title: "Moving blocks"
    code: """
        background white
        noStroke
        stackN = 10
        numStacks = 40
        scale 0.5
        spread = 18
        thinness = 0.08
        colorSpeed = 4
        movmentSpeed = 0.002
        noiseMov = (x, y, j, z) -> spread * (  ( noise  (x * abs (sin (time+y) * movmentSpeed)) / (j + z) ) - 0.5  )
        move 1, 1, 0
        rotate 3, 0.6, time / 10
        numStacks times with j
        \tmove 0
        \t\txm = noiseMov 200, 100, j, 20
        \t\tym = noiseMov 209, 200, j, 2
        \t\tzm = (noiseMov 100, 300, j, 40) / 4
        \t\tmove xm, ym, zm
        \t\tstackN times with i
        \t\t\tmove 0, 0, i * thinness
        \t\t\t\tfill 255, (time*3*j*colorSpeed+i*255/stackN)%255, (time*1*j*colorSpeed+i*255/stackN)%255
        \t\t\t\trect
        """

programs.demos.infoway =
    submenu: "Complex"
    title: "Infoway"
    code: """
        background black
        noStroke
        stackN = 1
        numStacks = 400
        spread = 48
        scale 0.5
        thinness = 0.08
        colorSpeed = 4
        movmentSpeed = 0.003
        noiseMov = (x, y, j, z) -> spread * (  ( noise  (x * abs (sin (time+y) * movmentSpeed)) / (j + z) ) - 0.5  )
        move 1,1,0
        rotate time/10
        numStacks times with j
        \tmove 0
        \t\txm = noiseMov 501, 300, j, 20
        \t\tym = noiseMov 703, 400, j, 2
        \t\tzm = (noiseMov 604, 500, j, 40) / 4
        \t\tmove xm, ym, zm
        \t\tmove 0,0,thinness
        \t\t\tfill 0,0, (time*1*j*colorSpeed+255/stackN)%255
        \t\t\trect 0.24
        """


programs.demos.webgltwocubesDemo =
    submenu: "WebGL"
    title: "WebGL: Two cubes"
    code: """
        background 155, 255, 255
        2 times
        \trotate 0, 1, time / 2
        \tbox
        """

programs.demos.webglturbineDemo =
    submenu: "WebGL"
    title: "WebGL: Turbine"
    code: """
        background 155, 55, 255
        70 times
        \trotate time / 100, 1, time / 100
        \tbox
        """

programs.demos.webgllavaDemo =
    submenu: "WebGL"
    title: "WebGL: Lava"
    code: """
        scale 4.5
        noStroke
        10 times with i
        \trotate 1, time / 400, 2
        \tfill 255, 0, 200 * abs(sin(i))
        \tball
        """


programs.demos.webglzfightartDemo =
    submenu: "WebGL"
    title: "WebGL: Z-fight!"
    code: """
        // Explore the artifacts
        // of your GPU!
        // Go Z-fighting, go!
        scale 5
        noStroke
        rotate
        fill red
        box
        rotate 0.000001
        fill yellow
        box
        """

programs.demos.webglaKnot =
    submenu: "WebGL"
    title: "WebGL: A knot"
    code: """
        turns = 2
        detail = 400
        speed = 0.4
        background black
        scale 0.9
        rotate 15,3,1
        detail times with i
        \trotate 0, 0, (2 * pi) / detail
        \tmove 0.65
        \t\trotate (turns * i * pi) / detail + (time * speed), 0, 0
        \t\t\trect 1
        """

programs.demos.seaweeds =
    submenu: "Complex"
    title: "Seaweeds"
    code: """
        turns = 2
        detail = 100
        speed = 2
        background black
        scale 2
        rotate time / 5
        4 times
        \trotate 0, 2, 0
        \tdetail times with i
        \t\trotate 0, 0, 2 * pi / detail
        \t\tmove 2, 5, 1
        \t\t\trotate (turns * i * pi) / detail + (time * speed), 0, 0
        \t\t\trect 1
        """

programs.demos.littleSpiralOfCubes =
    submenu: "Basic"
    title: "Little spiral"
    code: """
        background orange
        scale 0.1
        10 times
        \trotate 0, 1, time
        \tmove 1, 1, 1
        \tbox
        """

programs.demos.tentacleDemo =
    submenu: "Basic"
    title: "Tentacle"
    code: """
        background 155, 255, 155
        scale 0.15
        3 times
        \trotate 0, 1, 1
        \t10 times
        \t\trotate 0, 1, time
        \t\tscale 0.9
        \t\tmove 1, 1, 1
        \t\tbox
        """

programs.demos.lampDemo =
    submenu: "Basic"
    title: "Lamp"
    code: """
        animationStyle motionBlur
        simpleGradient red, yellow, (color 255, 0, 255)
        //animationStyle paintOver
        scale 2
        rotate time / 4, time / 4, time / 4
        90 times
        \trotate time / 200, time / 200,  time / 200
        \tline
        \tmove 0.5, 0, 0
        \tline
        \tmove -0.5, 0, 0
        \tline
        """

programs.demos.trillionfeathersDemo =
    submenu: "Basic"
    title: "A trillion feathers"
    code: """
        animationStyle paintOver
        move 2, 0, 0
        scale 2
        rotate
        20 times
        \trotate
        \tmove 0.25, 0, 0
        \tline
        \tmove -0.5, 0, 0
        \tline
        """

programs.demos.monsterblobDemo =
    submenu: "Basic"
    title: "Monster blob"
    code: """
        ballDetail 6
        animationStyle motionBlur
        rotate time / 5
        simpleGradient fuchsia, aqua, yellow
        5 times
        \trotate 0, 1, time / 5
        \tmove 0.2, 0, 0
        \t3 times
        \t\trotate 1
        \t\tball -1
        """

programs.demos.industrialMusicDemo =
    submenu: "Sound"
    title: "Sound: Industrial"
    code: """
        bpm 88
        play 'alienBeep',  '--x- ---- --x- ----'
        play 'beepC',      '-x-- ---- x--x xxx-'
        play 'beepA',      '--x- ---- --x- ----'
        play 'lowFlash',   '--x- ---- ---- ----'
        play 'beepB',      'x--x ---- -x-- -x--'
        play 'voltage',    'x-x- -x-- x-xx x-xx'
        play 'tranceKick', '-x-x ---x x--- --xx'
        """

programs.demos.overScratch =
    submenu: "Sound"
    title: "Sound: Over-scratch"
    code: """
        bpm 108
        play 'tranceKick',  'x-x- -x'
        play 'tranceKick1', 'x-x-x-x'
        play 'scratch' + int(random(14)) ,'x'
        play 'scratch-med' + int(random(8)) ,'x-'
        play 'scratch-high' + int(random(2)) ,'x---'
        play 'scratch-rough' + int(random(4)) ,'x-'
        """

programs.demos.trySoundsDemo =
    submenu: "Sound"
    title: "Sound: Try them all"
    code: """
        bpm 88
        // leave this one as base
        play 'tranceKick'  ,'-x-x ---x x--- --xx'

        //play 'alienBeep'  ,'--x- ---- --x- ----'
        //play "beep" + int(random 4) ,'x'
        //play "bing"  ,'--x- ---- --x- ----'
        //play "ciack" + int(random 2) ,'x'
        //play "cosmos"  ,'--x- ---- --x- ----'
        //play "crash" + int(random 3) ,'x'
        //play "detune"  ,'--x- ---- --x- ----'
        //play "dish" + int(random 3) ,'x'
        //play "downstairs"  ,'--x- ---- --x- ----'
        //play "glass"  ,'--x- ---- --x- ----'
        //play "growl" + int(random 6) ,'x'
        //play "highHatClosed"  ,'--x- ---- --x- ----'
        //play "highHatOpen"  ,'--x- ---- --x- ----'
        //play "hiss" + int(random 3) ,'x'
        //play "hoover" + int(random 2) ,'x'
        //play "lowFlash" + int(random 2) ,'x'
        //play "mouth" + int(random 5) ,'x'
        //play "penta" + int(random 16) ,'x'

        //play "pianoLDChord" + int(random 4) ,'x'
        //play "pianoLHChord" + int(random 4) ,'x'
        //play "pianoRHChord" + int(random 4) ,'x'

        //play "ride"  ,'--x- ---- --x- ----'
        //play "rust" + int(random 3) ,'x'

        // scratches of short length
        //play "scratch" + int(random 14) ,'x'
        // scratches of high pitch
        //play "scratch-high" + int(random 2) ,'x'
        // scratches of long length
        //play "scratch-long" + int(random 4) ,'x'
        // scratches of medium length
        //play "scratch-med" + int(random 9) ,'x'
        // "rough"-sounding scratches
        //play "scratch-rough" + int(random 4) ,'x'

        //play "siren" + int(random 4) ,'x'
        //play "snap" + int(random 2) ,'x'
        //play "snare" + int(random 3) ,'x'
        //play "thump"  + int(random 3) ,'x'
        //play "tap" + int(random 6) ,'x'
        //play "tense" + int(random 6) ,'x'
        //play "tic" + int(random 5) ,'x'
        //play "toc" + int(random 3) ,'x'
        //play "tranceKick" + int(random 4) ,'x'
        //play "tweet" + int(random 14) ,'x'
        //play "voltage"  ,'--x- ---- --x- ----'
        //play "warm"  ,'--x- ---- --x- ----'
        """

programs.demos.DJCastroHomage =
    submenu: "Sound"
    title: "Sound: DJCastro homage"
    code: """
        // An homage to DJ Castro
        // https://www.youtube.com/watch?v=hG_n8yl0ptk

        // To book DJ Castro see info at:
        // https://www.youtube.com/watch?v=Aog3iokxbw0

        // All samples belong to DJ Castro
        // LiveCodeLab claims no ownership
        // or intellectual property over DJ Castro's work.

        background black
        rotate
        rect 2 + 2 * pulse(4)

        bpm 102
        vowelSmpl= [1, 2, 3, 8, 9, 10, 11, 12, 14]
        rhytmSmpl= [3, 8, 11, 12]
        vowelSmpl= vowelSmpl[int random vowelSmpl.length]
        rhytmSmpl= rhytmSmpl[int random rhytmSmpl.length]

        // put some rhythm
        play 'DJCastro'+ rhytmSmpl   ,'xx-x-'
        play 'DJCastro'+ rhytmSmpl   ,'-xxx-x'

        // some extra rhythm mayhem
        // every now and then
        if beat % 24 > 18
        \tplay 'DJCastro1' ,'x'
        if beat % 36 > 30
        \tplay 'DJCastro3' ,'x'

        if beat % 10 > 5
        \tplay 'castro'+ int(random 24)   ,'xxx-'
        if beat % 10 > 2
        \tplay 'DJCastro'+ vowelSmpl   ,'---x-'
        \totherSmpl = [1, 3, 4, 5, 6, 7, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
        \totherSmpl = otherSmpl[int random otherSmpl.length]
        \tplay 'DJCastro'+otherSmpl   ,'xx-'
        if beat % 12 > 10
        \tplay 'DJCastro2'   ,'x'
        if beat % 12 > 8 and beat % 12 < 11
        \tplay 'DJCastro23'   ,'x'
        """

programs.demos.springysquaresDemo =
    submenu: "Basic"
    title: "Springy squares"
    code: """
        animationStyle motionBlur
        simpleGradient fuchsia, (color 100, 200, 200), yellow
        scale 0.3
        3 times
        \tmove 0, 0, 0.5
        \t5 times
        \t\trotate time / 2
        \t\tmove 0.7, 0, 0
        \t\trect
        """

programs.demos.diceDemo =
    submenu: "Basic"
    title: "Dice"
    code: """
        animationStyle motionBlur
        simpleGradient (color 255), moccasin, peachpuff
        stroke 255, 100, 100, 255
        fill red, 155
        move -0.5, 0, 0
        scale 0.3
        3 times
        \tmove 0, 0, 0.5
        \t1 times
        \t\trotate time
        \t\tmove 2, 0, 0
        \t\tbox
        """

programs.demos.webglalmostvoronoiDemo =
    submenu: "WebGL"
    title: "WebGL: Almost Voronoi"
    code: """
        scale 10
        2 times
        \trotate 0, 1, time / 10
        \tball -1
        """

programs.demos.webglshardsDemo =
    submenu: "WebGL"
    title: "WebGL: Shards"
    code: """
        scale 10
        fill 0
        strokeSize 7
        5 times
        \trotate 0, 1, time / 20
        \tball
        \trotate 0, 1, 1
        \tball -1.01
        """

programs.demos.möbius =
    submenu: "Complex"
    title: "Möbius"
    code: """
        turns = 1 // 1 = Möbius strip
        detail = 200 // try up to 400 or so
        speed = 0.5
        ambientLight 255, 0, 0 // comment out to see the seam

        background black
        rotate time / 5
        scale 0.6
        detail times with i
        \trotate 0, 0, (2 * pi) / detail
        \tmove 2, 0, 0
        \t\trotate 0, (turns * i * pi) / detail + (time * speed), 0
        \t\trect 1, 0.04 + (1 / detail)
        """

programs.demos.theeye =
    submenu: "Complex"
    title: "The eye"
    code: """
        turns = floor(time / 10) % 6
        detail = 100
        speed = 3
        if time % 10 < 5
        \tambientLight 255, 255, 255

        background black
        rotate time / 5
        detail times with i
        \trotate 0, 0, (2 * pi) / detail
        \tmove 2, 0, 0
        \t\trotate (turns * i * pi) / detail + (time * speed), 0, 0
        \t\trect 1
        """


programs.tutorials.introTutorial = require('../../programs/tutorials/intro')
programs.tutorials.helloworldTutorial = require('../../programs/tutorials/helloworld')
programs.tutorials.somenotesTutorial = require('../../programs/tutorials/somenotes')
programs.tutorials.rotateTutorial = require('../../programs/tutorials/rotate')

programs.tutorials.frameTutorial = require('../../programs/tutorials/frame')
programs.tutorials.timeTutorial = require('../../programs/tutorials/time')

programs.tutorials.moveTutorial = require('../../programs/tutorials/move')
programs.tutorials.scaleTutorial = require('../../programs/tutorials/scale')

programs.tutorials.timesTutorial = require('../../programs/tutorials/times')

programs.tutorials.fillTutorial = require('../../programs/tutorials/fill')
programs.tutorials.strokeTutorial = require('../../programs/tutorials/stroke')
programs.tutorials.colornamesTutorial = require('../../programs/tutorials/colornames')
programs.tutorials.lightsTutorial = require('../../programs/tutorials/lights')
programs.tutorials.backgroundTutorial = require('../../programs/tutorials/background')
programs.tutorials.gradientTutorial = require('../../programs/tutorials/gradient')
programs.tutorials.lineTutorial = require('../../programs/tutorials/line')
programs.tutorials.ballTutorial = require('../../programs/tutorials/ball')
programs.tutorials.pushpopMatrixTutorial = require('../../programs/tutorials/pushpopMatrix')
programs.tutorials.animationstyleTutorial = require('../../programs/tutorials/animationstyle')


programs.tutorials.doonceTutorial = require('../../programs/tutorials/doonce')
programs.tutorials.conditionalsTutorial = require('../../programs/tutorials/conditionals')

programs.tutorials.autocodeTutorial = require('../../programs/tutorials/autocode')


module.exports = programs
