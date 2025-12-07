let mouseFillMode = false; 

class PatternEditor {
    constructor (player) {
        this.player = player;
        const pattern = player.pattern;

        this.grids = [];
        this.currentPlaying = -1;

        this.element = document.getElementById("pattern");
        this.element.addEventListener("noteset", this.onNoteSet.bind(this));

        this.setPattern(pattern);

        window.addEventListener("patternselect", e => {
            this.setPattern(e.pattern);
        });
    }
    
    onNoteSet (event) {
        const position = event.position;
        const note = event.note;
        this.pattern.setNote(position, note, event.value);
        this.getGrid(position, note).setCellEnd(position, note, !this.pattern.getNote(position + 1, event.note));
        if (position > 0) this.getGrid(position - 1, note).setCellEnd(position - 1, note, !event.value);
    }

    getGrid (position, note) {
        return this.grids[Math.floor(position / barSteps)][-Math.floor(note / octaveNotes)];
    }

    getPattern () {
        return this.pattern;
    }

    setPattern (pattern) {
        this.setPlaying(-1);
        this.pattern = pattern;
        this.player.pattern = pattern;
        this.setHoldNotes(pattern.holdNotes);
        for (let i = 0; i < pattern.bars && i < this.grids.length; i++)
            for (let j = 0; j < pattern.octaves && j < this.grids[i].length; j++)
                this.grids[i][j].setNotes(pattern.notes);

        while (this.grids.length < this.pattern.bars)
            this.addEditorBar();
        
        while (this.grids.length > this.pattern.bars)
            this.removeEditorBar();

        while (this.grids[0].length < this.pattern.octaves)
            this.addEditorOctave();
        
        while (this.grids[0].length > this.pattern.octaves)
            this.removeEditorOctave();
    }

    setHoldNotes (value) {
        this.pattern.holdNotes = value;
        if (value) {
            this.element.classList.add("pattern-hold");
        } else {
            this.element.classList.remove("pattern-hold");
        }
    }

    addBar () {
        this.pattern.addBar();
        this.addEditorBar();
    }

    removeBar () {
        if (this.pattern.bars === 1) return;
        this.pattern.removeBar();
        this.removeEditorBar();
    }

    addOctave () {
        this.pattern.addOctave();
        this.addEditorOctave();
    }

    removeOctave () {
        if (this.pattern.octaves === 1) return;
        this.pattern.removeOctave();
        this.removeEditorOctave();
        this.player.onOctaveRemoved();
    }

    addEditorBar () {
        const bar = this.grids.length;
        this.grids[bar] = [];
        for (let i = 0; i < this.grids[0].length; i++) {
            const grid = new PatternEditorGrid(bar, -i);
            grid.setNotes(this.pattern.notes);
            this.grids[bar][i] = grid
            this.element.appendChild(grid.element);
        }
    }

    removeEditorBar () {
        const bar = this.grids.length - 1;
        if (bar === 0) return;

        for (let i = 0; i < this.grids[0].length; i++) {
            this.element.removeChild(this.grids[bar][i].element);
        }
        this.grids.length = bar;
        
        for (let i = 0; i < this.grids[0].length; i++) {
            for (let j = 0; j < octaveNotes; j++) {
                this.grids[bar - 1][i].setCellEnd(bar * barSteps - 1, j - i * octaveNotes, true);
            }
        }
    }

    addEditorOctave () {
        const idx = this.grids[0].length;
        for (let i = 0; i < this.grids.length; i++) {
            const grid = new PatternEditorGrid(i, -idx);
            grid.setNotes(this.pattern.notes);
            grid.setPlaying(this.currentPlaying, true);
            this.grids[i][idx] = grid
            this.element.appendChild(grid.element);
        }
    }

    removeEditorOctave () {
        const idx = this.grids[0].length - 1;
        if (idx === 0) return;
        
        for (let i = 0; i < this.pattern.bars; i++) {
            this.element.removeChild(this.grids[i][idx].element);
            this.grids[i].length = idx;
        }
    }

    setPlaying (position) {
        if (this.currentPlaying != -1) {
            const bar = Math.floor(this.currentPlaying / barSteps);
            for (let i = 0; i < this.pattern.octaves; i++) {
                this.grids[bar][i].setPlaying(this.currentPlaying, false);
            }
        }

        this.currentPlaying = position;

        if (this.currentPlaying != -1) {
            const bar = Math.floor(position / barSteps);
            for (let i = 0; i < this.pattern.octaves; i++) {
                this.grids[bar][i].setPlaying(this.currentPlaying, true);
            }
        }
    }
}

class PatternEditorGrid {
    constructor (bar, octave) {
        this.bar = bar;
        this.octave = octave;

        this.element = document.createElement("div");
        this.element.classList.add("pattern-editor-grid");
        this.element.style.gridRow = 2 - octave;
        this.element.style.gridColumn = bar + 1;
        this.gotos = []
        this.cells = []

        if (octave === 0)
            this.element.style.gridTemplateRows = `repeat(${octaveNotes + 1}, auto)`;

        for (let i = 0; i < barSteps; i++) {
            this.cells[i] = []
            if (octave === 0)
                this.gotos[i] = this.createGoto(i + bar * barSteps);
            for (let j = 0; j < octaveNotes; j++) {
                this.cells[i][j] = new PatternEditorCell(octaveNotes - 1 - j + octave * octaveNotes, i + bar * barSteps);
                this.element.appendChild(this.cells[i][j].element);
            }
        }
    }

    createGoto (position) {
        const goto = document.createElement("div");
        goto.classList.add("goto");
        goto.addEventListener("click", () => {
            const event = new Event("goto", {bubbles: true});
            event.position = position;
            goto.dispatchEvent(event);
        });
        this.element.appendChild(goto);
        return goto;
    }

    setNotes (notes) {
        for (let i = 0; i < barSteps; i++) {
            for (let j = 0; j < octaveNotes; j++) {
                this.cells[i][j].setActive(notes[i + this.bar * barSteps][j - this.octave * octaveNotes]);
                if (notes.length > i + 1 + this.bar * barSteps)
                    this.cells[i][j].element.setAttribute("end", !notes[i + 1 + this.bar * barSteps][j - this.octave * octaveNotes]);
            }
        }
    }

    setPlaying (position, value) {
        const idx = position - this.bar * barSteps;
        if (!(0 <= idx && idx < barSteps)) return;
        for (let i = 0; i < octaveNotes; i++) {
            this.cells[idx][i].setPlaying(value);
        }
    }

    toLocalIndex (position, note) {
        return {i: position - this.bar * barSteps, j: octaveNotes - 1 - note + this.octave * octaveNotes};
    }

    setCellEnd (position, note, value) {
        const index = this.toLocalIndex(position, note);
        this.cells[index.i][index.j].element.setAttribute("end", value);
    }
}

class PatternEditorCell {
    constructor (note, position) {
        this.note = note;
        this.position = position;
        this.element = document.createElement("div");
        this.element.classList.add("cell");
        this.element.draggable = false;
        if ((note % octaveNotes + octaveNotes) % octaveNotes % 9 % 5 % 2 === 1)
            this.element.classList.add("cell-black");

        this.element.addEventListener("pointerdown", e => {
            if (e.pointerType != "mouse") return;
            this.onclick(e);
        });
        this.element.addEventListener("click", e => {
            if (e.pointerType == "mouse") return;
            this.onclick(e);
        });
        this.element.addEventListener("mouseenter", this.onhover.bind(this));
        this.active = false;
    }

    onhover (event) {
        if (event.buttons === 1)
            this.setActive(mouseFillMode);
    }

    onclick () {
        mouseFillMode = !this.active;
        this.setActive(!this.active);
    }

    setActive (value) {
        if (this.active === value) return;
        this.active = value;
        const event = new Event("noteset", {bubbles: true});
        event.value = value;
        event.note = this.note;
        event.position = this.position;
        this.element.dispatchEvent(event);
        if (value) {
            this.element.classList.add("cell-active");
        } else {
            this.element.classList.remove("cell-active");
        }
    }

    setPlaying (value) {
        if (value) {
            this.element.classList.add("cell-playing");
        } else {
            this.element.classList.remove("cell-playing");
        }
    }
}

class EditorPatternPlayer extends PatternPlayer {
    step () {
        super.step();
        if (patternEditor.pattern === this.pattern)
            patternEditor.setPlaying(this.index);
    }
}