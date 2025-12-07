let bpm = 130;
barSteps = 8;
octaveNotes = 12;
const bpmSlider = new EditorSlider("Шагов в минуту", 60, 240, 1, 130)
                    .onValueChanged(value => bpm = value)
                    .appendTo(document.getElementById("bpm"));

const synths = {
    "retro": "Ретро",
    "string": "Струна",
    "xylo": "Ксилофон",
    "flute": "Флейта",
    "brass": "Труба"
}
const synthChoice = new EditorRadioGroup("Синтезатор", synths)
                    .onValueChanged(value => {
                        patternPlayer.notePlayer.releaseAllNotes();
                        patternPlayer.notePlayer = presets[value];
                    })
                    .appendTo(document.getElementById("synths"));

const pattern = new Pattern("drums", 1, 4, true);
pattern.notes = presets["melody"];
const patternPlayer = new PatternPlayer(pattern, presets["retro"], true);
const patternEditor = new PatternEditor(patternPlayer);

window.addEventListener("goto", (e) => {
    patternEditor.player.goto(e.position);
    play();
});

let loop;
let isPlaying = false;

function step () {
    patternPlayer.step();
    patternEditor.setPlaying(patternPlayer.index);
    loop = setTimeout(step, 30 / bpm * 1000);
}

function play () {
    if (isPlaying) return;
    isPlaying = true;
    step();
}

function stop () {
    if (!isPlaying) return;
    isPlaying = false;
    patternPlayer.stop();
    clearTimeout(loop);
}

window.addEventListener("keydown", e => {
    if (e.code === "Enter")
        if (isPlaying)
            stop();
        else
            play();
});