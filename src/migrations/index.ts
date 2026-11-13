import * as migration_20261109_190403_initial from './20261109_190403_initial';

export const migrations = [
  {
    up: migration_20261109_190403_initial.up,
    down: migration_20261109_190403_initial.down,
    name: '20261109_190403_initial'
  },
];
