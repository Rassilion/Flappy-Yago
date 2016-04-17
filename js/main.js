var preload= {
  preload: function() {//load assets
    game.load.image('yago', 'assets/yago.png');
    game.load.image('pipe', 'assets/pipe.png');
    game.load.audio('jump', 'assets/jump.wav');
  },
  create: function() {
    // If this is not a desktop (so it's a mobile device)
    if (game.device.desktop == false) {
      // Set the scaling mode to SHOW_ALL to show all the game
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // Set a minimum and maximum size for the game
      // Here the minimum is half the game size
      // And the maximum is the original game size
      game.scale.setMinMax(game.width/2, game.height/2,
        game.width, game.height);


      }
      // Center the game horizontally and vertically
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;

      this.state.start('mainMenu');
    }
  };

  var mainMenu = {
    create: function() {
      game.stage.backgroundColor = '#105AFF';
      var text =game.add.text(game.world.centerX,game.world.centerY, 'Start', {font:'50px Arial', fill: '#fff'});
      text.anchor.set(0.5);
      text.inputEnabled = true;
      text.events.onInputDown.add(this.start,this);
    },
    start: function(item) {
      this.state.start('mainState');
    },
  };

  var mainState = {
    create: function() {
      // Change the background color of the game to blue
      game.stage.backgroundColor = '#105AFF';

      this.jumpSound = game.add.audio('jump');
      // Set the physics system
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // Display the yago at the position x=100 and y=245
      this.yago = game.add.sprite(100, 245, 'yago');

      // Add physics to the yago
      // Needed for: movements, gravity, collisions, etc.
      game.physics.arcade.enable(this.yago);

      // Add gravity to the yago to make it fall
      this.yago.body.gravity.y = 1000;

      // Call the 'jump' function when the spacekey is hit
      var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      spaceKey.onDown.add(this.jump, this);

      // Call the 'jump' function when we tap/click on the screen
      game.input.onDown.add(this.jump, this);

      this.pipes = game.add.group();
      this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

      this.score = 0;
      this.labelScore = game.add.text(20, 20, "0",
      { font: "30px Arial", fill: "#ffffff" });
    },

    update: function() {
      // If the yago is out of the screen (too high or too low)
      // Call the 'restartGame' function
      if (this.yago.y < 0 || this.yago.y > 490)
      this.restartGame();

      game.physics.arcade.overlap(this.yago, this.pipes, this.hitPipe, null, this);

      //update angle to downwards
      if (this.yago.angle < 20)
      this.yago.angle += 1;
    },
    // Make the yago jump
    jump: function() {
      if (this.yago.alive == false)
      return;
      // Add a vertical velocity to the yago
      this.yago.body.velocity.y = -350;

      // Create an animation on the yago
      var animation = game.add.tween(this.yago);

      // Change the angle of the yago to -20° in 100 milliseconds
      animation.to({angle: -20}, 100);
      this.jumpSound.play();
      // And start the animation
      animation.start();

    },

    // Restart the game
    restartGame: function() {
      game.time.events.remove(this.timer);
      if(this.score>best)
      best=this.score;
      var text=game.add.text(game.world.centerX, game.world.centerY, "Game Over\nBest: "+best+"\nRestart",{ font: "50px Arial", fill: "#ffffff" });
      text.anchor.set(0.5);
      text.inputEnabled = true;
      text.events.onInputDown.add(function(item){game.state.start('mainState');},this);

    },
    addOnePipe: function(x, y) {
      // Create a pipe at the position x and y
      var pipe = game.add.sprite(x, y, 'pipe');

      // Add the pipe to our previously created group
      this.pipes.add(pipe);

      // Enable physics on the pipe
      game.physics.arcade.enable(pipe);

      // Add velocity to the pipe to make it move left
      pipe.body.velocity.x = -200;

      // Automatically kill the pipe when it's no longer visible
      pipe.checkWorldBounds = true;
      pipe.outOfBoundsKill = true;
    },
    addRowOfPipes: function() {
      // Randomly pick a number between 1 and 8
      // This will be the hole position
      var hole = Math.floor(Math.random() * 7) + 1;

      // Add the 6 pipes
      // With one big hole at position 'hole' and 'hole + 1'
      for (var i = 0; i < 10; i++)
      if (i != hole && i != hole + 1&& i != hole + 2)
      this.addOnePipe(400, i * 50);

      this.score += 1;
      this.labelScore.text = this.score;
    },
    hitPipe: function() {
      // If the yago has already hit a pipe, do nothing
      // It means the yago is already falling off the screen
      if (this.yago.alive == false)
      return;

      // Set the alive property of the yago to false
      this.yago.alive = false;

      // Prevent new pipes from appearing
      game.time.events.remove(this.timer);

      // Go through all the pipes, and stop their movement
      this.pipes.forEach(function(p){
        p.body.velocity.x = 0;
      }, this);
    },
  };

  // Initialize Phaser, and create a 400px by 490px game
  var game = new Phaser.Game(400, 490);
  best=0;
  // Add states
  game.state.add('preload', preload);
  game.state.add('mainMenu', mainMenu);
  game.state.add('mainState', mainState);

  game.state.start('preload');
