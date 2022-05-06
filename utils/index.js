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
// DEPARTMENT NAV
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
              console.log(`${answer.deptName} department created`);
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
const viewDepartmentBudget = () => {
    // empty arrays for department data
    let departmentName = [];
    let departments = [];

    // pull all department names for prompt
    const deptQuery = `SELECT name, id FROM department`;
    db.query(deptQuery, (err, res) => {
        // loop through response, push to array
        for (var i = 0; i < res.length; i++) {
            departmentName.push(res[i].name);
            departments.push(res[i]);
        }

        // prompt to select which department's salaries to view based on name
        return inquirer
        .prompt(
            {
                name: "deptBudget",
                message: "Which department's budget would you like'?",
                type: "list",
                choices: departmentName
            }
        )
        .then((deptChoice) => {
            // get department_id based on name match
            departments.forEach((department) => {
                if (department.name === deptChoice.deptBudget) {
                    deptChoice.deptBudget = department.id;
                }
            });

            // return combined salaries (SUM) of all employees in matching dept as "Budget"
            // JOIN role_ids from employee table (fills FK role_id in employee table with data from role table)
            // JOIN department_ids from department table (fills FK department_id in employee table with data from department table)
            // WHERE role table's dept id matches id value from name match
            const sql = `SELECT SUM(role.salary) 
                        AS Budget 
                        FROM employee
                        LEFT JOIN role ON employee.role_id = role.id 
                        LEFT JOIN department ON role.department_id = department.id 
                        WHERE role.department_id = ?
                        `;
            db.query(sql, [deptChoice.deptBudget], (err, res) => {
                console.table(res);
                // return to department section
                viewDepartmentSection();
            });
        });
    });  
};

// -- ROLE FUNCTIONS -- //
const viewRoleSection = () => {
    // prompt to navigate role functions
    return inquirer
      .prompt({
          name: 'roleChoice',
          message: 'What would you like to do?',
          type: 'list',
          choices: [
              "View all roles",
              "Add a role",
              "Remove a role",
              "Exit"
          ]
      })
      .then((choice) =>{
          switch (choice.roleChoice){
              case "View all roles" :
                  viewRoles();
                  break;
              case "Add a role" :
                  addRole();
                  break;
              case "Remove a role" :
                  removeRole();
                  break;
              case "Exit" :
                  startPrompts();
                  break; 
          }
      })
};

// VIEW ALL ROLES
const viewRoles = () => {
    db.query(`SELECT * FROM role`, (err, res) => {
        if (err) throw err;
        console.table(res);
        // return to role section
        viewRoleSection();
    });
};

// ADD A ROLE
const addRole = () => {
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

        // prompt for new role name
        return inquirer
        .prompt(
            {
            name: "roleTitle",
            message: "What is the new role's title?",
            validate: input => input ? true : "Role title is required."
            },
            {
            name: "roleSalary",
            message: "What is the new role's salary?",
            validate: input => {
                if (isNaN(input)) {
                    return "Salary must be a number";
                }
                return true;
            }
            },
            {
                name: "roleDept",
                message: "Which department does this role belong to?",
                type: 'list',
                choices: departmentName
            }
        )
        .then((answer) => {
            // get department id from answer
            departments.forEach((department) => {
                if (department.name = answer.roleDept) {
                    answer.roleDept = department.id;
                }
            });
    
            db.query(`
                INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
                [
                    answer.roleTitle, 
                    answer.salary,
                    answer.roleDept
                ],
                (err, res) => {
                if (err) throw err;
                console.log(`Role created`);
                viewRoleSection();
                })
        });
    })

}
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