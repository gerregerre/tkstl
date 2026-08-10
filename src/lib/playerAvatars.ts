import gerardAvatar from '@/assets/avatars/gerard.png';
import joelAvatar from '@/assets/avatars/joel.png';
import kockumAvatar from '@/assets/avatars/kockum.png';
import ludvigAvatar from '@/assets/avatars/ludvig.png';
import hampusAvatar from '@/assets/avatars/hampus.png';
import viktorAvatar from '@/assets/avatars/viktor.png';

const PLAYER_AVATARS: Record<string, string> = {
  Gerard: gerardAvatar,
  Joel: joelAvatar,
  Kockum: kockumAvatar,
  Ludvig: ludvigAvatar,
  Hampus: hampusAvatar,
  Viktor: viktorAvatar,
};

import gerardCutout from '@/assets/avatars/cutout/gerard.png';
import joelCutout from '@/assets/avatars/cutout/joel.png';
import kockumCutout from '@/assets/avatars/cutout/kockum.png';
import ludvigCutout from '@/assets/avatars/cutout/ludvig.png';
import hampusCutout from '@/assets/avatars/cutout/hampus.png';
import viktorCutout from '@/assets/avatars/cutout/viktor.png';

// Transparent-background cutouts, used for layered/hero presentation
const PLAYER_CUTOUTS: Record<string, string> = {
  Gerard: gerardCutout,
  Joel: joelCutout,
  Kockum: kockumCutout,
  Ludvig: ludvigCutout,
  Hampus: hampusCutout,
  Viktor: viktorCutout,
};

export const PLAYER_ROSTER = Object.keys(PLAYER_AVATARS);

export function getPlayerAvatar(name: string): string | null {
  return PLAYER_AVATARS[name] ?? null;
}

export function getPlayerCutout(name: string): string | null {
  return PLAYER_CUTOUTS[name] ?? null;
}


