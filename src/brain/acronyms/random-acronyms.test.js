import RandomAcronyms from './random-acronyms.js';
import { assertThat, equalTo } from 'hamjest';
import { withDeterministicRandom } from '../../../test/utils.js';

describe('RandomAcronyms', () => {
  const subject = new RandomAcronyms();

  it('returns a definition for the provided acronym', () => {
    withDeterministicRandom(() => {
      assertThat(subject.define('ABC'), equalTo('Amazing Bubbly Cookie'));
    });
  });

  it('returns random definitions', () => {
    withDeterministicRandom(() => {
      assertThat(subject.define('ABC'), equalTo('Amazing Bubbly Cookie'));
      assertThat(subject.define('ABC'), equalTo('Affectionate Brainy Cupcake'));
      assertThat(subject.define('ABC'), equalTo('Adaptable Bodacious Cocktail'));
      assertThat(subject.define('ABC'), equalTo('Altruistic Brilliant Carrot'));
      assertThat(subject.define('ABC'), equalTo('Agile Bouncy Coyote'));
    });
  });

  it('supports characters not between A-Z', () => {
    withDeterministicRandom(() => {
      assertThat(subject.define('ÐĮØ'), equalTo('Alluring Buoyant Cupcake'));
    });
  });
});
