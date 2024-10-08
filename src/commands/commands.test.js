import {assertThat, hasProperties, instanceOf, is} from "hamjest";
import Commands from "./commands.js";
import Brain from "../brain/brain.js";
import RandomAcronyms from "../brain/acronyms/random-acronyms.js";
import {TestLogger, testSlackClient} from "../../test/utils.js";
import ForgetCommand from "./forget-command.js";
import LearnCommand from "./learn-command.js";

describe('Commands', () => {
  let brain, client, logger, subject;

  beforeEach(() => {
    brain = new Brain(new RandomAcronyms(), {
      "HTML": ["Hyper Text Markup Language"],
      "API": ["Application Programming Interface"]
    });
    client = testSlackClient();
    logger = new TestLogger();
    subject = new Commands(brain, client, logger);
  });

  describe("get", () => {
    it("returns the Command instance that matches the provided event", () => {
      assertThat(subject.get({text: "forget API Application Programming Interface"}), is(instanceOf(ForgetCommand)));
      assertThat(subject.get({text: "learn API Application Programming Interface"}), is(instanceOf(LearnCommand)));
    });

    it('returns `undefined` if no Command matches the provided event', () => {
      assertThat(subject.get({text: "Doesn't match any command"}), is(undefined));
    });

    it('passes through the client and logger instances', () => {
      assertThat(subject.get({text: "forget API Application Programming Interface"}), hasProperties({
        brain,
        client,
        logger
      }));
    });
  });
});