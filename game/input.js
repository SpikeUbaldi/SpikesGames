const keys = { w: false, a: false, s: false, d: false, shift: false, r: false };
const mouse = { x: 0, y: 0, clicked: false };

document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", e => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousedown", () => mouse.clicked = true);
document.addEventListener("mouseup", () => mouse.clicked = false);

document.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
