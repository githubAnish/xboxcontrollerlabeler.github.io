document.addEventListener("DOMContentLoaded", () => {
    const labels = document.querySelectorAll(".label");
    const tooltip = document.getElementById("tooltip");

    labels.forEach(label => {
        label.addEventListener("mouseenter", e => {
            tooltip.textContent = label.dataset.label;
            tooltip.style.opacity = 1;
        });

        label.addEventListener("mousemove", e => {
            tooltip.style.left = e.pageX + 15 + "px";
            tooltip.style.top = e.pageY + 15 + "px";
        });

        label.addEventListener("mouseleave", () => {
            tooltip.style.opacity = 0;
        });
    });
});
