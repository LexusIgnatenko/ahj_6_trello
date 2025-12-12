import Board from './Board';

export default class MouseDnD {
  constructor(classBoard) {
    this.classBoard = classBoard;
    this.parentEl = this.classBoard.element;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  static get draggableSelector() { return '.draggable'; }

  static get placeSelector() { return '.place'; }

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
    this.cardsBeforeDragging = [ ...this.columnBeforeDragging.querySelectorAll(Board.cardSelector) ];
    this.cardIndexBeforeDragging = this.cardsBeforeDragging.findIndex(item => item === this.card);

    const { top, left, width, height } = this.card.getBoundingClientRect();

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
    const cards = [ ...column.querySelectorAll(Board.cardSelector) ];
    const cardIndex = cards.findIndex(item => item === this.card);

    let key = Board.selector.slice(1) + '.' + this.columnBeforeDragging.id;
    if (
      (this.columnBeforeDragging !== column) ||
      (this.columnBeforeDragging === column && this.cardIndexBeforeDragging !== cardIndex)
    ) {
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
    if (
      elementUnderCursor.classList.contains(Board.cardSelector.slice(1)) &&
      !elementUnderCursor.classList.contains(MouseDnD.draggableSelector.slice(1))
    ) {
      const { y, height } = elementUnderCursor.getBoundingClientRect();
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
    } else if (
      elementUnderCursor.classList.contains(Board.cardsListSelector.slice(1)) &&
      elementUnderCursor.children.length === 0
    ) {
      elementUnderCursor.append(this.place);
    }
  }
}