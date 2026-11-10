package com.example.seed.plan;

import module java.base;

import com.example.seed.plan.Seeder.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/// Edit a plan in the page and run it against the mail service. It runs only with the `demo` profile and needs no
/// sign-in; the calls themselves still carry the seed client's own token.
@Controller
@Profile("demo")
@RequestMapping("/demo")
@RequiredArgsConstructor
class SeedDemo {

    private final Plans plans;
    private final Seeder seeder;

    @Value("classpath:demo/plan.yaml")
    private Resource example;

    @Value("${seed.demo.mail-url:http://localhost:8082}")
    private String mailUrl;

    @GetMapping("/")
    String page(Model model) throws IOException {
        model.addAttribute("plan", example.getContentAsString(StandardCharsets.UTF_8).replace("${mail}", mailUrl));
        model.addAttribute("mailDemo", "http://localhost:8082/demo/");
        return "demo";
    }

    @PostMapping(path = "/api/run", consumes = "text/plain")
    @ResponseBody
    Report run(@RequestBody String plan) {
        return seeder.run(plans.read(plan), null);
    }
}
