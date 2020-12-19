import { TokenType } from "./TokenType";

export class Token {
  readonly type: TokenType;
  readonly lexeme: String;
  readonly literal: Object | null;
  readonly line: number;

  constructor(
    type: TokenType,
    lexeme: String,
    literal: Object | null,
    line: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString(): String {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
