import {
    TASK_SELECTOR,
    LANGUAGE_TO
} from "./dom";
import { LANGUAGE } from "./config/contants";
import { 
    SPEECH2TEXT_AUDIO,
    SPEECH2TEXT_SELECT,
    SPEECH2TEXT_INPUT,
} from "./dom";
import { updateVisibility } from "./utils/updateVisibility";
// Initialise worker
export const worker = new Worker(new URL('./workers/worker.js', import.meta.url), {
    type: 'module',
});

// Define elements
let searchParams = new URLSearchParams(location.search);
let defaultDemo = searchParams.get('demo');
if (defaultDemo) {
    TASK_SELECTOR.value = defaultDemo;
}


//
updateVisibility();

LANGUAGE.forEach(lang => {
    const key = Object.keys(lang)[0];
    const value = lang[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value;
    LANGUAGE_TO.appendChild(option);
});

[
    [SPEECH2TEXT_SELECT, SPEECH2TEXT_INPUT, SPEECH2TEXT_AUDIO],
].forEach(x => {
    let [select, input, media] = x;

    select.addEventListener('input', (e) => {
        if (select.options[select.selectedIndex].hasAttribute('show-custom')) {
            input.style.display = 'block';
        } else {
            input.style.display = 'none';

            media.src = select.value
        }
    })

    input.addEventListener("change", () => {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        media.src = url;
    });
});