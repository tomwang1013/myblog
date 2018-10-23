export class HTMLClockElement extends HTMLElement {
  constructor() {
    super();
    // this.innerHTML = 'i am a clock custom element'
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        ...
      </style>
      <p>from clock's shadow dom</p>
      <slot></slot>
    `;

    console.log('custom element created')
  }

  // 指定需要观察的属性
  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    console.log('insert into dom')
  }

  disconnectedCallback() {
    console.log('removed from dom')
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log(`${attrName} changed from ${oldVal} to ${newVal}`)
  }

  adoptedCallback() {
    console.log('move to new document')
  }
}