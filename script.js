document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.background-slider');
    if (!sliderContainer) {
        console.warn("Le conteneur '.background-slider' n'a pas été trouvé. Le script du slider ne démarrera pas.");
        return;
    }

    const originalImages = Array.from(sliderContainer.querySelectorAll('img'));

    if (originalImages.length < 2) {
        console.log("Moins de 2 images dans le slider. Le défilement ne sera pas activé.");
        return;
    }

    const PAUSE_DURATION = 6000;
    const SCROLL_DURATION = 8000; // La durée de défilement, était 1500, est passée à 8000 dans votre exemple actuel
    // L'IMAGE_WIDTH sera window.innerWidth ici puisque le slider prend 100vw

    let currentImageIndex = 0;
    let timeoutId;
    let lastTransitionEndTimestamp = 0;
    let animationStartTime;

    const sliderTrack = document.createElement('div');
    sliderTrack.style.display = 'inline-block';
    sliderTrack.style.whiteSpace = 'nowrap';
    sliderTrack.style.transition = `transform ${SCROLL_DURATION / 1000}s ease-in-out`;
    sliderTrack.style.willChange = 'transform';

    originalImages.forEach(img => {
        sliderContainer.removeChild(img);
        sliderTrack.appendChild(img);
    });

    originalImages.forEach(img => {
        const clone = img.cloneNode(true);
        sliderTrack.appendChild(clone);
    });

    sliderContainer.appendChild(sliderTrack);

    // Fonction pour gérer la fin de la transition (rendue globale pour être appelée par tous les listeners)
    function handleTransitionEnd() {
        // IMPORTANT: toujours supprimer l'écouteur pour éviter qu'il ne se déclenche plusieurs fois
        sliderTrack.removeEventListener('transitionend', handleTransitionEnd);
        lastTransitionEndTimestamp = performance.now();

        if (currentImageIndex >= originalImages.length) {
            sliderTrack.style.transition = 'none';
            sliderTrack.style.transform = `translateX(0px)`;
            sliderTrack.offsetHeight;
            sliderTrack.style.transition = `transform ${SCROLL_DURATION / 1000}s ease-in-out`;
            currentImageIndex = 0;
        }

        timeoutId = setTimeout(() => {
            currentImageIndex++;
            animateSlider();
        }, PAUSE_DURATION);
    }

    function animateSlider() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // Toujours retirer l'écouteur avant d'en ajouter un nouveau pour éviter les doublons
        sliderTrack.removeEventListener('transitionend', handleTransitionEnd);

        const scrollAmount = window.innerWidth; // Utilise la largeur actuelle de la fenêtre
        const targetX = -currentImageIndex * scrollAmount;

        sliderTrack.style.transition = `transform ${SCROLL_DURATION / 1000}s ease-in-out`;
        sliderTrack.style.transform = `translateX(${targetX}px)`;

        animationStartTime = performance.now();

        sliderTrack.addEventListener('transitionend', handleTransitionEnd);

// Fallback si transitionend ne se déclenche pas
        // Cette timeout garantit que le slider avancera quoi qu'il arrive après SCROLL_DURATION + un petit buffer.
        timeoutId = setTimeout(() => {
            console.warn('Transitionend did not fire for current slide, manually advancing.');
            // Supprime l'écouteur pour éviter qu'il ne se déclenche si transitionend arrive après
            sliderTrack.removeEventListener('transitionend', handleTransitionEnd);
            handleTransitionEnd(); // Déclenche manuellement la logique de fin de transition
        }, SCROLL_DURATION + 60); // Un petit délai de sécurité après la durée de la transition
    }

    // Gestion du redimensionnement de la fenêtre
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(timeoutId); // Arrête la pause en cours
        clearTimeout(resizeTimer); // Annule le timer de redimensionnement précédent
        sliderTrack.removeEventListener('transitionend', handleTransitionEnd); // Supprime l'écouteur si une transition était en cours

        // Repositionne immédiatement le slider à l'image courante sans transition
        const scrollAmount = window.innerWidth;
        const targetX = -currentImageIndex * scrollAmount;
        sliderTrack.style.transition = 'none';
        sliderTrack.style.transform = `translateX(${targetX}px)`;
        sliderTrack.offsetHeight; // Force le reflow

        // Redémarre l'animation après un court délai pour que le redimensionnement soit stable
        resizeTimer = setTimeout(() => {
            sliderTrack.style.transition = `transform ${SCROLL_DURATION / 1000}s ease-in-out`; // Réactive la transition
            animateSlider(); // Redémarre la boucle d'animation
        }, 250); // Délai de 250ms pour le "debounce"
    });

    // Gestion du changement de visibilité de l'onglet (quand on change d'onglet)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(timeoutId); // Arrête le setTimeout en cours (pause ou fallback)
            sliderTrack.removeEventListener('transitionend', handleTransitionEnd); // Supprime l'écouteur si une transition était en cours
        } else {
            // L'onglet redevient visible, repositionne et redémarre
            const scrollAmount = window.innerWidth;
            const targetX = -currentImageIndex * scrollAmount;
            sliderTrack.style.transition = 'none';
            sliderTrack.style.transform = `translateX(${targetX}px)`;
            sliderTrack.offsetHeight;
            sliderTrack.style.transition = `transform ${SCROLL_DURATION / 1000}s ease-in-out`;

            // Redémarre l'animation après un petit délai pour assurer la reprise
            setTimeout(() => {
                animateSlider();
            }, 100);
        }
    });

    // Lancement initial du slider : pause sur la première image, puis démarre le défilement
    timeoutId = setTimeout(() => {
        currentImageIndex++; // Incrémente pour la première animation vers la deuxième image
        animateSlider();
    }, PAUSE_DURATION);
});