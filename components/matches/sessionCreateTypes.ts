import type { FutsalParticipantRole, FutsalTeamColor } from '@/types';

export interface TeamDraft {
  clientId: string;
  name: string;
  color: FutsalTeamColor;
}

export interface GuestDraft {
  clientId: string;
  name: string;
  role: FutsalParticipantRole;
}

export type TeamAssignments = Record<string, string>;
export type ParticipantRoles = Record<string, FutsalParticipantRole>;

export function playerKey(playerId: string): string {
  return `player:${playerId}`;
}

export function guestKey(guestId: string): string {
  return `guest:${guestId}`;
}
