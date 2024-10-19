import {testSlackClient} from "../../test/utils.js";
import SlackOAuth from "./oauth.js";
import {assertThat, hasProperties} from "hamjest";

describe("#access", () => {
  let client, credentials;
  let subject;

  beforeEach(() => {
    client = testSlackClient();
    credentials = {
      id: "ID",
      secret: "SECRET"
    }
    subject = new SlackOAuth(client, credentials);

    client.oauth.v2.access = jest.fn().mockResolvedValue({
      access_token: 'some token',
      team: {
        id: "team ID",
        name: 'team name'
      },
      enterprise: {
        id: 'enterprise ID',
        name: 'enterprise name'
      }
    });
  });

  it("uses the Slack client to exchange the provided code for an access token", async () => {
    await subject.access("some code");

    expect(client.oauth.v2.access).toHaveBeenCalledWith({
      client_id: credentials.id,
      client_secret: credentials.secret,
      code: "some code"
    });
  });

  it('returns the access token and received data about the team and the enterprise', async () => {
    const result = await subject.access("some code");

    assertThat(result, hasProperties({
      accessToken: 'some token',
      team: {
        id: "team ID",
        name: 'team name'
      },
      enterprise: {
        id: 'enterprise ID',
        name: 'enterprise name'
      }
    }));
  });
});
