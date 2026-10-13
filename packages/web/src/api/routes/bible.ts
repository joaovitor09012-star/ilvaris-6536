import { base } from "../__core/app";
import { BIBLE, BIBLE_INTRO, BIBLE_WORDS } from "../world/bible";

/**
 * The World Bible — the player-facing, in-universe encyclopedia. Public and unauthenticated:
 * it carries only common learning (see world/bible.ts). Fates, director doctrine and NPC
 * secrets live in world/npcs.ts, agent/prompts.ts and the save state, and never pass here.
 */
export const bible = {
  get: base.handler(() => ({ intro: BIBLE_INTRO, sections: BIBLE, words: BIBLE_WORDS })),
};
