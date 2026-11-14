import * as migration_20261109_190403_initial from './20261109_190403_initial';
import * as migration_20261113_153026_welcome_stage from './20261113_153026_welcome_stage';
import * as migration_20261113_161712_licences from './20261113_161712_licences';
import * as migration_20261114_155025_licence_certificate from './20261114_155025_licence_certificate';
import * as migration_20261114_162634_journeys_copy from './20261114_162634_journeys_copy';
import * as migration_20261114_170259_booking_engine from './20261114_170259_booking_engine';
import * as migration_20261114_182516_seo_controls from './20261114_182516_seo_controls';

export const migrations = [
  {
    up: migration_20261109_190403_initial.up,
    down: migration_20261109_190403_initial.down,
    name: '20261109_190403_initial',
  },
  {
    up: migration_20261113_153026_welcome_stage.up,
    down: migration_20261113_153026_welcome_stage.down,
    name: '20261113_153026_welcome_stage',
  },
  {
    up: migration_20261113_161712_licences.up,
    down: migration_20261113_161712_licences.down,
    name: '20261113_161712_licences',
  },
  {
    up: migration_20261114_155025_licence_certificate.up,
    down: migration_20261114_155025_licence_certificate.down,
    name: '20261114_155025_licence_certificate',
  },
  {
    up: migration_20261114_162634_journeys_copy.up,
    down: migration_20261114_162634_journeys_copy.down,
    name: '20261114_162634_journeys_copy',
  },
  {
    up: migration_20261114_170259_booking_engine.up,
    down: migration_20261114_170259_booking_engine.down,
    name: '20261114_170259_booking_engine',
  },
  {
    up: migration_20261114_182516_seo_controls.up,
    down: migration_20261114_182516_seo_controls.down,
    name: '20261114_182516_seo_controls'
  },
];
