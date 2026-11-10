package com.example.seed.plan;

import module java.base;

import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.PathNotFoundException;
import net.datafaker.Faker;

/// Fills a step's path and body for one repetition. Only strings change; numbers, booleans and structure stay as
/// written. A string that is exactly one `{{reference}}` keeps the type of the value it refers to.
final class Values {

    private static final Pattern REFERENCE = Pattern.compile("\\{\\{\\s*([A-Za-z][A-Za-z0-9_]*)((?:\\.[A-Za-z0-9_\\[\\]]+)*)\\s*}}");

    private final Faker faker;
    private final Map<String, Object> saved;
    private final int index;

    Values(Faker faker, Map<String, Object> saved, int index) {
        this.faker = faker;
        this.saved = saved;
        this.index = index;
    }

    Object fill(Object value) {
        return switch (value) {
            case String text -> fillText(text);
            case Map<?, ?> map -> {
                var filled = new LinkedHashMap<String, Object>();
                map.forEach((key, item) -> filled.put(String.valueOf(key), fill(item)));
                yield filled;
            }
            case List<?> list -> list.stream().map(this::fill).toList();
            default -> value;
        };
    }

    String text(String value) {
        return String.valueOf(fillText(value));
    }

    private Object fillText(String text) {
        var whole = REFERENCE.matcher(text);
        if (whole.matches()) return resolve(whole.group(1), whole.group(2));
        var replaced = REFERENCE.matcher(text).replaceAll(match -> Matcher.quoteReplacement(String.valueOf(resolve(match.group(1), match.group(2)))));
        return replaced.contains("#{") ? faker.expression(replaced) : replaced;
    }

    private Object resolve(String name, String path) {
        if (name.equals("index") && path.isEmpty()) return index;
        if (!saved.containsKey(name)) throw new PlanException("Nothing was saved as '%s' before it is used".formatted(name));
        if (path.isEmpty()) return saved.get(name);
        try {
            return JsonPath.read(saved.get(name), "$" + path);
        } catch (PathNotFoundException _) {
            throw new PlanException("The response saved as '%s' has no '%s'".formatted(name, path.substring(1)));
        }
    }
}
