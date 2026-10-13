package com.personal.portfolio.platform;

import module java.base;

public record Tally<K extends Enum<K>>(K key, long total) {

    public static <K extends Enum<K>> Map<K, Long> zeroFilled(Class<K> type, List<Tally<K>> tallies) {
        var counts = new EnumMap<K, Long>(type);
        EnumSet.allOf(type).forEach(key -> counts.put(key, 0L));
        tallies.forEach(tally -> counts.put(tally.key(), tally.total()));
        return counts;
    }
}
