class TimelineEditor {
    constructor (timeline, synths, patterns) {
        this.element = document.getElementById("timeline");
        this.timeline = timeline;
        this.tracks = [];

        this.player = new EditorTimelinePlayer(timeline, synths, patterns, true);

        this.gotos = document.createElement("div");
        this.gotos.classList.add("gotos");
        this.element.appendChild(this.gotos);
        for (let i = 0; i < timeline.bars; i++) {
            this.createGoto(i);
        }
        synths.forEach(this.addTrack.bind(this));

        this.element.addEventListener("goto", (e) => {
            this.player.goto(e.index, 0);
            this.player.play();
        })

        this.element.addEventListener("patternset", this.onPatternSet.bind(this));
    }

    addTrack (synth) {
        const track = new TimelineEditorTrack(this.timeline, synth);
        this.element.appendChild(track.trackName);
        this.element.appendChild(track.track);
        this.tracks.push(track);
    }

    onPatternSet (event) {
        this.timeline.patterns[event.bar][event.track] = event.pattern;
    }

    setPlaying (index) {
        this.tracks.forEach(x => x.setPlaying(index));
    }

    createGoto (index) {
        const goto = document.createElement("div");
        goto.classList.add("goto");
        goto.addEventListener("click", () => {
            const event = new Event("goto", {bubbles: true});
            event.index = index;
            goto.dispatchEvent(event);
        });
        this.gotos.appendChild(goto);
        return goto;
    }
}

class TimelineEditorTrack {
    constructor (timeline, synth) {
        this.timeline = timeline;
        this.synth = synth;
        this.trackName = document.createElement("div");
        this.trackName.classList.add("timeline-track-name");
        this.trackName.textContent = synth.name;
        this.trackName.addEventListener("click", () => {
            const synthEvent = new Event("synthselect");
            synthEvent.synth = synth;
            window.dispatchEvent(synthEvent);
        });

        this.currentPlaying = -1;

        this.track = document.createElement("div");
        this.track.classList.add("timeline-track");
        this.track.style.gridTemplateColumns = `repeat(${timeline.bars}, var(--cell-size))`;

        this.cells = []
        for (let i = 0; i < this.timeline.bars; i++) {
            const cell = new TimelineTrackCell(i, synths.indexOf(synth), null);
            this.cells.push(cell);
            this.track.appendChild(cell.element);
        }
    }

    setPlaying (index) {
        if (this.currentPlaying != -1)
            this.cells[this.currentPlaying].setPlaying(false);
        
        this.currentPlaying = index;

        if (this.currentPlaying != -1)
            this.cells[this.currentPlaying].setPlaying(true);
    }
}

class TimelineTrackCell {
    constructor (bar, track, pattern) {
        this.bar = bar;
        this.track = track;
        this.pattern = pattern;

        this.element = document.createElement("div");
        this.element.classList.add("cell");
        this.element.addEventListener("click", this.onclick.bind(this));
        this.element.addEventListener("contextmenu", this.onmenu.bind(this));
    }

    setPattern (pattern) {
        this.pattern = pattern;
        if (this.pattern != null) {
            this.element.classList.add("cell-active");
            this.element.textContent = this.pattern.name;
            this.element.style.width = `calc(${this.pattern.bars} * (var(--cell-size) + 2px) - 2px)`;
        } else {
            this.element.classList.remove("cell-active");
            this.element.textContent = "";
            this.element.style.width = null;
        }

        const event = new Event("patternset", {bubbles: true});
        event.bar = this.bar;
        event.track = this.track;
        event.pattern = patterns.indexOf(pattern);
        this.element.dispatchEvent(event);
    }

    setPlaying (value) {
        if (value) {
            this.element.classList.add("cell-playing");
        } else {
            this.element.classList.remove("cell-playing");
        }
    }

    onclick () {
        if (this.pattern == null) {
            this.setPattern(patternEditor.pattern);
        } else {
            this.setPattern(null);
        }
    }

    onmenu (event) {
        event.preventDefault();
        
        const synthEvent = new Event("synthselect");
        synthEvent.synth = synths[this.track];
        window.dispatchEvent(synthEvent);
        if (this.pattern == null) return;

        const patternEvent = new Event("patternselect");
        patternEvent.pattern = this.pattern;
        window.dispatchEvent(patternEvent);     
    }
}

class EditorTimelinePlayer extends TimelinePlayer {
    step () {
        super.step();
        timelineEditor.setPlaying(this.bar);
    }

    createPatternPlayer (pattern, synth) {
        return new EditorPatternPlayer(pattern, synth, false);
    }
}