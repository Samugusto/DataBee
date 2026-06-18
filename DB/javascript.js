    const lenis = new Lenis({
      duration: 1.2, // Tempo da animação da rolagem (em segundos)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de suavização
      smoothWheel: true
    });

    // Sincronizar o Lenis com o ScrollTrigger do GSAP
    lenis.on('scroll', ScrollTrigger.update);

    // Alimentar o "ticker" do GSAP com a animação do Lenis
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Desativar a suavização de lag do GSAP para evitar conflitos de sincronia
    gsap.ticker.lagSmoothing(0);
// === LOADING REAL - ESPERA TUDO CARREGAR ===
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading-locked');
    
    // Verificação de segurança caso o header ainda não exista no DOM
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

// === ESCONDE O LOADER (CORRIGIDO PARA O SEU HTML) ===
function hideLoader() {
    // CORREÇÃO: Buscando pela classe do seu container principal do HTML (.loading-screen)
    const loader = document.querySelector('.loading-screen');

    document.body.classList.remove('loading-locked');
    
    const header = document.getElementById('header');
    if (header) header.classList.remove('loading-hidden');

    ['wheel', 'touchmove', 'keydown'].forEach(event => {
        document.removeEventListener(event, preventScroll);
    });

    // Se o loader existir, aplica a classe de fade e depois destrói o elemento
    if (loader) {
        loader.classList.add('hidden');

        setTimeout(() => {
            loader.style.display = 'none';
            loader.remove();
            reactivateAnimations();
        }, 800); // 800ms é o tempo para o fade-out visual terminar
    } else {
        reactivateAnimations();
    }
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    // Evita o comportamento padrão do navegador (que daria um "pulo" seco)
    e.preventDefault();

    // Pega o destino (ex: "#secao-2")
    const target = this.getAttribute('href');

    // Usa a função mágica do Lenis para rolar suavemente
    lenis.scrollTo(target, {
      duration: 1.5,       // Duração da animação em segundos
      offset: -50,         // Ajuste se você tiver um menu fixo no topo (ex: -80 para 80px de menu)
      immediate: false,    // Se true, vai direto sem animação
      lock: true           // Bloqueia o scroll do usuário enquanto a animação acontece
    });
  });
});