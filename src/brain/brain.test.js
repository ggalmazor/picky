import Brain from './brain.js';
import RandomAcronyms from './acronyms/random-acronyms.js';
import { withDeterministicRandom } from '../../test/utils.js';
import { assertThat, equalTo } from 'hamjest';

describe('Brain', () => {
  describe('getDefinition', () => {
    it('returns the memorized definition for the provided acronym', () => {
      const subject = new Brain(new RandomAcronyms(), { ABC: ['Agile Bouncy Coyote'] });
      assertThat(subject.getDefinitions('ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it('gets a definition from the acronyms source if unknown and remembers it', () => {
      const subject = new Brain(new RandomAcronyms(), {});

      withDeterministicRandom(() => {
        assertThat(subject.getDefinitions('ABC'), equalTo(['Amazing Bubbly Cookie']));
        assertThat(subject.getDefinitions('ABC'), equalTo(['Amazing Bubbly Cookie']));
      });
    });
  });

  describe('learn', () => {
    it('memorizes the provided acronym definition', () => {
      const subject = new Brain(new RandomAcronyms(), {});

      subject.learn('ABC', 'Agile Bouncy Coyote');

      assertThat(subject.getDefinitions('ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it('prevents memorizing duplicates', () => {
      const subject = new Brain(new RandomAcronyms(), { ABC: ['Agile Bouncy Coyote'] });

      subject.learn('ABC', 'Agile Bouncy Coyote');

      assertThat(subject.getDefinitions('ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });

  describe('forget', () => {
    it('forgets the provided acronym definition', () => {
      const subject = new Brain(new RandomAcronyms(), { ABC: ['Agile Bouncy Coyote'] });

      subject.forget('ABC', 'Agile Bouncy Coyote');

      withDeterministicRandom(() => {
        assertThat(subject.getDefinitions('ABC'), equalTo(['Amazing Bubbly Cookie']));
      });
    });

    it('silently ignores unknown acronym definitions', () => {
      const subject = new Brain(new RandomAcronyms(), { ABC: ['Agile Bouncy Coyote'] });

      subject.forget('ABC', 'Some other definition');
      subject.forget('DEF', 'Some other definition');

      assertThat(subject.getDefinitions('ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });
});
