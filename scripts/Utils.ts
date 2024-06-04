import * as readline from "readline";
export async function promptUser(msg: string): Promise<boolean> {
  console.log(msg);
  console.log("(y/n)");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question("", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}
