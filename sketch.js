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
}

//runs game
function draw() {
  background(color('white'));

  if (gameOver) {
    gameDone();
  } else {
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

//game is finished
function gameDone() {
  text("Time's Up!", 100, 100);
  text("Score " + score, 100, 150);
}

//check if a click hit
function mouseClicked() {
  if (!gameOver) {
    for (let bug of bugs) {
      bug.isBugDead();
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
    } else if (this.facingLeft && !this.bugDead && mouseX < abs(this.x) && mouseX > this.x - this.spriteWidth && 
               mouseY > this.y && mouseY < this.y + 20) {
        this.bugDead = true;
        score++;
        speed += 1.00005;
      }

  }

}
