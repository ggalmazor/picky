export function buildSlackId(slackEnterpriseId, slackTeamId) {
  if (slackEnterpriseId === undefined)
    return `_.${slackTeamId}`;

  return `${slackEnterpriseId}.${slackTeamId}`;
}

// noinspection EqualityComparisonWithCoercionJS
export default class DbMemory {
  constructor(db) {
    this.db = db;
  }

  static async setUpTeam(db, {id: slackTeamId, name: teamName}, {id: slackEnterpriseId, name: enterpriseName}, accessToken) {
    const slackId = buildSlackId(slackEnterpriseId, slackTeamId);

    const teamExists = (await db('teams').count('id', {as: 'count'}).where({slack_id: slackId}).first()).count == 1;
    if (teamExists) {
      if (accessToken !== undefined)
        await db('teams').update({access_token: accessToken}).where({slack_id: slackId});
      return;
    }

    if (slackEnterpriseId !== undefined) {
      const enterpriseId = (await db('enterprises').returning("id").insert({
        slack_id: slackEnterpriseId,
        name: enterpriseName
      }))[0].id;
      await db('teams').insert({
        enterprise_id: enterpriseId,
        slack_id: slackId,
        name: teamName,
        access_token: accessToken
      })
    } else {
      await db('teams').insert({
        slack_id: slackId,
        name: teamName,
        access_token: accessToken
      })
    }
  }

  async teamId({enterpriseId, teamId}) {
    const slackId = buildSlackId(enterpriseId, teamId);
    const result = await this.db('teams').select("id").where({slack_id: slackId}).first();

    if (result === undefined)
      throw new Error(`Team ${slackId} not found`);

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

    let acronymId;
    const result = await this.db('acronyms')
      .select('acronyms.id')
      .where('team_id', teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) {
      acronymId = (
        await this.db('acronyms').returning('acronyms.id').insert({team_id: teamId, acronym: acronym})
      )[0].id;
    } else {
      acronymId = result.id;
    }

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

    await this.db('definitions').delete().where('acronym_id', acronymId).where('definition', definition);

    const count = (await this.db('definitions').count('id', {as: 'count'}).where('acronym_id', acronymId).first())
      .count;

    if (count == 0) await this.db('acronyms').delete().where('id', acronymId);
  }
}
