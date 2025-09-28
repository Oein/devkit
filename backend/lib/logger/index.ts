import chalk from "chalk";

class Logger {
  private getTimestamp(): string {
    const now = new Date();
    // Format: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  info(...messages: any[]) {
    console.log(
      `[${chalk.gray(this.getTimestamp())}] [${chalk.blue("INFO")}\t] `,
      ...messages
    );
  }

  success(...messages: any[]) {
    console.log(
      `[${chalk.gray(this.getTimestamp())}] [${chalk.green("SUCCESS")}\t] `,
      ...messages
    );
  }

  warn(...messages: any[]) {
    console.log(
      `[${chalk.gray(this.getTimestamp())}] [${chalk.yellow("WARN")}\t] `,
      ...messages
    );
  }

  error(...messages: any[]) {
    console.log(
      `[${chalk.gray(this.getTimestamp())}] [${chalk.red("ERROR")}\t] `,
      ...messages
    );
  }

  debug(...messages: any[]) {
    console.log(
      `[${chalk.gray(this.getTimestamp())}] [${chalk.magenta("DEBUG")}\t] `,
      ...messages
    );
  }
}

const logger = new Logger();
export default logger;
