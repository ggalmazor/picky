package com.ggalmazor.brain;

import com.ggalmazor.brain.acronyms.RandomAcronyms;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Knows how to describe an acronym and remembers their descriptions after that
 */
public class Brain {
    private final Acronyms acronyms;
    private final Map<String, List<String>> memory;

    Brain(Acronyms acronyms, Map<String, List<String>> memory) {
        this.acronyms = acronyms;
        this.memory = memory;
    }

    /**
     * Returns a Brain that doesn't know any acronym yet
     */
    static Brain empty(Acronyms acronyms) {
        return new Brain(acronyms, new ConcurrentHashMap<>());
    }

    /**
     * Returns a Brain that will return random acronym descriptions
     */
    public static Brain random() {
        return new Brain(new RandomAcronyms(), new ConcurrentHashMap<>());
    }

    /**
     * Returns the memorized descriptions of the provided acronym. When there's no memory of it,
     * generates a new acronym using the Acronym source.
     */
    public List<String> getDescriptions(String acronym) {
        return memory.computeIfAbsent(acronym, key -> new ArrayList<>(List.of(acronyms.getDescription(acronym))));
    }
}
