import {v4 as uuid} from 'uuid';
import DbMemory, {buildSlackId} from './db-memory.js';
import {
  assertThat,
  containsString,
  equalTo,
  hasProperties, hasProperty, instanceOf,
  is,
  isRejectedWith,
  not,
  promiseThat,
  rejected,
  throws
} from 'hamjest';
import knex from 'knex';
import profiles from '../../../knexfile.js';
import {TeamNeedsSetUpError} from "../../errors/errors.js";

describe('Database memory', () => {
  let db;
  let context, slackTeam, slackEnterprise;
  let subject, acronymId;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    slackTeam = {id: uuid(), name: 'Test team'};
    slackEnterprise = {id: uuid(), name: 'Test enterprise'};
    context = {teamId: slackTeam.id, enterpriseId: slackEnterprise.id};

    const enterpriseId = (await db('enterprises').returning("id").insert({
      slack_id: slackEnterprise.id,
      name: slackEnterprise.name
    }))[0].id;
    const teamId = (await db('teams').returning("id").insert({
      enterprise_id: enterpriseId,
      slack_id: buildSlackId(slackEnterprise.id, slackTeam.id),
      name: slackTeam.name
    }))[0].id;
    acronymId = (await db('acronyms').returning('id').insert({team_id: teamId, acronym: 'ABC'}))[0].id;
    await db('definitions').insert({acronym_id: acronymId, definition: 'Agile Bouncy Coyote'});

    subject = new DbMemory(db, teamId);
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe('knows', () => {
    it("returns true when there's a memorized definition for the provided acronym", async () => {
      assertThat(await subject.knows(context, 'ABC'), is(true));
    });

    it("returns true when there's a memory of the provided acronym and definition", async () => {
      assertThat(await subject.knows(context, 'ABC', 'Agile Bouncy Coyote'), is(true));
    });

    it('returns false otherwise', async () => {
      assertThat(await subject.knows(context, 'ABC', 'Amazing Bright Castle'), is(false));
      assertThat(await subject.knows(context, 'CDE'), is(false));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(subject.knows({teamId: 'unknown'}, 'ABC', 'Amazing Bright Castle'), isRejectedWith(instanceOf(TeamNeedsSetUpError)));
    });
  });

  describe('recall', () => {
    it('returns learned definitions for the provided acronym', async () => {
      assertThat(await subject.recall(context, 'ABC'), equalTo(['Agile Bouncy Coyote']));
    });

    it("returns an empty list when providing an acronym that's not memorized", async () => {
      assertThat(await subject.recall(context, 'CDE'), equalTo([]));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(subject.recall({teamId: 'unknown'}, 'ABC'), isRejectedWith(instanceOf(TeamNeedsSetUpError)));
    });
  });

  describe('learn', () => {
    it('learns new definitions for existing acronyms', async () => {
      await subject.learn(context, 'ABC', 'Amazing Bright Castle');

      assertThat(await subject.recall(context, 'ABC'), equalTo(['Agile Bouncy Coyote', 'Amazing Bright Castle']));
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
      await promiseThat(subject.learn({teamId: 'unknown'}, 'ABC', 'Agile Bouncy Coyote'), isRejectedWith(instanceOf(TeamNeedsSetUpError)));
    });
  });

  describe('forget', () => {
    it('deletes the row in `definitions` for the provided acronym and definition', async () => {
      await db('definitions').insert({acronym_id: acronymId, definition: 'Amazing Bright Castle'});

      await subject.forget(context, 'ABC', 'Agile Bouncy Coyote');

      assertThat(await subject.knows(context, 'ABC', 'Agile Bouncy Coyote'), is(false));
      assertThat(await subject.knows(context, 'ABC', 'Amazing Bright Castle'), is(true));
    });

    it('deletes the row in `acronyms` if there are no more definitions', async () => {
      await subject.forget(context, 'ABC', 'Agile Bouncy Coyote');

      const count = (await db('acronyms').count('id', {as: 'count'}).where({id: acronymId}))[0].count;
      assertThat(count, is('0'));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(subject.forget({teamId: 'unknown'}, 'ABC', 'Agile Bouncy Coyote'), isRejectedWith(instanceOf(TeamNeedsSetUpError)));
    });
  });
});
