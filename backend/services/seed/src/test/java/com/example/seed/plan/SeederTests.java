package com.example.seed.plan;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.seed.SeedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class SeederTests extends SeedIntegrationTest {

    @Autowired
    private Plans plans;

    @Autowired
    private Seeder seeder;

    @Test
    void createsSomethingThenFillsItUsingWhatTheServiceAnswered() {
        var report = seeder.run(plans.read(plan("""
            - target: target
              method: POST
              path: /lists
              as: list
              body: {name: readers, tags: [weekly, "#{color.name}"], active: true}
            - target: target
              method: POST
              path: /lists/{{list.id}}/members
              repeat: 3
              body:
                name: "#{name.firstName}"
                position: "{{index}}"
                label: "Member {{index}} of {{list.size}}"
            """)), 7L);

        assertThat(report.completed()).isTrue();
        assertThat(report.steps()).extracting(Seeder.Report.StepResult::calls).containsExactly(1, 3);
        var received = target.received();
        assertThat(received.getFirst()).containsEntry("name", "readers").containsEntry("active", true);
        assertThat((List<?>) received.getFirst().get("tags")).first().isEqualTo("weekly");
        assertThat(received.subList(1, 4)).extracting(member -> member.get("position")).containsExactly(1, 2, 3);
        assertThat(received.subList(1, 4)).allSatisfy(member -> assertThat(member)
            .containsEntry("list", "list-readers")
            .hasEntrySatisfying("name", name -> assertThat(name.toString()).isNotBlank().doesNotContain("#{")));
        assertThat(received.get(2)).containsEntry("label", "Member 2 of 3");
    }

    @Test
    void makesUpTheSameDataForTheSameSeed() {
        var plan = plans.read(plan("""
            - target: target
              method: POST
              path: /lists
              body: {name: "#{name.fullName}"}
            """));

        seeder.run(plan, 42L);
        seeder.run(plan, 42L);
        seeder.run(plan, 43L);

        var names = target.received().stream().map(body -> body.get("name")).toList();
        assertThat(names.get(0)).isEqualTo(names.get(1)).isNotEqualTo(names.get(2));
    }

    @Test
    void stopsAtTheFirstRefusedCall() {
        var report = seeder.run(plans.read(plan("""
            - target: target
              method: GET
              path: /refuse
            - target: target
              method: POST
              path: /lists
              body: {name: never}
            """)), null);

        assertThat(report.completed()).isFalse();
        assertThat(report.steps()).singleElement().satisfies(step -> {
            assertThat(step.step()).isEqualTo("GET target/refuse");
            assertThat(step.calls()).isZero();
            assertThat(step.error()).startsWith("The service answered 409:").contains("Already there");
        });
        assertThat(target.received()).isEmpty();
    }

    @Test
    void reportsATargetThePlanDoesNotName() {
        var report = seeder.run(plans.read(plan("""
            - target: elsewhere
              method: POST
              path: /lists
            """)), null);

        assertThat(report.completed()).isFalse();
        assertThat(report.steps().getFirst().error()).isEqualTo("No target named 'elsewhere'");
    }

    @Test
    void reportsAReferenceToSomethingNeverSaved() {
        var report = seeder.run(plans.read(plan("""
            - target: target
              method: POST
              path: /lists/{{missing.id}}/members
              body: {name: x}
            """)), null);

        assertThat(report.steps().getFirst().error()).isEqualTo("Nothing was saved as 'missing' before it is used");
    }

    @Test
    void savesNothingFromAnEmptyAnswer() {
        var report = seeder.run(plans.read(plan("""
            - target: target
              method: POST
              path: /lists/l1/members
              as: member
              body: {name: x}
            - target: target
              method: POST
              path: /lists/{{member.id}}/members
              body: {name: y}
            """)), null);

        assertThat(report.steps()).extracting(Seeder.Report.StepResult::calls).containsExactly(1, 0);
        assertThat(report.steps().getLast().error()).isEqualTo("Nothing was saved as 'member' before it is used");
    }
}
