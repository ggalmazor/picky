import RandomAcronyms from './random-acronyms.js';
import { assertThat, equalTo } from 'hamjest';
import { deterministicRandom } from '../../../test/utils.js';

describe('RandomAcronyms', () => {
  let subject;

  beforeEach(() => {
    subject = new RandomAcronyms(deterministicRandom());
  });

  it('returns a definition for the provided acronym', () => {
    assertThat(subject.define('ABC'), equalTo('Artistic Bizarre Cricket'));
  });

  it('returns random definitions', () => {
    assertThat(subject.define('ABC'), equalTo('Artistic Bizarre Cricket'));
    assertThat(subject.define('ABC'), equalTo('Affable Brawny Carrot'));
    assertThat(subject.define('ABC'), equalTo('Affable Bohemian Clownfish'));
    assertThat(subject.define('ABC'), equalTo('Astonishing Bold Cloud'));
    assertThat(subject.define('ABC'), equalTo('Adaptable Blithesome Carrot'));
  });

  it('supports characters not between A-Z', () => {
    assertThat(subject.define('ÐĮØ'), equalTo('Harmonious Thriving Beach'));
  });
});
