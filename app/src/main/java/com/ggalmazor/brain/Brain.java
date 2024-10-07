package com.ggalmazor.brain;

import com.ggalmazor.brain.acronyms.Acronyms;
import com.ggalmazor.brain.acronyms.RandomAcronyms;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Knows how to describe an acronym and remembers their definition after that
 */
public class Brain {
    private final Acronyms acronyms;
    private final Map<String, Set<String>> memory;

    Brain(Acronyms acronyms, Map<String, Set<String>> memory) {
        this.acronyms = acronyms;
        this.memory = memory;
    }

    /**
     * Returns a Brain that doesn't know any acronym yet
     */
    public static Brain empty(Acronyms acronyms) {
        return new Brain(acronyms, new ConcurrentHashMap<>());
    }

    /**
     * Returns a Brain that will return random acronym definition
     */
    public static Brain random() {
        return new Brain(new RandomAcronyms(), new ConcurrentHashMap<>());
    }

    /**
     * Returns the memorized definition of the provided acronym. When there's no memory of it,
     * generates a new acronym using the Acronym source.
     */
    public List<String> getDefinitions(String acronym) {
        return memory.computeIfAbsent(acronym, key -> new HashSet<>(List.of(acronyms.getDefinition(acronym)))).stream().toList();
    }

    public void learn(String acronym, String definition) {
        memory.computeIfAbsent(acronym, key -> new HashSet<>()).add(definition);
    }

    public void forget(String acronym, String definition) {
        if (!memory.containsKey(acronym))
            return;
        memory.get(acronym).remove(definition);
        if (memory.get(acronym).isEmpty())
            memory.remove(acronym);
    }
}
