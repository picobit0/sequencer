const kick = presets["kick"];
const snare = presets["snare"];
const hat = presets["hat"];
const bell = presets["bell"];

class DrumSynth {
    constructor (synths) {
        this.synths = synths;
    }

    playNote (note) {
        const n = this.synths.length;
        this.synths[(note % n + n) % n].playNote(0);    
    }

    releaseNote (note) {
        const n = this.synths.length;
        this.synths[(note % n + n) % n].releaseNote(0);    
    }

    releaseAllNotes () {
        this.synths.forEach(synth => {
            synth.releaseAllNotes();
        });
    }
}

let bpm = 130;
barSteps = 4;
octaveNotes = 4;
const bpmSlider = new EditorSlider("Шагов в минуту", 60, 240, 1, 130).onValueChanged(value => bpm = value).appendTo(document.getElementById("bpm"));

const drumSynth = new DrumSynth([bell, hat, snare, kick]); 
const pattern = new Pattern("drums", 1, 4, false);
pattern.notes = presets["4-drums"];
const patternPlayer = new PatternPlayer(pattern, drumSynth, true);
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