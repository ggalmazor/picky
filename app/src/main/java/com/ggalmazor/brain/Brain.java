package com.ggalmazor.brain;

import com.ggalmazor.brain.acronyms.RandomAcronyms;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Brain {
    private final Acronyms acronyms;
    private final Map<String, List<String>> memory;

    Brain(Acronyms acronyms, Map<String, List<String>> memory) {
        this.acronyms = acronyms;
        this.memory = memory;
    }

    static Brain empty(Acronyms acronyms) {
        return new Brain(acronyms, new ConcurrentHashMap<>());
    }

    public static Brain randomAcronyms() {
        return new Brain(new RandomAcronyms(), new ConcurrentHashMap<>());
    }

    public List<String> getDescriptions(String acronym) {
        return memory.computeIfAbsent(acronym, key -> new ArrayList<>(List.of(acronyms.getDescription(acronym))));
    }
}
