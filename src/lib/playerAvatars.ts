import gerardAvatar from '@/assets/avatars/gerard.png';
import joelAvatar from '@/assets/avatars/joel.png';
import kockumAvatar from '@/assets/avatars/kockum.png';
import ludvigAvatar from '@/assets/avatars/ludvig.png';
import hampusAvatar from '@/assets/avatars/hampus.png';
import viktorAvatar from '@/assets/avatars/viktor.png';
import fredrikAvatar from '@/assets/avatars/fredrik.png';

const PLAYER_AVATARS: Record<string, string> = {
  Gerard: gerardAvatar,
  Joel: joelAvatar,
  Kockum: kockumAvatar,
  Ludvig: ludvigAvatar,
  Hampus: hampusAvatar,
  Viktor: viktorAvatar,
  Fredrik: fredrikAvatar,
};

export function getPlayerAvatar(name: string): string | null {
  return PLAYER_AVATARS[name] ?? null;
}
