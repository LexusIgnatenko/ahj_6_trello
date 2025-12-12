import Form from './Form';
import MouseDnD from './MouseDnD';

export default class Board {
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  static get markup() {
    return `
      <main class="board">
        <article class="board-column" id="todo">
          <h2 class="board-column__title">TODO</h2>
          <ul class="board-column__list"></ul>
          <div class="board-column__toggle"><span></span>Add another card</div>
        </article>
        <article class="board-column" id="in-progress">
          <h2 class="board-column__title">IN PROGRESS</h2>
          <ul class="board-column__list"></ul>
          <div class="board-column__toggle"><span></span>Add another card</div>
        </article>
        <article class="board-column" id="done">
          <h2 class="board-column__title">DONE</h2>
          <ul class="board-column__list"></ul>
          <div class="board-column__toggle"><span></span>Add another card</div>
        </article>
      </main>
    `;
  }

  static get selector() { return '.board'; }

  static get columnSelector() { return '.board-column'; }

  static get cardsListSelector() { return '.board-column__list'; }

  static get toggleSelector() { return '.board-column__toggle'; }

  static get cardSelector() { return '.board-column__item'; }

  static get removeCardSelector() { return '.board-column__remove-item'; }

  bindToDOM() {
    this.parentEl.insertAdjacentHTML('beforeEnd', Board.markup);
    this.element = this.parentEl.querySelector(Board.selector);
    this.columns = this.element.querySelectorAll(Board.columnSelector);
    this.toggles = this.element.querySelectorAll(Board.toggleSelector);

    this.toggles.forEach(toggle => {
      const form = new Form(toggle, this);
      form.bindToDOM();
    });

    const mouseDnD = new MouseDnD(this);
    mouseDnD.bindToDOM();
  }

  insertCard(where, content) {
    const card = document.createElement('li');
    card.className = Board.cardSelector.slice(1);
    card.insertAdjacentHTML('beforeEnd',
      `${content}<div class="${Board.removeCardSelector.slice(1)}">&#x2717;</div>`
    );
    where.append(card);
    return card;
  }

  setState(key) {
    const state = JSON.parse(localStorage.getItem(key));
    return state;
  }

  setCardInState(key, content, cardIndex = null) {
    let state = JSON.parse(localStorage.getItem(key));
    if (!state) state = [];

    if (typeof cardIndex === 'number') {
      state.splice(cardIndex, 0, content);
    } else {
      state.push(content);
    }

    localStorage.setItem(key, JSON.stringify(state));
  }

  removeCardInState(key, cardIndex) {
    let state = JSON.parse(localStorage.getItem(key));
    if (!state) return;

    const result = state[cardIndex];
    state.splice(cardIndex, 1);

    localStorage.setItem(key, JSON.stringify(state));
    return result;
  }
}