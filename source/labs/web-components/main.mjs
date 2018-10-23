// import { HTMLClockElement } from './clock.mjs'

// customElements.define('x-clock', HTMLClockElement);

// document.getElementById('reg').addEventListener('click', (e) => {
// })

// customElements.whenDefined('x-clock').then(() => {
//   console.log('x-clock defined');
// });

const div = document.getElementById('to-attach-shadow');

// attach a shadow dom tree to it
const shadowRoot = div.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = '<p>shadow p1</p><p>shadow p2</p>';

div.shadowRoot === shadowRoot
shadowRoot.host === div