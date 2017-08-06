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
  LIST,
  COMMENT
} from './types';

/**
 */
export const Null = function() {
  return {
    type: NULL
  };
};

/**
 *  elements: [Element]
 */
export const Block = function(elements) {
  return {
    type: BLOCK,
    elements
  };
};

/**
 *  identifier: Identifier
 *  expression: Expression
 */
export const Assignment = function(identifier, expression) {
  return {
    type: ASSIGNMENT,
    identifier,
    expression
  };
};

/**
 *  identifier: Identifier
 *  args:       [Expression]
 */
export const Application = function(identifier, args, block = Null()) {
  return {
    type: APPLICATION,
    identifier,
    args,
    block
  };
};

/**
 *  predicate: Expression
 *  ifBlock:   Block
 *  elseBlock: Block
 */
export const If = function(predicate, ifBlock, elseBlock = Null()) {
  return {
    type: IF,
    predicate,
    ifBlock,
    elseBlock
  };
};

/**
 *  argNames:  [Identifier]
 *  body:      Block
 *  inlinable: Boolean
 */
export const Closure = function(argNames, body, inlinable = false) {
  return {
    type: CLOSURE,
    argNames,
    body,
    inlinable
  };
};

/**
 *  number:  Expression
 *  block:   Block
 *  loopVar: Identifier
 */
export const Times = function(number, block, loopVar = Null()) {
  return {
    type: TIMES,
    number,
    block,
    loopVar
  };
};

/**
 *  block: Block
 */
export const DoOnce = function(active, block = Null()) {
  return {
    type: DOONCE,
    active,
    block
  };
};

/**
 *  operation: String
 *  expr1: Expression
 */
export const UnaryOp = function(operator, expr1) {
  return {
    type: UNARYOP,
    operator,
    expr1
  };
};

/**
 *  operation: String
 *  expr1: Expression
 *  expr2: Expression
 */
export const BinaryOp = function(operator, expr1, expr2) {
  return {
    type: BINARYOP,
    operator,
    expr1,
    expr2
  };
};

/**
 *  collection: Expression
 *  index: Expression
 */
export const DeIndex = function(collection, index) {
  return {
    type: DEINDEX,
    collection,
    index
  };
};

/**
 *  value: Number
 */
export const Num = function(value) {
  return {
    type: NUM,
    value
  };
};

/**
 *  value: Identifier
 */
export const Variable = function(identifier) {
  return {
    type: VARIABLE,
    identifier
  };
};

/**
 *  value: String
 */
export const Str = function(value) {
  return {
    type: STRING,
    value
  };
};

/**
 *  value: List
 */
export const List = function(values) {
  return {
    type: LIST,
    values
  };
};

/**
 */
export const Comment = function() {
  return {
    type: COMMENT
  };
};
