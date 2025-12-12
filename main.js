/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/components/board/Form.js

class Form {
  constructor(toggle, classBoard) {
    this.toggle = toggle;
    this.classBoard = classBoard;
    this.parentEl = this.toggle.closest(Board.columnSelector);
    this.key = Board.selector.slice(1) + '.' + this.parentEl.id;
    this.cardList = this.parentEl.querySelector(Board.cardsListSelector);
    this.onToggleClick = this.onToggleClick.bind(this);
    this.onElementClick = this.onElementClick.bind(this);
    this.onRemoveCardClick = this.onRemoveCardClick.bind(this);
  }
  static get markup() {
    return `
      <form class="board-column__form">
        <textarea class="board-column__textarea" placeholder="Enter a title for this card..." spellcheck="true"></textarea>
        <button type="button" class="board-column__add">Add card</button>
        <button type="reset" class="board-column__cancel">&#x2716;</button>
      </form>
    `;
  }
  static get selector() {
    return '.board-column__form';
  }
  static get textareaSelector() {
    return '.board-column__textarea';
  }
  static get addSelector() {
    return '.board-column__add';
  }
  static get cancelSelector() {
    return '.board-column__cancel';
  }
  bindToDOM() {
    this.toggle.addEventListener('click', this.onToggleClick);
    const state = this.classBoard.setState(this.key);
    if (!state) return;
    state.forEach(content => {
      const card = this.classBoard.insertCard(this.cardList, content);
      card.addEventListener('click', this.onRemoveCardClick);
    });
  }
  onToggleClick() {
    if (this.parentEl.querySelector(Form.selector)) return;
    this.toggle.classList.add('hidden');
    this.parentEl.insertAdjacentHTML('beforeEnd', Form.markup);
    this.element = this.parentEl.querySelector(Form.selector);
    this.textarea = this.element.querySelector(Form.textareaSelector);
    this.element.addEventListener('click', this.onElementClick);
  }
  onElementClick(e) {
    if (e.target.classList.contains(Form.addSelector.slice(1))) {
      const content = this.textarea.value.trim();
      const thereAreSpaces = /^\s*$/.test(content);
      if (thereAreSpaces) return;
      const card = this.classBoard.insertCard(this.cardList, content);
      card.addEventListener('click', this.onRemoveCardClick);
      this.classBoard.setCardInState(this.key, content);
      this.removeElement();
    } else if (e.target.classList.contains(Form.cancelSelector.slice(1))) this.removeElement();
  }
  onRemoveCardClick(e) {
    if (e.target.classList.contains(Board.removeCardSelector.slice(1))) {
      const card = e.target.closest(Board.cardSelector);
      const cards = [...this.cardList.querySelectorAll(Board.cardSelector)];
      const cardIndex = cards.findIndex(item => item === card);
      this.classBoard.removeCardInState(this.key, cardIndex);
      card.removeEventListener('click', this.onRemoveCardClick);
      card.remove();
    }
  }
  removeElement() {
    this.textarea.value = '';
    this.element.removeEventListener('click', this.onElementClick);
    this.element.remove();
    this.element = null;
    this.toggle.classList.remove('hidden');
  }
}
;// ./src/components/board/MouseDnD.js

class MouseDnD {
  constructor(classBoard) {
    this.classBoard = classBoard;
    this.parentEl = this.classBoard.element;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }
  static get draggableSelector() {
    return '.draggable';
  }
  static get placeSelector() {
    return '.place';
  }
  bindToDOM() {
    this.parentEl.addEventListener('mousedown', this.onMouseDown);
  }
  disableSelect(e) {
    e.preventDefault();
  }
  onMouseDown(e) {
    if (!e.target.classList.contains(Board.cardSelector.slice(1)) || this.card) return;
    this.card = e.target;
    this.columnBeforeDragging = this.card.closest(Board.columnSelector);
    this.cardsBeforeDragging = [...this.columnBeforeDragging.querySelectorAll(Board.cardSelector)];
    this.cardIndexBeforeDragging = this.cardsBeforeDragging.findIndex(item => item === this.card);
    const {
      top,
      left,
      width,
      height
    } = this.card.getBoundingClientRect();
    this.card.style.height = height + 'px';
    this.place = this.card.cloneNode(false);
    this.place.classList.add(MouseDnD.placeSelector.slice(1));
    this.card.style.width = width + 'px';
    this.shiftX = e.clientX - left;
    this.shiftY = e.clientY - top;
    this.card.replaceWith(this.place);
    this.card.classList.add(MouseDnD.draggableSelector.slice(1));
    this.card.style.left = e.pageX - this.shiftX + 'px';
    this.card.style.top = e.pageY - this.shiftY + 'px';
    document.body.append(this.card);
    document.addEventListener('selectstart', this.disableSelect);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
  onMouseUp() {
    this.place.replaceWith(this.card);
    this.card.style = null;
    this.card.classList.remove(MouseDnD.draggableSelector.slice(1));
    const column = this.card.closest(Board.columnSelector);
    const cards = [...column.querySelectorAll(Board.cardSelector)];
    const cardIndex = cards.findIndex(item => item === this.card);
    let key = Board.selector.slice(1) + '.' + this.columnBeforeDragging.id;
    if (this.columnBeforeDragging !== column || this.columnBeforeDragging === column && this.cardIndexBeforeDragging !== cardIndex) {
      const content = this.classBoard.removeCardInState(key, this.cardIndexBeforeDragging);
      key = Board.selector.slice(1) + '.' + column.id;
      this.classBoard.setCardInState(key, content, cardIndex);
    }
    this.card = null;
    this.place = null;
    this.columnBeforeDragging = null;
    this.cardsBeforeDragging = null;
    this.cardIndexBeforeDragging = null;
    this.shiftX = null;
    this.shiftY = null;
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('selectstart', this.disableSelect);
  }
  onMouseMove(e) {
    if (!this.card) return;
    this.card.style.left = e.pageX - this.shiftX + 'px';
    this.card.style.top = e.pageY - this.shiftY + 'px';
    this.card.hidden = true;
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    this.card.hidden = false;
    if (elementUnderCursor) this.insertPlace(e.clientY, elementUnderCursor);
  }
  insertPlace(clientY, elementUnderCursor) {
    if (elementUnderCursor.classList.contains(Board.cardSelector.slice(1)) && !elementUnderCursor.classList.contains(MouseDnD.draggableSelector.slice(1))) {
      const {
        y,
        height
      } = elementUnderCursor.getBoundingClientRect();
      const center = y + height / 2;
      let anotherCard = elementUnderCursor;
      if (!elementUnderCursor.nextElementSibling && clientY >= center) {
        anotherCard.after(this.place);
        return;
      }
      if (clientY >= center) {
        anotherCard = elementUnderCursor.nextElementSibling;
      }
      if (this.place !== anotherCard && this.place !== anotherCard.previousSibling) {
        anotherCard.before(this.place);
      }
    } else if (elementUnderCursor.classList.contains(Board.cardsListSelector.slice(1)) && elementUnderCursor.children.length === 0) {
      elementUnderCursor.append(this.place);
    }
  }
}
;// ./src/components/board/Board.js


class Board {
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
  static get selector() {
    return '.board';
  }
  static get columnSelector() {
    return '.board-column';
  }
  static get cardsListSelector() {
    return '.board-column__list';
  }
  static get toggleSelector() {
    return '.board-column__toggle';
  }
  static get cardSelector() {
    return '.board-column__item';
  }
  static get removeCardSelector() {
    return '.board-column__remove-item';
  }
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
    card.insertAdjacentHTML('beforeEnd', `${content}<div class="${Board.removeCardSelector.slice(1)}">&#x2717;</div>`);
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
;// ./src/js/app.js

document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  const board = new Board(content);
  board.bindToDOM();
});
;// ./src/index.js




// TODO: write your code in app.js
/******/ })()
;