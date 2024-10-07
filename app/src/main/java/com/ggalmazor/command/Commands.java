package com.ggalmazor.command;

import com.ggalmazor.brain.Brain;
import com.slack.api.model.event.Event;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

public class Commands {
    private static final List<Function<Brain, Command>> COMMANDS = new ArrayList<>();

    public static void initialize() {
        COMMANDS.add(LearnCommand::new);
        COMMANDS.add(ForgetCommand::new);
    }

    public static Optional<Command> get(Brain brain, Event event) {
        return COMMANDS.stream().map(commandFactory -> {
            Command command = commandFactory.apply(brain);
            if (command.test(event))
                return command;

            return null;
        }).filter(Objects::nonNull).findFirst();
    }
}
