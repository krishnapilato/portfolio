(function () {
    const Motion = window.Motion || {
        mode: 'soft',
        cinematic: false,
        expired: true,
        locked: true,
        remaining: 0,
        release() {},
        lock() {},
        onChange() {},
        whenReady(fn) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fn, { once: true });
            } else {
                window.setTimeout(fn, 0);
            }
        }
    };
    let G = null;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const has = (name) => Boolean(G && window[name]);

    const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' });
    $$('[data-local-time]').forEach((element) => {
        const value = Date.parse(element.getAttribute('datetime') || '');
        if (Number.isFinite(value)) {
            element.title = new Date(value).toISOString();
            element.textContent = when.format(value);
        }
    });

    const announce = $('[data-copy-status]');
    const legacyCopy = (source) => {
        if (!source) {
            return false;
        }
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(source);
        selection.removeAllRanges();
        selection.addRange(range);
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch {
            copied = false;
        }
        if (copied) {
            selection.removeAllRanges();
        }
        return copied;
    };

    $$('[data-copy]').forEach((button) => {
        const label = $('[data-copy-label]', button);
        const icon = $('[data-copy-icon]', button);
        const source = button.dataset.copySource ? $(button.dataset.copySource) : null;
        let timer = 0;
        const reset = () => {
            delete button.dataset.state;
            label.textContent = 'Copy';
            icon.className = 'ti ti-copy';
        };
        button.addEventListener('click', async () => {
            const value = button.dataset.copyValue || (source ? source.textContent.trim() : '');
            let copied = false;
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(value);
                    copied = true;
                } catch {
                    copied = false;
                }
            }
            if (!copied) {
                copied = legacyCopy(source);
            }
            button.dataset.state = copied ? 'copied' : 'failed';
            label.textContent = copied ? 'Copied' : 'Press Ctrl+C';
            icon.className = copied ? 'ti ti-check' : 'ti ti-alert-triangle';
            if (announce) {
                announce.textContent = copied
                    ? 'Request ID copied to the clipboard.'
                    : 'Copying failed. The request ID is selected, press Control and C to copy it.';
            }
            window.clearTimeout(timer);
            timer = window.setTimeout(reset, 2200);
        });
    });

    $$('.surface').forEach((surface) => {
        let frame = 0;
        let point = null;
        surface.addEventListener('pointermove', (event) => {
            point = event;
            if (frame) {
                return;
            }
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                const box = surface.getBoundingClientRect();
                surface.style.setProperty('--mx', `${point.clientX - box.left}px`);
                surface.style.setProperty('--my', `${point.clientY - box.top}px`);
            });
        });
        surface.addEventListener('pointerenter', () => surface.style.setProperty('--glow', '1'));
        surface.addEventListener('pointerleave', () => surface.style.removeProperty('--glow'));
    });

    const finePointer = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const nav = $('[data-nav]');
    const code = $('[data-code-glyph]');
    const reason = $('[data-reason]');
    const title = $('[data-fault-title]');
    const scramble = $('[data-scramble]');
    const scrambleText = scramble ? scramble.textContent.trim() : '';
    const hint = $('[data-hint]');
    const actions = $('[data-actions]');
    const diag = $('[data-diag]');
    const footer = $('[data-footer]');
    const glows = $$('[data-glow]');
    const beam = $('[data-beam]');
    const grid = $('[data-grid]');

    let scene = null;

    const cinematic = (first) => {
        const cleanups = [];
        const ctx = G.context(() => {});
        const scenario = { ctx, reverted: false };
        const later = (fn) => (...args) => {
            if (!scenario.reverted) {
                ctx.add(() => fn(...args));
            }
        };
        scenario.revert = () => {
            scenario.reverted = true;
            cleanups.splice(0).forEach((fn) => fn());
            ctx.revert();
            if (code) {
                code.classList.remove('is-split');
            }
            if (scramble) {
                scramble.textContent = scrambleText;
            }
        };

        const random = (min, max) => G.utils.random(min, max);

        const build = () => {
            const replay = !(first && Motion.expired);
            const tl = G.timeline({ defaults: { ease: 'expo.out' } });
            let chars = [];
            if (code && has('SplitText')) {
                const split = window.SplitText.create(code, { type: 'chars', charsClass: 'char' });
                code.classList.add('is-split');
                chars = split.chars;
            }
            if (replay) {
                if (first && nav) {
                    tl.from(nav, { yPercent: -100, autoAlpha: 0, duration: 0.9 }, 0);
                }
                tl.from(glows, { autoAlpha: 0, scale: 0.55, duration: 2.2, stagger: 0.2, ease: 'power2.out' }, 0);
                if (beam) {
                    tl.from(beam, { scaleX: 0, autoAlpha: 0, duration: 1.4, ease: 'expo.inOut' }, 0.1);
                }
                if (grid) {
                    tl.from(grid, { autoAlpha: 0, duration: 1.6, ease: 'power1.out' }, 0.1);
                }
                if (code) {
                    if (chars.length) {
                        tl.from(chars, {
                            x: () => random(-180, 180),
                            y: () => random(-110, 110),
                            rotation: () => random(-50, 50),
                            scale: () => random(0.4, 1.7),
                            autoAlpha: 0,
                            filter: 'blur(16px)',
                            duration: 1.3,
                            stagger: { each: 0.09, from: 'random' },
                            clearProps: 'filter'
                        }, 0.15);
                        tl.to(chars, {
                            skewX: () => random(-22, 22),
                            x: () => random(-6, 6),
                            duration: 0.05,
                            repeat: 7,
                            yoyo: true,
                            ease: 'none',
                            stagger: 0.02
                        }, 1.25);
                        tl.set(chars, { skewX: 0, x: 0 }, 1.75);
                    } else {
                        tl.from(code, { autoAlpha: 0, scale: 0.9, duration: 1.2 }, 0.15);
                    }
                    tl.fromTo(code, { '--split': 0.85, '--gx': 22 }, {
                        '--split': 0,
                        '--gx': 0,
                        immediateRender: false,
                        duration: 1.5,
                        ease: has('CustomEase') ? 'portfolio-jitter' : 'power2.out'
                    }, 0.25);
                }
                if (reason) {
                    tl.from(reason, { autoAlpha: 0, y: 14, duration: 0.8 }, 0.9);
                }
                if (title) {
                    tl.from(title, { autoAlpha: 0, y: 12, duration: 0.8 }, 1.0);
                    if (has('ScrambleTextPlugin') && scramble) {
                        tl.to(scramble, {
                            duration: 1.3,
                            ease: 'none',
                            scrambleText: { text: scrambleText, chars: '<>/\\|_-=+*#%01', speed: 0.8, revealDelay: 0.2 }
                        }, 1.0);
                    }
                }
                if (hint) {
                    tl.from(hint, { autoAlpha: 0, y: 14, duration: 0.9 }, 1.2);
                }
                if (actions) {
                    tl.from(actions.children, { autoAlpha: 0, y: 16, scale: 0.92, duration: 0.9, stagger: 0.08, ease: 'back.out(1.7)' }, 1.3);
                }
                if (diag) {
                    tl.from(diag, { autoAlpha: 0, y: 36, scale: 0.97, filter: 'blur(10px)', duration: 1.1, clearProps: 'filter' }, 1.4);
                    tl.from($$('.diag__row', diag), { autoAlpha: 0, x: -12, duration: 0.7, stagger: 0.07 }, 1.6);
                    tl.fromTo(diag, { '--mx': '-20%', '--my': '0%', '--glow': 1 }, { '--mx': '120%', '--my': '100%', duration: 1.4, ease: 'power2.inOut' }, 1.5);
                    tl.to(diag, { '--glow': 0, duration: 0.5, onComplete: () => diag.style.removeProperty('--glow') }, 2.9);
                }
                if (footer) {
                    tl.from(footer, { autoAlpha: 0, duration: 0.8 }, 1.7);
                }
            }

            if (code) {
                const burst = G.timeline({ paused: true });
                burst.to(code, { '--split': 1, '--gx': () => random(-12, 12), duration: 0.05, ease: 'none' });
                if (chars.length) {
                    burst.to(chars, { x: () => random(-7, 7), skewX: () => random(-14, 14), opacity: () => random(0.55, 1), duration: 0.05, ease: 'none' }, '<');
                }
                burst.to(code, { '--gx': () => random(-6, 6), duration: 0.06, ease: 'none' });
                if (chars.length) {
                    burst.to(chars, { x: 0, skewX: 0, opacity: 1, duration: 0.08, ease: 'none' });
                }
                burst.to(code, { '--split': 0, '--gx': 0, duration: 0.14, ease: 'power2.out' }, '<');
                let next = null;
                const flicker = () => {
                    if (scenario.reverted) {
                        return;
                    }
                    burst.invalidate().restart();
                    next.delay(random(2.6, 6.2)).restart(true);
                };
                next = G.delayedCall(replay ? 3.8 : 1.6, flicker);
            }

            glows.forEach((glow, index) => {
                G.to(glow, {
                    x: index ? -80 : 90,
                    y: index ? 50 : 30,
                    scale: index ? 1.1 : 1.06,
                    duration: index ? 10 : 8,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    delay: 2
                });
            });

            if (finePointer) {
                $$('[data-magnetic]').forEach((element) => {
                    const toX = G.quickTo(element, 'x', { duration: 0.6, ease: 'power3' });
                    const toY = G.quickTo(element, 'y', { duration: 0.6, ease: 'power3' });
                    const clamp = G.utils.clamp(-10, 10);
                    const move = (event) => {
                        const box = element.getBoundingClientRect();
                        toX(clamp((event.clientX - (box.left + box.width / 2)) * 0.22));
                        toY(clamp((event.clientY - (box.top + box.height / 2)) * 0.22));
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
                });
            }
        };

        const fail = () => {
            if (scene === scenario) {
                Motion.lock('soft', 'Cinematic motion stopped after an error, so soft motion is used instead.');
            }
        };
        const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        const budget = Math.max(0, Math.min(1200, Motion.remaining - 200));
        const wait = first ? Promise.race([fonts, new Promise((resolve) => window.setTimeout(resolve, budget))]) : Promise.resolve();
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

    let staged = null;
    let booted = false;

    const stage = (mode, first) => {
        if (scene) {
            scene.revert();
            scene = null;
        }
        if (mode === 'cinematic') {
            scene = cinematic(first);
        } else {
            Motion.release();
        }
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
            const plugins = ['SplitText', 'ScrambleTextPlugin', 'CustomEase'].map((name) => window[name]).filter(Boolean);
            if (plugins.length) {
                G.registerPlugin(...plugins);
            }
            if (has('CustomEase')) {
                window.CustomEase.create('portfolio-jitter', 'M0,0 C0.05,0.8 0.08,-0.2 0.14,0.6 0.2,1.3 0.24,0.3 0.32,0.9 0.4,1.2 0.46,0.7 0.56,1 0.7,1.05 0.8,0.98 1,1');
            }
        } else {
            Motion.lock('soft', 'Animations are unavailable because the animation library did not load.');
        }
        refresh();
    };

    Motion.onChange(refresh);
    refresh();
    Motion.whenReady(boot);
})();
