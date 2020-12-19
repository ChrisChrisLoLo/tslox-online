import {error} from "./interpreter"
import {TokenType} from "./TokenType";
import {Token} from "./Token";

export class Scanner {
    readonly #source: string;
    readonly #tokens: Token[] = [];

    // Offsets of the program
    #start: number = 0;
    #current: number = 0;
    #line: number = 1;

    static keywords: object = {
        "and":    TokenType.AND,
        "class":  TokenType.CLASS,
        "else":   TokenType.ELSE,
        "false":  TokenType.FALSE,
        "for":    TokenType.FOR,
        "fun":    TokenType.FUN,
        "if":     TokenType.IF,
        "nil":    TokenType.NIL,
        "or":     TokenType.OR,
        "print":  TokenType.PRINT,
        "return": TokenType.RETURN,
        "super":  TokenType.SUPER,
        "this":   TokenType.THIS,
        "true":   TokenType.TRUE,
        "var":    TokenType.VAR,
        "while":  TokenType.WHILE,
    }

    constructor(source: string){
        this.#source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()){
            this.#start = this.#current;
            this.scanToken();
        }

        this.#tokens.push(new Token(TokenType.EOF, "", null, this.#line));
        return this.#tokens;
    }
    
    private isAtEnd(): boolean {
        return this.#current >= this.#source.length;
    }

    private scanToken(): void {
        const char: string = this.advance();
        switch (char) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
        
            case '\n':
                this.#line++;
                break;
            case '"': this.string(); break;
            default:
                if (this.isDigit(char)){
                    this.number();
                } else if (this.isAlpha(char)){
                    this.identifier();
                } else {
                    error(this.#line, "Unexpected character.");
                }
                break;
        }
    }

    private advance(): string {
        this.#current++;
        return this.#source[this.#current - 1];
    }

    private addToken(type: TokenType, literal: any = null): void{
        // MAY HAVE WRONG INDICES
        const text: String = this.#source.substring(this.#start, this.#current);
        this.#tokens.push(new Token(type, text, literal, this.#line));
    }

    private match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.#source.charAt(this.#current) != expected) return false;

        this.#current++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.#source.charAt(this.#current);
    }

    private peekNext(): string {
        if (this.#current + 1  >= this.#source.length) return '\0';
        return this.#source.charAt(this.#current + 1);
    }

    private string(): void {
        while (this.peek() != '"' && !this.isAtEnd()){
            if (this.peek() == '\n') this.#line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            error(this.#line, "Unterminated string.");
            return;
        }

        // The closing ".
        this.advance();

        // Trim the surrounding quotes.
        const value: string = this.#source.substring(this.#start + 1, this.#current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();
        const text: string = this.#source.substring(this.#start, this.#current);
        let type: TokenType = (Scanner.keywords as any)[text];
        if (type == null) type = TokenType.IDENTIFIER;
        this.addToken(type);
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part.
        if (this.peek() == '.' && this.isDigit(this.peekNext())){
            // Consume the "."
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER, parseFloat(this.#source.substring(this.#start,this.#current)));
    }

    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
        return  (char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z') ||
                char == '_';
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

}