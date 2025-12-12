import Board from './Board';

export default class Form {
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

  static get selector() { return '.board-column__form'; }

  static get textareaSelector() { return '.board-column__textarea'; }

  static get addSelector() { return '.board-column__add'; }

  static get cancelSelector() { return '.board-column__cancel'; }

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
      const cards = [ ...this.cardList.querySelectorAll(Board.cardSelector) ];
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