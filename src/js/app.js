import Board from '../components/board/Board';

document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  const board = new Board(content);
  board.bindToDOM();
});