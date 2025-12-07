let barSteps = 8;
let octaveNotes = 12;

class Pattern {
    constructor (name, octaves, bars, holdNotes) {
        this.name = name;
        this.octaves = octaves;
        this.bars = bars;
        this.holdNotes = holdNotes;
        this.notes = [];
        for (let i = 0; i < bars * barSteps; i++) {
            this.notes[i] = [];
            for (let j = 0; j < octaves * octaveNotes; j++) {
                this.notes[i][j] = false;
            }
        }
    }

    setName (value) {
        this.name = value;
    } 

    getNote (position, note) {
        return (this.notes[position] || [])[octaveNotes - 1 - note] || false;
    }

    setNote (position, note, value) {
        const idx = octaveNotes - 1 - note;
        if (!(0 <= position && position < this.bars * barSteps)) return;
        if (!(0 <= idx && idx < this.octaves * octaveNotes)) return;

        this.notes[position][idx] = value;
    }

    addOctave () {
        for (let i = 0; i < this.bars; i++) {
            for (let j = 0; j < octaveNotes; j++) {
                this.notes[i][j + this.octaves * 12] = false;
            }
        }
        this.octaves += 1;
    }

    removeOctave () {
        this.octaves -= 1;
        for (let i = 0; i < this.bars * barSteps; i++) {
            this.notes[i].length = this.octaves * 12;
        }
    }

    addBar () {
        for (let i = 0; i < barSteps; i++) {
            const bar = i + this.bars * barSteps; 
            this.notes[bar] = [];
            for (let j = 0; j < this.octaves * octaveNotes; j++) {
                this.notes[bar][j] = false;
            }
        }
        this.bars += 1;
    }

    removeBar () {
        this.bars -= 1;
        this.notes.length = this.bars * barSteps;
    }
}

class PatternPlayer {
    constructor (pattern, notePlayer, loop = false) {
        this.pattern = pattern;
        this.notePlayer = notePlayer;
        this.loop = loop;
        this.finished = false;
        this.index = -1;
    }

    stopLine () {
        if (this.index == -1 || !this.pattern) return;
        for (let i = 0; i < this.pattern.octaves * octaveNotes; i++) {
            if (!this.pattern.holdNotes)
                this.notePlayer.releaseNote(octaveNotes - i - 1);
        }
    }

    playLine () {
        if (!this.pattern) return;
        for (let i = 0; i < this.pattern.octaves * octaveNotes; i++) {
            if (this.pattern.notes[this.index][i]) {
                this.notePlayer.playNote(octaveNotes - i - 1);
            } else {
                this.notePlayer.releaseNote(octaveNotes - i - 1);
            }
        }
    }

    step () {
        if (!this.pattern) {
            this.finished = true;
            return;
        }
        this.stopLine();
        this.index += 1;
        if (this.index >= this.pattern.bars * barSteps) {
            if (this.loop) {
                this.index = 0;
            } else {
                this.stop();
                this.finished = true;
                this.index = -1;
                return;
            }
        }
        this.playLine();
    }

    stop () {
        this.notePlayer.releaseAllNotes();
    }

    goto (position) {
        this.stopLine();
        this.index = position - 1;
    }

    onOctaveRemoved () {
        for (let i = 0; i < octaveNotes; i++)
            this.notePlayer.releaseNote(i - this.pattern.octaves * octaveNotes);
    }
}