import * as migration_20261109_190403_initial from './20261109_190403_initial';
import * as migration_20261113_153026_welcome_stage from './20261113_153026_welcome_stage';

export const migrations = [
  {
    up: migration_20261109_190403_initial.up,
    down: migration_20261109_190403_initial.down,
    name: '20261109_190403_initial',
  },
  {
    up: migration_20261113_153026_welcome_stage.up,
    down: migration_20261113_153026_welcome_stage.down,
    name: '20261113_153026_welcome_stage'
  },
];
