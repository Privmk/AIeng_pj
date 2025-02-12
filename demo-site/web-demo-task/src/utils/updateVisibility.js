import { updateParams } from "./updateParams";
import { TASK_SELECTOR, TASKS} from "../dom";
export function updateVisibility() {

    // Set default parameters for task
    updateParams(TASK_SELECTOR.value);

    for (let element of TASKS) {
        if (element.getAttribute('task').split(',').includes(TASK_SELECTOR.value)) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}