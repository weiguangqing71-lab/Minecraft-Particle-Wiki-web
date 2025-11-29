export type Lang = 'en' | 'zh';

export interface LocalizedString {
  en: string;
  zh: string;
}

export interface ParticleDef {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: 'common' | 'combat' | 'magic' | 'environment';
  example?: string;
  note?: LocalizedString;
  supportsColor?: boolean;
}

export interface PresetDef {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  command: string;
}

export interface CommandState {
  particle: string;
  x: string;
  y: string;
  z: string;
  dx: string;
  dy: string;
  dz: string;
  speed: string;
  count: string;
  mode: 'force' | 'normal';
}