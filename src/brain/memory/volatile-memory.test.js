import VolatileMemory from './volatile-memory.js';
import {assertThat, before, equalTo, is} from 'hamjest';

describe('Volatile memory', () => {
  let subject;

  beforeEach(() => {
    subject = new VolatileMemory({ ABC: ['Agile Bouncy Coyote'] });
  });

  describe('knows', () => {
    it("returns true when there's a memorized definition for the provided acronym", async () => {
      assertThat(await subject.knows({}, 'ABC'), is(true));
    });

    it('returns false otherwise', async () => {
      assertThat(await subject.knows({}, 'CDE'), is(false));
    });
  });

  describe('recall', () => {
    it('returns learned definitions for the provided acronym', async () => {
      assertThat(await subject.recall({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it("returns an empty list when providing an acronym that's not memorized", async () => {
      assertThat(await subject.recall({}, 'CDE'), equalTo([]));
    });
  });

  describe('learn', () => {
    it('learns new definitions for existing acronyms', async () => {
      await subject.learn({}, 'ABC', 'Another Banging Chaos');

      assertThat(await subject.recall({}, 'ABC'), equalTo(['Agile Bouncy Coyote', 'Another Banging Chaos']));
    });

    it('learns definitions for new acronyms', async () => {
      await subject.learn({}, 'DEF', 'Definitely Expensive Flute');

      assertThat(await subject.recall({}, 'DEF'), equalTo(['Definitely Expensive Flute']));
    });

    it('avoids learning duplicates', async () => {
      await subject.learn({}, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.recall({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });

  describe('forget', () => {
    beforeEach(() => {
      subject = new VolatileMemory({ ABC: ['Agile Bouncy Coyote', 'Another Banging Chaos'] });
    });

    it('forgets existing definitions', async () => {
      await subject.forget({}, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.recall({}, 'ABC'), equalTo(['Another Banging Chaos']));
    });

    it('forgets the acronym if no definition is provided', async () => {
      await subject.forget({}, 'ABC');

      assertThat(await subject.recall({}, 'ABC'), equalTo([]));
    });
  });

  describe('list', () => {
    beforeEach(() => {
      subject = new VolatileMemory({
        ABC: ['Agile Bouncy Coyote', "Another Banging Chaos"],
        DEF: ["Definitely Expensive Flute"],
      });
    });

    it('returns an object with all known acronyms and their definitions', async () => {
      const list = await subject.list({});

      assertThat(list, equalTo({
        ABC: ['Agile Bouncy Coyote', "Another Banging Chaos"],
        DEF: ["Definitely Expensive Flute"],
      }));
    });
  });
});
