import { TASK_DEFAULT_PARAMS } from "../config/contants";
export function updateParams(task) {
    let params = TASK_DEFAULT_PARAMS[task]
    if (!params) return;

    for (let [key, value] of Object.entries(params)) {
        let element = document.querySelector(`.generation-option[param-name="${key}"]`)
        if (!element) continue;
        element.value = value;
    }
}
