let inputElements = [];
let solutionsElement = null;

const updateUiForHistory = () => {
  if (window.location.hash.toLowerCase().includes('solver')) {
    openSolverUi();
  } else {
    openGameUi();
  }
};

const openSolverUi = () => {
  document.body.classList.add('solving');
  window.location.hash = 'solver';
  inputElements[0].focus();
  inputElements[0].select();
};

const openGameUi = () => {
  document.body.classList.remove('solving');
  window.location.hash = 'game';
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

const solvePuzzle = () => {
  if (inputElements.some((element) => !element.value.trim())) return;

  while (solutionsElement.firstChild) {
    solutionsElement.firstChild.remove();
  }

  for (var i = 0; i < 5; i++) {
    const solution = document.createElement('div');
    solution.innerText = 'Hey there ' + Math.floor(Math.random() * 10);
    solutionsElement.appendChild(solution);
  }
};

window.onload = () => {
  solutionsElement = document.querySelector('.solver-solutions');
  inputElements = Array.from(document.querySelectorAll('.number-inputs input'));

  inputElements.forEach((element, index, array) => {
    element.addEventListener('input', () => {
      if (array.every((element) => element.value.trim())) {
        solvePuzzle();
      } else if (element.value.trim() && index != array.length - 1) {
        array[index + 1].focus();
        array[index + 1].select();
      }
    });
  });

  addActionListener(open_solver_button, openSolverUi);
  addActionListener(open_game_button, openGameUi);

  window.addEventListener('popstate', updateUiForHistory);
  updateUiForHistory();
};