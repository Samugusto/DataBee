// ==========================================
// 1. INICIALIZAÇÃO GLOBAL (LENIS E GSAP)
// ==========================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2, // Tempo da animação da rolagem
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de suavização
    smoothWheel: true
});

// Sincronizar o Lenis com o ScrollTrigger do GSAP
lenis.on('scroll', ScrollTrigger.update);

// Alimentar o "ticker" do GSAP com a animação do Lenis
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

// Desativar a suavização de lag do GSAP para evitar conflitos
gsap.ticker.lagSmoothing(0);

// ==========================================
// 2. SISTEMA DE CARREGAMENTO (PRELOADER)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading-locked');
    
    const header = document.getElementById('header');
    if (header) header.classList.add('loading-hidden');

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
    return document.fonts ? document.fonts.ready : Promise.resolve();
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

function hideLoader() {
    const loader = document.querySelector('.loading-screen');
    document.body.classList.remove('loading-locked');
    
    const header = document.getElementById('header');
    if (header) header.classList.remove('loading-hidden');

    ['wheel', 'touchmove', 'keydown'].forEach(event => {
        document.removeEventListener(event, preventScroll);
    });

    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
            loader.remove();
            reactivateAnimations(); // CHAMA AS ANIMAÇÕES APÓS O LOADER SUMIR
        }, 800);
    } else {
        reactivateAnimations();
    }
}

// ==========================================
// 3. INICIALIZAÇÃO DAS ANIMAÇÕES
// ==========================================
function reactivateAnimations() {
    initHeaderObserver();
    initMotivadorObserver();
    initScrollPrevent();
    initLateralPinSection(); // Inicializa o seu código novo aqui!
    
    // Atualiza o ScrollTrigger após tudo estar visível para recalcular alturas
    ScrollTrigger.refresh(); 
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

// === NOVO CÓDIGO: LATERAL PIN INDICATOR ===
function initLateralPinSection() {
    const scrollContainer = document.querySelector('.scroll-container');
    const blocks = document.querySelectorAll('.section-block');
    const indicators = document.querySelectorAll('.indicator');
    const lineFill = document.querySelector('.progress-line-fill');

    // Se a seção não existir na página, aborta para não dar erro
    if (!scrollContainer || blocks.length === 0) return;

    const totalBlocks = blocks.length;
    const pinDistance = () => scrollContainer.offsetHeight * totalBlocks;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: scrollContainer,
            start: "top top",
            end: () => `+=${pinDistance()}`,
            pin: true,
            scrub: 1,
        }
    });

    blocks.forEach((block, index) => {
        if (index === 0) return; 

        const progressProgressiva = index / (totalBlocks - 1);

        tl.to(indicators[index - 1], { color: "#444", duration: 0.5 }, `passo-${index}`)
          .to(indicators[index], { color: "#ffcd42", duration: 0.3 }, `passo-${index}`)
          .to(lineFill, { scaleY: progressProgressiva, duration: 0.5, ease: "none" }, `passo-${index}`)
          .to(blocks[index - 1], { opacity: 0, autoAlpha: 0, duration: 0.5 }, `passo-${index}`)
          .to(block, { opacity: 1, autoAlpha: 1, duration: 0.5 }, `passo-${index}+=0.2`);
        
        tl.to({}, { duration: 1 }); 
    });
}

// ==========================================
// 4. LINKS ÂNCORA COM ROLAGEM SUAVE
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        lenis.scrollTo(target, {
            duration: 1.5,
            offset: -50,
            immediate: false,
            lock: true
        });
    });
});