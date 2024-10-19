import {TeamNeedsSetUpError} from '../../errors/errors.js';

export function buildSlackId(slackEnterpriseId, slackTeamId) {
  if (slackEnterpriseId === undefined) return `_.${slackTeamId}`;

  return `${slackEnterpriseId}.${slackTeamId}`;
}

// noinspection EqualityComparisonWithCoercionJS
export default class DbMemory {
  constructor(db) {
    this.db = db;
  }

  async teamId({enterpriseId, teamId}) {
    const slackId = buildSlackId(enterpriseId, teamId);
    const result = await this.db('teams').select('id').where({slack_id: slackId}).first();

    if (result === undefined) throw new TeamNeedsSetUpError(enterpriseId, teamId);

    return result.id;
  }

  async knows(context, acronym, definition) {
    const teamId = await this.teamId(context);

    if (definition === undefined) {
      const exists = (
        await this.db('acronyms')
          .count('acronyms.id', {as: 'exists'})
          .where('team_id', teamId)
          .where('acronym', acronym)
          .first()
      ).exists;
      return exists == 1;
    }

    const exists = (
      await this.db('acronyms')
        .count('acronyms.id', {as: 'exists'})
        .join('definitions', 'acronyms.id', 'acronym_id')
        .where('team_id', teamId)
        .where('acronym', acronym)
        .where('definition', definition)
        .first()
    ).exists;
    return exists == 1;
  }

  async recall(context, acronym) {
    const teamId = await this.teamId(context);

    const results = await this.db('definitions')
      .join('acronyms', 'acronyms.id', 'definitions.acronym_id')
      .select('definition')
      .where('team_id', teamId)
      .where('acronym', acronym)
      .orderBy('definition');
    return results.map((result) => result.definition);
  }

  async learn(context, acronym, definition) {
    const teamId = await this.teamId(context);

    await this.db('acronyms')
      .insert({team_id: teamId, acronym: acronym})
      .onConflict(['team_id', 'acronym'])
      .ignore();

    const acronymId = (await this.db('acronyms').select('id').where({ team_id: teamId, acronym}).first()).id;

    await this.db('definitions')
      .onConflict(['acronym_id', 'definition'])
      .ignore()
      .insert({acronym_id: acronymId, definition: definition});
  }

  async forget(context, acronym, definition) {
    const teamId = await this.teamId(context);

    const result = await this.db('acronyms')
      .select('acronyms.id')
      .where('team_id', teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) return;

    const acronymId = result.id;

    if (definition === undefined) {
      await this.db('acronyms').delete().where('id', acronymId);
      return;
    }

    await this.db('definitions').delete().where('acronym_id', acronymId).where('definition', definition);

    const count = (await this.db('definitions').count('id', {as: 'count'}).where('acronym_id', acronymId).first())
      .count;

    if (count == 0) await this.db('acronyms').delete().where('id', acronymId);
  }

  async list(context, ignored) {
    const teamId = await this.teamId(context);

    let baseQuery = this.db('acronyms')
      .join('definitions', 'acronym_id', 'acronyms.id')
      .select('acronyms.acronym', this.db.raw('jsonb_agg(definitions.definition) as definitions'))
      .where('team_id', teamId);

    if (ignored !== undefined)
      baseQuery = baseQuery.where('ignored', ignored);

    const results = await baseQuery
      .groupBy('acronyms.acronym')
      .orderBy("acronyms.acronym");

    return results.reduce((agg, {acronym, definitions}) => {
      agg[acronym] = definitions;
      return agg;
    }, {});
  }

  async ignore(context, acronym) {
    const teamId = await this.teamId(context);

    await this.db('acronyms')
      .insert({team_id: teamId, acronym: acronym, ignored: true})
      .onConflict(['team_id', 'acronym'])
      .merge();
  }

  async isIgnored(context, acronym) {
    const teamId = await this.teamId(context);

    const result = await this.db('acronyms')
      .select('ignored')
      .where({team_id: teamId, acronym})
      .first();

    return result?.ignored || false;
  }

  async stopIgnoring(context, acronym) {
    const teamId = await this.teamId(context);

    await this.db('acronyms')
      .insert({team_id: teamId, acronym: acronym, ignored: false})
      .onConflict(['team_id', 'acronym'])
      .merge();
  }
}
