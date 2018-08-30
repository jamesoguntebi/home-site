let inputElements = [];
let solutionsElement = null;
let puzzleGridElement = null;

const updateUiForHistory = () => {
  if (window.location.hash.toLowerCase().includes('solver')) {
    openSolverUi();
  } else {
    openGameUi();
  }
};

const handleSelectAll = (keyEvent) => {
  if (keyEvent.ctrlKey && keyEvent.key == 'a') {
    inputElements.forEach((element) => element.value = '');
    inputElements[0].focus();
    inputElements[0].select();

    while (solutionsElement.firstChild) {
      solutionsElement.firstChild.remove();
    }
  }
};

const openSolverUi = () => {
  document.body.classList.add('solving');
  window.location.hash = 'solver';
  inputElements[0].focus();
  inputElements[0].select();
  window.addEventListener('keydown', handleSelectAll);
  open_solver_button.classList.add('selected');
  open_game_button.classList.remove('selected');
};

const openGameUi = () => {
  document.body.classList.remove('solving');
  window.location.hash = 'game';
  window.removeEventListener('keydown', handleSelectAll);
  open_solver_button.classList.remove('selected');
  open_game_button.classList.add('selected');

  maybeInitPuzzleGrid();
};

const maybeInitPuzzleGrid = () => {
  if (puzzleGridElement.children.length) return;

  for (let i = 1; i <= 9; i++) {
    const gridEntry = document.createElement('label');
    gridEntry.innerText = String(i);
    puzzleGridElement.appendChild(gridEntry);
  }

  for (let i = 1; i <= 26; i++) {
    const gridEntry = document.createElement('label');
    gridEntry.innerText = '_';
    puzzleGridElement.appendChild(gridEntry);
  }
};

/**
 * Adds a click listener and an enter key listener to the element to call the
 * given function.
 * @param {!Element} element
 * @param {function():void} listener
 */
const addActionListener = (element, listener) => {
  element.addEventListener('click', listener);
  element.addEventListener('keydown', (evt) => {
    if (evt.keyCode === 13) {
      listener();
    }
  });
};

const addToSolutionList = (text) => {
  const entryElement = document.createElement('div');
  entryElement.innerText = text;
  solutionsElement.appendChild(entryElement);
};

const solvePuzzle = () => {
  if (inputElements.some((element) => !element.value.trim())) return;

  while (solutionsElement.firstChild) {
    solutionsElement.firstChild.remove();
  }

  const solutions =
      checkNumberSet(
          inputElements.map((element) => Number(element.value)),
          24);

  solutions.forEach((solution) => addToSolutionList(solution));
  solutions.size || addToSolutionList('No solutions');
};

window.onload = () => {
  solutionsElement = document.querySelector('.solver-solutions');
  inputElements = Array.from(document.querySelectorAll('.number-inputs input'));
  puzzleGridElement = document.querySelector('.puzzle-grid');

  inputElements.forEach((element, index, array) => {
    element.addEventListener('input', () => {
      if (array.every((element) => element.value.trim())) {
        solvePuzzle();
      } else if (element.value.trim() && index != array.length - 1) {
        array[index + 1].focus();
        array[index + 1].select();
      }
    });
    element.addEventListener('keydown', (evt) => {
      if (index > 0 && !element.value && evt.keyCode == 8 /* backspace */) {
        array[index - 1].value = '';
        array[index - 1].focus();
      }
    });
  });

  addActionListener(open_solver_button, openSolverUi);
  addActionListener(open_game_button, openGameUi);

  window.addEventListener('popstate', updateUiForHistory);
  updateUiForHistory();
};
