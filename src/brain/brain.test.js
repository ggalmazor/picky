import Brain from './brain.js';
import RandomAcronyms from './acronyms/random-acronyms.js';
import {assertThat, equalTo, is} from 'hamjest';
import VolatileMemory from './memory/volatile-memory.js';
import {deterministicRandom} from '../../test/utils.js';

describe('Brain', () => {
  describe('getDefinition', () => {
    it('returns the memorized definition for the provided acronym', async () => {
      const subject = new Brain(
        new RandomAcronyms(deterministicRandom()),
        new VolatileMemory({ABC: ['Agile Bouncy Coyote']}),
      );
      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it('gets a definition from the acronyms source if unknown and remembers it', async () => {
      const subject = new Brain(new RandomAcronyms(deterministicRandom()), new VolatileMemory({}));

      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Artistic Bizarre Cricket']));
      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Artistic Bizarre Cricket']));
    });
  });

  describe('learn', () => {
    it('memorizes the provided acronym definition', async () => {
      const subject = new Brain(new RandomAcronyms(), new VolatileMemory({}));

      await subject.learn({}, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it('prevents memorizing duplicates', async () => {
      const subject = new Brain(new RandomAcronyms(), new VolatileMemory({ABC: ['Agile Bouncy Coyote']}));

      await subject.learn({}, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });

  describe('forget', () => {
    it('forgets the provided acronym definition', async () => {
      const subject = new Brain(
        new RandomAcronyms(deterministicRandom()),
        new VolatileMemory({ABC: ['Agile Bouncy Coyote']}),
      );

      await subject.forget({}, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Artistic Bizarre Cricket']));
    });

    it('silently ignores unknown acronym definitions', async () => {
      const subject = new Brain(new RandomAcronyms(), new VolatileMemory({ABC: ['Agile Bouncy Coyote']}));

      await subject.forget({}, 'ABC', 'Some other definition');
      await subject.forget({}, 'DEF', 'Some other definition');

      assertThat(await subject.getDefinitions({}, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });

  describe('list', () => {
    let subject;

    beforeEach(() => {
      subject = new Brain(
        new RandomAcronyms(deterministicRandom()),
        new VolatileMemory({ABC: ['Agile Bouncy Coyote'], DEF: ['Definitely Expensive Flute']}),
      );
    });

    it('lists known acronyms', async () => {
      const list = await subject.list({});

      assertThat(list, equalTo({ABC: ['Agile Bouncy Coyote'], DEF: ['Definitely Expensive Flute']}));
    });

    it('passes through the `ignored` param if provided', async () => {
      await subject.ignore({}, 'ABC');

      assertThat(await subject.list({}, true), equalTo({ABC: ['Agile Bouncy Coyote']}));
      assertThat(await subject.list({}, false), equalTo({DEF: ['Definitely Expensive Flute']}));
    });
  });

  describe('ignore, isIgnored & stopIgnoring', () => {
    it('returns a boolean telling if the acronym is ignored', async () => {
      const subject = new Brain(
        new RandomAcronyms(deterministicRandom()),
        new VolatileMemory(),
      );

      await subject.ignore({}, 'ABC');

      assertThat(await subject.isIgnored({}, 'ABC'), is(true));
      assertThat(await subject.isIgnored({}, 'DEF'), is(false));

      await subject.stopIgnoring({}, 'ABC');

      assertThat(await subject.isIgnored({}, 'ABC'), is(false));
    });
  });
});
