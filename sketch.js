let bug;
let score = 0;
let speed = 1;
let timeRemaining = 30;
let gameOver = false;
let gameFont;
let bugSheet;
let animationFrames = [];
let deathFrame;
let bugs = [];
let bugCount = 0;
let facingLeft;
let spriteWidth;
let animationLength;
let currentFrame;
let spawnDelay = 0;

let port, writer, reader, connected;
let poten;

//loads sprite sheet and font
function preload() {
  bugSheet = loadImage("assets/bugs.png");
  gameFont = loadFont("assets/PressStart2P-Regular.ttf");
}

//extracts each animation frame
function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 4; i++) {
    let frame = bugSheet.get(32*i, 0, 32, 20);
    animationFrames.push(frame);
  }
  deathFrame = (bugSheet.get(32*4, 0, 32, 20));
  textFont(gameFont);

  //button to connect to port
  if ("serial" in navigator) {
    connectButton = createButton("Connect");
    connectButton.position(20, 80);
    connectButton.mousePressed(connect);
  }
}

//runs game
function draw() {
  background(color('white'));

  //if not connected to the arduino, break
  if (!connected) return;

  if (gameOver) {
    gameDone();
  } else {
    //read arduino stream
    readData();

    //draw crosshair
    fill(0);
    ellipse(width/2, poten, 20, 20);
    
    textSize(16);
    text("Score: " + score, 20, 20);
    text("Time: " + ceil(timeRemaining), width-150,20);
  
    timeRemaining -= deltaTime / 1000;
    if (timeRemaining < 0 ) {
      gameOver = true;
    } else {
      for (let bug of bugs) {
        bug.calculateWalk();
        bug.walk();
      }
    }

    //spawns rounds of bugs
    if (round(timeRemaining) % 3.5 == 0 && !spawnDelay) {
      bugs[bugCount] = new Bug(animationFrames, animationFrames.length, deathFrame, speed, Math.round(Math.random()), Math.round(Math.random() * windowHeight));
      bugs[bugCount].calculateWalk();
      bugCount++;
      spawnDelay = 1;
    } else {
      spawnDelay = 0;
    }
  }

}

//connects arduino and js
async function connect() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  writer = port.writable.getWriter();
  connected = 1;
}

//game is finished
function gameDone() {
  text("Time's Up!", 100, 100);
  text("Score " + score, 100, 150);
}

//check if a click hit
function buttonPressed() {
  if (!gameOver) {
    for (let bug of bugs) {
      bug.isBugDead();
    }
  }
}

async function readData() {
  //while we can read the port's stream
  while (port.readable) {
    //obtain a reader
    const reader = port.readable.getReader();
    try {
      while (true) {
        //read incoming data
        const { value, done } = await reader.read();
        if (done) {
          // |reader| has been canceled.
          break;
        }
        //split button and poten readings
        let val = String(value).split(',');

        //if button was pressed, check for kills
        if (val[1]) {
          buttonPressed();
        }

        //move crosshair/cursor on the y axis
        poten = map(float(val[0]), 0, 1023, 0, height, 1);

      }
    } catch (error) {
      console.error(err);
    } finally {
      reader.releaseLock();
    }
  }  
}

//bug
class Bug {
  constructor(animationFrames, animationLength, death, speed, facingLeft, y) {
    this.animationFrames = animationFrames;
    this.animationLength = animationLength;
    this.deathFrame = death;
    this.facingLeft = facingLeft;
    this.heightSpawn = Math.floor(Math.random() * (windowHeight+20));
    this.spriteWidth = animationFrames[0].width;
    this.currentFrame = 0;
    this.x = 0;
    this.y = y;
    this.bugDead = false;

    if (this.facingLeft) {
      this.x = -width-this.spriteWidth;
    } else {
      this.x = -this.spriteWidth;
    }
  }

  //moves the bug across the screen
  walk() {
    push();
    if (this.facingLeft) {
      scale(-1, 1);
    } else if (!this.facingLeft) {
      scale(1,1);
    }

    if (!this.bugDead && !gameOver) {
      let u = floor(this.currentFrame) % this.animationLength;
      image(this.animationFrames[u], this.x, this.y);
    } else if (this.bugDead) {
      image(this.deathFrame, this.x, this.y);
    }
    pop();

    if(frameCount % 4 == 0 ) {
      this.currentFrame++;
    }
  }

  //increases bug position
  calculateWalk() {
    if (!this.bugDead && !gameOver) {
      this.x += 1 * speed;
    }
  }

  //check if bug has died
  isBugDead() {
     if (!this.facingLeft && !this.bugDead && mouseX > this.x && mouseX < this.x + this.spriteWidth && 
          mouseY > this.y && mouseY < this.y + 20) {
        this.bugDead = true;
        score++;
        speed += 1.00005;
        writer.write(stringToArrayBuffer("1"));
    } else if (this.facingLeft && !this.bugDead && mouseX < abs(this.x) && mouseX > this.x - this.spriteWidth && 
               mouseY > this.y && mouseY < this.y + 20) {
        this.bugDead = true;
        score++;
        speed += 1.00005;
        writer.write(stringToArrayBuffer("1"));
      }

  }

}
