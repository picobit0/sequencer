const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const hardNoiseWave = generateHardNoiseWave(256);
const softNoiseWave = generateSoftNoiseWave(256, 4);

const oscillatorTypes = [
    "square",
    "triangle",
    "sine",
    "sawtooth",
    "soft noise",
    "hard noise"
]

class Synth {
    constructor (name, oscillator, envelope, volume, octave) {
        this.name = name;
        this.oscillatorSettings = oscillator;
        this.envelopeSettings = envelope;
        this.octave = octave;
        this.notes = new Map();
        
        this.gain = audioContext.createGain();
        this.setVolume(volume);
        this.gain.connect(audioContext.destination);
    }

    setName (value) {
        this.name = value;
    }

    setVolume (value) {
        this.volume = value;
        this.gain.gain.setValueAtTime(this.volume, audioContext.currentTime);
    }

    playNote (note) {
        if (this.notes.get(note) != undefined) return;

        const frequency = 440 * Math.pow(2, note / 12 + this.octave);
        const synthNote = new SynthNote(frequency, this.oscillatorSettings, this.envelopeSettings);
        synthNote.connect(this.gain);

        this.notes.set(note, synthNote);
        synthNote.play(audioContext.currentTime);
    }

    releaseNote (note) {
        const synthNote = this.notes.get(note);
        if (synthNote == undefined) return;

        synthNote.stop(audioContext.currentTime);
        this.notes.delete(note);
    }

    releaseAllNotes () {
        this.notes.values().forEach(note => {
            note.stop(audioContext.currentTime);
        });
        this.notes.clear();
    }
}

class SynthNote {
    constructor (frequency, oscillator, envelope) {
        this.oscillator = audioContext.createOscillator();
        if (oscillator.type === "soft noise") {
            this.oscillator.setPeriodicWave(softNoiseWave);
        } else if (oscillator.type == "hard noise") {
            this.oscillator.setPeriodicWave(hardNoiseWave);
        } else {
            this.oscillator.type = oscillator.type;
        }
        this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        this.envelope = new SynthNoteEnvelope(envelope);

        this.oscillator.connect(this.envelope.gain);
    }

    connect (destination) {
        this.envelope.connect(destination);
    }

    play (time) {
        this.oscillator.start();
        this.envelope.play(time);
    }

    stop (time) {
        this.oscillator.stop(time + this.envelope.settings.release);
        this.envelope.stop(time);
    }
}

class SynthNoteEnvelope {
    constructor (settings) {
        this.settings = settings;
        this.gain = new GainNode(audioContext);
    }

    connect (destination) {
        this.gain.connect(destination);
    }

    play (time) {
        this.gain.gain.cancelScheduledValues(time);
        this.gain.gain.setValueAtTime(0, time);
        this.gain.gain.linearRampToValueAtTime(1, time + this.settings.attack);
        this.gain.gain.linearRampToValueAtTime(this.settings.sustain, time + this.settings.attack + this.settings.decay);
    }

    stop (time) {
        this.gain.gain.cancelScheduledValues(time);
        this.gain.gain.setValueAtTime(this.gain.gain.value, time);
        this.gain.gain.linearRampToValueAtTime(0, time + this.settings.release)
    }
}

function generateHardNoiseWave (sampleCount) {
    const real = []
    const imag = []
    for (let i = 0; i < sampleCount; i++) {
        real[i] = Math.round(Math.random()) * 2 - 1;
        imag[i] = Math.round(Math.random()) * 2 - 1;
    }
    return audioContext.createPeriodicWave(real, imag);
}

function generateSoftNoiseWave (sampleCount, period) {
    const real = []
    const imag = []
    for (let i = 0; i < sampleCount; i += period) {
        const realValue = Math.random() * 2 - 1;
        const imagValue = Math.random() * 2 - 1;
        for (let j = 0; j < period; j++) {
            real[i + j] = realValue;
            imag[i + j] = imagValue;
        }
    }
    return audioContext.createPeriodicWave(real, imag);
}