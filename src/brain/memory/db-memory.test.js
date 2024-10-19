import {v4 as uuid} from 'uuid';
import DbMemory, {buildSlackId} from './db-memory.js';
import {
  assertThat,
  containsString,
  equalTo,
  hasProperties, hasProperty,
  is,
  isRejectedWith,
  not,
  promiseThat,
  rejected,
  throws
} from 'hamjest';
import knex from 'knex';
import profiles from '../../../knexfile.js';

describe('DbMemory.setUpTeam', () => {
  let db;
  let slackTeam;
  let slackEnterprise;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    slackTeam = {id: uuid(), name: 'Test team'};
    slackEnterprise = {id: uuid(), name: 'Test enterprise'};
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe("when the team already exists and an access token is provided", () => {
    it("updates the access token", async () => {
      const enterpriseId = (await db('enterprises').returning("id").insert({
        slack_id: slackEnterprise.id,
        name: slackEnterprise.name
      }))[0].id;
      const teamId = (await db('teams').returning("id").insert({
        enterprise_id: enterpriseId,
        slack_id: buildSlackId(slackEnterprise.id, slackTeam.id),
        name: slackTeam.name
      }))[0].id;

      await DbMemory.setUpTeam(db, slackTeam, slackEnterprise, "new token");

      const accessToken = (await db('teams').select("access_token").where("id", teamId).first()).access_token;
      assertThat(accessToken, equalTo("new token"));
    });
  });

  describe("when the team doesn't exist", () => {
    it("creates the enterprise", async () => {
      await DbMemory.setUpTeam(db, slackTeam, slackEnterprise, "new token");

      const result = (await db('enterprises').select("id", "name").where("slack_id", slackEnterprise.id).first());
      assertThat(result, hasProperties({
        id: not(null),
        name: equalTo(slackEnterprise.name)
      }));
    });

    it("creates the team", async () => {
      await DbMemory.setUpTeam(db, slackTeam, slackEnterprise, "new token");

      const result = (await db('teams').select("id", "name").where("slack_id", buildSlackId(slackEnterprise.id, slackTeam.id)).first());
      assertThat(result, hasProperties({
        id: not(null),
        name: equalTo(slackTeam.name)
      }));
    });

    it("links the team with the enterprise", async () => {
      await DbMemory.setUpTeam(db, slackTeam, slackEnterprise, "new token");

      const enterpriseId = (await db('enterprises').select("id").where("slack_id", slackEnterprise.id).first()).id;
      const linkedEnterpriseId = (await db('teams').select("enterprise_id").where("slack_id", buildSlackId(slackEnterprise.id, slackTeam.id)).first()).enterprise_id;
      assertThat(linkedEnterpriseId, equalTo(enterpriseId));
    });

    describe("when there's no enterprise", () => {
      it("creates the team", async () => {
        await DbMemory.setUpTeam(db, slackTeam, {}, "new token");

        const result = (await db('teams').select("id", "name", "enterprise_id").where("slack_id", buildSlackId(undefined, slackTeam.id)).first());
        assertThat(result, hasProperties({
          id: not(null),
          name: equalTo(slackTeam.name),
          enterprise_id: is(null)
        }));
      })
    });
  });
});

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
      await promiseThat(subject.knows({teamId: 'unknown'}, 'ABC', 'Amazing Bright Castle'), isRejectedWith(hasProperty("message", containsString("Team _.unknown not found"))));
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
      await promiseThat(subject.recall({teamId: 'unknown'}, 'ABC'), isRejectedWith(hasProperty("message", containsString("Team _.unknown not found"))));
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
      await promiseThat(subject.learn({teamId: 'unknown'}, 'ABC', 'Agile Bouncy Coyote'), isRejectedWith(hasProperty("message", containsString("Team _.unknown not found"))));
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
      await promiseThat(subject.forget({teamId: 'unknown'}, 'ABC', 'Agile Bouncy Coyote'), isRejectedWith(hasProperty("message", containsString("Team _.unknown not found"))));
    });
  });
});
