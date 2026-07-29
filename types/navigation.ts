export type AppSection =
  | 'cards'
  | 'matches'
  | 'rankings';

export const APP_SECTION_HASHES: Record<
  AppSection,
  string
> = {
  cards: '#cards',
  matches: '#matches',
  rankings: '#rankings',
};

export function getSectionFromHash(
  hash: string
): AppSection | null {
  const normalizedHash = hash.toLowerCase();

  const entry = Object.entries(
    APP_SECTION_HASHES
  ).find(
    ([, sectionHash]) =>
      sectionHash === normalizedHash
  );

  return (entry?.[0] as AppSection | undefined) ??
    null;
}
