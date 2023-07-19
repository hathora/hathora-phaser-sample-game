import { Scene, GameObjects, Input, Math as pMath } from 'phaser';
// @ts-ignore
import { HathoraConnection } from 'hathora-phaser';
import { Food, GameState, Player } from '../../../common/types';
import { InterpolationBuffer } from 'interpolation-buffer';

export class GameScene extends Scene {
  private connection!: HathoraConnection;
  private players: GameObjects.Container[] = [];
  private food: GameObjects.Sprite[] = [];
  private stateBuffer!: InterpolationBuffer<GameState>;

  constructor() {
    super('scene-game');
  }

  init({ connection }: { connection: HathoraConnection }) {
    this.connection = connection;
  }

  create() {
    const {width, height} = this.game.scale;

    this.sound.play('st-theme', { loop: true });
    
    if (this.connection) {
      this.add.text(
        width / 2,
        20,
        'Get the food!',
        {
          color: '#000',
          fontFamily: 'monospace',
          align: 'right',
          fontSize: '22px'
        }
      ).setOrigin(0.5, 0).setDepth(100);

      this.connection.onMessageJson((msg: any) => {
        if (msg.event === 'UPDATE') {
          if (this.stateBuffer === undefined) {
            this.stateBuffer = new InterpolationBuffer(msg.game, 50, lerp);
          }
          else {
            this.stateBuffer.enqueue(msg.game, [], msg.ts);
          }
        }
      });

      const keys = this.input.keyboard!.addKeys("W,S,A,D") as {
        W: Input.Keyboard.Key;
        S: Input.Keyboard.Key;
        A: Input.Keyboard.Key;
        D: Input.Keyboard.Key;
      };
      let prevDirection = {
        x: 0,
        y: 0
      };

      const keyboardHandler = () => {
        let direction = {
          x: 0,
          y: 0
        };
  
        if (keys.W.isDown) {
          direction.y -= 1;
        }
        if (keys.S.isDown) {
          direction.y += 1;
        }
        if (keys.A.isDown) {
          direction.x -= 1;
        }
        if (keys.D.isDown) {
          direction.x += 1;
        }
  
        if (prevDirection.x !== direction.x || prevDirection.y !== direction.y) {
          // If connection is open and direction has changed, send updated direction
          prevDirection = direction;
          this.connection.writeJson({ event: 'PLAYER_MOVE', direction });
        }
      };

      this.input.keyboard.addListener('keydown', keyboardHandler);
      this.input.keyboard.addListener('keyup', keyboardHandler);

      this.add.image(0, 0, 'bg').setOrigin(0, 0);
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

  update() {
    if (this.stateBuffer === undefined) {
      return;
    }

    const { state } = this.stateBuffer.getInterpolatedState(Date.now());

    state.players.forEach((player: Player) => {
      let container = this.players.find((p) => p.getData('serverId') === player.id);

      if (!container) {
        const sprite = this.add.sprite(0, 0, `${player.avatar}-idle`);

        sprite.play({
          key: `${player.avatar}-idle`,
          repeat: -1
        }, true);

        const scoreTag = this.add.text(0, 25, '0', {
          color: '#FFF',
          backgroundColor: '#000',
          padding: {
            x: 5,
            y: 2
          },
          fontSize: '12px'
        });
        scoreTag.setOrigin(0.5);
        
        container = this.add.container(player.position.x, player.position.y, [
          sprite,
          scoreTag
        ]);
        container.setData('serverId', player.id);
        container.setData('avatar', player.avatar);
        container.setData('sprite', sprite);
        container.setData('scoreTag', scoreTag);
        this.players.push(container);
      }
      else {
        const serverPlayer = state.players.find((sp: Player) => sp.id === container!.getData('serverId'));
        const avatar = container.getData('avatar');

        if (!serverPlayer) return;

        const sprite = container.getData('sprite');
        const scoreTag = container.getData('scoreTag');

        container.setPosition(player.position.x, player.position.y);
        sprite.setFlipX(serverPlayer.isFlipped);
        container.setDepth(container.y);
        scoreTag.setText(`${serverPlayer.food}`);

        if (serverPlayer.isMoving) {
          if (sprite.texture.key !== `${avatar}-run`) {
            sprite.setTexture(`${avatar}-run`);
          }

          sprite.play({
            key: `${avatar}-run`,
            repeat: -1
          }, true);
        }
        else {
          if (sprite.texture.key !== `${avatar}-idle`) {
            sprite.setTexture(`${avatar}-idle`);
          }

          sprite.play({
            key: `${avatar}-idle`,
            repeat: -1
          }, true);
        }
      }
    });

    state.food.forEach((food: Food) => {
      let sprite = this.food.find((f) => f.getData('serverId') === food.id);

      if (!sprite) {
        sprite = this.add.sprite(food.position.x, food.position.y, food.type);
        sprite.setData('serverId', food.id);

        this.food.push(sprite);
        this.sound.play('sfx-pop');
      }
    });

    this.food.forEach((food, i) => {
      const serverId = food.getData('serverId');

      if (!state.food.find((f) => f.id === serverId)) {
        const si = pMath.Between(1, 5);
        
        food.destroy();
        this.food.splice(i, 1);
        this.sound.play(`sfx-eat${si}`);
      }
    });
  }
}

function lerp(from: GameState, to: GameState, pctElapsed: number) {
  return {
    ...to,
    players: to.players.map((toPlayer) => {
      const fromPlayer = from.players.find((p) => p.id === toPlayer.id);
      return fromPlayer !== undefined ? lerpPlayer(fromPlayer, toPlayer, pctElapsed) : toPlayer;
    })
  }
}

function lerpPlayer(from: Player, to: Player, pctElapsed: number): Player {
  return {
    ...to,
    position: {
      x: from.position.x + (to.position.x - from.position.x) * pctElapsed,
      y: from.position.y + (to.position.y - from.position.y) * pctElapsed,
    }
  };
}