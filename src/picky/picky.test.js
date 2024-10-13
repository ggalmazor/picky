import { TestLogger, testSlackClient } from '../../test/utils.js';
import Picky from './picky.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';
import { allOf, assertThat, empty, hasItem, instanceOf, is, not } from 'hamjest';
import { v4 as uuid } from 'uuid';
import knex from 'knex';
import profiles from '../../knexfile.js';
import DbMemory from '../brain/memory/db-memory.js';

function buildReplyOrCommandSpy(testResult) {
  const acceptSpy = jest.fn();

  function Constructor() {}

  Constructor.test = () => testResult;
  Constructor.prototype.accept = acceptSpy;

  return [Constructor, acceptSpy];
}

describe('Picky.from(...) factory', () => {
  let db, teamId, app;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    teamId = uuid();

    app = { client: testSlackClient(), logger: new TestLogger() };
    app.client.team.info = jest.fn().mockResolvedValue({
      team: {
        id: teamId,
        name: 'Test team',
        url: 'https://test.team.org',
      },
    });
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  it("gets the team's info using the app's client", async () => {
    await Picky.from(db, app);

    expect(app.client.team.info).toHaveBeenCalled();
  });

  it('configures the dependencies tree and returns a new Picky instance', async () => {
    const subject = await Picky.from(db, app);

    assertThat(subject, is(instanceOf(Picky)));
    assertThat(subject.brain, is(instanceOf(Brain)));
    assertThat(subject.brain.memory, is(instanceOf(DbMemory)));
    assertThat(subject.commands, is(instanceOf(Commands)));
    assertThat(subject.commands.commands, is(not(empty())));
    assertThat(subject.replies, is(instanceOf(Replies)));
    assertThat(subject.replies.replies, is(not(empty())));
    assertThat(subject.logger, is(app.logger));
  });
});

describe('Picky', () => {
  let brain, client, logger, replies, commands, say, subject, payload;

  function buildPayload(text = 'foo bar baz', botUserId = 'U07QZFMN8MU') {
    return { event: { text }, context: { botUserId }, say };
  }

  beforeEach(() => {
    brain = new Brain(
      new RandomAcronyms(Math.random),
      new VolatileMemory({
        HTML: ['Hyper Text Markup Language'],
        API: ['Application Programming Interface'],
      }),
    );
    logger = new TestLogger();
    client = testSlackClient();
    replies = new Replies([], brain, logger);
    commands = new Commands([], brain, client, logger);
    say = jest.fn().mockResolvedValue();
    payload = buildPayload('foo bar baz');
    subject = new Picky(brain, replies, commands, logger);
  });

  describe('onMessage', () => {
    describe("when there's a Reply for the message", () => {
      let Reply, replySpy;

      beforeEach(() => {
        [Reply, replySpy] = buildReplyOrCommandSpy(true);
        replies.add(Reply);
      });

      it('logs an info message', async () => {
        await subject.onMessage(payload);

        assertThat(logger.messages.info, hasItem(`Replying to message: ${payload.event.text}`));
      });

      it('executes the Reply', async () => {
        await subject.onMessage(payload);

        expect(replySpy).toHaveBeenCalledWith({ text: payload.event.text }, say);
      });

      describe('when the message includes a mention to Picky', () => {
        beforeEach(() => {
          payload = buildPayload('<BOTUSERID> foo bar baz', 'BOTUSERID');
        });

        it('logs a debug message', async () => {
          await subject.onMessage(payload);

          assertThat(logger.messages.debug, hasItem(`Ignoring message with mention: ${payload.event.text}`));
        });

        it("doesn't execute the Reply", async () => {
          await subject.onMessage(payload);

          expect(replySpy).not.toHaveBeenCalled();
        });
      });
    });

    describe("when there's no Reply for the message", () => {
      it('logs a debug message', async () => {
        await subject.onMessage(payload);

        assertThat(logger.messages.debug, hasItem(`No reply for: ${payload.event.text}`));
      });

      it("doesn't send any reply message", async () => {
        await subject.onMessage(payload);

        expect(say).not.toHaveBeenCalled();
      });

      describe('when `true` is provided in the `replyAll` param', () => {
        it("doesn't log a debug message", async () => {
          await subject.onMessage(payload, true);

          assertThat(logger.messages.debug, not(hasItem(`No reply for: ${payload.event.text}`)));
        });

        it("replies informing that it doesn't know how to reply to the message", async () => {
          await subject.onMessage(payload, true);

          expect(say).toHaveBeenCalledWith(`I don't know how to reply to: \`${payload.event.text}\``);
        });
      });

      describe('when the message includes a mention to Picky', () => {
        beforeEach(() => {
          payload = buildPayload('<BOTUSERID> foo bar baz', 'BOTUSERID');
        });

        it('logs a different debug message', async () => {
          await subject.onMessage(payload);

          assertThat(
            logger.messages.debug,
            allOf(
              not(hasItem(`No reply for: ${payload.event.text}`)),
              hasItem(`Ignoring message with mention: ${payload.event.text}`),
            ),
          );
        });
      });
    });
  });

  describe('onAppMention', () => {
    describe("when there's a Command for the message", () => {
      let Command, commandSpy;

      beforeEach(() => {
        [Command, commandSpy] = buildReplyOrCommandSpy(true);
        commands.add(Command);
      });

      it('logs an info message', async () => {
        await subject.onAppMention(payload);

        assertThat(logger.messages.info, hasItem(`Replying to mention: ${payload.event.text}`));
      });

      it('executes the Reply', async () => {
        await subject.onAppMention(payload);

        expect(commandSpy).toHaveBeenCalledWith({ text: payload.event.text }, say);
      });
    });

    describe("when there's no Command for the message", () => {
      it('logs a debug message', async () => {
        await subject.onAppMention(payload);

        assertThat(logger.messages.debug, hasItem(`No command for: ${payload.event.text}`));
      });

      it("doesn't send any reply message", async () => {
        await subject.onAppMention(payload);

        expect(say).not.toHaveBeenCalled();
      });

      describe('when `true` is provided in the `replyAll` param', () => {
        it("doesn't log a debug message", async () => {
          await subject.onAppMention(payload, true);

          assertThat(logger.messages.debug, not(hasItem(`No command for: ${payload.event.text}`)));
        });

        it("replies informing that it doesn't know how to reply to the message", async () => {
          await subject.onAppMention(payload, true);

          expect(say).toHaveBeenCalledWith(`I don't know how to reply to: \`${payload.event.text}\``);
        });
      });
    });
  });
});
