package com.example.mail.newsletter;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/// Opening a link only shows a button: mail scanners follow links on their own, and must not confirm or
/// unsubscribe anybody. The button, or a mail client's one-click unsubscribe, posts back to the same address.
@Controller
@RequestMapping("/subscriptions/{action:confirm|unsubscribe}")
@RequiredArgsConstructor
class SubscriptionPage {

    private final Newsletter newsletter;

    @GetMapping
    String ask(@PathVariable String action, @RequestParam String token, Model model) {
        model.addAttribute("action", action);
        model.addAttribute("token", token);
        return "subscription";
    }

    @PostMapping
    String act(@PathVariable String action, @RequestParam String token, Model model) {
        model.addAttribute("action", action);
        model.addAttribute("done", apply(action, token));
        return "subscription";
    }

    @PostMapping(params = "List-Unsubscribe")
    @ResponseBody
    ResponseEntity<Void> oneClick(@PathVariable String action, @RequestParam String token) {
        return apply(action, token) ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    private boolean apply(String action, String token) {
        return "confirm".equals(action) ? newsletter.confirm(token) : newsletter.unsubscribe(token);
    }
}
