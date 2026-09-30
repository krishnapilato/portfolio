(function () {
    const Motion = window.Motion || {
        mode: 'soft',
        cinematic: false,
        expired: true,
        locked: true,
        remaining: 0,
        release() {},
        lock() {},
        cancel() {},
        onChange() {},
        whenReady(fn) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fn, { once: true });
            } else {
                window.setTimeout(fn, 0);
            }
        },
        isTweening() {
            return false;
        },
        tween(key, from, to, seconds, draw, done) {
            draw(to);
            if (done) {
                done();
            }
        }
    };
    let G = null;
    const body = document.body;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const has = (name) => Boolean(G && window[name]);
    const ease = (name, fallback) => (has('CustomEase') ? name : fallback);

    const number = (digits) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    const n0 = number(0);
    const n1 = number(1);
    const n2 = number(2);
    const MIB = 1048576;
    const GIB = 1073741824;
    const two = (value) => String(Math.floor(value)).padStart(2, '0');

    const formats = {
        integer: (v) => [n0.format(Math.round(v)), ''],
        bytes: (v) => (v >= GIB ? [n2.format(v / GIB), 'GiB'] : [n0.format(v / MIB), 'MiB']),
        percent: (v) => [n1.format(v * 100), '%'],
        percent0: (v) => [n0.format(v * 100), '%'],
        percent2: (v) => [n2.format(v * 100), '%'],
        ms: (v) => [n1.format(v), 'ms'],
        rate: (v) => [(v >= 100 ? n0 : v >= 10 ? n1 : n2).format(v), 'req/s'],
        duration: (v) => {
            const total = Math.max(0, Math.floor(v));
            const days = Math.floor(total / 86400);
            const clock = `${two((total % 86400) / 3600)}:${two((total % 3600) / 60)}:${two(total % 60)}`;
            return [days ? `${days}d ${clock}` : clock, ''];
        }
    };

    const clock = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const shortClock = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    const stamp = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    const words = { UP: 'Operational', DOWN: 'Down', OUT_OF_SERVICE: 'Out of service', UNKNOWN: 'Unknown' };
    const shortState = (state) => (state === 'OUT_OF_SERVICE' ? 'OOS' : state);
    const longState = (state) => String(state).toLowerCase().replace(/_/g, ' ');
    const finite = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
    const read = (element) => {
        const raw = element.dataset.value;
        if (raw === undefined || raw === '') {
            return null;
        }
        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
    };

    const shown = new WeakMap();
    const latest = new WeakMap();
    const latestOf = (element) => (latest.has(element) ? latest.get(element) : read(element));
    let holding = false;

    const paint = (element, value) => {
        const format = formats[element.dataset.format];
        const [text, unit] = value === null || !Number.isFinite(value) || !format ? ['—', ''] : format(value);
        const figure = $('[data-n]', element);
        if (figure) {
            figure.textContent = text;
            const suffix = $('[data-u]', element);
            if (suffix) {
                suffix.textContent = unit;
            }
        } else {
            element.textContent = unit === '%' ? `${text}%` : unit ? `${text} ${unit}` : text;
        }
        shown.set(element, value);
    };

    const flash = (element) => {
        const target = element.classList.contains('num') ? element : element.closest('.num');
        if (!target || !Motion.cinematic) {
            return;
        }
        target.classList.add('is-flash');
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => target.classList.remove('is-flash')));
    };

    const show = (element, value, seconds, highlight) => {
        latest.set(element, value);
        if (holding) {
            return;
        }
        const previous = shown.has(element) ? shown.get(element) : null;
        if (previous === value && !Motion.isTweening(element)) {
            return;
        }
        if (previous === null || value === null) {
            Motion.tween(element, value, value, 0, (v) => paint(element, v));
            return;
        }
        if (highlight && previous !== value) {
            flash(element);
        }
        Motion.tween(element, previous, value, seconds, (v) => paint(element, v));
    };

    const current = new WeakMap();
    const latestFill = new WeakMap();
    const fillName = (element) => element.dataset.var || '--fill';
    const drawFill = (element, value) => {
        current.set(element, value);
        element.style.setProperty(fillName(element), value.toFixed(4));
    };
    const fill = (element, value, seconds) => {
        const target = fillName(element) === '--fill' ? Math.max(0, Math.min(1, value ?? 0)) : Math.max(0, value ?? 0);
        latestFill.set(element, target);
        if (holding) {
            return;
        }
        const previous = current.has(element) ? current.get(element) : target;
        Motion.tween(element, previous, target, seconds, (v) => drawFill(element, v));
    };

    const group = (elements, attribute) => elements.reduce((map, element) => {
        const key = element.dataset[attribute];
        map.set(key, [...(map.get(key) || []), element]);
        return map;
    }, new Map());

    const bound = $$('[data-bind][data-format]');
    const fills = $$('[data-fill]');
    const byKey = group(bound, 'bind');
    const fillsByKey = group(fills, 'fill');
    const ticking = bound.filter((element) => element.hasAttribute('data-tick'));

    const statusEls = $$('[data-status], [data-status-dot], [data-status-orb]');
    const statusLabels = $$('[data-status-label]');
    const statusWords = $$('[data-status-word]');
    const announcer = $('[data-announcer]');
    const captured = $('[data-captured]');
    const started = $('[data-started]');
    const stream = $('[data-stream]');
    const streamLabel = $('[data-stream-label]');
    const pause = $('[data-pause]');
    const checks = $('[data-checks]');
    const checksEmpty = $('[data-checks-empty]');
    const checkTemplate = $('[data-check-template]');
    const beats = $('[data-beats]');
    const segments = $('[data-segments]');
    const rateNote = $('[data-rate-note]');
    const mailNote = $('[data-mail-note]');
    const spark = $('[data-spark]');
    const sparkLine = $('[data-spark-line]');
    const sparkArea = $('[data-spark-area]');
    const sparkAvg = $('[data-spark-avg]');
    const sparkDot = $('[data-spark-dot]');
    const texts = group($$('[data-text]'), 'text');

    const CAPACITY = 40;
    const SPARK = 30;
    const history = [];
    let average = spark ? Number(spark.dataset.average) || 0 : 0;
    let lastStatus = body.dataset.health || null;
    let previous = {
        captured: Date.parse(body.dataset.capturedAt || ''),
        requests: Number(body.dataset.requests),
        server: true
    };
    const uptime = { base: null, at: performance.now() };

    let scene = null;
    const transient = (make) => {
        const owner = scene;
        if (!G || !owner || owner.reverted || !Motion.cinematic) {
            return false;
        }
        const tween = make();
        owner.live.add(tween);
        tween.eventCallback('onComplete', () => owner.live.delete(tween));
        return true;
    };

    const sparkSvg = spark ? $('svg', spark) : null;
    const renderSpark = () => {
        if (!spark || !sparkSvg) {
            return;
        }
        const width = Math.max(120, Math.round(sparkSvg.getBoundingClientRect().width || 400));
        const height = 76;
        const pad = 8;
        sparkSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        $$('.spark__grid line', sparkSvg).forEach((line) => line.setAttribute('x2', String(width)));
        const top = Math.max(average * 1.8, ...history, 0.05) * 1.12;
        const y = (value) => height - pad - (Math.max(0, value) / top) * (height - pad * 2);
        const clampY = (value) => Math.max(pad / 2, Math.min(height, value));
        const step = width / (SPARK - 1);
        const series = [...Array(Math.max(0, SPARK - history.length)).fill(average), ...history].slice(-SPARK);
        const points = series.map((value, index) => [index * step, y(value)]);
        sparkAvg.setAttribute('d', `M0 ${y(average).toFixed(2)} H${width}`);
        let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
        for (let i = 0; i < points.length - 1; i += 1) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clampY(p1[1] + (p2[1] - p0[1]) / 6)];
            const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clampY(p2[1] - (p3[1] - p1[1]) / 6)];
            d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
        }
        sparkLine.setAttribute('d', d);
        sparkArea.setAttribute('d', `${d} L${width} ${height} L0 ${height} Z`);
        if (sparkDot) {
            sparkDot.hidden = history.length === 0;
            if (history.length) {
                const [x, yy] = points[points.length - 1];
                sparkDot.style.left = `${x}px`;
                sparkDot.style.top = `${yy}px`;
            }
        }
    };

    const setStream = (state, label) => {
        if (!stream) {
            return;
        }
        stream.dataset.state = state;
        if (streamLabel) {
            streamLabel.textContent = label || state;
        }
    };

    const setStatus = (status) => {
        if (!status) {
            return;
        }
        body.dataset.health = status;
        statusEls.forEach((element) => {
            element.dataset.state = status;
        });
        statusLabels.forEach((element) => {
            element.textContent = status;
        });
        statusWords.forEach((element) => {
            element.textContent = words[status] || status;
        });
        if (lastStatus !== null && status !== lastStatus && announcer) {
            announcer.textContent = `Service status changed to ${words[status] || status}.`;
        }
        lastStatus = status;
    };

    const fadeIn = (element) => {
        if (transient(() => G.from(element, { autoAlpha: 0, y: 6, duration: 0.5, ease: 'power3.out' }))) {
            return;
        }
        if (typeof element.animate === 'function') {
            element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
        }
    };

    const renderChecks = (components) => {
        if (!checks || !checkTemplate) {
            return;
        }
        const entries = Object.entries(components || {}).sort(([a], [b]) => a.localeCompare(b));
        const existing = new Map($$('[data-component]', checks).map((item) => [item.dataset.component, item]));
        entries.forEach(([name, state], index) => {
            let item = existing.get(name);
            existing.delete(name);
            if (!item) {
                item = checkTemplate.content.firstElementChild.cloneNode(true);
                item.dataset.component = name;
                $('[data-check-name]', item).textContent = name;
                checks.insertBefore(item, checks.children[index] || null);
                fadeIn(item);
            } else if (checks.children[index] !== item) {
                checks.insertBefore(item, checks.children[index] || null);
            }
            if (item.dataset.state !== state) {
                item.dataset.state = state;
                const label = $('[data-check-state]', item);
                label.title = state;
                $('[data-check-short]', item).textContent = shortState(state);
                $('[data-check-long]', item).textContent = longState(state);
            }
        });
        existing.forEach((item) => item.remove());
        if (checksEmpty) {
            checksEmpty.hidden = entries.length > 0;
        }
    };

    const pushBeat = (status) => {
        if (!beats) {
            return;
        }
        const beat = document.createElement('li');
        beat.className = 'beat';
        beat.dataset.state = status || 'UNKNOWN';
        beats.appendChild(beat);
        while (beats.children.length > CAPACITY) {
            beats.firstElementChild.remove();
        }
        if (transient(() => G.from(beat, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6, ease: 'back.out(2.2)' }))) {
            return;
        }
        if (typeof beat.animate === 'function') {
            beat.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
        }
    };

    const setText = (key, value) => {
        (texts.get(key) || []).forEach((element) => {
            if (element.textContent !== value) {
                element.textContent = value;
            }
        });
    };

    const localize = (capturedAt, uptimeSeconds) => {
        const at = Date.parse(capturedAt);
        if (captured && Number.isFinite(at)) {
            captured.textContent = clock.format(at);
            captured.dateTime = new Date(at).toISOString();
        }
        if (started && Number.isFinite(at) && uptimeSeconds !== null) {
            const since = new Date(at - uptimeSeconds * 1000);
            const today = new Date().toDateString() === since.toDateString();
            started.textContent = `Since ${today ? shortClock.format(since) : stamp.format(since)} local time`;
        }
    };

    const localizeBuilt = () => {
        (texts.get('built') || []).forEach((element) => {
            const value = Date.parse(element.getAttribute('datetime') || '');
            if (Number.isFinite(value)) {
                element.textContent = stamp.format(value);
            }
        });
    };

    const derive = (snapshot) => {
        const runtime = snapshot.runtime || {};
        const traffic = snapshot.traffic || {};
        const domain = snapshot.domain || {};
        const cpu = finite(runtime.cpu);
        const heapUsed = finite(runtime.heapUsed);
        const heapMax = finite(runtime.heapMax) > 0 ? runtime.heapMax : null;
        const up = finite(runtime.uptimeSeconds);
        const requests = finite(traffic.requests);
        const errors = finite(traffic.serverErrors);
        const users = finite(domain.users);
        const active = finite(domain.activeUsers);
        const components = Object.values(snapshot.components || {});
        const at = Date.parse(snapshot.capturedAt);
        let rate = null;
        let interval = null;
        if (requests !== null && Number.isFinite(previous.requests) && Number.isFinite(previous.captured) && Number.isFinite(at)) {
            const seconds = (at - previous.captured) / 1000;
            if (seconds > 0.5 && requests >= previous.requests) {
                rate = (requests - previous.requests) / seconds;
                interval = seconds;
            }
        }
        const baseline = previous.server;
        previous = { captured: at, requests, server: false };
        if (baseline) {
            rate = null;
        }
        return {
            rate,
            interval,
            average: up > 0 && requests !== null ? requests / up : null,
            values: {
                'runtime.cpu': cpu === null || cpu < 0 ? null : Math.min(cpu, 1),
                'runtime.threads': finite(runtime.threads),
                'runtime.processors': finite(runtime.processors),
                'runtime.heapUsed': heapUsed,
                'runtime.heapMax': heapMax,
                'heap.ratio': heapMax && heapUsed !== null ? heapUsed / heapMax : null,
                'runtime.uptimeSeconds': up,
                'traffic.requests': requests,
                'traffic.serverErrors': errors,
                'traffic.meanLatencyMs': finite(traffic.meanLatencyMs),
                'traffic.errorRate': requests ? (errors || 0) / requests : 0,
                'domain.users': users,
                'domain.activeUsers': active,
                'domain.activeRatio': users ? (active || 0) / users : 0,
                'domain.mailSent': finite(domain.mailSent),
                'domain.mailPending': finite(domain.mailPending),
                'domain.mailFailed': finite(domain.mailFailed),
                'health.passing': components.filter((state) => state === 'UP').length,
                'health.total': components.length
            }
        };
    };

    const apply = (snapshot) => {
        if (!snapshot || typeof snapshot !== 'object') {
            return;
        }
        const next = derive(snapshot);
        const seconds = Motion.cinematic ? 0.9 : 0.5;
        if (next.rate !== null) {
            next.values['traffic.rate'] = next.rate;
            history.push(next.rate);
            while (history.length > SPARK) {
                history.shift();
            }
            if (rateNote && next.interval !== null) {
                rateNote.textContent = `last ${n0.format(Math.max(1, Math.round(next.interval)))} s`;
            }
        }
        if (next.average !== null) {
            average = next.average;
        }
        Object.entries(next.values).forEach(([key, value]) => {
            (byKey.get(key) || []).forEach((element) => {
                if (element.hasAttribute('data-tick')) {
                    latest.set(element, value);
                    return;
                }
                show(element, value, seconds, true);
            });
            (fillsByKey.get(key) || []).forEach((element) => fill(element, value, seconds));
        });
        if (next.values['runtime.uptimeSeconds'] !== null) {
            uptime.base = next.values['runtime.uptimeSeconds'];
            uptime.at = performance.now();
        }
        if (segments) {
            const total = ['domain.mailSent', 'domain.mailPending', 'domain.mailFailed']
                .reduce((sum, key) => sum + (next.values[key] || 0), 0);
            segments.classList.toggle('is-empty', total === 0);
            if (mailNote) {
                mailNote.textContent = total === 0
                    ? 'Outbox empty, nothing waiting to send'
                    : `${n0.format(total)} messages through the outbox`;
            }
        }
        setStatus(snapshot.status);
        renderChecks(snapshot.components);
        pushBeat(snapshot.status);
        renderSpark();
        const build = snapshot.build || {};
        const runtime = snapshot.runtime || {};
        if (build.version) {
            setText('version', `v${build.version}`);
        }
        setText('channel', build.commit ? 'release' : 'local');
        setText('commit', build.commit ? String(build.commit).slice(0, 7) : 'local build');
        if (runtime.java) {
            setText('java', runtime.java);
        }
        if (runtime.vendor) {
            setText('vendor', runtime.vendor);
        }
        localize(snapshot.capturedAt, next.values['runtime.uptimeSeconds']);
    };

    const tick = () => {
        if (uptime.base === null) {
            return;
        }
        const value = uptime.base + (performance.now() - uptime.at) / 1000;
        ticking.forEach((element) => {
            if (!Motion.isTweening(element)) {
                paint(element, value);
            }
        });
    };

    const hold = () => {
        holding = true;
        bound.forEach((element) => {
            if (element.hasAttribute('data-static')) {
                return;
            }
            Motion.cancel(element);
            paint(element, latestOf(element) === null ? null : 0);
        });
        fills.forEach((element) => {
            Motion.cancel(element);
            drawFill(element, 0);
        });
    };

    const countUp = (seconds) => {
        holding = false;
        bound.forEach((element) => {
            if (element.hasAttribute('data-tick') && uptime.base !== null) {
                const target = uptime.base + (performance.now() - uptime.at) / 1000 + seconds;
                paint(element, 0);
                Motion.tween(element, 0, target, seconds, (v) => paint(element, v));
                return;
            }
            const target = latestOf(element);
            if (target === null || element.hasAttribute('data-static')) {
                Motion.cancel(element);
                paint(element, target);
                return;
            }
            paint(element, 0);
            Motion.tween(element, 0, target, seconds, (v) => paint(element, v));
        });
        fills.forEach((element) => {
            const target = latestFill.has(element) ? latestFill.get(element) : 0;
            drawFill(element, 0);
            Motion.tween(element, 0, target, seconds, (v) => drawFill(element, v));
        });
    };

    const settle = () => {
        holding = false;
        bound.forEach((element) => {
            Motion.cancel(element);
            if (!element.hasAttribute('data-tick') || uptime.base === null) {
                paint(element, latestOf(element));
            }
        });
        fills.forEach((element) => {
            Motion.cancel(element);
            drawFill(element, latestFill.has(element) ? latestFill.get(element) : 0);
        });
        tick();
    };

    const primeUptime = () => {
        const element = ticking[0];
        if (element) {
            uptime.base = read(element);
            uptime.at = performance.now();
        }
    };

    let source = null;
    let poller = 0;
    let polls = 0;
    let failures = 0;
    let paused = false;
    let watchdog = 0;

    const arm = () => {
        window.clearTimeout(watchdog);
        watchdog = window.setTimeout(() => setStream('offline', 'stale'), 10000);
    };

    const stopPolling = () => {
        if (poller) {
            window.clearInterval(poller);
            poller = 0;
        }
    };

    let connect = () => {};

    const poll = () => {
        const url = body.dataset.snapshotUrl;
        if (!url) {
            return;
        }
        stopPolling();
        polls = 0;
        setStream('polling');
        const run = () => window.fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
            .then((snapshot) => {
                if (paused || !poller) {
                    return;
                }
                setStream('polling');
                apply(snapshot);
                polls += 1;
                if (polls % 12 === 0 && typeof window.EventSource === 'function') {
                    stopPolling();
                    failures = 0;
                    connect();
                }
            })
            .catch(() => {
                if (poller) {
                    setStream('offline');
                }
            });
        poller = window.setInterval(run, 5000);
        run();
    };

    connect = () => {
        const url = body.dataset.pulseUrl;
        if (!url || typeof window.EventSource !== 'function') {
            poll();
            return;
        }
        setStream('connecting');
        source = new window.EventSource(url);
        source.addEventListener('open', () => {
            failures = 0;
            setStream('live');
            arm();
        });
        source.addEventListener('snapshot', (event) => {
            failures = 0;
            setStream('live');
            arm();
            let snapshot = null;
            try {
                snapshot = JSON.parse(event.data);
            } catch {
                snapshot = null;
            }
            apply(snapshot);
        });
        source.addEventListener('error', () => {
            failures += 1;
            if (!source) {
                return;
            }
            if (source.readyState === window.EventSource.CLOSED || failures >= 3) {
                window.clearTimeout(watchdog);
                source.close();
                source = null;
                poll();
            } else {
                setStream('connecting', 'reconnecting');
            }
        });
    };

    const disconnect = () => {
        window.clearTimeout(watchdog);
        if (source) {
            source.close();
            source = null;
        }
        stopPolling();
    };

    if (pause) {
        const label = $('[data-pause-label]', pause);
        const icon = $('[data-pause-icon]', pause);
        pause.addEventListener('click', () => {
            paused = !paused;
            label.textContent = paused ? 'Resume updates' : 'Pause updates';
            icon.className = paused ? 'ti ti-player-play' : 'ti ti-player-pause';
            if (paused) {
                disconnect();
                setStream('paused');
            } else {
                failures = 0;
                connect();
            }
        });
    }

    const spotlight = (container) => {
        const items = $$('.surface', container);
        let frame = 0;
        let point = null;
        container.addEventListener('pointermove', (event) => {
            point = event;
            if (frame) {
                return;
            }
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                items.forEach((item) => {
                    const box = item.getBoundingClientRect();
                    item.style.setProperty('--mx', `${point.clientX - box.left}px`);
                    item.style.setProperty('--my', `${point.clientY - box.top}px`);
                });
            });
        });
    };

    const finePointer = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const nav = $('[data-nav]');
    const badge = $('[data-badge]');
    const title = $('[data-title]');
    const lead = $('[data-lead]');
    const leadVisual = $('[data-lead-visual]');
    const leadText = leadVisual ? leadVisual.textContent.trim() : '';
    const actions = $('[data-actions]');
    const sectionHead = $('[data-section-head]');
    const cards = $$('[data-card]');
    const glows = $$('[data-glow]');
    const beam = $('[data-beam]');
    const grid = $('[data-grid]');
    const marquee = $('[data-marquee]');
    const track = $('[data-marquee-track]');
    const reveals = $$('[data-reveal]');

    const cinematic = (first) => {
        const cleanups = [];
        const ctx = G.context(() => {});
        const live = new Set();
        const scenario = { ctx, live, reverted: false };
        const later = (fn) => (...args) => {
            if (!scenario.reverted) {
                ctx.add(() => fn(...args));
            }
        };
        scenario.revert = () => {
            scenario.reverted = true;
            cleanups.splice(0).forEach((fn) => fn());
            live.forEach((tween) => tween.revert());
            live.clear();
            ctx.revert();
            if (title) {
                title.classList.remove('is-split');
            }
        };

        const build = () => {
            const replay = !(first && Motion.expired);
            const tl = G.timeline({ defaults: { ease: 'expo.out' } });
            const inView = (element) => element.getBoundingClientRect().top < window.innerHeight * 0.92;
            const visibleCards = cards.filter(inView);
            const laterCards = cards.filter((card) => !inView(card));

            if (finePointer) {
                G.set(cards, { transformPerspective: 1000 });
            }

            if (replay) {
                hold();
                if (first && nav) {
                    tl.from(nav, { yPercent: -100, autoAlpha: 0, duration: 0.9 }, 0);
                }
                tl.from(glows, { autoAlpha: 0, scale: 0.55, duration: 2.4, stagger: 0.25, ease: 'power2.out' }, 0);
                if (beam) {
                    tl.from(beam, { scaleX: 0, autoAlpha: 0, duration: 1.6, ease: 'expo.inOut' }, 0.1);
                }
                if (grid) {
                    tl.from(grid, { autoAlpha: 0, duration: 1.8, ease: 'power1.out' }, 0.1);
                }
                if (badge) {
                    tl.from(badge, { autoAlpha: 0, y: 14, filter: 'blur(8px)', duration: 0.9, clearProps: 'filter' }, 0.15);
                }
                if (title) {
                    if (has('SplitText')) {
                        const split = window.SplitText.create(title, { type: 'lines,chars', mask: 'lines', charsClass: 'char', linesClass: 'line' });
                        title.classList.add('is-split');
                        tl.from(split.chars, { yPercent: 118, rotate: 7, duration: 1.25, stagger: 0.034, ease: ease('portfolio-rise', 'expo.out') }, 0.3);
                        tl.add(() => {
                            split.revert();
                            title.classList.remove('is-split');
                        }, 2.2);
                    } else {
                        tl.from(title, { autoAlpha: 0, y: 32, duration: 1.1 }, 0.3);
                    }
                    tl.fromTo(title, { '--sheen': '100%' }, { '--sheen': '0%', duration: 1.6, ease: 'power2.inOut' }, 2.25);
                }
                if (lead) {
                    tl.from(lead, { autoAlpha: 0, duration: 0.5 }, 0.7);
                    if (has('ScrambleTextPlugin') && leadVisual) {
                        leadVisual.textContent = '';
                        const pieces = [];
                        leadText.split(/(\s+)/).forEach((part) => {
                            if (!part) {
                                return;
                            }
                            if (/^\s+$/.test(part)) {
                                leadVisual.appendChild(document.createTextNode(' '));
                                return;
                            }
                            const word = document.createElement('span');
                            word.dataset.word = '';
                            word.textContent = part;
                            leadVisual.appendChild(word);
                            pieces.push(word);
                        });
                        pieces.forEach((word) => {
                            word.style.width = `${word.getBoundingClientRect().width}px`;
                        });
                        const restore = () => {
                            leadVisual.textContent = leadText;
                        };
                        cleanups.push(restore);
                        tl.to(pieces, {
                            duration: 0.8,
                            ease: 'none',
                            stagger: 0.04,
                            scrambleText: { text: '{original}', chars: 'lowerCase', speed: 0.9, revealDelay: 0.25 }
                        }, 0.7);
                        tl.add(restore);
                    }
                }
                if (actions) {
                    tl.from(actions.children, { autoAlpha: 0, y: 16, scale: 0.92, duration: 0.9, stagger: 0.08, ease: 'back.out(1.7)' }, 0.95);
                }
                if (stream) {
                    tl.from(stream, { autoAlpha: 0, y: 10, duration: 0.7 }, 1.1);
                }
                if (sectionHead) {
                    tl.from(sectionHead, { autoAlpha: 0, y: 18, duration: 0.8 }, 1.1);
                }
                if (visibleCards.length) {
                    tl.from(visibleCards, {
                        autoAlpha: 0,
                        y: 56,
                        scale: 0.95,
                        filter: 'blur(12px)',
                        duration: 1.2,
                        stagger: 0.08,
                        clearProps: 'filter'
                    }, 1.15);
                    tl.fromTo(visibleCards, { '--mx': '-15%', '--my': '-20%', '--glow': 1 }, {
                        '--mx': '115%',
                        '--my': '120%',
                        duration: 1.3,
                        stagger: 0.08,
                        ease: 'power2.inOut'
                    }, 1.25);
                    tl.to(visibleCards, {
                        '--glow': 0,
                        duration: 0.5,
                        stagger: 0.08,
                        onComplete: () => visibleCards.forEach((card) => card.style.removeProperty('--glow'))
                    }, 2.25);
                }
                tl.add(() => countUp(1.6), 1.2);
                const checkItems = $$('.check', checks || document);
                if (checkItems.length && checks && inView(checks)) {
                    tl.from(checkItems, { autoAlpha: 0, x: -10, duration: 0.6, stagger: 0.04 }, 1.45);
                }
                if (beats && inView(beats)) {
                    tl.from(beats.children, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6, stagger: { each: 0.012, from: 'end' }, ease: 'back.out(2)' }, 1.45);
                }
                if (sparkSvg && inView(spark)) {
                    const guides = [...$$('.spark__grid line', sparkSvg), sparkAvg];
                    tl.from(guides, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.2, stagger: 0.08, ease: 'power3.inOut' }, 1.5);
                    if (has('DrawSVGPlugin') && sparkLine.getAttribute('d')) {
                        tl.from(sparkLine, { drawSVG: '0%', duration: 1.4, ease: 'power2.inOut' }, 1.6);
                        tl.from(sparkArea, { autoAlpha: 0, duration: 1.2 }, 1.9);
                    }
                    if (sparkDot && !sparkDot.hidden) {
                        tl.from(sparkDot, { autoAlpha: 0, scale: 0, duration: 0.6, ease: 'back.out(3)' }, 2.6);
                    }
                }
            }

            if (replay && has('ScrollTrigger')) {
                const hidden = [...laterCards, ...reveals];
                if (hidden.length) {
                    G.set(hidden, { opacity: 0, y: 40 });
                    window.ScrollTrigger.batch(hidden, {
                        start: 'clamp(top 92%)',
                        once: true,
                        onEnter: (batch) => G.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out', overwrite: true })
                    });
                    const reveal = later((event) => {
                        const target = hidden.find((element) => element.contains(event.target));
                        if (target) {
                            G.to(target, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
                        }
                    });
                    document.addEventListener('focusin', reveal);
                    cleanups.push(() => document.removeEventListener('focusin', reveal));
                }
            }

            glows.forEach((glow, index) => {
                G.to(glow, {
                    x: index ? -90 : 110,
                    y: index ? 60 : 40,
                    scale: index ? 1.12 : 1.06,
                    duration: index ? 11 : 9,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    delay: 2
                });
            });

            if (badge) {
                G.fromTo(badge, { '--angle': '200deg' }, { '--angle': '560deg', duration: 4.5, ease: 'none', repeat: -1 });
            }

            if (title) {
                G.fromTo(title, { '--sheen': '100%' }, {
                    '--sheen': '0%',
                    duration: 1.8,
                    ease: 'power2.inOut',
                    repeat: -1,
                    repeatDelay: 5.5,
                    delay: 7
                });
            }

            if (marquee && track) {
                const clones = Array.from(track.children).map((item) => {
                    const clone = item.cloneNode(true);
                    clone.setAttribute('aria-hidden', 'true');
                    track.appendChild(clone);
                    return clone;
                });
                marquee.classList.add('is-running');
                const loop = G.to(track, { xPercent: -50, duration: Math.max(28, track.scrollWidth / 55), ease: 'none', repeat: -1 });
                const slow = () => G.to(loop, { timeScale: 0.18, duration: 0.6, overwrite: true });
                const resume = () => G.to(loop, { timeScale: 1, duration: 0.6, overwrite: true });
                marquee.addEventListener('pointerenter', slow);
                marquee.addEventListener('pointerleave', resume);
                if (has('ScrollTrigger')) {
                    window.ScrollTrigger.create({
                        trigger: marquee,
                        start: 'top bottom',
                        end: 'bottom top',
                        onToggle: (self) => (self.isActive ? loop.play() : loop.pause())
                    });
                }
                cleanups.push(() => {
                    marquee.removeEventListener('pointerenter', slow);
                    marquee.removeEventListener('pointerleave', resume);
                    clones.forEach((clone) => clone.remove());
                    marquee.classList.remove('is-running');
                });
            }

            if (finePointer) {
                cards.forEach((card) => {
                    const rotateX = G.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
                    const rotateY = G.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
                    const lift = G.quickTo(card, 'y', { duration: 0.6, ease: 'power3' });
                    const move = (event) => {
                        const box = card.getBoundingClientRect();
                        const px = (event.clientX - box.left) / box.width - 0.5;
                        const py = (event.clientY - box.top) / box.height - 0.5;
                        rotateX(py * -4);
                        rotateY(px * 5);
                    };
                    const enter = () => lift(-4);
                    const leave = () => {
                        rotateX(0);
                        rotateY(0);
                        lift(0);
                    };
                    card.addEventListener('pointermove', move);
                    card.addEventListener('pointerenter', enter);
                    card.addEventListener('pointerleave', leave);
                    cleanups.push(() => {
                        card.removeEventListener('pointermove', move);
                        card.removeEventListener('pointerenter', enter);
                        card.removeEventListener('pointerleave', leave);
                    });
                });

                const magnetize = (element, strength, limit) => {
                    const toX = G.quickTo(element, 'x', { duration: 0.6, ease: 'power3' });
                    const toY = G.quickTo(element, 'y', { duration: 0.6, ease: 'power3' });
                    const clamp = G.utils.clamp(-limit, limit);
                    const move = (event) => {
                        const box = element.getBoundingClientRect();
                        toX(clamp((event.clientX - (box.left + box.width / 2)) * strength));
                        toY(clamp((event.clientY - (box.top + box.height / 2)) * strength));
                    };
                    const leave = () => {
                        toX(0);
                        toY(0);
                    };
                    element.addEventListener('pointermove', move);
                    element.addEventListener('pointerleave', leave);
                    cleanups.push(() => {
                        element.removeEventListener('pointermove', move);
                        element.removeEventListener('pointerleave', leave);
                    });
                };
                $$('[data-magnetic]').forEach((element) => magnetize(element, 0.22, 10));
                $$('[data-magnetic-card]').forEach((element) => magnetize(element, 0.05, 8));
            }
        };

        const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        const budget = Math.max(0, Math.min(1200, Motion.remaining - 200));
        const wait = first ? Promise.race([fonts, new Promise((resolve) => window.setTimeout(resolve, budget))]) : Promise.resolve();
        const fail = () => {
            if (scene === scenario) {
                Motion.lock('soft', 'Cinematic motion stopped after an error, so soft motion is used instead.');
            }
        };
        wait.then(later(() => {
            try {
                build();
            } catch {
                window.setTimeout(fail, 0);
            } finally {
                Motion.release();
            }
        })).catch(fail);
        return scenario;
    };

    const soft = (first) => {
        if (first && !Motion.expired) {
            countUp(0.8);
        }
        Motion.release();
    };

    let staged = null;
    let booted = false;

    const stage = (mode, first) => {
        if (scene) {
            scene.revert();
            scene = null;
        }
        if (!first) {
            settle();
        }
        if (mode === 'cinematic') {
            scene = cinematic(first);
        } else {
            soft(first);
        }
        renderSpark();
    };

    const refresh = () => {
        let next = 'soft';
        if (Motion.mode === 'cinematic' && !Motion.locked) {
            if (!booted) {
                return;
            }
            next = G ? 'cinematic' : 'soft';
        }
        if (next === staged) {
            return;
        }
        const first = staged === null;
        staged = next;
        stage(next, first);
    };

    const boot = () => {
        booted = true;
        G = window.gsap || null;
        if (G) {
            const plugins = ['SplitText', 'ScrambleTextPlugin', 'CustomEase', 'ScrollTrigger', 'DrawSVGPlugin']
                .map((name) => window[name])
                .filter(Boolean);
            if (plugins.length) {
                G.registerPlugin(...plugins);
            }
            if (has('CustomEase')) {
                window.CustomEase.create('portfolio-rise', 'M0,0 C0.12,0.72 0.2,1 1,1');
            }
        } else {
            Motion.lock('soft', 'Animations are unavailable because the animation library did not load.');
        }
        refresh();
    };

    bound.forEach((element) => {
        const value = read(element);
        shown.set(element, value);
        latest.set(element, value);
    });
    fills.forEach((element) => {
        const value = read(element) ?? 0;
        current.set(element, value);
        latestFill.set(element, value);
    });
    primeUptime();
    localize(body.dataset.capturedAt, uptime.base);
    localizeBuilt();
    renderSpark();
    if (sparkSvg && typeof window.ResizeObserver === 'function') {
        new window.ResizeObserver(() => renderSpark()).observe(sparkSvg);
    }
    $$('[data-spotlight]').forEach(spotlight);
    Motion.onChange(refresh);
    refresh();
    Motion.whenReady(boot);
    window.setInterval(() => {
        if (!paused) {
            tick();
        }
    }, 1000);
    connect();
})();
