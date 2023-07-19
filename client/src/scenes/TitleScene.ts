import { Scene } from 'phaser';
// @ts-ignore
import { HathoraConnection } from 'hathora-phaser';

export class TitleScene extends Scene {
  constructor() {
    super('scene-title');
  }

  async create() {
    // @ts-ignore
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
      true
    );

    const padding = 20;

    // @ts-ignore
    this.add.haVisibilityToggle(padding + 175, 430);

    // @ts-ignore
    this.add.haCreateGameButton(padding + 175, 500).setScale(2);

    // @ts-ignore
    this.add.haRegionSelect(padding, 720 - padding).setOrigin(0, 1);

    // @ts-ignore
    this.add.haJoinPublicList(1280 - padding, padding, 400, 720 - 37.92 - (padding * 3)).setOrigin(1, 0);

    // @ts-ignore
    this.add.haJoinPrivateInput(1280 - padding, 720 - padding, 'Join Private Game', 400).setOrigin(1, 1);

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-1);

    this.add.image(padding, padding, 'logo').setOrigin(0, 0);
  }
}