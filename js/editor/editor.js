
// --------------------------------------

document.getElementById("bpm").addEventListener("change", (e) => {
    timeline.bpm = Math.max(30, parseFloat(e.target.value) || 120);
    e.target.value = timeline.bpm;
});

let playing = false;
document.getElementById("play").addEventListener("click", play);
document.getElementById("pause").addEventListener("click", pause);
const repeat = document.getElementById("repeat");
repeat.addEventListener("change", e => {
    patternEditor.setHoldNotes(e.target.checked);
});
document.addEventListener("keydown", e => {
    if (e.code == "Space") {
        if (playing) {
            pause();
        } else {
            play();
        }
    }
})

const synths = []

const synthSelect = document.getElementById("synths");
synthSelect.addEventListener("change", (e) => {
    synthEditor.synth.releaseAllNotes();
    synthEditor.setSynth(synths[e.target.value]);
    patternEditor.player.notePlayer = synthEditor.synth; 
});


for (let i = 0; i < 5; i++) {
    synths.push(new Synth("Synth " + i,
        {
        type: "square"
    },
    {
        attack: 0.1,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5
    },
    0.5, 0));

    const option = document.createElement("option");
    option.value = i;
    option.textContent = "Synth " + i;
    synthSelect.appendChild(option);
}

const patterns = []

const patternSelect = document.getElementById("patterns");
patternSelect.addEventListener("change", (e) => {
    patternEditor.setPattern(patterns[e.target.value]);
});

for (let i = 0; i < 5; i++) {
    patterns.push(new Pattern("Pattern " + i, 1, 2));

    const option = document.createElement("option");
    option.value = i;
    option.textContent = "Pattern " + i;
    patternSelect.appendChild(option);
}

const timeline = new Timeline(130, 16, 5);

const patternEditor = new PatternEditor(patterns[0]);
const synthEditor = new SynthEditor(synths[0]);
const timelineEditor = new TimelineEditor(timeline, synths, patterns);

function play () {
    if (playing) return;
    playing = true;
    timelineEditor.player.play();
}

function pause () {
    playing = false;
    timelineEditor.player.stop();
}

patternEditor.element.addEventListener("goto", (e) => {
    if (patternEditor.player.index != -1 && patternEditor.player.index < patternEditor.pattern.bars * barSteps) {
        patternEditor.setPlaying(patternEditor.player.index, false);
    }
    patternEditor.player.goto(e.position);
    play();
});


const keys = [
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
pressed = new Set();

window.addEventListener("keydown", e => {
    const idx = keys.indexOf(e.code);
    if (idx != -1 && !pressed.has(idx)) {
        pressed.add(idx);
        synthEditor.synth.playNote(idx);
    }
});
window.addEventListener("keyup", e => {
    const idx = keys.indexOf(e.code);
    if (idx != -1) {
        pressed.delete(idx);
        synthEditor.synth.releaseNote(idx);
    }
})