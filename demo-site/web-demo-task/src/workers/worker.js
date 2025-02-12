import { env } from "@xenova/transformers";
import { translate } from "./tasks/translation";
import { speech_to_text } from "./tasks/speechRecognition";

env.allowLocalModels = false;


const TASK_FUNCTION_MAPPING = {
    'translation': translate,
    'automatic-speech-recognition': speech_to_text,
}

self.addEventListener('message', async (event) => {
    const data = event.data;
    let fn = TASK_FUNCTION_MAPPING[data.task];

    if (!fn) return;

    let result = await fn(data);
    self.postMessage({
        task: data.task,
        type: 'result',
        data: result
    });
});
