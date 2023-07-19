import './style.css'
import { Game, WEBGL, Scale } from 'phaser';
// @ts-ignore
import { HathoraPhaser } from 'hathora-phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

const config = {
  type: WEBGL,
  scale: {
    width: 1280,
    height: 720,
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH
  },
  parent: 'game',
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true
    }
  },
  scene: [
    BootScene,
    TitleScene,
    GameScene
  ],
  plugins: {
    scene: [
      {
        key: 'HathoraPhaser',
        mapping: 'HathoraPhaser',
        plugin: HathoraPhaser,
        start: true
      }
    ]
  }
}

new Game(config);
