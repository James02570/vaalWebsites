/* ===============================
   MOBILE SLIDERS FOR HOME PAGE
   =============================== */

document.addEventListener("DOMContentLoaded", () => {

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (!isMobile) return;

    /* ========= GENERIC AUTO SLIDER ========= */

    function createAutoSlider(containerSelector, intervalTime = 3000) {

        const container = document.querySelector(containerSelector);
        if (!container) return;

        let isDown = false;
        let startX;
        let scrollLeft;
        let autoSlide;

        const getStep = () => container.clientWidth * 0.9;

        function startAutoSlide() {
            autoSlide = setInterval(() => {
                const maxScrollLeft = container.scrollWidth - container.clientWidth;

                if (container.scrollLeft >= maxScrollLeft - 5) {
                    container.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    container.scrollBy({ left: getStep(), behavior: "smooth" });
                }
            }, intervalTime);
        }

        function stopAutoSlide() {
            clearInterval(autoSlide);
        }

        // Start auto sliding
        startAutoSlide();

        /* ========= TOUCH / DRAG SUPPORT ========= */

        container.addEventListener("mousedown", (e) => {
            isDown = true;
            container.classList.add("active");
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            stopAutoSlide();
        });

        container.addEventListener("mouseleave", () => {
            isDown = false;
            container.classList.remove("active");
            startAutoSlide();
        });

        container.addEventListener("mouseup", () => {
            isDown = false;
            container.classList.remove("active");
            startAutoSlide();
        });

        container.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
        });

        /* ========= TOUCH SCREENS ========= */

        container.addEventListener("touchstart", () => stopAutoSlide());
        container.addEventListener("touchend", () => startAutoSlide());

        /* ========= PAUSE ON HOVER ========= */

        container.addEventListener("mouseenter", stopAutoSlide);
        container.addEventListener("mouseleave", startAutoSlide);
    }

    /* ========= INIT SLIDERS ========= */

    createAutoSlider(".expert-cards", 3200);
    createAutoSlider(".tech-row", 2200);

});