const env = require("../config/env");
const moment = require("moment");

const AddTaskLocators = {
  hoursInput: "#task_hours",
  moduleInput: "#task_module",
  taskInput: "#task_name",
  subTaskInput: "#task_sub_task",
  remark: "#task_remark",
  crNo: "#task_requirement_id",
  cardId: "#task_card_id",
  project: "#task_project_id",
};

module.exports = {
  addNewTask: async (page, config) => {
    const { date, manhours, module, task, subTask, crNo, remark, project } =
      config || {};
    console.log("Adding task", config);
    let parsedData = moment().format("YYYY-MM-DD");
    if (date && moment(date, "DD-MM-YYYY").isValid()) {
      parsedData = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    } else {
      throw new Error("Invalid date");
    }

    await page.goto(`${env.timesheetUrl}/tasks/new?date=${parsedData}`);
    await page.waitForTimeout(1000);
    if (manhours) {
      await page.focus(AddTaskLocators.hoursInput);
      await page.click(AddTaskLocators.hoursInput, { clickCount: 3 });
      await page.keyboard.type(`${manhours}`);
    }
    if (module) {
      await page.focus(AddTaskLocators.moduleInput);
      await page.click(AddTaskLocators.moduleInput, { clickCount: 3 });
      await page.keyboard.type(module);
    }
    if (task) {
      await page.focus(AddTaskLocators.taskInput);
      await page.click(AddTaskLocators.taskInput, { clickCount: 3 });
      await page.keyboard.type(task);
    }
    if (subTask) {
      await page.focus(AddTaskLocators.subTaskInput);
      await page.click(AddTaskLocators.subTaskInput, { clickCount: 3 });
      await page.keyboard.type(subTask);
    }
    if (remark) {
      await page.focus(AddTaskLocators.remark);
      await page.click(AddTaskLocators.remark, { clickCount: 3 });
      await page.keyboard.type(remark);
    }
    if (crNo) {
      await page.focus(AddTaskLocators.crNo);
      await page.click(AddTaskLocators.crNo, { clickCount: 3 });
      await page.keyboard.type(crNo);

      await page.focus(AddTaskLocators.cardId);
      await page.click(AddTaskLocators.cardId, { clickCount: 3 });
      await page.keyboard.type(`${env.jiraUrl}/browse/${crNo}`);
    }
    if (project) {
      await page.focus(AddTaskLocators.project);
      const projectDrop = await page.$(AddTaskLocators.project);
      await projectDrop.select(project);
    }
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    await page.goto(`${env.timesheetUrl}/tasks?date=${date}`);

    const tasks = await page.evaluate(
      'Array.prototype.slice.call(document.getElementsByClassName("activity-task")).map(x => x.innerText)'
    );
    if (tasks && task.includes(task)) {
      console.log("Successfully added Task");
      const totalHours = await page.evaluate(
        'document.getElementsByClassName("task-selected-date-total")[0].innerText'
      );
      console.log(totalHours);
    } else {
      console.log("Failed to add Task", task);
    }
  },
};
