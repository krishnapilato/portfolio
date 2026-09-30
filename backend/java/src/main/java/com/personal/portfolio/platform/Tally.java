package com.personal.portfolio.platform;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

public record Tally<K extends Enum<K>>(K key, long total) {

    public static <K extends Enum<K>> Map<K, Long> zeroFilled(Class<K> type, List<Tally<K>> tallies) {
        var counts = new EnumMap<K, Long>(type);
        EnumSet.allOf(type).forEach(key -> counts.put(key, 0L));
        tallies.forEach(tally -> counts.put(tally.key(), tally.total()));
        return counts;
    }
}
