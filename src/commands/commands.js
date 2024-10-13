import ForgetCommand from './forget-command.js';
import LearnCommand from './learn-command.js';
import DefineCommand from './define-command.js';

const COMMANDS = [ForgetCommand, LearnCommand, DefineCommand];

export default class Commands {
  constructor(commands, brain, client, logger) {
    this.commands = commands;
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static load(brain, client, logger) {
    return new Commands(COMMANDS, brain, client, logger);
  }

  add(command) {
    this.commands.push(command);
  }

  get(event) {
    const CommandConstructor = this.commands.find((Command) => Command.test(event));
    if (CommandConstructor === undefined) return;

    return new CommandConstructor(this.brain, this.client, this.logger);
  }
}
