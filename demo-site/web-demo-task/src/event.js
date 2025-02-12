import { worker } from "./init";
import {
    GENERATION_OPTIONS,
    TASK_SELECTOR,
    GENERATE_BUTTON,
    LANGUAGE_FROM,
    LANGUAGE_TO,
    INPUT_TEXTBOX,
    OUTPUT_TEXTBOX,
    SPEECH2TEXT_AUDIO,
    SPEECH2TEXT_OUTPUT_TEXTBOX,
} from "./dom";

import { updateVisibility } from "./utils/updateVisibility";
import { isVisible } from "./utils/isVisible";
import { parseValue } from "./utils/parseValue";

TASK_SELECTOR.addEventListener('input', updateVisibility);
GENERATE_BUTTON.addEventListener('click', async (e) => {
    // Set and pass generation settings to web worker
    let data = {
        task: TASK_SELECTOR.value,
        generation: Object.fromEntries([...GENERATION_OPTIONS]
            .filter(isVisible) // Only use parameters that are visible on screen
            .map(x => {
                let value = parseValue(x.value, x.getAttribute('datatype'));
                return [x.getAttribute('param-name'), value]
            }))
    };
    switch (TASK_SELECTOR.value) {

        case 'translation':
            data.languageFrom = LANGUAGE_FROM.value
            data.languageTo = LANGUAGE_TO.value
            data.text = INPUT_TEXTBOX.value
            data.elementIdToUpdate = OUTPUT_TEXTBOX.id
            break;
        case 'automatic-speech-recognition':
            const sampling_rate = 16000;
            const audioCTX = new AudioContext({ sampleRate: sampling_rate })

            const response = await (await fetch(SPEECH2TEXT_AUDIO.currentSrc)).arrayBuffer()
            const decoded = await audioCTX.decodeAudioData(response)

            data.audio = decoded.getChannelData(0);
            data.elementIdToUpdate = SPEECH2TEXT_OUTPUT_TEXTBOX.id
            break;
        default:
            return;
    }

    worker.postMessage(data);
});
