import { HTMLClockElement } from './clock.mjs'

customElements.define('x-clock', HTMLClockElement);

// const div = document.getElementById('to-attach-shadow');

// attach a shadow dom tree to it
// const shadowRoot = div.attachShadow({ mode: 'open' });
// shadowRoot.innerHTML = `
//   <style>
//     :host {
//       color: red;
//     }

//     ::slotted(p) {
//       font-size: 30px;
//     }
//   </style>
//   <p>shadow p1</p>
//   <slot name="slot1"></slot>
//   <p>shadow p2</p>
//   <slot></slot>
// `;

// div.shadowRoot === shadowRoot
// shadowRoot.host === div