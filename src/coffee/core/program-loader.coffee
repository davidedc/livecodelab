###
## ProgramLoader takes care of managing the URL and editor content
## when the user navigates through demos and examples - either by
## selecting menu entries, or by clicking back/forward arrow, or by
## landing on a URL with a hashtag.
###

class ProgramLoader

  constructor: (
    @eventRouter,
    @texteditor,
    @liveCodeLabCoreInstance,
    @usingWebGL,
  ) ->
    @lastHash = ""
    userWarnedAboutWebglExamples = false
    @programs =
      demos: {}
      tutorials: {}

    @programs.demos.roseDemo =
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


    @programs.demos.simpleCubeDemo =
      submenu: "Basic"
      title: "Simple cube"
      code: """
            // there you go!
            // a simple cube!

            background yellow
            rotate 0, time / 2, time / 2
            box
            """


    @programs.demos.cubesAndSpikes =
      submenu: "Basic"
      title: "Cubes and spikes"
      code: """
            simpleGradient fuchsia, color(100, 200, 200), yellow
            scale 2.1
            5 times
            ▶rotate 0, 1, time / 5
            ▶box 0.1, 0.1, 0.1
            ▶move 0, 0.1, 0.1
            ▶3 times
            ▶▶rotate 0, 1, 1
            ▶▶box 0.01, 0.01, 1
            """

    @programs.demos.redthreadsDemo =
      submenu: "Basic"
      title: "Red threads"
      code: """
            scale 4.5
            background black
            stroke red
            noFill
            strokeSize 7
            2 times
            ▶rotate time / 20
            ▶ball
            ▶rotate 0, 1, 1
            ▶ball
            """


    @programs.demos.ringBall =
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
            ▶rotate (time / 5) + i
            ▶ringDetail times
            ▶▶rotate 0, 0, (2 * pi) / ringDetail
            ▶▶move 2, 0, 0
            ▶▶▶rect 1, 0.3 + (1 / ringDetail)
            """

    @programs.demos.crazyRibbon =
      submenu: "Complex"
      title: "Crazy ribbon"
      code: """
            noStroke
            fill red
            background black
            rotate time
            200 times with i
            ▶rotate time * 2 + sin(i)
            ▶▶move 2, 0, 0
            ▶▶▶box 1, 0.4, 0.07
            """

    @programs.demos.acidTown =
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
            ▶rotate time / 20
            ▶box
            """

    @programs.demos.theGrid =
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
            ▶gridSize times with columns
            ▶▶gridSize times with slices
            ▶▶▶move pad * rows, pad * columns, pad * slices
            ▶▶▶▶box
            """

    @programs.demos.tube =
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
            ▶move 0, 0.5, 0
            ▶31 times with i
            ▶▶rotate 0, 0.2, 0
            ▶▶r = ((i  * 3) + (time * 12)) % 255
            ▶▶g = ((i * 7) + (time * 30 + 20) * 7) % 255
            ▶▶b = ((j * 17) + (time * 30 + 40) * 3) % 255
            ▶▶fill r, g, b
            ▶▶rect 0.3, 0.3
            ▶▶move 0.5, 0, 0
            """

    @programs.demos.movingBlocks =
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
            noiseMov = (x, y, j, z) -> spread * (noise(((x*abs(sin((time+y)*movmentSpeed))))/(j+z))-0.5)
            move 1, 1, 0
            rotate 3, 0.6, time / 10
            numStacks times with j
            ▶move 0
            ▶▶move noiseMov(200,100,j,20),noiseMov(209,200,j,2),noiseMov(100,300,j,40)/4
            ▶▶stackN times with i
            ▶▶▶move 0, 0, i * thinness
            ▶▶▶▶fill 255, (time*3*j*colorSpeed+i*255/stackN)%255, (time*1*j*colorSpeed+i*255/stackN)%255
            ▶▶▶▶rect
            """

    @programs.demos.infoway =
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
            noiseMov = (x,y,j,z) -> spread*(noise(((x*abs(sin((time+y)*movmentSpeed))))/(j+z))-0.5)
            move 1,1,0
            rotate time/10
            numStacks times with j
            ▶move 0
            ▶▶move noiseMov(501,300,j,20),noiseMov(703,400,j,2),noiseMov(604,500,j,40)/4
            ▶▶move 0,0,thinness
            ▶▶▶fill 0,0, (time*1*j*colorSpeed+255/stackN)%255
            ▶▶▶rect 0.24
            """

    @programs.demos.turtleGraphicstreeDemo =
      submenu: "TurtleGraphics"
      title: "Tree"
      code: """
            scale 0.3
            move 0,-2,0

            drawTree = (depth) ->
            ▶if depth <= 0 then return
            ▶forward
            ▶scale 1
            ▶▶turnRight 30
            ▶▶▶drawTree depth-1
            ▶▶turnLeft 30 * sin time
            ▶▶▶drawTree depth-1

            drawTree 9
            """

    @programs.demos.turtleGraphicsrandomGridDemo =
      submenu: "TurtleGraphics"
      title: "Random grid"
      code: """
            background black
            animationStyle paintOver
            rotate 0,0,time
            scale 0.9
            fill frame%255,0,0
            10 times
            ▶if random > 0.5
            ▶▶turnRight
            ▶else
            ▶▶turnLeft
            ▶forward random
            """

    @programs.demos.turtleGraphicsturtleSpiralDemo =
      submenu: "TurtleGraphics"
      title: "Turtle spiral"
      code: """
            rotate 6
            scale 0.3
            frame%550 times with i
            ▶turnLeft 18
            ▶forward 0.2 + i/300
            turtle
            """

    @programs.demos.webgltwocubesDemo =
      submenu: "WebGL"
      title: "WebGL: Two cubes"
      code: """
            background 155, 255, 255
            2 times
            ▶rotate 0, 1, time / 2
            ▶box
            """

    @programs.demos.webglturbineDemo =
      submenu: "WebGL"
      title: "WebGL: Turbine"
      code: """
            background 155, 55, 255
            70 times
            ▶rotate time / 100, 1, time / 100
            ▶box
            """

    @programs.demos.webgllavaDemo =
      submenu: "WebGL"
      title: "WebGL: Lava"
      code: """
            scale 4.5
            noStroke
            10 times with i
            ▶rotate 1, time / 400, 2
            ▶fill 255, 0, 200 * abs(sin(i))
            ▶ball
            """


    @programs.demos.webglzfightartDemo =
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

    @programs.demos.webglaKnot =
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
            ▶rotate 0, 0, (2 * pi) / detail
            ▶move 0.65
            ▶▶rotate (turns * i * pi) / detail + (time * speed), 0, 0
            ▶▶▶rect 1
            """

    @programs.demos.seaweeds =
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
            ▶rotate 0, 2, 0
            ▶detail times with i
            ▶▶rotate 0, 0, 2 * pi / detail
            ▶▶move 2, 5, 1
            ▶▶▶rotate (turns * i * pi) / detail + (time * speed), 0, 0
            ▶▶▶rect 1
            """

    @programs.demos.littleSpiralOfCubes =
      submenu: "Basic"
      title: "Little spiral"
      code: """
            background orange
            scale 0.1
            10 times
            ▶rotate 0, 1, time
            ▶move 1, 1, 1
            ▶box
            """

    @programs.demos.tentacleDemo =
      submenu: "Basic"
      title: "Tentacle"
      code: """
            background 155, 255, 155
            scale 0.15
            3 times
            ▶rotate 0, 1, 1
            ▶10 times
            ▶▶rotate 0, 1, time
            ▶▶scale 0.9
            ▶▶move 1, 1, 1
            ▶▶box
            """

    @programs.demos.lampDemo =
      submenu: "Basic"
      title: "Lamp"
      code: """
            animationStyle motionBlur
            simpleGradient red, yellow, color(255, 0, 255)
            //animationStyle paintOver
            scale 2
            rotate time / 4, time / 4, time / 4
            90 times
            ▶rotate time / 200, time / 200,  time / 200
            ▶line
            ▶move 0.5, 0, 0
            ▶line
            ▶move -0.5, 0, 0
            ▶line
            """

    @programs.demos.trillionfeathersDemo =
      submenu: "Basic"
      title: "A trillion feathers"
      code: """
            animationStyle paintOver
            move 2, 0, 0
            scale 2
            rotate
            20 times
            ▶rotate
            ▶move 0.25, 0, 0
            ▶line
            ▶move -0.5, 0, 0
            ▶line
            """

    @programs.demos.monsterblobDemo =
      submenu: "Basic"
      title: "Monster blob"
      code: """
            ballDetail 6
            animationStyle motionBlur
            rotate time / 5
            simpleGradient fuchsia, aqua, yellow
            5 times
            ▶rotate 0, 1, time / 5
            ▶move 0.2, 0, 0
            ▶3 times
            ▶▶rotate 1
            ▶▶ball -1
            """

    @programs.demos.industrialMusicDemo =
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

    @programs.demos.overScratch =
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

    @programs.demos.trySoundsDemo =
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

    @programs.demos.DJCastroHomage =
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
            ▶play 'DJCastro1' ,'x'
            if beat % 36 > 30
            ▶play 'DJCastro3' ,'x'

            if beat % 10 > 5
            ▶play 'castro'+ int(random 24)   ,'xxx-'
            if beat % 10 > 2
            ▶play 'DJCastro'+ vowelSmpl   ,'---x-'
            ▶otherSmpl = [1, 3, 4, 5, 6, 7, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
            ▶otherSmpl = otherSmpl[int random otherSmpl.length]
            ▶play 'DJCastro'+otherSmpl   ,'xx-'
            if beat % 12 > 10
            ▶play 'DJCastro2'   ,'x'
            if beat % 12 > 8 and beat % 12 < 11
            ▶play 'DJCastro23'   ,'x'
            """

    @programs.demos.springysquaresDemo =
      submenu: "Basic"
      title: "Springy squares"
      code: """
            animationStyle motionBlur
            simpleGradient fuchsia, color(100, 200, 200), yellow
            scale 0.3
            3 times
            ▶move 0, 0, 0.5
            ▶5 times
            ▶▶rotate time / 2
            ▶▶move 0.7, 0, 0
            ▶▶rect
            """

    @programs.demos.diceDemo =
      submenu: "Basic"
      title: "Dice"
      code: """
            animationStyle motionBlur
            simpleGradient color(255), moccasin, peachpuff
            stroke 255, 100, 100, 255
            fill red, 155
            move -0.5, 0, 0
            scale 0.3
            3 times
            ▶move 0, 0, 0.5
            ▶1 times
            ▶▶rotate time
            ▶▶move 2, 0, 0
            ▶▶box
            """

    @programs.demos.webglalmostvoronoiDemo =
      submenu: "WebGL"
      title: "WebGL: Almost Voronoi"
      code: """
            scale 10
            2 times
            ▶rotate 0, 1, time / 10
            ▶ball -1
            """

    @programs.demos.webglshardsDemo =
      submenu: "WebGL"
      title: "WebGL: Shards"
      code: """
            scale 10
            fill 0
            strokeSize 7
            5 times
            ▶rotate 0, 1, time / 20
            ▶ball
            ▶rotate 0, 1, 1
            ▶ball -1.01
            """

    @programs.demos.möbius =
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
            ▶rotate 0, 0, (2 * pi) / detail
            ▶move 2, 0, 0
            ▶▶rotate 0, (turns * i * pi) / detail + (time * speed), 0
            ▶▶rect 1, 0.04 + (1 / detail)
            """

    @programs.demos.theeye =
      submenu: "Complex"
      title: "The eye"
      code: """
            turns = floor(time / 10) % 6
            detail = 100
            speed = 3
            if time % 10 < 5
            ▶ambientLight 255, 255, 255

            background black
            rotate time / 5
            detail times with i
            ▶rotate 0, 0, (2 * pi) / detail
            ▶move 2, 0, 0
            ▶▶rotate (turns * i * pi) / detail + (time * speed), 0, 0
            ▶▶rect 1
            """


    @programs.tutorials.introTutorial =
      submenu: "Intro"
      title: "intro"
      code: """
            // Lines beginning with two
            // slashes (like these) are just comments.

            // Everything else is run
            // about 30 to 60 times per second
            // in order to create an animation.

            // Click the link below to start the tutorial.

            // next-tutorial:hello_world
            """

    @programs.tutorials.helloworldTutorial =
      submenu: "Intro"
      title: "hello world"
      code: """
            // type these three letters
            // in one of these empty lines below:
            // 'b' and 'o' and 'x'



            // (you should then see a box facing you)
            // click below for the next tutorial
            // next-tutorial:some_notes
            """

    @programs.tutorials.somenotesTutorial =
      submenu: "Intro"
      title: "some notes"
      code: """
            // If this makes sense to you:
            // the syntax is similar to Coffeescript
            // and the commands are almost
            // like Processing.

            // If this doesn't make sense to you
            // don't worry.

            // next-tutorial:rotate
            """

    @programs.tutorials.rotateTutorial =
      submenu: "Intro"
      title: "a taste of animation"
      code: """
            // now that we have a box
            // let's rotate it:
            // type 'rotate 1' in the
            // line before the 'box'


            box

            // click for the next tutorial:
            // next-tutorial:frame
            """

    @programs.tutorials.frameTutorial =
      submenu: "Animation"
      title: "frame"
      code: """
            // make the box spin
            // by replacing '1' with 'frame'

            rotate 1
            box

            // 'frame' contains a number
            // always incrementing as
            // the screen is re-drawn.
            // (use 'frame / 100' to slow it down)
            // next-tutorial:time
            """

    @programs.tutorials.timeTutorial =
      submenu: "Animation"
      title: "time"
      code: """
            // 'frame / 100' has one problem:
            // faster computers will make
            // the cube spin too fast.
            // Replace it with 'time / 2'.

            rotate frame / 100
            box

            // 'time' counts the
            // number of seconds since
            // the program started, so it's
            // independent of how fast
            // the computer is at drawing.
            // next-tutorial:move
            """

    @programs.tutorials.moveTutorial =
      submenu: "Placing things"
      title: "move"
      code: """
            // you can move any object
            // by using 'move'

            box
            move 1, 1, 0
            box

            // try to use a rotate before
            // the first box to see how the
            // scene changes.
            // next-tutorial:scale
            """

    @programs.tutorials.scaleTutorial =
      submenu: "Placing things"
      title: "scale"
      code: """
            // you can make an object bigger
            // or smaller by using 'scale'

            rotate 3
            box
            move 1
            scale 2
            box

            // try to use scale or move before
            // the first box to see how the
            // scene changes.
            // next-tutorial:times
            """

    @programs.tutorials.timesTutorial =
      submenu: "Repeating stuff"
      title: "times"
      code: """
            // 'times' (not to be confused with
            // 'time'!) can be used to
            // repeat operations like so:

            rotate 1
            3 times
            ▶move 0.2, 0.2, 0.2
            ▶box

            // note how the tabs indicate
            // exactly the block of code
            // to be repeated.
            // next-tutorial:fill
            """

    @programs.tutorials.fillTutorial =
      submenu: "Graphics"
      title: "fill"
      code: """
            // 'fill' changes the
            // color of all the faces:

            rotate 1
            fill 255, 255, 0
            box

            // the three numbers indicate
            // red green and blue values.
            // You can also use color names such as 'indigo'
            // Try replacing the numbers with
            // 'angleColor'
            // next-tutorial:stroke
            """

    @programs.tutorials.strokeTutorial =
      submenu: "Graphics"
      title: "stroke"
      code: """
            // 'stroke' changes all the
            // edges:

            rotate 1
            strokeSize 5
            stroke 255, 255, 255
            box

            // the three numbers are RGB
            // but you can also use the color names
            // or the special color 'angleColor'
            // Also you can use 'strokeSize'
            // to specify the thickness.
            // next-tutorial:color_names
            """

    @programs.tutorials.colornamesTutorial =
      submenu: "Graphics"
      title: "color by name"
      code: """
            // you can call colors by name
            // try to un-comment one line:
            //fill greenyellow
            //fill indigo
            //fill lemonchiffon // whaaaat?

            rotate 1
            box

            // more color names here:
            // http://html-color-codes.info/color-names/
            // (just use them in lower case)
            // next-tutorial:lights
            """

    @programs.tutorials.lightsTutorial =
      submenu: "Graphics"
      title: "lights"
      code: """
            // 'ambientLight' creates an
            // ambient light so things have
            // some sort of shading:

            ambientLight 0, 255, 255
            rotate time
            box

            // you can turn that light on and
            // off while you build the scene
            // by using 'lights' and 'noLights'
            // next-tutorial:background
            """

    @programs.tutorials.backgroundTutorial =
      submenu: "Graphics"
      title: "background"
      code: """
            // 'background' creates a
            // solid background:

            background 0, 0, 255
            rotate time
            box

            // next-tutorial:gradient
            """

    @programs.tutorials.gradientTutorial =
      submenu: "Graphics"
      title: "gradient"
      code: """
            // even nicer, you can paint a
            // background gradient:

            simpleGradient color(190, 10, 10), color(30, 90, 100), color(0)
            rotate time
            box

            // next-tutorial:line
            """

    @programs.tutorials.lineTutorial =
      submenu: "Graphics"
      title: "line"
      code: """
            // draw lines like this:

            20 times
            ▶rotate time / 9
            ▶line

            // next-tutorial:ball
            """

    @programs.tutorials.ballTutorial =
      submenu: "Graphics"
      title: "ball"
      code: """
            // draw balls like this:

            ballDetail 10
            3 times
            ▶move 0.2, 0.2, 0.2
            ▶ball

            // ('ballDetail' is optional)
            // next-tutorial:pushpopMatrix
            """

    @programs.tutorials.pushpopMatrixTutorial =
      submenu: "Graphics"
      title: "push and pop"
      code: """
            // pushMatrix creates a bookmark of
            // the position, which you can
            // return to later by using popMatrix.
            // You can reset using 'resetMatrix'.

            rotate time
            pushMatrix // bookmark the position after the rotation
            line
            move 0.5, 0, 0
            line
            popMatrix // go back to the bookmarked position
            move -0.5, 0, 0
            line
            resetMatrix // resets the position
            line // not affected by initial rotation
            // next-tutorial:animation_style
            """

    @programs.tutorials.animationstyleTutorial =
      submenu: "Graphics"
      title: "animation style"
      code: """
            // try uncommenting either line
            // with the animationStyle

            background 255
            //animationStyle motionBlur
            //animationStyle paintOver
            rotate frame / 10
            box

            // next-tutorial:do_once
            """

    @programs.tutorials.doonceTutorial =
      submenu: "Controlling flow"
      title: "do once"
      code: """
            // delete either check mark below

            rotate time
            ✓doOnce
            ▶background 255
            ▶fill 255, 0, 0
            ✓doOnce ball
            box

            // ...the line or block of code
            // are ran one time only, after that the
            // check marks immediately re-appear
            // P.S. keep hitting the delete button
            // on that first check mark for seizures.
            // next-tutorial:conditionals
            """

    @programs.tutorials.conditionalsTutorial =
      submenu: "Controlling flow"
      title: "conditionals"
      code: """
            // you can draw different things
            // (or in general do different things)
            // based on any
            // test condition you want:

            rotate
            if frame % 3 == 0
            ▶box
            else if frame % 3 == 1
            ▶ball
            else
            ▶peg

            // next-tutorial:autocode
            """

    @programs.tutorials.autocodeTutorial =
      submenu: "Others"
      title: "autocode"
      code: """
            // the Autocode button invents random
            // variations for you.

            // You can interrupt the Autocoder at
            // any time by pressing the button again,
            // or you can press CTRL-Z
            // (or CMD-Z on Macs) to undo (or re-do) some of
            // the steps even WHILE the autocoder is running,
            // if you see that things got
            // boring down a particular path of changes.
            """
  kickOff: ->
    setInterval(
      () => @pollHash(),
      100
    )
    # Setup Event Listeners
    @eventRouter.addListener("url-hash-changed", (hash) =>
      @loadAppropriateDemoOrTutorialBasedOnHash hash
    )

  loadDemoOrTutorial: (demoName) ->
    if (
      not @usingWebGL and
      not userWarnedAboutWebglExamples and
      demoName.indexOf("webgl") is 0
    )
      userWarnedAboutWebglExamples = true
      $("#exampleNeedsWebgl").modal()
      $("#simplemodal-container").height 200

    # set the demo as a hash state
    # so that ideally people can link directly to
    # a specific demo they like.
    @eventRouter.emit("set-url-hash", "bookmark=" + demoName)
    @eventRouter.emit("big-cursor-hide")
    @eventRouter.emit("editor-undim")
    @liveCodeLabCoreInstance.graphicsCommands.doTheSpinThingy = false
    prependMessage = ""
    if not @usingWebGL and demoName.indexOf("webgl") is 0
      prependMessage =
      """
      // This drawing makes much more sense
      // in a WebGL-enabled browser.


      """

    # Note, setting the value of the texteditor (texteditor.setValue below)
    # triggers the codeMirror onChange callback, which registers the new
    # code - so the next draw() will run the new demo code. But before doing
    # that will happen (when the timer for the next frame triggers), we'll
    # have cleared the screen with the code below.
    if @programs.demos[demoName] || @programs.tutorials[demoName]
      if @programs.demos[demoName]
        # the "replace" here is to change the arrows in tabs
        @texteditor.setValue prependMessage +
          @programs.demos[demoName].code.replace(/\u25B6/g, "\t")
      else if @programs.tutorials[demoName]
        # the "replace" here is to change the arrows in tabs
        @texteditor.setValue prependMessage +
          @programs.tutorials[demoName].code.replace(/\u25B6/g, "\t")
      # clear history. Why? Because we want to avoid the follwing:
      # user opens an example. User opens another example.
      # User performs undo. Result: previous example is open, but the hashtag
      # doesn't match the example. It's just confusing - we assume here that
      # the user selects another tutorial and example then is not expecting
      # the undo history to bring her back to previous demos/examples.
      # Note that, again, this is quite common in CodeMirror, the clearHistory
      # invocation below only works if slightly postponed. Not sure why.
      setTimeout((() => @texteditor.clearHistory()), 30)

    # bring the cursor to the top
    @texteditor.setCursor 0, 0

    # we want to avoid that the selected example
    # or tutorial when started paints over a screen with a previous drawing
    # of the previous code.
    # So basically we draw an empty frame.
    #   a) make sure that animationStyle is "normal"
    #   b) apply the potentially new animationStyle
    #   render the empty frame
    blendControls = @liveCodeLabCoreInstance.blendControls
    blendControls.animationStyle blendControls.animationStyles.normal
    blendControls.animationStyleUpdateIfChanged()
    @liveCodeLabCoreInstance.renderer.render(
      @liveCodeLabCoreInstance.graphicsCommands
    )

  loadAppropriateDemoOrTutorialBasedOnHash: (hash) ->
    matched = hash.match(/bookmark=(.*)/)

    if matched
      @loadDemoOrTutorial matched[1]
    else
      # user in on the root page without any hashes
      @texteditor.setValue ""
      # reset undo history
      setTimeout((()=>@texteditor.clearHistory()), 30)

  # this paragraph from http://stackoverflow.com/a/629817
  # there are more elegant ways to track back/forward history
  # but they are more complex than this. I don't mind having a bit of
  # polling for this, not too big of a problem.
  pollHash: ->
    if @lastHash isnt location.hash
      @lastHash = location.hash

      # hash has changed, so do stuff:
      @loadAppropriateDemoOrTutorialBasedOnHash @lastHash

module.exports = ProgramLoader

