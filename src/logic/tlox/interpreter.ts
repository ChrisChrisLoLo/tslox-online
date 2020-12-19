import {Scanner} from './Scanner';
import {Token} from './Token';

let hadError: boolean = false;

function runInput(): void {}

export function runInterpreter(source: string): void {
    hadError = false;

    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    for (const token of tokens) {
        console.log(token);
    }
}

export function error(line: number, message: string): void {
    report(line, "", message);
}

function report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where} : ${message}`);
    hadError = true;
}
