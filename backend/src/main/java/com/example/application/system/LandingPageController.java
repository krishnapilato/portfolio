package com.example.application.system;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class LandingPageController {

    @GetMapping("/")
    String index() {
        return "index";
    }
}
