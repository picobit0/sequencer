class EditorInputBase {
    constructor (name, value) {
        this.value = value;
        this.element = document.createElement("div");
        this.element.classList.add("editor-input");
        this.onValueChangedCallback = null;
        
        this.label = document.createElement("span");
        this.label.textContent = name;
        this.element.appendChild(this.label);
    }

    setValue (value) {
        this.value = value;
        if (this.onValueChangedCallback) this.onValueChangedCallback(value);
    }

    appendTo (parent) {
        parent.appendChild(this.element);
        return this;
    }

    onValueChanged (callback) {
        this.onValueChangedCallback = callback;
        return this;
    }
}

class EditorInput extends EditorInputBase {
    constructor (name, value, type) {
        super(name, value);

        this.input = document.createElement("input");
        this.input.type = type;
        if (type == "number" || type == "range") {
            this.input.addEventListener("change", () => {
                this.setValue(parseFloat(this.input.value));
            });
        } else {
            this.input.addEventListener("change", () => {
                this.setValue(this.input.value);
            });
        }
        this.element.appendChild(this.input);

        this.setValue(value);
    }

    setValue (value) {
        super.setValue(value);
        this.input.value = value;
    }
}

class EditorOptions extends EditorInputBase {
    constructor (name, options) {
        super(name);

        this.select = document.createElement("select");

        this.select.addEventListener("input", () => {
            this.setValue(this.select.value);
        });

        options.forEach(o => {
            const option = document.createElement("option");
            option.value = o;
            option.textContent = o;
            this.select.appendChild(option);
        });

        this.element.appendChild(this.select);
    }

    setValue (value) {
        super.setValue(value);
        this.select.value = value;
    }
}

class EditorSlider extends EditorInputBase {
    constructor (name, min, max, step, value) {
        super(name, value);

        this.silder = document.createElement("input");
        this.silder.type = "range";
        this.silder.min = min;
        this.silder.max = max;
        this.silder.step = step;
        this.silder.addEventListener("input", () => {
            this.setValue(parseFloat(this.silder.value));
        });

        this.input = document.createElement("input");
        this.input.type = "number";
        this.input.min = min;
        this.input.max = max;
        this.input.step = step;
        this.input.addEventListener("change", () => {
            const event = new Event("input", {bubbles: true});
            event.value = this.input.value;
            this.silder.value = this.input.value;
            this.silder.dispatchEvent(event);
        });

        this.setValue(value);

        this.element.appendChild(this.silder);
        this.element.appendChild(this.input);
    }

    setValue (value) {
        if (isFinite(value)) {
            value = Math.max(Math.min(value, this.input.max), this.input.min);
            super.setValue(value);
        }

        this.silder.value = this.value;
        this.input.value = this.value;
    }
}

class EditorRadioGroup extends EditorInputBase {
    constructor (name, options) {
        super(name);
        this.group = document.createElement("div");
        
        this.group.addEventListener("input", (e) => {
            this.setValue(e.target.value);
        });

        const id = "Input_" + Math.random();
        let first = true;
        Object.entries(options).forEach(([key, value]) => {
            const label = document.createElement("label");
            label.textContent = value;
            const input = document.createElement("input"); 
            input.type = "radio";
            input.name = id;
            input.value = key;
            if (first) {
                input.checked = true;
                first = false;
            }
            label.appendChild(input);
            this.group.appendChild(label);
        });

        this.element.appendChild(this.group);
    }
}