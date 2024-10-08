import DescribeReply from "./describe-reply.js";
import {assertThat, hasProperties, instanceOf, is} from "hamjest";
import Replies from "./replies.js";
import Brain from "../brain/brain.js";
import RandomAcronyms from "../brain/acronyms/random-acronyms.js";
import {TestLogger} from "../../test/utils.js";

describe('Replies', () => {
  let brain, logger, subject;

  beforeEach(() => {
    brain = new Brain(new RandomAcronyms(), {
      "HTML": ["Hyper Text Markup Language"],
      "API": ["Application Programming Interface"]
    });
    logger = new TestLogger();
    subject = new Replies(brain, logger);
  });

  describe("get", () => {
    it("returns the Reply instance that matches the provided event", () => {
      const reply = subject.get({text: "FOO"});

      assertThat(reply, is(instanceOf(DescribeReply)));
    });

    it('returns `undefined` if no Reply matches the provided event', () => {
      const reply = subject.get({text: "Doesn't match any reply"});

      assertThat(reply, is(undefined));
    });

    it('passes through the client and logger instances', () => {
      const reply = subject.get({text: "FOO"});

      assertThat(reply, hasProperties({brain, logger}));
    });
  });
});