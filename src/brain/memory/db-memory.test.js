import { v4 as uuid } from 'uuid';
import DbMemory from './db-memory.js';
import { assertThat, before, equalTo, is, number } from 'hamjest';
import knex from 'knex';
import profiles from '../../../knexfile.js';

let db;
try {
  db = knex(profiles.test);
} catch (error) {
  console.log(error);
}

describe('DbMemory.from', () => {
  let teamId;

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    teamId = uuid();
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  describe("when there's no row in `teams` for the provided team", () => {
    it('creates a team for the provided teamId if needed', async () => {
      await DbMemory.from(db, { id: teamId, name: 'Test team', url: 'https://test.team.org' });

      const count = (await db('teams').count('id', { as: 'count' }).where({ id: teamId }))[0].count;
      assertThat(count, is('1'));
    });

    it('creates a brain for the provided teamId if needed', async () => {
      await DbMemory.from(db, { id: teamId, name: 'Test team', url: 'https://test.team.org' });

      const count = (await db('teams').count('id', { as: 'count' }).where({ id: teamId }))[0].count;
      assertThat(count, is('1'));
    });

    it('returns a new DbMemory with the team and brain IDs', async () => {
      const subject = await DbMemory.from(db, { id: teamId, name: 'Test team', url: 'https://test.team.org' });

      const brainId = (await db('brains').select('id').where({ team_id: teamId }).first()).id;
      assertThat(subject.brainId, equalTo(brainId));
    });
  });

  describe("when there's a row in `teams` for the provided team", () => {
    it('returns a new DbMemory with the team and brain IDs', async () => {
      await db('teams').insert({ id: teamId, name: 'Test team', url: 'https://test.team.org' });
      const brainId = (await db('brains').returning('id').insert({ team_id: teamId }))[0].id;

      const subject = await DbMemory.from(db, { id: teamId, name: 'Test team', url: 'https://test.team.org' });

      assertThat(subject.brainId, equalTo(brainId));
    });
  });
});

describe('Database memory', () => {
  let teamId, subject, acronymId;

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    teamId = uuid();

    await db('teams').insert({ id: teamId, name: 'Test team', url: 'https://test.team.org' });
    const brainId = (await db('brains').returning('id').insert({ team_id: teamId }))[0].id;
    acronymId = (await db('acronyms').returning('id').insert({ brain_id: brainId, acronym: 'ABC' }))[0].id;
    await db('definitions').insert({ acronym_id: acronymId, definition: 'Agile Bouncy Coyote' });

    subject = new DbMemory(db, teamId, brainId);
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  describe('knows', () => {
    it("returns true when there's a memorized definition for the provided acronym", async () => {
      assertThat(await subject.knows('ABC'), is(true));
    });

    it("returns true when there's a memory of the provided acronym and definition", async () => {
      assertThat(await subject.knows('ABC', 'Agile Bouncy Coyote'), is(true));
    });

    it('returns false otherwise', async () => {
      assertThat(await subject.knows('ABC', 'Amazing Bright Castle'), is(false));
      assertThat(await subject.knows('CDE'), is(false));
    });
  });

  describe('recall', () => {
    it('returns learned definitions for the provided acronym', async () => {
      assertThat(await subject.recall('ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it("returns an empty list when providing an acronym that's not memorized", async () => {
      assertThat(await subject.recall('CDE'), equalTo([]));
    });
  });

  describe('learn', () => {
    it('learns new definitions for existing acronyms', async () => {
      await subject.learn('ABC', 'Amazing Bright Castle');

      assertThat(await subject.recall('ABC'), equalTo(['Agile Bouncy Coyote', 'Amazing Bright Castle']));
    });

    it('learns definitions for new acronyms', async () => {
      await subject.learn('DEF', 'Definitely Expensive Flute');

      assertThat(await subject.recall('DEF'), equalTo(['Definitely Expensive Flute']));
    });

    it('avoids learning duplicates', async () => {
      await subject.learn('ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.recall('ABC'), equalTo(['Agile Bouncy Coyote']));
    });
  });

  describe('forget', () => {
    it('deletes the row in `definitions` for the provided acronym and definition', async () => {
      await db('definitions').insert({ acronym_id: acronymId, definition: 'Amazing Bright Castle' });

      await subject.forget('ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.knows('ABC', 'Agile Bouncy Coyote'), is(false));
      assertThat(await subject.knows('ABC', 'Amazing Bright Castle'), is(true));
    });

    it('deletes the row in `acronyms` if there are no more definitions', async () => {
      await subject.forget('ABC', 'Agile Bouncy Coyote');

      const count = (await db('acronyms').count('id', { as: 'count' }).where({ id: acronymId }))[0].count;
      assertThat(count, is('0'));
    });
  });
});
