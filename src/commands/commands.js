import ForgetCommand from './forget-command.js';
import LearnCommand from './learn-command.js';
import DefineCommand from "./define-command.js";

const COMMANDS = [ForgetCommand, LearnCommand, DefineCommand];

export default class Commands {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  get(event) {
    const CommandConstructor = COMMANDS.find((Command) => Command.test(event));
    if (CommandConstructor === undefined) return;

    return new CommandConstructor(this.brain, this.client, this.logger);
  }
}
