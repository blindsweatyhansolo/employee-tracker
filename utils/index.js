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
          message: 'What would you like to do?',
          type: 'list',
          choices: [
              "View all departments",
              "View all employees",
              "View all roles",
              "Exit"
          ]
      })
      .then((choice) => {
          switch (choice.nav){
            case "View all departments" :
              viewDepartments();
              break;

            case "View all employees" :
              viewEmployees();
              break;
            
            case "View all roles" :
              viewRoles();
              break;

            case "Exit" :
              console.log(`Goodbye!`);
              db.end();
              break;
            }
      });
};


// -- DEPARTMENT FUNCTIONS -- //
// VIEW ALL DEPARTMENTS
// VIEW SALARIES BY DEPARTMENT
// ADD A DEPARTMENT
// DELETE A DEPARTMENT

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