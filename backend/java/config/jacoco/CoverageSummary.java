import module java.base;
import module java.xml;

import org.w3c.dom.Element;

record Counter(String type, long covered, long missed) {

    double ratio() {
        var total = covered + missed;
        return total == 0 ? 1 : (double) covered / total;
    }
}

void main(String... args) throws Exception {
    var report = Path.of(args[0]);
    var minimum = Double.parseDouble(args[1]);
    if (Files.notExists(report)) {
        IO.println("[coverage] no JaCoCo report at " + report + " (tests skipped?)");
        return;
    }
    var factory = DocumentBuilderFactory.newInstance();
    factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
    var root = factory.newDocumentBuilder().parse(report.toFile()).getDocumentElement();
    var counters = root.getChildNodes();
    var byType = new LinkedHashMap<String, Counter>();
    for (var i = 0; i < counters.getLength(); i++) {
        if (counters.item(i) instanceof Element counter && counter.getTagName().equals("counter")) {
            var type = counter.getAttribute("type");
            byType.put(type, new Counter(type, Long.parseLong(counter.getAttribute("covered")),
                    Long.parseLong(counter.getAttribute("missed"))));
        }
    }
    IO.println("[coverage] JaCoCo totals (gate: LINE, BRANCH, INSTRUCTION >= %.0f%%)".formatted(minimum * 100));
    Stream.of("INSTRUCTION", "BRANCH", "LINE", "METHOD", "CLASS")
            .map(byType::get)
            .filter(Objects::nonNull)
            .forEach(counter -> IO.println("[coverage]   %-12s %6.1f%%  %s  (%d of %d covered)".formatted(
                    counter.type(), counter.ratio() * 100, counter.ratio() >= minimum ? "PASS" : "FAIL",
                    counter.covered(), counter.covered() + counter.missed())));
}
