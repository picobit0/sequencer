const inViewport = (entries, _) => {
    entries.forEach(entry => {
        entry.target.classList.toggle("onscreen", entry.isIntersecting);
    });
};

const observer = new IntersectionObserver(inViewport);

document.querySelectorAll('[listen-viewport]').forEach(el => {
    observer.observe(el);
});

var burgerOpened = false;
const burgerBtn = document.querySelector('.burger-btn');
burgerBtn.addEventListener("click", (e) => {
    burgerOpened = !burgerOpened;
    burgerBtn.classList.toggle("opened", burgerOpened);
});

document.querySelectorAll("input[type='range']").forEach(el => {
    const min = parseFloat(el.min);
    const max = parseFloat(el.max);
    el.style.setProperty("--value", (parseFloat(el.value) - min) / (max - min) * 100 + "%");
    el.addEventListener("input", e => {
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        el.style.setProperty("--value", (parseFloat(el.value) - min) / (max - min) * 100 + "%");
    });
});

const alertEl = document.getElementById("alert");
if (alertEl) {
    alertEl.querySelector(".close").addEventListener("click", e => {
        alertEl.style.setProperty("display", "none");
    });
}