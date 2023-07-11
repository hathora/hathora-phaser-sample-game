import './style.css'
import { Scene, Game, WEBGL, Scale } from 'phaser';
// @ts-ignore
import { HathoraPhaser, HathoraConnection } from 'hathora-phaser';

class TitleScene extends Scene {
  constructor() {
    super('scene-title');
  }

  async create() {
    this.HathoraPhaser.initialize(
      'app-1288369e-9df0-4432-9439-9e0b59023f07',
      (connection: HathoraConnection) => {
        this.scene.start('scene-game', {
          connection
        });
      },
      (error: any) => {
        console.warn(error);
      },
      true,
      'private'
    );

    // this.add.haVisibilityToggle(1280 / 2, 64);

    this.add.haRegionSelect(1280 / 2, 128);

    this.add.haCreateGameButton(1280 / 2, 192);
    
    this.add.haJoinPrivateInput(1280 / 2, 256);

    this.add.haJoinPublicList(1280 / 2, 455, 300, 280);
  }
}

class GameScene extends Scene {
  private connection!: HathoraConnection;

  constructor() {
    super('scene-game');
  }

  init({ connection }: { connection: HathoraConnection }) {
    this.connection = connection;
  }

  create() {
    const {width, height} = this.game.scale;
    
    if (this.connection) {
      this.add.text(
        width - 20,
        height / 2,
        'Click to get points!\nFirst to 100 wins!',
        {
          color: '#999',
          fontFamily: 'monospace',
          align: 'right',
          fontSize: '22px'
        }
      ).setOrigin(1, 0.5);

      const scoreboard = this.add.text(
        20,
        height / 2,
        '',
        {
          color: '#FFF',
          fontFamily: 'monospace',
          align: 'left',
          fontSize: '26px'
        }
      ).setOrigin(0, 0.5);

      this.connection.onMessageJson((msg: any) => {
        if (msg.event === 'UPDATE_SCORES') {
          const {players} = msg.data;
          const sorted = players.sort((a: any, b: any) => b.score - a.score);
          let scores = '';

          sorted.forEach(({id, score}: {id: string, score: number}) => {
            scores += `${id}: ${score}\n`;
          });

          scoreboard.setText(scores);
        }
      });

      this.input.on('pointerdown', () => {
        this.connection.writeJson({
          event: 'PLAYER_CLICK'
        });
      });
    }
    else {
      this.add.text(
        width / 2,
        height / 2,
        'Something went terribly wrong...',
        {
          color: 'red',
          fontFamily: 'monospace'
        }
      ).setOrigin(0.5, 0.5);
    }
  }
}

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
