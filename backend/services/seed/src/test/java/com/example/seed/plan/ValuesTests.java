package com.example.seed.plan;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import net.datafaker.Faker;
import org.junit.jupiter.api.Test;

class ValuesTests {

    private static final Map<String, Object> SAVED = Map.of(
        "list", Map.of("id", "l-7", "size", 3, "owner", Map.of("name", "Ada"), "tags", List.of("a", "b")));

    private final Values values = new Values(new Faker(Locale.ENGLISH, new Random(1)), SAVED, 4);

    @Test
    void keepsTheTypeOfAValueReferencedOnItsOwn() {
        assertThat(values.fill("{{list.size}}")).isEqualTo(3);
        assertThat(values.fill("{{ index }}")).isEqualTo(4);
        assertThat(values.fill("{{list}}")).isEqualTo(SAVED.get("list"));
        assertThat(values.fill("{{list.tags[1]}}")).isEqualTo("b");
    }

    @Test
    void writesReferencesIntoText() {
        assertThat(values.text("/lists/{{list.id}}/members/{{index}}")).isEqualTo("/lists/l-7/members/4");
        assertThat(values.fill("Owned by {{list.owner.name}}")).isEqualTo("Owned by Ada");
    }

    @Test
    void evaluatesDatafakerExpressionsAfterTheReferences() {
        var name = values.fill("#{name.firstName} of {{list.owner.name}}").toString();

        assertThat(name).endsWith(" of Ada").doesNotContain("#{");
    }

    @Test
    void walksMapsAndListsAndLeavesOtherValuesAlone() {
        var filled = values.fill(Map.of("ids", List.of("{{list.id}}", 5, true), "nested", Map.of("n", "{{index}}"), "plain", "text"));

        assertThat(filled).isEqualTo(Map.of("ids", List.of("l-7", 5, true), "nested", Map.of("n", 4), "plain", "text"));
    }

    @Test
    void refusesAReferenceToSomethingMissing() {
        assertThatThrownBy(() -> values.fill("{{order.id}}"))
            .isInstanceOf(PlanException.class)
            .hasMessage("Nothing was saved as 'order' before it is used");
        assertThatThrownBy(() -> values.fill("{{list.missing}}"))
            .isInstanceOf(PlanException.class)
            .hasMessage("The response saved as 'list' has no 'missing'");
    }
}
