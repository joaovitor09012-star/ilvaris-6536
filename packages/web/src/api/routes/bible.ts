import { base } from "../__core/app";
import { BIBLE, BIBLE_INTRO, BIBLE_WORDS } from "../world/bible";

/**
 * The World Bible — read-only, out-of-world. This is world truth for the person playing,
 * not for anyone living in Ilvaris: nothing here is ever passed to an NPC.
 */
export const bible = {
  get: base.handler(() => ({ intro: BIBLE_INTRO, sections: BIBLE, words: BIBLE_WORDS })),
};
