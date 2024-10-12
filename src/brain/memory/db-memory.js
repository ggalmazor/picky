// noinspection EqualityComparisonWithCoercionJS
export default class DbMemory {
  constructor(db, teamId, brainId) {
    this.db = db;
    this.teamId = teamId;
    this.brainId = brainId;
  }

  static async from(db, team) {
    const teamExists = (await db('teams').count('id', { as: 'count' }).where({ id: team.id }).first()).count == 1;
    if (teamExists) {
      const brainId = (await db('brains').select('id').where({ team_id: team.id }).first()).id;
      return new DbMemory(db, team.id, brainId);
    } else {
      await db('teams').insert({ id: team.id, name: team.name, url: team.url });
      const brainId = (await db('brains').returning('id').insert({ team_id: team.id }))[0].id;
      return new DbMemory(db, team.id, brainId);
    }
  }

  async knows(acronym, definition) {
    if (definition === undefined) {
      const exists = (
        await this.db('acronyms')
          .count('acronyms.id', { as: 'exists' })
          .join('brains', 'brains.id', 'brain_id')
          .where('team_id', this.teamId)
          .where('acronym', acronym)
          .first()
      ).exists;
      return exists == 1;
    }

    const exists = (
      await this.db('acronyms')
        .count('acronyms.id', { as: 'exists' })
        .join('brains', 'brains.id', 'brain_id')
        .join('definitions', 'acronyms.id', 'acronym_id')
        .where('team_id', this.teamId)
        .where('acronym', acronym)
        .where('definition', definition)
        .first()
    ).exists;
    return exists == 1;
  }

  async recall(acronym) {
    const results = await this.db('definitions')
      .join('acronyms', 'acronyms.id', 'definitions.acronym_id')
      .join('brains', 'brains.id', 'acronyms.brain_id')
      .select('definition')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .orderBy('definition');
    return results.map((result) => result.definition);
  }

  async learn(acronym, definition) {
    let acronymId;
    const result = await this.db('acronyms')
      .join('brains', 'brains.id', 'brain_id')
      .select('acronyms.id')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) {
      acronymId = (
        await this.db('acronyms').returning('acronyms.id').insert({ brain_id: this.brainId, acronym: acronym })
      )[0].id;
    } else {
      acronymId = result.id;
    }

    await this.db('definitions')
      .onConflict(['acronym_id', 'definition'])
      .ignore()
      .insert({ acronym_id: acronymId, definition: definition });
  }

  async forget(acronym, definition) {
    const result = await this.db('acronyms')
      .join('brains', 'brains.id', 'brain_id')
      .select('acronyms.id')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) return;

    const acronymId = result.id;

    await this.db('definitions').delete().where('acronym_id', acronymId).where('definition', definition);

    const count = (await this.db('definitions').count('id', { as: 'count' }).where('acronym_id', acronymId).first())
      .count;

    if (count == 0) await this.db('acronyms').delete().where('id', acronymId);
  }
}
