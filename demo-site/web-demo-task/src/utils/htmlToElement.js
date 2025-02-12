export function htmlToElement(html) {
    // https://stackoverflow.com/a/35385518
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
