import { HTMLClockElement } from './clock.mjs'

customElements.define('x-clock', HTMLClockElement);

document.getElementById('reg').addEventListener('click', (e) => {
})

customElements.whenDefined('x-clock').then(() => {
  console.log('x-clock defined');
});