const commandLineArgs = require("command-line-args");
const readLine = require("readline");
const moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");

const { optionsDefinitions } = require("./config/options");
const { readFileData } = require("./utils/generic");
const { defaultTask } = require("./config/default");

const options = commandLineArgs(optionsDefinitions);

const confirmUser = () => {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question("Do you wish to execute? (Y/N): ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Usage
async function main() {
  if (options.file) console.log(`File path: ${options.file}`);
  else
    console.log(
      "No file path provided, every day generated will be from template."
    );
  if (!options.startDate) throw new Error("Start date required. (s)");
  else if (!moment(options.startDate, "DD-MM-YYYY").isValid())
    throw new Error("Start date is not valid. (DD-MM-YYYY)");
  if (options.endDate) {
    if (!moment(options.endDate, "DD-MM-YYYY").isValid())
      throw new Error("End date is not valid. (DD-MM-YYYY)");
    console.log(`End date: ${options.endDate}`);
  } else console.log("End date is not provided, current date will be used.");
  console.log(`Start date: ${options.startDate}`);
  let confirm = null;
  while (confirm === null) {
    const r = await confirmUser();
    if (r) confirm = r;
  }
  if (confirm === "N") return;

  const startDate = moment(options.startDate, "DD-MM-YYYY");
  const endDate = options.endDate
    ? moment(options.endDate, "DD-MM-YYYY")
    : moment();
  const data = options.file ? readFileData(options.file) : {};
  data.map((d) => {
    if (d.manhours === 0) d.manhours = 1;
  });
  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    const dayOfWeek = currentDate.day();
    const isDayOfWeek = dayOfWeek >= 1 && dayOfWeek <= 5;
    if (isDayOfWeek) {
      const existingRecords = data.filter(
        (d) => d.date === currentDate.format("DD-MM-YYYY")
      );
      const existingManHours = existingRecords.reduce(
        (acc, curr) => acc + curr.manhours,
        0
      );
      if (existingManHours < 8) {
        const neededManHours = 8 - existingManHours;
        const task = {
          id: crypto.randomUUID(),
          date: currentDate.format("DD-MM-YYYY"),
          manhours: neededManHours,
          ...defaultTask,
        };
        data.push(task);
      }
    }
    currentDate = currentDate.add(1, "days");
  }
  fs.writeFileSync("result.json", JSON.stringify(data, null, 2));
  console.log("Result generated.")
}

main();
