gsap.registerPlugin(ScrollTrigger);

// 1. Smooth Scroll con Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Split text para el título del hero
function splitTextIntoSpans(selector) {
    const el = document.querySelector(selector);
    if (!el) return { chars: [], words: [] };

    const text = el.innerText;
    el.innerHTML = '';

    const words = text.split(' ');
    const allChars = [];
    const allWords = [];

    words.forEach((wordText, wIdx) => {
        const wordWrap = document.createElement('span');
        wordWrap.classList.add('word-wrapper');

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word-span');

        for (let i = 0; i < wordText.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char-span');
            charSpan.innerText = wordText[i];
            wordSpan.appendChild(charSpan);
            allChars.push(charSpan);
        }

        wordWrap.appendChild(wordSpan);
        el.appendChild(wordWrap);
        allWords.push(wordSpan);

        if (wIdx < words.length - 1) {
            const space = document.createTextNode(' ');
            el.appendChild(space);
        }
    });

    return { chars: allChars, words: allWords };
}

// Burbujas dinámicas
function createBubbles() {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 18; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        const size = Math.random() * 12 + 6;
        const left = Math.random() * 80 + 10;
        const delay = Math.random() * 4;
        const duration = Math.random() * 3 + 2.5;
        const drift = (Math.random() - 0.5) * 40;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.setProperty('--drift', `${drift}px`);

        container.appendChild(bubble);
    }
}

window.pulseBubbles = function() {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;
    
    for (let i = 0; i < 10; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        const size = Math.random() * 16 + 8;
        const left = Math.random() * 80 + 10;
        const duration = Math.random() * 2 + 1.5;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);

        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), duration * 1000);
    }

    gsap.to('.bio-cylinder', {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // 🔒 Bloquear el scroll al iniciar con el cargador
    document.body.style.overflow = 'hidden';

    createBubbles();

    const titleSplit = splitTextIntoSpans('.hero-title');

    // Configuración Inicial Preloader
    gsap.set(".nav-logo", { scale: 0, opacity: 0 });
    gsap.set(titleSplit.chars, { y: 40, opacity: 0, scale: 0.8 });
    gsap.set(".hero-subtitle", { y: 20, opacity: 0 });
    gsap.set(".hero-img", { scale: 0.8, opacity: 0 });

    // Preloader Timeline
    const tl = gsap.timeline({ 
        delay: 0.3,
        onComplete: () => {
            // 🔓 Habilitar el scroll nuevamente al terminar la animación de carga
            document.body.style.overflow = '';
        }
    });

    tl.to(".preloader-revealer", {
        clipPath: "circle(100% at 50% 50%)",
        duration: 1.1,
        stagger: 0.2,
        ease: "power2.inOut"
    });

    tl.set(".preloader-revealer", { display: "none" });

    tl.to(".preloader-logo", {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
    });

    tl.set(".preloader-bg", { display: "none" });

    tl.to(".preloader-logo", {
        y: "-100vh",
        scale: 2,
        duration: 0.7,
        ease: "power2.in"
    });

    // Revelación Inicial Hero
    tl.to(".nav-logo", { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.2");
    tl.to(titleSplit.chars, { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.02, ease: "back.out(1.4)" }, "<0.1");
    tl.to(".hero-subtitle", { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "<0.3");
    tl.to(".hero-img", { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, "<0.1");
    tl.set(".preloader", { display: "none" });

    // Revelado de texto por palabras en la cortina (Difuminado / Efecto cortina al hacer scroll)
    const splitText = new SplitType('.reveal-text', { types: 'words' });
    const splitSub = new SplitType('.sub-text', { types: 'words' });

    const textTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.transition-section',
            start: 'top 55%',
            end: 'center 60%',
            scrub: 1
        }
    });

    textTl.from(splitText.words, {
        opacity: 0.1,
        y: 20,
        stagger: 0.03,
        ease: "power2.out"
    })
    .from(splitSub.words, {
        opacity: 0,
        y: 15,
        stagger: 0.02,
        ease: "power2.out"
    }, "-=0.2");

    // ANIMACIONES DE SCROLL SUAVES PARA LOS BLOQUES
    const blocks = gsap.utils.toArray('.editorial-block');
    blocks.forEach((block) => {
        gsap.from(block, {
            scrollTrigger: {
                trigger: block,
                start: 'top 85%',
            },
            y: 40,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });
    });
});