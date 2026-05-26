// === LOADING REAL - ESPERA TUDO CARREGAR ===
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading-locked');
    document.getElementById('header').classList.add('loading-hidden');

    // Constrói o loader hexagonal assim que o DOM está pronto
    buildHexLoader();

    const scrollEvents = ['wheel', 'touchmove', 'keydown'];
    scrollEvents.forEach(event => {
        document.addEventListener(event, preventScroll, { passive: false });
    });

    window.loadingObservers = window.loadingObservers || [];

    waitForAllResources()
        .then(hideLoader)
        .catch((err) => {
            console.warn('waitForAllResources error:', err);
            hideLoader();
        });
});

// === LOADER HEXAGONAL ===
function buildHexLoader() {
    const svgEl = document.getElementById('hexLoaderSvg');
    if (!svgEl) return;

    const size = 100, strokeW = 6;
    const ns = 'http://www.w3.org/2000/svg';

    function hexPoints(cx, cy, r) {
        const pts = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 90);
            pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
        }
        return pts;
    }

    const pts = hexPoints(size / 2, size / 2, size / 2 - strokeW);
    const pStr = pts.map(p => p[0].toFixed(3) + ',' + p[1].toFixed(3)).join(' ');
    const perim = pts.reduce((acc, p, i) => {
        const b = pts[(i + 1) % pts.length];
        return acc + Math.hypot(b[0] - p[0], b[1] - p[1]);
    }, 0);

    // Trilha de fundo
    const track = document.createElementNS(ns, 'polygon');
    track.setAttribute('points', pStr);
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    track.setAttribute('stroke-width', strokeW);
    track.setAttribute('stroke-linejoin', 'round');
    svgEl.appendChild(track);

    // Arco animado
    const prog = document.createElementNS(ns, 'polygon');
    prog.setAttribute('points', pStr);
    prog.setAttribute('fill', 'none');
    prog.setAttribute('stroke', '#ffffff');
    prog.setAttribute('stroke-width', strokeW);
    prog.setAttribute('stroke-linecap', 'round');
    prog.setAttribute('stroke-linejoin', 'round');
    prog.setAttribute('stroke-dasharray', perim);
    prog.setAttribute('stroke-dashoffset', perim);

    const anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'stroke-dashoffset');
    anim.setAttribute('values', `${perim};${perim * 0.05};${-perim * 0.95}`);
    anim.setAttribute('keyTimes', '0;0.5;1');
    anim.setAttribute('dur', '1.4s');
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('calcMode', 'spline');
    anim.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1');
    prog.appendChild(anim);

    svgEl.appendChild(prog);
}

// === AGUARDA RECURSOS ===
function waitForAllResources() {
    return Promise.all([
        waitForImages(),
        waitForFonts(),
        waitForWindowLoad(),
        waitForCustomCSS()
    ]);
}

function waitForImages() {
    return new Promise((resolve) => {
        const images = document.querySelectorAll('img');
        if (images.length === 0) return resolve();

        let loadedCount = 0;

        images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
                loadedCount++;
            } else {
                img.onload = img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === images.length) resolve();
                };
            }
        });

        if (loadedCount === images.length) resolve();
    });
}

function waitForFonts() {
    return document.fonts ?
        document.fonts.ready :
        Promise.resolve();
}

function waitForWindowLoad() {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    });
}

function waitForCustomCSS() {
    return new Promise((resolve) => {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        let loadedCount = 0;

        if (links.length === 0) return resolve();

        const handleLoad = () => {
            loadedCount++;
            if (loadedCount === links.length) resolve();
        };

        links.forEach(link => {
            try {
                if (link.sheet) {
                    loadedCount++;
                    if (loadedCount === links.length) resolve();
                    return;
                }
            } catch (e) {
                loadedCount++;
                if (loadedCount === links.length) resolve();
                return;
            }

            link.addEventListener('load', handleLoad);
            link.addEventListener('error', handleLoad);
        });

        if (loadedCount === links.length) resolve();
    });
}

function preventScroll(e) {
    e.preventDefault();
    return false;
}

// === ESCONDE O LOADER ===
function hideLoader() {
    const loader = document.getElementById('loader');

    document.body.classList.remove('loading-locked');
    document.getElementById('header').classList.remove('loading-hidden');

    ['wheel', 'touchmove', 'keydown'].forEach(event => {
        document.removeEventListener(event, preventScroll);
    });

    loader.classList.add('hidden');

    setTimeout(() => {
        loader.style.display = 'none';
        loader.remove();
        reactivateAnimations();
    }, 800);
}

// === REATIVA ANIMAÇÕES ===
function reactivateAnimations() {
    initHeaderObserver();
    initMotivadorObserver();
    initScrollPrevent();
}

function initHeaderObserver() {
    const header = document.getElementById("header");
    const fundo = document.querySelector(".fundo1");

    if (fundo && header) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                header.style.top = entry.isIntersecting ? "-90px" : "0px";
            });
        }, { threshold: 0.1 });

        observer.observe(fundo);
    }
}

function initMotivadorObserver() {
    const motivadorObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('ativo');
                setTimeout(() => {
                    entry.target.style.transitionDelay = "0s";
                }, 600);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".motivador, .motivador2").forEach(el => {
        motivadorObserver.observe(el);
    });

    document.querySelectorAll(".botao-animado").forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`;
        motivadorObserver.observe(el);
    });
}

function initScrollPrevent() {
    window.addEventListener('wheel', function(e) {
        if (Math.abs(e.deltaX) > 0) {
            e.preventDefault();
        }
    }, { passive: false });
}