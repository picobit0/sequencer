const synths = {
    "retro": "Ретро",
    "string": "Струна",
    "xylo": "Ксилофон",
    "flute": "Флейта",
    "brass": "Труба"
}
const synthChoice = new EditorRadioGroup("Синтезатор", synths)
                    .onValueChanged(value => {
                        synth.releaseAllNotes();
                        synth = presets[value];
                    })
                    .appendTo(document.getElementById("synths"));

let synth = presets["retro"];
const piano = document.getElementById("piano");
const keys = [];
for (let i = 0; i < 24; i++) {
    const key = document.createElement("div");
    key.addEventListener("mousedown", e => {
        if (e.button == 0) {
            playNote(i);
            e.preventDefault();
        }
    });
    key.addEventListener("mouseup", e => {
        if (e.button == 0) {
            releaseNote(i);
            e.preventDefault();
        }
    });

    key.addEventListener("touchstart", e => {
        playNote(i);
        e.preventDefault();
    });
    key.addEventListener("touchend", e => {
        releaseNote(i);
        e.preventDefault();
    });
    
    key.addEventListener("mouseenter", e => {
        if (e.buttons & 1)
            playNote(i);
    });
    
    key.addEventListener("mouseleave", e => {
        if (e.buttons & 1)
            releaseNote(i);
    });

    key.classList.add("key");
    if (i % 12 % 9 % 5 % 2 == 1)
        key.classList.add("key-black");
    keys.push(key);    
    piano.appendChild(key);
}

function playNote (note) {
    synth.playNote(note);
    if (note < keys.length)
        keys[note].classList.toggle("key-pressed", true);
}

function releaseNote (note) {
    synth.releaseNote(note);
    if (note < keys.length)
        keys[note].classList.toggle("key-pressed", false);
}

const keybinds = [
    "KeyQ",
    "Digit2",
    "KeyW",
    "Digit3",
    "KeyE",
    "KeyR",
    "Digit5",
    "KeyT",
    "Digit6",
    "KeyY",
    "Digit7",
    "KeyU",
    "KeyI",
    "Digit9",
    "KeyO",
    "Digit0",
    "KeyP",
    "BracketLeft",
    "Equal",
    "BracketRight"
]

const pressed = new Set();
window.addEventListener("keydown", e => {
    const idx = keybinds.indexOf(e.code);
    if (idx != -1 && !pressed.has(idx)) {
        pressed.add(idx);
        playNote(idx);
    }
    if (idx != -1) e.preventDefault();
});
window.addEventListener("keyup", e => {
    const idx = keybinds.indexOf(e.code);
    if (idx != -1) {
        pressed.delete(idx);
        releaseNote(idx);
    }
    if (idx != -1) e.preventDefault();
})

window.addEventListener("blur", e => {
    pressCount = [];
    synth.releaseAllNotes();
    keys.forEach(k => k.classList.toggle("key-pressed", false));
});