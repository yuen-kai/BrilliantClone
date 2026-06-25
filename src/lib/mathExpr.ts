import { choose } from './lessonEngine'

export type Op = '+' | '-' | '*' | '/' | '!' | 'C' | 'P'

export type EvalResult =
  | { ok: true; value: number; opsUsed: Set<Op> }
  | {
      ok: false
      error: 'empty' | 'syntax' | 'locked' | 'domain'
      lockedOp?: Op
      message: string
    }

type SymbolTok = '+' | '-' | '*' | '/' | '!' | '(' | ')' | ','

type Token =
  | { t: 'num'; value: number }
  | { t: SymbolTok }
  | { t: 'func'; name: 'C' | 'P' }

type Node =
  | { type: 'num'; value: number }
  | { type: 'neg'; operand: Node }
  | { type: 'fact'; operand: Node }
  | { type: 'bin'; op: '+' | '-' | '*' | '/'; left: Node; right: Node }
  | { type: 'func'; name: 'C' | 'P'; args: [Node, Node] }

class ParseError extends Error {}
class DomainError extends Error {}

const SYMBOLS = new Set(['+', '-', '*', '/', '!', '(', ')', ','])

function normalizeAliases(input: string): string {
  return input.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-')
}

/** Returns null when an unrecognized character is found (→ syntax error). */
function tokenize(input: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const c = input[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (/[0-9.]/.test(c)) {
      let raw = ''
      while (i < input.length && /[0-9.]/.test(input[i])) raw += input[i++]
      const value = Number(raw)
      if (Number.isNaN(value)) return null
      tokens.push({ t: 'num', value })
      continue
    }
    if (SYMBOLS.has(c)) {
      tokens.push({ t: c as SymbolTok })
      i++
      continue
    }
    if (c === 'C' || c === 'c') {
      tokens.push({ t: 'func', name: 'C' })
      i++
      continue
    }
    if (c === 'P' || c === 'p') {
      tokens.push({ t: 'func', name: 'P' })
      i++
      continue
    }
    return null
  }
  return tokens
}

/**
 * Recursive descent: expr → term → unary → postfix → primary.
 * Precedence low→high: (+ -) < (* /) < unary minus < postfix ! < primary.
 * Operators are collected as they are consumed so callers can gate on them
 * without first evaluating (lets "locked" win over "domain").
 */
function parse(tokens: Token[]): { ast: Node; opsUsed: Set<Op> } {
  let pos = 0
  const opsUsed = new Set<Op>()

  const peek = () => tokens[pos]
  const expect = (t: Token['t']) => {
    if (peek()?.t !== t) throw new ParseError()
    pos++
  }

  function parseExpression(): Node {
    let left = parseTerm()
    while (peek()?.t === '+' || peek()?.t === '-') {
      const op = tokens[pos++].t as '+' | '-'
      opsUsed.add(op)
      left = { type: 'bin', op, left, right: parseTerm() }
    }
    return left
  }

  function parseTerm(): Node {
    let left = parseUnary()
    while (peek()?.t === '*' || peek()?.t === '/') {
      const op = tokens[pos++].t as '*' | '/'
      opsUsed.add(op)
      left = { type: 'bin', op, left, right: parseUnary() }
    }
    return left
  }

  function parseUnary(): Node {
    if (peek()?.t === '-') {
      pos++
      opsUsed.add('-')
      return { type: 'neg', operand: parseUnary() }
    }
    return parsePostfix()
  }

  function parsePostfix(): Node {
    let node = parsePrimary()
    while (peek()?.t === '!') {
      pos++
      opsUsed.add('!')
      node = { type: 'fact', operand: node }
    }
    return node
  }

  function parsePrimary(): Node {
    const tok = peek()
    if (!tok) throw new ParseError()
    if (tok.t === 'num') {
      pos++
      return { type: 'num', value: tok.value }
    }
    if (tok.t === '(') {
      pos++
      const inner = parseExpression()
      expect(')')
      return inner
    }
    if (tok.t === 'func') {
      pos++
      opsUsed.add(tok.name)
      expect('(')
      const a = parseExpression()
      expect(',')
      const b = parseExpression()
      expect(')')
      return { type: 'func', name: tok.name, args: [a, b] }
    }
    throw new ParseError()
  }

  const ast = parseExpression()
  if (pos !== tokens.length) throw new ParseError()
  return { ast, opsUsed }
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new DomainError('! only works on whole numbers ≥ 0.')
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

function permute(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0)
    throw new DomainError('P(n, k) needs whole numbers ≥ 0.')
  if (k > n) return 0
  return factorial(n) / factorial(n - k)
}

function combine(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0)
    throw new DomainError('C(n, k) needs whole numbers ≥ 0.')
  return choose(n, k)
}

function evalNode(node: Node): number {
  if (node.type === 'num') return node.value
  if (node.type === 'neg') return -evalNode(node.operand)
  if (node.type === 'fact') return factorial(evalNode(node.operand))
  if (node.type === 'func') {
    const a = evalNode(node.args[0])
    const b = evalNode(node.args[1])
    return node.name === 'C' ? combine(a, b) : permute(a, b)
  }
  const l = evalNode(node.left)
  const r = evalNode(node.right)
  if (node.op === '+') return l + r
  if (node.op === '-') return l - r
  if (node.op === '*') return l * r
  return l / r
}

export function evaluateExpression(input: string, allowedOps?: Set<Op>): EvalResult {
  if (input.trim() === '') return { ok: false, error: 'empty', message: 'Enter an expression.' }

  const tokens = tokenize(normalizeAliases(input))
  if (!tokens) return { ok: false, error: 'syntax', message: "That expression isn't written correctly." }

  let ast: Node
  let opsUsed: Set<Op>
  try {
    ;({ ast, opsUsed } = parse(tokens))
  } catch {
    return { ok: false, error: 'syntax', message: "That expression isn't written correctly." }
  }

  if (allowedOps) {
    for (const op of opsUsed) {
      if (!allowedOps.has(op)) {
        return {
          ok: false,
          error: 'locked',
          lockedOp: op,
          message: `The ${op} operation isn't unlocked yet.`,
        }
      }
    }
  }

  try {
    const value = evalNode(ast)
    if (!Number.isFinite(value)) return { ok: false, error: 'domain', message: "That doesn't have a finite value." }
    return { ok: true, value, opsUsed }
  } catch (err) {
    if (err instanceof DomainError) return { ok: false, error: 'domain', message: err.message }
    return { ok: false, error: 'syntax', message: "That expression isn't written correctly." }
  }
}

const PREC = { add: 1, mul: 2, neg: 3, postfix: 4, atom: 5 } as const

function precedence(node: Node): number {
  if (node.type === 'bin') {
    if (node.op === '+' || node.op === '-') return PREC.add
    if (node.op === '*') return PREC.mul
    return PREC.atom // division renders as a self-grouping \dfrac
  }
  if (node.type === 'neg') return PREC.neg
  return PREC.atom
}

function wrap(node: Node, minPrec: number): string {
  const inner = nodeToLatex(node)
  return precedence(node) < minPrec ? `\\left(${inner}\\right)` : inner
}

function nodeToLatex(node: Node): string {
  if (node.type === 'num') return String(node.value)
  if (node.type === 'neg') return `-${wrap(node.operand, PREC.neg)}`
  if (node.type === 'fact') return `${wrap(node.operand, PREC.postfix)}!`
  if (node.type === 'func') {
    const a = nodeToLatex(node.args[0])
    const b = nodeToLatex(node.args[1])
    return node.name === 'C' ? `\\binom{${a}}{${b}}` : `{}^{${a}}\\mkern-2mu P_{${b}}`
  }
  if (node.op === '/') return `\\dfrac{${nodeToLatex(node.left)}}{${nodeToLatex(node.right)}}`
  if (node.op === '*') return `${wrap(node.left, PREC.mul)} \\times ${wrap(node.right, PREC.mul)}`
  if (node.op === '+') return `${nodeToLatex(node.left)} + ${nodeToLatex(node.right)}`
  return `${nodeToLatex(node.left)} - ${wrap(node.right, PREC.mul)}`
}

function fallbackLatex(input: string): string {
  return normalizeAliases(input).replace(/\*/g, ' \\times ').replace(/\//g, ' \\div ')
}

/** Best-effort, never-throwing conversion of our notation into display LaTeX. */
export function exprToLatex(input: string): string {
  try {
    const tokens = tokenize(normalizeAliases(input))
    if (tokens) return nodeToLatex(parse(tokens).ast)
  } catch {
    // fall through to a light symbol swap below
  }
  return fallbackLatex(input)
}
