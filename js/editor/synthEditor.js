class SynthEditor {
    constructor (synth) {
        this.synth = synth;
        this.element = document.getElementById("synth");

        this.nameInput = new EditorInput("name", synth.name, "text")
                            .onValueChanged(x => this.synth.setName(x))
                            .appendTo(this.element);

        this.oscillatorInput = new EditorOptions("type", oscillatorTypes)
                                    .onValueChanged(x => this.synth.oscillatorSettings.type = x)
                                    .appendTo(this.element);

        this.octaveInput = new EditorInput("octave", 0, "number")
                          .onValueChanged(x => this.synth.octave = x)
                          .appendTo(this.element);

        this.volumeSlider = new EditorSlider("volume", 0, 1, 0.01, this.synth.volume)
                                .onValueChanged(x => this.synth.setVolume(x))
                                .appendTo(this.element);

        this.attackSlider = new EditorSlider("attack", 0, 1, 0.01, this.synth.envelopeSettings.attack)
                                .onValueChanged(x => this.synth.envelopeSettings.attack = x)
                                .appendTo(this.element);
        this.decaySlider = new EditorSlider("decay", 0, 1, 0.01, this.synth.envelopeSettings.decay)
                                .onValueChanged(x => this.synth.envelopeSettings.decay = x)
                                .appendTo(this.element);
        this.sustainSlider = new EditorSlider("sustain", 0, 1, 0.01, this.synth.envelopeSettings.sustain)
                                .onValueChanged(x => this.synth.envelopeSettings.sustain = x)
                                .appendTo(this.element);
        this.releaseSlider = new EditorSlider("release", 0, 1, 0.01, this.synth.envelopeSettings.release)
                                .onValueChanged(x => this.synth.envelopeSettings.release = x)
                                .appendTo(this.element);

        window.addEventListener("synthselect", (e) => {
            this.setSynth(e.synth);
        });
    }

    setSynth (synth) {
        this.synth = synth;

        this.nameInput.setValue(synth.name);

        this.oscillatorInput.setValue(synth.oscillatorSettings.type);
        this.octaveInput.setValue(synth.octave);
        this.volumeSlider.setValue(synth.volume);
        
        this.attackSlider.setValue(synth.envelopeSettings.attack);
        this.decaySlider.setValue(synth.envelopeSettings.decay);
        this.sustainSlider.setValue(synth.envelopeSettings.sustain);
        this.releaseSlider.setValue(synth.envelopeSettings.release);
    }
}