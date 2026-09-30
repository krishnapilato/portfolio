(function () {
    const KEY = 'portfolio.motion';
    const MODES = ['cinematic', 'soft'];
    const SAFETY_MS = 2500;
    const root = document.documentElement;
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const listeners = new Set();
    const queue = [];
    const running = new WeakMap();
    let released = false;
    let expired = false;
    let locked = false;
    let ready = document.readyState === 'complete';
    let calm = 0;

    const stored = () => {
        try {
            const value = window.localStorage.getItem(KEY);
            return MODES.includes(value) ? value : null;
        } catch {
            return null;
        }
    };

    const system = () => (media && media.matches ? 'soft' : 'cinematic');

    const painted = () => {
        try {
            return typeof performance.getEntriesByType === 'function'
                && performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint');
        } catch {
            return false;
        }
    };

    let mode = stored() || system();
    const late = painted();
    root.dataset.motion = mode;
    root.classList.add('js');

    const icons = () => {
        const probe = document.querySelector('.ti');
        if (!probe) {
            return;
        }
        const family = window.getComputedStyle(probe).fontFamily || '';
        root.classList.toggle('no-icons', !/tabler/i.test(family));
    };

    const softIntro = () => {
        document.querySelectorAll('[data-intro]').forEach((element, index) => {
            element.style.setProperty('--i', String(Math.min(index, 10)));
        });
        root.classList.add('is-soft-intro');
        window.clearTimeout(calm);
        calm = window.setTimeout(() => root.classList.remove('is-soft-intro'), 900);
    };

    const release = () => {
        if (released) {
            return;
        }
        released = true;
        const hidden = root.classList.contains('is-intro');
        root.classList.remove('is-intro');
        if (hidden && mode === 'soft' && !expired) {
            softIntro();
        }
    };

    if (late) {
        released = true;
        expired = true;
    } else if (mode === 'cinematic') {
        root.classList.add('is-intro');
        window.setTimeout(() => {
            if (!released) {
                expired = true;
                release();
            }
        }, Math.max(0, SAFETY_MS - performance.now()));
    } else {
        released = true;
    }

    const sync = () => {
        const cinematic = mode === 'cinematic';
        document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(cinematic && !locked));
            if (locked) {
                button.setAttribute('aria-disabled', 'true');
            }
        });
        document.querySelectorAll('[data-motion-state]').forEach((element) => {
            element.textContent = locked ? 'Unavailable' : (cinematic ? 'On' : 'Off');
        });
    };

    const commit = (next) => {
        if (next === mode) {
            sync();
            return;
        }
        const previous = mode;
        mode = next;
        root.dataset.motion = next;
        if (next === 'soft') {
            root.classList.remove('is-soft-intro');
        }
        sync();
        listeners.forEach((listener) => listener(next, previous));
    };

    const set = (next, persist = true) => {
        if (locked || !MODES.includes(next)) {
            return;
        }
        if (persist) {
            try {
                window.localStorage.setItem(KEY, next);
            } catch {
                persist = false;
            }
        }
        commit(next);
    };

    const toggle = () => set(mode === 'cinematic' ? 'soft' : 'cinematic');

    const lock = (next, reason) => {
        if (!MODES.includes(next)) {
            return;
        }
        locked = true;
        document.querySelectorAll('[data-motion-system]').forEach((element) => {
            element.textContent = reason;
        });
        commit(next);
        release();
        sync();
    };

    const cancel = (key) => {
        const active = running.get(key);
        if (active) {
            window.cancelAnimationFrame(active.frame);
            running.delete(key);
        }
    };

    const tween = (key, from, to, seconds, draw, done) => {
        cancel(key);
        const finite = Number.isFinite(from) && Number.isFinite(to);
        if (!finite || from === to || !(seconds > 0)) {
            draw(to);
            if (done) {
                done();
            }
            return;
        }
        const start = performance.now();
        const state = { frame: 0 };
        const step = (now) => {
            const progress = Math.max(0, Math.min(1, (now - start) / (seconds * 1000)));
            const eased = 1 - Math.pow(1 - progress, 4);
            draw(from + (to - from) * eased);
            if (progress < 1) {
                state.frame = window.requestAnimationFrame(step);
                return;
            }
            running.delete(key);
            if (done) {
                done();
            }
        };
        running.set(key, state);
        state.frame = window.requestAnimationFrame(step);
    };

    const flush = () => {
        if (ready) {
            return;
        }
        ready = true;
        icons();
        queue.splice(0).forEach((fn) => fn());
    };

    const whenReady = (fn) => {
        if (ready) {
            window.setTimeout(fn, 0);
            return;
        }
        queue.push(fn);
    };

    const bind = () => {
        document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                if (!locked) {
                    toggle();
                }
            });
        });
        document.querySelectorAll('[data-tooltip-host]').forEach((host) => {
            const quiet = () => host.classList.remove('is-quiet');
            host.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    host.classList.add('is-quiet');
                }
            });
            host.addEventListener('pointerleave', quiet);
            host.addEventListener('focusout', quiet);
        });
        if (!locked) {
            document.querySelectorAll('[data-motion-system]').forEach((element) => {
                element.textContent = media && media.matches
                    ? 'Your system asks for reduced motion, so soft is the default here.'
                    : 'Your system allows motion, so cinematic is the default here.';
            });
        }
        icons();
        sync();
    };

    if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', () => {
            if (!stored()) {
                set(system(), false);
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === KEY) {
            set(stored() || system(), false);
        }
    });

    const start = () => {
        if (mode === 'soft' && !late) {
            softIntro();
        }
        bind();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
    document.addEventListener('DOMContentLoaded', flush, { once: true });
    window.addEventListener('load', flush, { once: true });

    window.Motion = Object.freeze({
        get mode() {
            return mode;
        },
        get cinematic() {
            return mode === 'cinematic';
        },
        get expired() {
            return expired;
        },
        get locked() {
            return locked;
        },
        get remaining() {
            return released ? 0 : Math.max(0, SAFETY_MS - performance.now());
        },
        key: KEY,
        set,
        toggle,
        lock,
        release,
        tween,
        cancel,
        whenReady,
        isTweening: (key) => running.has(key),
        onChange(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    });
})();
