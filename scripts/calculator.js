class Expression {
  /** @return {string} */
  toString() {}
  /** @return {number} */
  getValue() {}
}

class SingleNumber extends Expression {
  /** @param {number} value */
  constructor(value) {
    super();

    /** @private {number} */
    this.value_ = value;
  }

  /** @override */
  toString() {
    return String(this.value_);
  }

  /** @override */
  getValue() {
    return this.value_;
  }
}

class Operation extends Expression {
  /**
   * @param {!Expression|number} left
   * @param {!Expression|number} right
   */
  constructor(left, right) {
    super();

    /** @protected {!Expression} */
    this.left = (typeof left == 'number') ? new SingleNumber(left) : left;
    /** @protected {!Expression} */
    this.right = (typeof right == 'number') ? new SingleNumber(right) : right;
  }

  /** @override */
  toString() {
    const leftSide =
        operationOrder.get(this.left.constructor) <
            operationOrder.get(this.constructor) &&
        !(this.left instanceof SingleNumber) ?
            `(${this.left.toString()})` :
            `${this.left.toString()}`;

    let rightNeedsParens = false;
    if (operationOrder.get(this.right.constructor) ===
            operationOrder.get(this.constructor) &&
        NON_COMMUTATIVE_OPERATIONS.includes(this.right.constructor)) {
      rightNeedsParens = true;
    }
    if (operationOrder.get(this.right.constructor) <
            operationOrder.get(this.constructor)) {
      rightNeedsParens = true;
    }

    const rightSide =
        rightNeedsParens && !(this.right instanceof SingleNumber) ?
            `(${this.right.toString()})` :
            `${this.right.toString()}`;

    return this.toStringInternal(leftSide, rightSide);
  }

  /**
   * @param {string} leftSide
   * @param {string} rightSide
   * @return {string}
   */
  toStringInternal() {}
}

class Addition extends Operation {
  constructor(left, right) {
    super(left, right);
  }

  /** @override */
  toStringInternal(leftSide, rightSide) {
    return `${leftSide} + ${rightSide}`;
  }

  /** @override */
  getValue() {
    return this.left.getValue() + this.right.getValue();
  }
}

class Subtraction extends Operation {
  constructor(left, right) {
    super(left, right);
  }

  /** @override */
  toStringInternal(leftSide, rightSide) {
    return `${leftSide} - ${rightSide}`;
  }

  /** @override */
  getValue() {
    return this.left.getValue() - this.right.getValue();
  }
}

class Multiplication extends Operation {
  constructor(left, right) {
    super(left, right);
  }

  /** @override */
  toStringInternal(leftSide, rightSide) {
    return `${leftSide} * ${rightSide}`;
  }

  /** @override */
  getValue() {
    return this.left.getValue() * this.right.getValue();
  }
}

class Division extends Operation {
  constructor(left, right) {
    super(left, right);
  }

  /** @override */
  toStringInternal(leftSide, rightSide) {
    return `${leftSide} / ${rightSide}`;
  }

  /** @override */
  getValue() {
    return this.left.getValue() / this.right.getValue();
  }
}

class Exponentiation extends Operation {
  constructor(left, right) {
    super(left, right);
  }

  /** @override */
  toStringInternal(leftSide, rightSide) {
    return `${leftSide} ^ ${rightSide}`;
  }

  /** @override */
  getValue() {
    return Math.pow(this.left.getValue(), this.right.getValue());
  }
}

/** @const Map<!Expression, number> */
const operationOrder = new Map([
  [Addition, 0],
  [Subtraction, 0],
  [Division, 1],
  [Multiplication, 1],
  [Exponentiation, 2],
  [SingleNumber, 3],
]);

/** @type !Array<function(new:Operation)> */
const ALL_OPERATIONS = Object.freeze([
  Addition,
  Subtraction,
  Multiplication,
  Division,
  Exponentiation,
]);

/** @type !Array<function(new:Operation)> */
const NON_COMMUTATIVE_OPERATIONS = Object.freeze([
  Subtraction,
  Division,
  Exponentiation,
]);

/**
 * @param {!Array<number>} numbers
 * @param {number} target
 * @return {!Set<string>} solutions
 */
function checkNumberSet(numbers, target) {
  return new Set(
      this.checkNumberSetHelper(
              numbers.map((number) => new SingleNumber(number)),
              target)
          .map((expression) => expression.toString()));
}

/**
 * @param {!Array<!Expression>} expressions
 * @param {number} target
 * @return {!Array<Expression>} solutions
 */
function checkNumberSetHelper(expressions, target) {
  if (expressions.length === 1) {
    return expressions.filter((expression) => expression.getValue() === target);
  }
  if (expressions.some((expression) => expression.getValue() < 0)) return [];

  const solutionExpressions = [];

  expressions.forEach((expression1, i) => {
    expressions.forEach((expression2, j) => {
      if (j <= i) return;

      ALL_OPERATIONS.forEach((OperationType) => {
        const partialExpressions = [
          new OperationType(expression1, expression2),
          ...expressions.filter((_, k) => k != i && k != j)
        ];
        solutionExpressions.push(
            ...checkNumberSetHelper(partialExpressions, target));
      });

      NON_COMMUTATIVE_OPERATIONS.forEach((OperationType) => {
        const partialExpressions = [
          new OperationType(expression2, expression1),
          ...expressions.filter((_, k) => k != i && k != j)
        ];
        solutionExpressions.push(
            ...checkNumberSetHelper(partialExpressions, target));
      });
    });
  });

  return solutionExpressions;
}
