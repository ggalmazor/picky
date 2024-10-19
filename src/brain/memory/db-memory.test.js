import { v4 as uuid } from 'uuid';
import DbMemory, { buildSlackId } from './db-memory.js';
import { assertThat, equalTo, instanceOf, is, isRejectedWith, promiseThat } from 'hamjest';
import knex from 'knex';
import profiles from '../../../knexfile.js';
import { TeamNeedsSetUpError } from '../../errors/errors.js';
import VolatileMemory from './volatile-memory.js';

describe('Database memory', () => {
  let db;
  let context, slackTeam, slackEnterprise, teamId;
  let subject;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    slackTeam = { id: uuid(), name: 'Test team' };
    slackEnterprise = { id: uuid(), name: 'Test enterprise' };
    context = { teamId: slackTeam.id, enterpriseId: slackEnterprise.id };

    const enterpriseId = (
      await db('enterprises').returning('id').insert({
        slack_id: slackEnterprise.id,
        name: slackEnterprise.name,
      })
    )[0].id;
    teamId = (
      await db('teams')
        .returning('id')
        .insert({
          enterprise_id: enterpriseId,
          slack_id: buildSlackId(slackEnterprise.id, slackTeam.id),
          name: slackTeam.name,
        })
    )[0].id;

    subject = new DbMemory(db, teamId);
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe('knows', () => {
    beforeEach(async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC' }))[0].id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
    });

    it("returns true when there's a memorized definition for the provided acronym", async () => {
      assertThat(await subject.knows(context, 'ABC'), is(true));
    });

    it("returns true when there's a memory of the provided acronym and definition", async () => {
      assertThat(await subject.knows(context, 'ABC', 'Agile Bouncy Coyote'), is(true));
    });

    it('returns false otherwise', async () => {
      assertThat(await subject.knows(context, 'ABC', 'Another Banging Chaos'), is(false));
      assertThat(await subject.knows(context, 'CDE'), is(false));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(
        subject.knows({ teamId: 'unknown' }, 'ABC', 'Another Banging Chaos'),
        isRejectedWith(instanceOf(TeamNeedsSetUpError)),
      );
    });
  });

  describe('recall', () => {
    beforeEach(async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC' }))[0].id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
    });

    it('returns learned definitions for the provided acronym', async () => {
      assertThat(await subject.recall(context, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it("returns an empty list when providing an acronym that's not memorized", async () => {
      assertThat(await subject.recall(context, 'CDE'), equalTo([]));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(subject.recall({ teamId: 'unknown' }, 'ABC'), isRejectedWith(instanceOf(TeamNeedsSetUpError)));
    });
  });

  describe('learn', () => {
    beforeEach(async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC' }))[0].id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
    });

    it('learns new definitions for existing acronyms', async () => {
      await subject.learn(context, 'ABC', 'Another Banging Chaos');

      assertThat(await subject.recall(context, 'ABC'), equalTo(['Agile Bouncy Coyote', 'Another Banging Chaos']));
    });

    it('learns definitions for new acronyms', async () => {
      await subject.learn(context, 'DEF', 'Definitely Expensive Flute');

      assertThat(await subject.recall(context, 'DEF'), equalTo(['Definitely Expensive Flute']));
    });

    it('avoids learning duplicates', async () => {
      await subject.learn(context, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.recall(context, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(
        subject.learn({ teamId: 'unknown' }, 'ABC', 'Agile Bouncy Coyote'),
        isRejectedWith(instanceOf(TeamNeedsSetUpError)),
      );
    });
  });

  describe('forget', () => {
    let abc;

    beforeEach(async () => {
      abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC' }))[0].id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
      await db('definitions').insert({ acronym_id: abc, definition: 'Another Banging Chaos' });
    });

    it('deletes the row in `definitions` for the provided acronym and definition', async () => {
      await subject.forget(context, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.knows(context, 'ABC', 'Agile Bouncy Coyote'), is(false));
      assertThat(await subject.knows(context, 'ABC', 'Another Banging Chaos'), is(true));
    });

    it('deletes the row in `acronyms` if there are no more definitions', async () => {
      await subject.forget(context, 'ABC', 'Agile Bouncy Coyote');
      await subject.forget(context, 'ABC', 'Another Banging Chaos');

      const count = (await db('acronyms').count('id', { as: 'count' }).where({ id: abc }))[0].count;
      assertThat(count, is('0'));
    });

    it('deletes the acronym with all definitions if no definition is provided', async () => {
      await subject.forget(context, 'ABC');

      const definitionsCount = (await db('definitions').count('id', { as: 'count' }).where({ id: abc }))[0].count;
      assertThat(definitionsCount, is('0'));

      const count = (await db('acronyms').count('id', { as: 'count' }).where({ id: abc }))[0].count;
      assertThat(count, is('0'));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(
        subject.forget({ teamId: 'unknown' }, 'ABC', 'Agile Bouncy Coyote'),
        isRejectedWith(instanceOf(TeamNeedsSetUpError)),
      );
    });
  });

  describe('list', () => {
    it('returns an object with of all known acronyms and their definitions', async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC' }))[0].id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
      await db('definitions').insert({ acronym_id: abc, definition: 'Another Banging Chaos' });
      const def = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'DEF' }))[0].id;
      await db('definitions').insert({ acronym_id: def, definition: 'Definitely Expensive Flute' });

      const list = await subject.list(context);

      assertThat(
        list,
        equalTo({
          ABC: ['Agile Bouncy Coyote', 'Another Banging Chaos'],
          DEF: ['Definitely Expensive Flute'],
        }),
      );
    });

    it('returns an empty object if there are no acronyms', async () => {
      const list = await subject.list(context);

      assertThat(list, equalTo({}));
    });

    it('returns only ignored acronyms if providing the `ignored = true` param', async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC', ignored: false }))[0]
        .id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
      await db('definitions').insert({ acronym_id: abc, definition: 'Another Banging Chaos' });
      const def = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'DEF', ignored: true }))[0]
        .id;
      await db('definitions').insert({ acronym_id: def, definition: 'Definitely Expensive Flute' });

      const list = await subject.list(context, true);

      assertThat(
        list,
        equalTo({
          DEF: ['Definitely Expensive Flute'],
        }),
      );
    });

    it('returns only non-ignored acronyms if providing the `ignored = false` param', async () => {
      const abc = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'ABC', ignored: false }))[0]
        .id;
      await db('definitions').insert({ acronym_id: abc, definition: 'Agile Bouncy Coyote' });
      await db('definitions').insert({ acronym_id: abc, definition: 'Another Banging Chaos' });
      const def = (await db('acronyms').returning('id').insert({ team_id: teamId, acronym: 'DEF', ignored: true }))[0]
        .id;
      await db('definitions').insert({ acronym_id: def, definition: 'Definitely Expensive Flute' });

      const list = await subject.list(context, false);

      assertThat(
        list,
        equalTo({
          ABC: ['Agile Bouncy Coyote', 'Another Banging Chaos'],
        }),
      );
    });
  });

  describe('ignore', () => {
    it('sets the ignored flag to true on the provided acronym', async () => {
      await db('acronyms').insert({ team_id: teamId, acronym: 'ABC', ignored: false });

      await subject.ignore(context, 'ABC');

      const isIgnored = (await db('acronyms').select('ignored').where('acronym', 'ABC').first()).ignored;
      assertThat(isIgnored, is(true));
    });

    it("creates an acronym row to remember the preference if the acronym doesn't exist", async () => {
      await subject.ignore(context, 'ABC');

      const isIgnored = (await db('acronyms').select('ignored').where('acronym', 'ABC').first()).ignored;
      assertThat(isIgnored, is(true));
    });
  });

  describe('isIgnored', () => {
    it('returns the value of the `ignored` column in the acronym row', async () => {
      await db('acronyms').insert({ team_id: teamId, acronym: 'ABC', ignored: false });
      await db('acronyms').insert({ team_id: teamId, acronym: 'DEF', ignored: true });

      assertThat(await subject.isIgnored(context, 'ABC'), is(false));
      assertThat(await subject.isIgnored(context, 'DEF'), is(true));
    });

    it("returns false if there's no row for the provided acronym", async () => {
      assertThat(await subject.isIgnored(context, 'ABC'), is(false));
    });
  });

  describe('stopIgnoring', () => {
    it('sets the ignored flag to false on the provided acronym', async () => {
      await db('acronyms').insert({ team_id: teamId, acronym: 'ABC', ignored: true });

      await subject.stopIgnoring(context, 'ABC');

      const isIgnored = (await db('acronyms').select('ignored').where('acronym', 'ABC').first()).ignored;
      assertThat(isIgnored, is(false));
    });

    it("creates an acronym row to remember the preference if the acronym doesn't exist", async () => {
      await subject.stopIgnoring(context, 'ABC');

      const isIgnored = (await db('acronyms').select('ignored').where('acronym', 'ABC').first()).ignored;
      assertThat(isIgnored, is(false));
    });
  });
});
