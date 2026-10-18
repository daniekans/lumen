/*
 * A small parser and evaluator for the TeX that the math input (MathLive) produces and that problem
 * generators write: numbers, variables, + - * / ^, implicit multiplication, \frac, \sqrt, |x|,
 * common functions and constants. It is all the answer checker needs, at a fraction of the size of
 * a computer algebra system.
 */

export type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'neg'; a: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { t: 'fn'; name: string; a: Node }

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  sqrt: Math.sqrt,
  abs: Math.abs,
}

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E, exponentialE: Math.E }

/** Commands that carry no meaning for evaluation. */
const IGNORED = new Set([
  'left',
  'right',
  'displaystyle',
  'mathrm',
  'operatorname',
  'mathit',
  ',',
  ';',
  '!',
  ' ',
  ':',
  'quad',
  'qquad',
])

export class TexParseError extends Error {}

export const parseTex = (input: string): Node => new Parser(input).parseAll()

class Parser {
  private i = 0
  private absDepth = 0
  /** The source. Rewritten in place only to unwrap \mathrm{...} and \operatorname{...}. */
  private s: string
  constructor(source: string) {
    this.s = source
  }

  parseAll(): Node {
    const node = this.expr()
    this.ws()
    if (this.i < this.s.length)
      throw new TexParseError(`Unexpected "${this.s.slice(this.i, this.i + 8)}"`)
    return node
  }

  // ---- low level -------------------------------------------------------------------------------

  /** Skips whitespace and commands that do not affect the value (\left, \right, spacing). */
  private ws() {
    for (;;) {
      while (this.i < this.s.length && /\s/.test(this.s[this.i]!)) this.i++
      if (this.s[this.i] !== '\\') return
      const name = this.peekCommand()
      if (!IGNORED.has(name)) return
      this.i += 1 + name.length
      // \mathrm{e} or \operatorname{sin}: keep the braced content, it is parsed normally.
      if (
        (name === 'mathrm' || name === 'operatorname' || name === 'mathit') &&
        this.s[this.i] === '{'
      ) {
        const close = this.s.indexOf('}', this.i)
        if (close < 0) throw new TexParseError('Unclosed brace')
        const inner = this.s.slice(this.i + 1, close)
        const replacement = name === 'operatorname' || inner.length > 1 ? `\\${inner}` : inner
        this.s = this.s.slice(0, this.i) + replacement + this.s.slice(close + 1)
      }
    }
  }

  private peekCommand(): string {
    const rest = this.s.slice(this.i + 1)
    const word = /^[a-zA-Z]+/.exec(rest)
    return word ? word[0] : (rest[0] ?? '')
  }

  private peek(): string | undefined {
    this.ws()
    return this.s[this.i]
  }

  private eat(ch: string) {
    if (this.peek() !== ch) throw new TexParseError(`Expected "${ch}"`)
    this.i++
  }

  // ---- grammar ---------------------------------------------------------------------------------

  private expr(): Node {
    let node = this.term()
    for (;;) {
      const c = this.peek()
      if (c === '+' || c === '-') {
        this.i++
        node = { t: 'bin', op: c, a: node, b: this.term() }
      } else return node
    }
  }

  private term(): Node {
    let node = this.unary()
    for (;;) {
      const c = this.peek()
      if (c === '*' || c === '/') {
        this.i++
        node = { t: 'bin', op: c, a: node, b: this.unary() }
        continue
      }
      if (c === '\\') {
        const cmd = this.peekCommand()
        if (cmd === 'cdot' || cmd === 'times' || cmd === 'div') {
          this.i += 1 + cmd.length
          node = { t: 'bin', op: cmd === 'div' ? '/' : '*', a: node, b: this.unary() }
          continue
        }
      }
      if (this.startsOperand()) {
        node = { t: 'bin', op: '*', a: node, b: this.power() }
        continue
      }
      return node
    }
  }

  private unary(): Node {
    const c = this.peek()
    if (c === '-') {
      this.i++
      return { t: 'neg', a: this.unary() }
    }
    if (c === '+') {
      this.i++
      return this.unary()
    }
    return this.power()
  }

  /** Whether the next token can begin an operand, for implicit multiplication like 2x or 3(x+1). */
  private startsOperand(): boolean {
    const c = this.peek()
    if (c === undefined) return false
    if (/[0-9.a-zA-Z({[]/.test(c)) return true
    if (c === '|') return this.absDepth === 0
    if (c === '\\') {
      const cmd = this.peekCommand()
      if (cmd === 'vert' || cmd === 'lvert') return this.absDepth === 0
      return (
        cmd in FUNCTIONS || cmd in CONSTANTS || ['frac', 'dfrac', 'tfrac', 'sqrt'].includes(cmd)
      )
    }
    return false
  }

  private power(): Node {
    return this.powerTail(this.primary())
  }

  /** Right associative: 2^3^2 = 2^(3^2). */
  private powerTail(base: Node): Node {
    if (this.peek() !== '^') return base
    this.i++
    return { t: 'bin', op: '^', a: base, b: this.powerTail(this.exponent()) }
  }

  private exponent(): Node {
    const c = this.peek()
    if (c === '{') return this.group()
    if (c === '-') {
      this.i++
      return { t: 'neg', a: this.exponent() }
    }
    // A bare exponent is one character: x^23 means x^2 * 3 in TeX.
    if (c !== undefined && /[0-9]/.test(c)) {
      this.i++
      return { t: 'num', v: Number(c) }
    }
    return this.primary()
  }

  /** A braced group, or a single character for TeX shorthand like \frac12. */
  private group(): Node {
    const c = this.peek()
    if (c === '{') {
      this.i++
      const node = this.expr()
      this.eat('}')
      return node
    }
    if (c !== undefined && /[0-9]/.test(c)) {
      this.i++
      return { t: 'num', v: Number(c) }
    }
    return this.primary()
  }

  private primary(): Node {
    const c = this.peek()
    if (c === undefined) throw new TexParseError('Unexpected end')
    if (/[0-9.]/.test(c)) return this.number()
    if (c === '(' || c === '[' || c === '{') {
      const close = c === '(' ? ')' : c === '[' ? ']' : '}'
      this.i++
      const node = this.expr()
      this.eat(close)
      return node
    }
    if (c === '|') return this.abs('|')
    if (/[a-zA-Z]/.test(c)) return this.variable()
    if (c === '\\') return this.command()
    throw new TexParseError(`Unexpected "${c}"`)
  }

  private number(): Node {
    const m = /^(\d+\.?\d*|\.\d+)/.exec(this.s.slice(this.i))
    if (!m) throw new TexParseError('Invalid number')
    this.i += m[0].length
    return { t: 'num', v: Number(m[0]) }
  }

  /** A single-letter variable, with an optional subscript that becomes part of its name (x_0). */
  private variable(): Node {
    let name = this.s[this.i++]!
    if (this.s[this.i] === '_') {
      this.i++
      if (this.s[this.i] === '{') {
        const close = this.s.indexOf('}', this.i)
        if (close < 0) throw new TexParseError('Unclosed subscript')
        name += `_${this.s.slice(this.i + 1, close)}`
        this.i = close + 1
      } else name += `_${this.s[this.i++] ?? ''}`
    }
    if (name === 'e') return { t: 'num', v: Math.E }
    return { t: 'var', name }
  }

  private abs(close: '|' | 'vert'): Node {
    if (close === '|') this.i++
    this.absDepth++
    const node = this.expr()
    this.absDepth--
    if (close === '|') this.eat('|')
    else {
      this.ws()
      const cmd = this.peekCommand()
      if (cmd !== 'vert' && cmd !== 'rvert') throw new TexParseError('Unclosed absolute value')
      this.i += 1 + cmd.length
    }
    return { t: 'fn', name: 'abs', a: node }
  }

  private command(): Node {
    const cmd = this.peekCommand()
    this.i += 1 + cmd.length
    if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
      const a = this.group()
      const b = this.group()
      return { t: 'bin', op: '/', a, b }
    }
    if (cmd === 'sqrt') {
      if (this.peek() === '[') {
        this.i++
        const n = this.expr()
        this.eat(']')
        return {
          t: 'bin',
          op: '^',
          a: this.group(),
          b: { t: 'bin', op: '/', a: { t: 'num', v: 1 }, b: n },
        }
      }
      return { t: 'fn', name: 'sqrt', a: this.group() }
    }
    if (cmd === 'vert' || cmd === 'lvert') return this.abs('vert')
    if (cmd in CONSTANTS) return { t: 'num', v: CONSTANTS[cmd]! }
    if (cmd === 'log' && this.peek() === '_') {
      // \log_b x = ln x / ln b.
      this.i++
      const base = this.group()
      const arg = this.functionArgument()
      return {
        t: 'bin',
        op: '/',
        a: { t: 'fn', name: 'ln', a: arg },
        b: { t: 'fn', name: 'ln', a: base },
      }
    }
    if (cmd in FUNCTIONS) {
      // \sin^2 x means (\sin x)^2.
      let power: Node | undefined
      if (this.peek() === '^') {
        this.i++
        power = this.exponent()
      }
      const arg = this.functionArgument()
      const call: Node = { t: 'fn', name: cmd, a: arg }
      return power ? { t: 'bin', op: '^', a: call, b: power } : call
    }
    throw new TexParseError(`Unknown command \\${cmd}`)
  }

  /** \sin(x+1), \sin{x}, \sin x, \sin 2x (= sin(2x)), but \sin x \cos x = sin(x) cos(x). */
  private functionArgument(): Node {
    const c = this.peek()
    if (c === '(' || c === '{') return this.primary()
    let node = this.power()
    for (;;) {
      const n = this.peek()
      if (n === undefined || !/[0-9.a-zA-Z]/.test(n)) return node
      node = { t: 'bin', op: '*', a: node, b: this.power() }
    }
  }
}

export const variablesOf = (node: Node, out = new Set<string>()): Set<string> => {
  switch (node.t) {
    case 'var':
      out.add(node.name)
      break
    case 'neg':
    case 'fn':
      variablesOf(node.a, out)
      break
    case 'bin':
      variablesOf(node.a, out)
      variablesOf(node.b, out)
      break
  }
  return out
}

export const evaluate = (node: Node, values: Readonly<Record<string, number>> = {}): number => {
  switch (node.t) {
    case 'num':
      return node.v
    case 'var': {
      const v = values[node.name]
      if (v === undefined) throw new TexParseError(`No value for ${node.name}`)
      return v
    }
    case 'neg':
      return -evaluate(node.a, values)
    case 'fn':
      return FUNCTIONS[node.name]!(evaluate(node.a, values))
    case 'bin': {
      const a = evaluate(node.a, values)
      const b = evaluate(node.b, values)
      switch (node.op) {
        case '+':
          return a + b
        case '-':
          return a - b
        case '*':
          return a * b
        case '/':
          return a / b
        case '^':
          // Odd roots of negative numbers, e.g. (-8)^(1/3) = -2.
          if (a < 0 && !Number.isInteger(b)) {
            const inv = 1 / b
            if (Number.isInteger(inv) && Math.abs(inv) % 2 === 1) return -((-a) ** b)
          }
          return a ** b
      }
    }
  }
}
