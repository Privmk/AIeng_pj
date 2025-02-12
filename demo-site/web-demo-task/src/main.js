

import Chart from 'chart.js/auto';
import Prism from 'prismjs';

// Import code and styles for supported languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism.css'

import './theme.css';
import './style.css';

import './init.js';
import './event.js';
import { worker } from './init.js';
import { PROGRESS, PROGRESS_BARS} from './dom.js';
import { escapeHtml } from './utils/escapeHtml';
import { htmlToElement } from './utils/htmlToElement.js';
import { formatBytes } from './utils/formatBytes.js';
// Initialise all code blocks
const CODE_BLOCKS = {};
[...document.querySelectorAll('.code-container')].forEach(element => {

  // Guide to add editable code block:
  // https://codepen.io/WebCoder49/pen/dyNyraq
  // https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/

  const CODE_HIGHLIGHT = element.querySelector('pre');
  const CODE_HIGHLIGHT_CONTENT = element.querySelector('code');
  const CODE_COMPLETION_TEXTBOX = element.querySelector('textarea');

  let sync_scroll = () => {
    /* Scroll result to scroll coords of event - sync with textarea */
    CODE_HIGHLIGHT.scrollTop = CODE_COMPLETION_TEXTBOX.scrollTop;
    CODE_HIGHLIGHT.scrollLeft = CODE_COMPLETION_TEXTBOX.scrollLeft;
  }
  let update = (text) => {
    // Handle final newlines (see article)
    if (text[text.length - 1] == "\n") {
      text += " ";
    }
    // Update code
    CODE_HIGHLIGHT_CONTENT.innerHTML = escapeHtml(text);

    // Syntax Highlight
    Prism.highlightElement(CODE_HIGHLIGHT_CONTENT);
  }

  // Update code function
  let updateCode = (text) => {
    update(text);
    sync_scroll();
  };

  CODE_BLOCKS[element.id] = {
    update: (text) => {
      CODE_COMPLETION_TEXTBOX.value = text;
      updateCode(text);

      // When updating, set scroll to bottom
      // https://stackoverflow.com/a/9170709
      CODE_COMPLETION_TEXTBOX.scrollTop = CODE_COMPLETION_TEXTBOX.scrollHeight;
    },
    text: () => CODE_COMPLETION_TEXTBOX.value
  };

  CODE_COMPLETION_TEXTBOX.oninput = () => updateCode(CODE_COMPLETION_TEXTBOX.value);

  CODE_COMPLETION_TEXTBOX.onscroll = sync_scroll;
  CODE_COMPLETION_TEXTBOX.onkeydown = (event) => {
    let code = CODE_COMPLETION_TEXTBOX.value;
    if (event.key == "Tab") {
      /* Tab key pressed */
      event.preventDefault(); // stop normal
      let before_tab = code.slice(0, CODE_COMPLETION_TEXTBOX.selectionStart); // text before tab
      let after_tab = code.slice(CODE_COMPLETION_TEXTBOX.selectionEnd, CODE_COMPLETION_TEXTBOX.value.length); // text after tab
      let cursor_pos = CODE_COMPLETION_TEXTBOX.selectionStart + 1; // where cursor moves after tab - moving forward by 1 char to after tab
      CODE_COMPLETION_TEXTBOX.value = before_tab + "\t" + after_tab; // add tab char
      // move cursor
      CODE_COMPLETION_TEXTBOX.selectionStart = cursor_pos;
      CODE_COMPLETION_TEXTBOX.selectionEnd = cursor_pos;
      update(CODE_COMPLETION_TEXTBOX.value); // Update text to include indent
    }
  };

});
// Handle result returned by the web worker

worker.addEventListener('message', (event) => {
  const message = event.data;

  switch (message.type) {
    case 'download': // for session creation

      if (message.data.status === 'initiate') {
        PROGRESS.style.display = 'block';

        // create progress bar
        PROGRESS_BARS.appendChild(htmlToElement(`
					<div class="progress w-100" model="${message.data.name}" file="${message.data.file}">
						<div class="progress-bar" role="progressbar"></div>
					</div>
				`));

      } else {
        let bar = PROGRESS_BARS.querySelector(`.progress[model="${message.data.name}"][file="${message.data.file}"]> .progress-bar`)

        switch (message.data.status) {
          case 'progress':
            // update existing bar
            bar.style.width = message.data.progress.toFixed(2) + '%';
            bar.textContent = `${message.data.file} (${formatBytes(message.data.loaded)} / ${formatBytes(message.data.total)})`;
            break;

          case 'done':
            // Remove the progress bar
            bar.parentElement.remove();
            break;

          case 'ready':
            // Pipeline is ready - hide container
            PROGRESS.style.display = 'none';
            PROGRESS_BARS.innerHTML = '';
            break;
        }
      }

      break;
    case 'update': // for generation
      let target = message.target;
      let elem = document.getElementById(target);

      switch (message.targetType) {
        case 'code':
          CODE_BLOCKS[target].update(message.data);
          break;
        default: // is textbox
          elem.value = message.data
          break;
      }

      break;

    case 'complete':
      switch (message.targetType) {
        case 'chart':
          const chartToUpdate = CHARTS[message.target];

          let chartData = chartToUpdate.data.datasets[0].data;

          if (message.updateLabels) {
            for (let i = 0; i < message.data.length; ++i) {
              let item = message.data[i];
              chartData[i] = item.score;
              chartToUpdate.data.labels[i] = item.label;
            }
          } else {
            // set data, ensuring labels align correctly
            for (let item of message.data) {
              chartData[
                chartToUpdate.data.labels.indexOf(item.label)
              ] = item.score
            }
          }

          chartToUpdate.update(); // update the chart
          break;

        case 'tokens':
          let target = document.getElementById(message.target);
          target.innerHTML = '';

          let tokens = message.data;

          for (let token of tokens) {
            let elem;
            if (token.type === 'O') {
              elem = document.createTextNode(token.text);
            } else {
              let [textColour, backgroundColour, tagColour] = NER_TAGS[token.type];
              elem = htmlToElement(`<span class="ner-container" style="background-color: ${backgroundColour}; color: ${textColour};">${token.text}<span class="ner-tag" style="background-color: ${tagColour}; color: ${backgroundColour};">${token.type}</span></span>`);
            }
            target.appendChild(elem);

          }
          break;

        case 'overlay':
          let parent = document.getElementById(message.target);

          // Clear previous output, just in case
          parent.innerHTML = '';

          let viewbox = parent.viewBox.baseVal;

          let colours = [];
          let borderColours = [];

          let items = message.data;
          for (let i = 0; i < items.length; ++i) {
            const box = items[i].box;

            let svgns = "http://www.w3.org/2000/svg";
            let rect = document.createElementNS(svgns, 'rect');

            rect.setAttribute('x', viewbox.width * box.xmin);
            rect.setAttribute('y', viewbox.height * box.ymin);
            rect.setAttribute('width', viewbox.width * (box.xmax - box.xmin));
            rect.setAttribute('height', viewbox.height * (box.ymax - box.ymin));

            const colour = COLOURS[i % COLOURS.length];
            rect.style.stroke = rect.style.fill = `rgba(${colour}, 1)`;

            colours.push(`rgba(${colour}, 0.5)`);
            borderColours.push(`rgba(${colour}, 1)`);
            parent.appendChild(rect);
          }

          // Update chart label and data
          const chart = CHARTS[message.chartId];
          chart.data.labels = items.map(x => x.label);
          chart.data.datasets[0] = {
            data: items.map(x => x.score),
            backgroundColor: colours,
            borderColor: borderColours
          };
          chart.update()
          break;
        default: // is text
          document.getElementById(message.target).value = message.data
          break;
      }
      break;
    default:
      break;
  }
});

