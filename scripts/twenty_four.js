/** @type {!Array<!Element>} */
let inputElements = [];
/** @type {?Element} */
let solutionsElement = null;
/** @type {?Element} */
let gameGridElement = null;
/** @type {?Element} */
let gameGeneratorInputElement = null;
/** @type {?Element} */
let gameProblemSetsElement = null;
/** @type {?Element} */
let gameProblemActionsElement = null;

let lastGameGeneratorInputValue = '';
const gameGridCharacterElements = [];
const alphabetIndexToDigit = new Map();
let nextGameIndex = 0;
const gameWords = new Set();
let activeGameProblem = null

window.onload = () => {
  solutionsElement = document.querySelector('.solver-solutions');
  inputElements = Array.from(document.querySelectorAll('.number-inputs input'));
  gameGridElement = document.querySelector('.game-grid');
  gameGeneratorInputElement = document.querySelector('.game-generator-input');
  gameProblemSetsElement = document.querySelector('.game-problem-sets');
  gameProblemActionsElement = document.querySelector('.game-problem-actions');

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

  gameGeneratorInputElement.addEventListener('input', handleGameGeneratorInput);

  addActionListener(open_solver_button, openSolverUi);
  addActionListener(open_game_button, openGameUi);

  window.addEventListener('popstate', updateUiForHistory);
  updateUiForHistory();
};

const updateUiForHistory = () => {
  if (window.location.hash.toLowerCase().includes('solver')) {
    openSolverUi();
  } else {
    openGameUi();
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



const openSolverUi = () => {
  document.body.classList.add('solving');
  window.location.hash = 'solver';
  inputElements[0].focus();
  inputElements[0].select();
  window.addEventListener('keydown', handleSelectAll);
  document.removeEventListener('click', handleDocClick, true /* useCapture */);
  open_solver_button.classList.add('selected');
  open_game_button.classList.remove('selected');
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



const openGameUi = () => {
  document.body.classList.remove('solving');
  window.location.hash = 'game';
  window.removeEventListener('keydown', handleSelectAll);
  document.addEventListener('click', handleDocClick, true /* useCapture */);
  open_solver_button.classList.remove('selected');
  open_game_button.classList.add('selected');

  maybeInitGameGrid();

  addActionListener(mark_correct_button, () => {
    activeGameProblem && activeGameProblem.setCorrect(true);
    hideGameProblemActions();
  });
  addActionListener(mark_incorrect_button, () => {
    activeGameProblem && activeGameProblem.setCorrect(false);
    hideGameProblemActions();
  });
  addActionListener(show_solutions_button, () => {
    // Show solutions.
  });
};

const handleDocClick = (e) => {
  if (gameProblemActionsElement.classList.contains('showing') &&
      !gameProblemActionsElement.contains(e.target) &&
      !gameProblemSetsElement.contains(e.target)) {
    hideGameProblemActions();
  };
};

const maybeInitGameGrid = () => {
  if (gameGridElement.children.length) return;

  for (let i = 1; i <= 9; i++) {
    const gridEntry = document.createElement('label');
    gridEntry.innerText = String(i);
    gameGridElement.appendChild(gridEntry);
  }

  for (let i = 1; i <= 26; i++) {
    const gridEntry = document.createElement('label');
    gridEntry.innerText = '_';
    gameGridElement.appendChild(gridEntry);
    gameGridCharacterElements.push(gridEntry);
  }
};

const handleGameGeneratorInput = () => {
  const newValue = gameGeneratorInputElement.value.toUpperCase();
  if (newValue.lastIndexOf(lastGameGeneratorInputValue, 0) === 0) {
    const newCharacters =
        newValue.substring(lastGameGeneratorInputValue.length);
    processGameCharacters(newCharacters);
  } else {
    processGameCharacters(newValue);
  }
  lastGameGeneratorInputValue = newValue;

  new Set(
      (newValue.match(/\b[A-Z][A-Z][A-Z][A-Z]\b(?!$)/g) || [])
          .filter((word) => !gameWords.has(word)))
      .forEach((word) => {
        gameWords.add(word);
        const digits =
            word.split('')
                .map((char) => {
                  const alphabetIndex = char.charCodeAt(0) - 65;
                  return alphabetIndexToDigit.get(alphabetIndex);
                })
                .sort();

        const gameProblemElement = document.createElement('div');
        const newProblem = new GameProblem(gameProblemElement, digits);
        gameProblemElement.innerText = `${word} - ${digits.join('')}`;
        gameProblemSetsElement.appendChild(gameProblemElement);
      });
};

const processGameCharacters = (characters) => {
  for (let i = 0; i < characters.length; i++) {
    const char = characters.charAt(i);
    const alphabetIndex = char.charCodeAt(0) - 65;
    if (alphabetIndex >= 0 &&
        alphabetIndex <= 25 &&
        !alphabetIndexToDigit.has(alphabetIndex)) {
      alphabetIndexToDigit.set(alphabetIndex, nextGameIndex % 9 + 1);
      gameGridCharacterElements[nextGameIndex].innerText = char;
      nextGameIndex++;
    }
  }
};

/** @param {!Element} element */
const attachGameProblemActions = (element) => {
  gameProblemActionsElement.style.visibility = 'hidden';
  gameProblemActionsElement.style.display = '';

  const elementRect = element.getBoundingClientRect();
  const horizontalCenter = elementRect.left + elementRect.width / 2;

  const left =
      Math.max(0, horizontalCenter - gameProblemActionsElement.clientWidth / 2);
  const top =
      Math.max(0, elementRect.top - gameProblemActionsElement.clientHeight);
  gameProblemActionsElement.style.left = `${left}px`;
  gameProblemActionsElement.style.top = `${top}px`;

  gameProblemActionsElement.style.visibility = '';
  gameProblemActionsElement.classList.add('showing');
};

const hideGameProblemActions = () => {
  gameProblemActionsElement.classList.remove('showing');
  setTimeout(() => {
    gameProblemActionsElement.style.display = 'none';
  }, 218);
  activeGameProblem = null;
};

class GameProblem {
  /**
   * @param {!Element} element The problem element in the game problem grid.
   * @param {!Array<number>} digits The digits of the problem.
   */
  constructor(element, digits) {
    /** @private {!Element} */
    this.element_ = element;
    /** @private {!Array<number>} */
    this.digits_ = digits;
    /** @private {boolean|undefined} */
    this.correct_ = undefined;

    addActionListener(this.element_, () => {
      attachGameProblemActions(this.element_);
      activeGameProblem = this;
    });
  }

  /** @param {boolean} correct */
  setCorrect(correct) {
    if (this.correct_ === false) return;
    this.correct_ = correct;
    this.element_.classList.toggle('correct', correct);
    this.element_.classList.toggle('incorrect', !correct);
  }

}
