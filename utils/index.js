// INDEX.JS TO HOLD INQUIRER FUNCTIONS
// IF TOO BLOATED, SEPARATE FUNCTIONS AND EXPORT MODULES
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('../db/connection');

// starting navigation prompts
const startPrompts = () => {
    return inquirer
      .prompt({
          name: 'nav',
          message: 'Which section would you like check out?',
          type: 'list',
          choices: [
              "Departments",
              "Employees",
              "Roles",
              "Exit"
          ]
      })
      .then((choice) => {
          switch (choice.nav){
            case "Departments" :
              viewDepartmentSection();
              break;

            case "Employees" :
              viewEmployeeSection();
              break;
            
            case "Roles" :
              viewRoleSection();
              break;

            case "Exit" :
              console.log(`Goodbye!`);
              db.end();
              break;
            }
      });
};


// -- DEPARTMENT FUNCTIONS -- //
const viewDepartmentSection = () => {
    return inquirer
      .prompt({
          name: 'deptChoice',
          message: 'What would you like to do?',
          type: 'list',
          choices: [
              "View all departments",
              "Add a department",
              "Remove a department",
              "View budget by department",
              "Exit"
          ]
      })
      .then((choice) =>{
          switch (choice.deptChoice){
              case "View all departments" :
                  viewDepartments();
                  break;
              case "Add a department" :
                  addDepartment();
                  break;
              case "Remove a department" :
                  removeDepartment();
                  break;
              case "View budget by department" :
                  viewDepartmentBudget();
                  break;
              case "Exit" :
                  startPrompts();
                  break; 
          }
      })
};

// VIEW ALL DEPARTMENTS
const viewDepartments = () => {
    const sql = `SELECT * FROM department`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        viewDepartmentSection();
    });
};

// ADD A DEPARTMENT
const addDepartment = () => {
    // prompt for new dept name, then insert into dept table
    return inquirer
      .prompt(
        {
          name: "deptName",
          message: "What is the new department's name?",
          validate: input => input ? true : "Department name is required."
        }
      )
      .then((answer) => {
          db.query(`
            INSERT INTO department SET ?`,
            { name: answer.deptName },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} department created`);
              viewDepartmentSection();
            })
      });
};
// DELETE A DEPARTMENT
const removeDepartment = () => {
    // empty array to hold department name
    let departmentName = [];
    // empty array to hold department name and id
    let departments = [];

    // pull all department names for prompt
    const deptQuery = `SELECT name, id FROM department`;
    db.query(deptQuery, (err, res) => {
        // loop through response, push to array
        for (var i = 0; i < res.length; i++) {
            departmentName.push(res[i].name);
            departments.push(res[i]);
        }

        // prompt to select which dept to remove
        return inquirer
        .prompt(
            {
                name: "deleteDept",
                message: "Which department would you like to delete?",
                type: "list",
                choices: departmentName
            }
        )
        .then((deptChoice) => {
            // get id based on name match
            departments.forEach((department) => {
                if (department.name === deptChoice.deleteDept) {
                    deptChoice.deleteDept = department.id;
                }
            });

            // remove from department table using id
            db.query(`DELETE FROM department WHERE ?`, 
                {id: deptChoice.deleteDept},
                (err, res) => {
                    if (err) throw err;
                    console.log(`Department deleted`);
                    viewDepartments();
                })
        });
    });  
};

// VIEW SALARIES BY DEPARTMENT

// -- ROLE FUNCTIONS -- //
// VIEW ALL ROLES
// ADD A ROLE
// DELETE A ROLE

// -- EMPLOYEE FUNCTIONS -- //
// VIEW ALL EMPLOYEES
// VIEW EMPLOYEES BY MANAGER
// VIEW EMPLOYEES BY DEPARTMENT
// ADD AN EMPLOYEE
// DELETE AN EMPLOYEE
// UPDATE AN EMPLOYEE ROLE
// UPDATE AN EMPLOYEE'S MANAGER


startPrompts();

module.exports = startPrompts;