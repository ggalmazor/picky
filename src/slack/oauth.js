export default class SlackOAuth {
  constructor(client, credentials) {
    this.client = client;
    this.credentials = credentials;
  }

  async access(code) {
    const response = await this.client.oauth.v2.access({
      client_id: this.credentials.id,
      client_secret: this.credentials.secret,
      code,
    });
    const { access_token: accessToken, team, enterprise } = response;
    return { accessToken, team, enterprise };
  }
}
