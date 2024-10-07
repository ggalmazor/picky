package com.ggalmazor.command;

import com.slack.api.bolt.context.Context;
import com.slack.api.model.event.Event;

import java.util.function.BiConsumer;

public interface Command extends BiConsumer<Context, Event> {
    boolean test(Event event);
}
