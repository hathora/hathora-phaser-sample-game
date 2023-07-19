import { Scene } from "phaser";

export class BootScene extends Scene {
  constructor() {
    super('scene-load');
  }
  
  preload() {
    this.load.image('bg', 'bg.png');

    this.load.image('logo', 'logo.png');

    this.load.spritesheet('snail-idle', 'sprites/Snail/idle.png', { frameWidth: 38, frameHeight: 24 });
    this.load.spritesheet('snail-run', 'sprites/Snail/run.png', { frameWidth: 38, frameHeight: 24 });

    this.load.spritesheet('chicken-idle', 'sprites/Chicken/idle.png', { frameWidth: 32, frameHeight: 34 });
    this.load.spritesheet('chicken-run', 'sprites/Chicken/run.png', { frameWidth: 32, frameHeight: 34 });

    this.load.spritesheet('mushroom-idle', 'sprites/Mushroom/idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mushroom-run', 'sprites/Mushroom/run.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('rhino-idle', 'sprites/Rhino/idle.png', { frameWidth: 52, frameHeight: 34 });
    this.load.spritesheet('rhino-run', 'sprites/Rhino/run.png', { frameWidth: 52, frameHeight: 34 });

    this.load.spritesheet('trunk-idle', 'sprites/Trunk/idle.png', { frameWidth: 64, frameHeight: 32 });
    this.load.spritesheet('trunk-run', 'sprites/Trunk/run.png', { frameWidth: 64, frameHeight: 32 });

    this.load.image('chicken', 'food/chicken.png');
    this.load.image('sandwich', 'food/sandwich.png');
    this.load.image('waffle', 'food/waffle.png');
    this.load.image('taco', 'food/taco.png');
    this.load.image('cake', 'food/cake.png');
    this.load.image('ramen', 'food/ramen.png');
    this.load.image('hotdog', 'food/hotdog.png');
    this.load.image('burger', 'food/burger.png');

    this.load.audio('sfx-pop', 'sfx/pop.mp3');
    this.load.audio('sfx-eat1', 'sfx/eat1.mp3');
    this.load.audio('sfx-eat2', 'sfx/eat2.mp3');
    this.load.audio('sfx-eat3', 'sfx/eat3.mp3');
    this.load.audio('sfx-eat4', 'sfx/eat4.mp3');
    this.load.audio('sfx-eat5', 'sfx/eat5.mp3');

    this.load.audio('st-theme', 'theme.mp3');
  }
  
  create() {
    this.anims.create({
      key: 'snail-idle',
      frames: this.anims.generateFrameNumbers('snail-idle', {
        start: 0,
        end: 14
      }),
      frameRate: 12
    });
    this.anims.create({
      key: 'snail-run',
      frames: this.anims.generateFrameNumbers('snail-run', {
        start: 0,
        end: 9
      }),
      frameRate: 12
    });

    this.anims.create({
      key: 'chicken-idle',
      frames: this.anims.generateFrameNumbers('chicken-idle', {
        start: 0,
        end: 12
      }),
      frameRate: 12
    });
    this.anims.create({
      key: 'chicken-run',
      frames: this.anims.generateFrameNumbers('chicken-run', {
        start: 0,
        end: 13
      }),
      frameRate: 12
    });

    this.anims.create({
      key: 'mushroom-idle',
      frames: this.anims.generateFrameNumbers('mushroom-idle', {
        start: 0,
        end: 13
      }),
      frameRate: 12
    });
    this.anims.create({
      key: 'mushroom-run',
      frames: this.anims.generateFrameNumbers('mushroom-run', {
        start: 0,
        end: 15
      }),
      frameRate: 12
    });

    this.anims.create({
      key: 'rhino-idle',
      frames: this.anims.generateFrameNumbers('rhino-idle', {
        start: 0,
        end: 10
      }),
      frameRate: 12
    });
    this.anims.create({
      key: 'rhino-run',
      frames: this.anims.generateFrameNumbers('rhino-run', {
        start: 0,
        end: 5
      }),
      frameRate: 12
    });

    this.anims.create({
      key: 'trunk-idle',
      frames: this.anims.generateFrameNumbers('trunk-idle', {
        start: 0,
        end: 17
      }),
      frameRate: 12
    });
    this.anims.create({
      key: 'trunk-run',
      frames: this.anims.generateFrameNumbers('trunk-run', {
        start: 0,
        end: 13
      }),
      frameRate: 12
    });
    
    this.scene.start('scene-title');
  }
}