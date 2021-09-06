import Phaser from 'phaser';
import { useEffect } from 'react';

import { MainScene } from '../scenes/main';

const GAME_WIDTH = 1000;

export default function Game() {
  useEffect(() => {
    const engine = new Phaser.Game({
      parent: 'root',
      backgroundColor: '#000000',
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.NONE,
        width: GAME_WIDTH,
        height: GAME_WIDTH, // temporary value
      },
      scene: [MainScene],
    });

    const resize = () => {
      if (engine) {
        const root = document.getElementById('root') as HTMLDivElement;
        const width = GAME_WIDTH;
        const height = (GAME_WIDTH / root.clientWidth) * root.clientHeight;
        engine.scale.resize(width, height);
      }
    };

    engine.events.once(Phaser.Core.Events.READY, () => {
      resize();
      window.addEventListener('resize', () => {
        resize();
      });
    });

    return () => {
      engine.destroy(true);
    };
  }, []);

  return null;
}
