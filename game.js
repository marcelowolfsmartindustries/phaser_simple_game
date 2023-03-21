var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var textoVidas;
var textoPontos;
var textoNivel;
var textoGameOver;
var vidas = 3;
var pontos = 0;
var cursors;
var speed = 5;


var player;
var score = 0;
var lives = 3;
var livesText;
var gameOver = false;
var objects;
var level = 1;
var objectsSpeed = 100;
var objectsTimer;
var objectsCounter = 0;

var mKey, nKey;


function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('redObject', 'assets/vermelho.png');
    this.load.image('blueObject', 'assets/azul.png');
}

function create() {
    // Player
    player = this.physics.add.sprite(400, 550, 'player');
    player.setCollideWorldBounds(true);

    //texts
    textoVidas = this.add.text(16, 16, 'Vidas: ' + vidas, { fontSize: '32px', fill: '#fff' });
    textoPontos = this.add.text(game.config.width / 2 - 100, 16, 'Pontos: ' + pontos, { fontSize: '32px', fill: '#fff' });
    textoNivel = this.add.text(600, 16, 'Nível: ' + level, { fontSize: '32px', fill: '#fff' });
    textoGameOver = this.add.text(200, 250, 'GAME OVAR!', { fontSize: '64px', fill: '#fff' });
    textoGameOver.visible = false;

    cursors = this.input.keyboard.createCursorKeys();
    mKey = this.input.keyboard.addKey('M');
    nKey = this.input.keyboard.addKey('N');

    // Add objects group
    objects = this.physics.add.group();

    // Start objects timer
    objectsTimer = this.time.addEvent({
        delay: 1000 / level,
        callback: dropObjects,
        callbackScope: this,
        loop: true
    });
}


function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        var duration = cursors.left.getDuration();
        player.x -= speed + (duration / 100);
        if (player.x < player.width / 2) {
            player.x = player.width / 2;
        }
    } else if (cursors.right.isDown) {
        var duration = cursors.right.getDuration();
        player.x += speed + (duration / 100);
        if (player.x > game.config.width - player.width / 2) {
            player.x = game.config.width - player.width / 2;
        }
    }

    if (mKey.isDown) {
        lives = 100;
        textoVidas.setText('Lives: ' + lives);
    }

    // Check for collision between player and objects
    this.physics.add.overlap(player, objects, collectObject, null, this);
}

dropObjects = () => {
    if (level > 10) {
        gameOver = true;
        //this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        textoGameOver.visible = true;
        return;
    }

    for (var i = 0; i < level; i++) {
        var randomX = Phaser.Math.Between(50, 750);
        var objectType = Phaser.Math.Between(1, 2);
        var object;

        if (objectType == 1) {
            object = objects.create(randomX, -50, 'blueObject');
        } else {
            object = objects.create(randomX, -50, 'redObject');
        }

        // Set object properties
        object.setScale(0.5);
        object.setGravityY(200);
        object.body.velocity.y = objectsSpeed * (level / 2);

        objectsCounter++;

        // Increase level every 10 objects
        if (objectsCounter % 10 * level == 0) {
            level++;
            objectsSpeed += 50;
            textoNivel.setText('Level: ' + level);
            dropObjects();
        }

        // Schedule next object drop
        if (objectsCounter < 10) {
            objectsTimer.delay = Phaser.Math.Between(500, 1000);
            objectsTimer.paused = false;
        } else {
            objectsCounter = 0;
            objectsTimer.paused = true;
        }
    }
}

function collectObject(player, object) {
    if (object.texture.key === 'blueObject') {
        score++;
        textoPontos.setText('Score: ' + score);
    } else {
        lives--;
        textoVidas.setText('Lives: ' + lives);

        if (lives === 0) {
            // Game over
            gameOver = true;
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            textoGameOver.visible = true;
        }
    }

    object.disableBody(true, true);
}