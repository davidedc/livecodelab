import {
  NULL,
  BLOCK,
  ASSIGNMENT,
  APPLICATION,
  IF,
  CLOSURE,
  TIMES,
  DOONCE,
  UNARYOP,
  BINARYOP,
  DEINDEX,
  NUM,
  VARIABLE,
  STRING,
  LIST
} from './types';

/**
 */
export function Null() {
  return {
    type: NULL
  };
}

/**
 *  elements: [Element]
 */
export function Block(elements) {
  return {
    type: BLOCK,
    elements
  };
}

/**
 *  identifier: Identifier
 *  expression: Expression
 */
export function Assignment(identifier, expression) {
  return {
    type: ASSIGNMENT,
    identifier,
    expression
  };
}

/**
 *  identifier: Identifier
 *  args:       [Expression]
 */
export function Application(identifier, args, block = Null()) {
  return {
    type: APPLICATION,
    identifier,
    args,
    block
  };
}

/**
 *  predicate: Expression
 *  ifBlock:   Block
 *  elseBlock: Block
 */
export function If(predicate, ifBlock, elseBlock = Null()) {
  return {
    type: IF,
    predicate,
    ifBlock,
    elseBlock
  };
}

/**
 *  argNames:  [Identifier]
 *  body:      Block
 *  inlinable: Boolean
 */
export function Closure(argNames, body, inlinable = false) {
  return {
    type: CLOSURE,
    argNames,
    body,
    inlinable
  };
}

/**
 *  number:  Expression
 *  block:   Block
 *  loopVar: Identifier
 */
export function Times(number, block, loopVar = Null()) {
  return {
    type: TIMES,
    number,
    block,
    loopVar
  };
}

/**
 *  block: Block
 */
export function DoOnce(active, block = Block([])) {
  return {
    type: DOONCE,
    active,
    block
  };
}

/**
 *  operation: String
 *  expr1: Expression
 */
export function UnaryOp(operator, expr1) {
  return {
    type: UNARYOP,
    operator,
    expr1
  };
}

/**
 *  operation: String
 *  expr1: Expression
 *  expr2: Expression
 */
export function BinaryOp(operator, expr1, expr2) {
  return {
    type: BINARYOP,
    operator,
    expr1,
    expr2
  };
}

/**
 *  collection: Expression
 *  index: Expression
 */
export function DeIndex(collection, index) {
  return {
    type: DEINDEX,
    collection,
    index
  };
}

/**
 *  value: Number
 */
export function Num(value) {
  return {
    type: NUM,
    value
  };
}

/**
 *  value: Identifier
 */
export function Variable(identifier) {
  return {
    type: VARIABLE,
    identifier
  };
}

/**
 *  value: String
 */
export function Str(value) {
  return {
    type: STRING,
    value
  };
}

/**
 *  value: List
 */
export function List(values) {
  return {
    type: LIST,
    values
  };
}
