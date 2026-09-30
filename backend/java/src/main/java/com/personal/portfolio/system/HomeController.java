package com.personal.portfolio.system;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Controller
@RequiredArgsConstructor
class HomeController {

    private final SnapshotService snapshots;
    private final PulseBroadcaster pulse;

    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("snapshot", snapshots.current());
        return "home";
    }

    @ResponseBody
    @GetMapping(path = "/system/snapshot", produces = MediaType.APPLICATION_JSON_VALUE)
    SystemSnapshot snapshot() {
        return snapshots.current();
    }

    @ResponseBody
    @GetMapping(path = "/system/pulse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter pulse() {
        return pulse.subscribe();
    }
}
