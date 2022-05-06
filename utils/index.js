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
              // re-run function to view department table for verification, which then returns to department section nav
              viewDepartments();
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
                    // re-run show department table for verification, which then returns to dept section nav
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
// ROLE NAV
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
    db.query(`SELECT title, role.id, department.name AS department, salary 
            FROM role 
            LEFT JOIN department 
            ON role.department_id = department.id`, 
            (err, res) => {
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

    // pull all department names for prompt
    const deptQuery = `SELECT name FROM department`;
    db.query(deptQuery, (err, res) => {
        // loop through response, push name value to array
        for (var i = 0; i < res.length; i++) {
            departmentName.push(res[i]);
        }
    });

    // prompt for new role name, salary, and department
    return inquirer
      .prompt([
        {
          name: "roleTitle",
          message: "What is the new role's title?",
          validate: input => input ? true : "Role title is required."
        },
        {
          name: "roleSalary",
          message: "What is the new role's salary?",
          validate: input => {
            if (isNaN(input) || input === "") {
                return "Salary is required AND must be a number";
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
      ])
      .then((answer) => {
        let deptName = answer.roleDept;
        // get department id from answer
        let deptIdQuery = `SELECT id FROM department WHERE name = "${deptName}"`;

        db.query(deptIdQuery, (err, res) => {
            let deptId = res[0].id;
            if (err) throw err;

            // insert into role table using gathered values
            db.query(`
                INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
                [
                    answer.roleTitle, 
                    answer.roleSalary,
                    deptId
                ],
                (err, res) => {
                if (err) throw err;
                console.log(`Role created`);
                // re-run show role table for verification, which then returns to role section
                viewRoles();
                })
        });
    });
};

// DELETE A ROLE
const removeRole = () => {
    // empty array to hold role title value for selection
    let roleName = [];
    // empty array to hold role title and id
    let roles = [];

    // pull all role names for prompt
    const roleQuery = `SELECT title, id FROM role`;
    db.query(roleQuery, (err, res) => {
        // loop through response, push titles to array
        for (var i = 0; i < res.length; i++) {
            roleName.push(res[i].title);
            roles.push(res[i]);
        }

        // prompt to select which role to remove
        return inquirer
          .prompt(
              {
                  name: "deleteRole",
                  message: "Which role would you like to delete?",
                  type: "list",
                  choices: roleName
              }
          )
          .then((roleChoice) => {
              // get id based on title match
              roles.forEach((role) => {
                  if (role.title === roleChoice.deleteRole) {
                      roleChoice.deleteRole = role.id;
                  }
              });

              // remove from role table using id (safer than by title)
              db.query(`DELETE FROM role WHERE ?`,
                {id: roleChoice.deleteRole},
                (err, res) => {
                    if (err) throw err;
                    console.log(`Role deleted`);
                    // re-run show role table for verification, which then returns to role section nav
                    viewRoles();
                })
          });
    });
};

// -- EMPLOYEE FUNCTIONS -- //
// EMPLOYEE NAV
const viewEmployeeSection = () => {
    return inquirer
      .prompt({
          name: "employeeChoice",
          message: "What would you like to do?",
          type: "list",
          choices: [
              "View all employees",
              "View employees by Manager",
              "View employees by Department",
              "Add new employee",
              "Remove an employee",
              "Update an employee's Role",
              "Update an employee's Manager",
              "Exit"
          ]
      })
      .then((choice) => {
          switch (choice.employeeChoice){
              case "View all employees" :
                  viewEmployees();
                  break;
              case "View employees by Manager" :
                  viewEmployeesByManager();
                  break;
              case "View employees by Department" :
                  viewEmployeesByDept();
                  break;
              case "Add new employee" :
                  addEmployee();
                  break;
              case "Remove an employee" :
                  removeEmployee();
                  break;
              case "Update an employee's Role" :
                  updateEmpRole();
                  break;
              case "Update an employee's Manager" :
                  updateEmpManager();
                  break;
              case "Exit" :
                  startPrompts();
                  break;
          }
      })
};

// VIEW ALL EMPLOYEES
const viewEmployees = () => {
    const sql = `SELECT employee.id AS ID, 
                CONCAT(employee.first_name, " ", employee.last_name) AS Name, 
                role.title AS Role,
                role.salary AS Salary,
                department.name AS Department,
                CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee
                INNER JOIN role on role.id = employee.role_id 
                INNER JOIN department on department.id = role.department_id 
                LEFT JOIN employee e on employee.manager_id = e.id`
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        viewEmployeeSection();
    });
};

// VIEW EMPLOYEES BY MANAGER
// VIEW EMPLOYEES BY DEPARTMENT
// ADD AN EMPLOYEE
const addEmployee = () => {
    // array to hold potential managers, including NONE for new managers
    let managerName = ["None"];
    // array for full manager record (full name and id)
    let managers = [];
    // empty array to hold roles
    let roles = [];

    // pull all role titles for prompt
    let roleQuery = `SELECT title FROM role`;
    db.query(roleQuery, (err, res) => {
        // loop through response, push role title to array
        for (var i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    });

    // pull names of managers from employees for prompt
    // only employees whose manager_id is NULL (NULL = employee is a manager)
    // CONCAT first and last name into one string
    let managerQuery = `SELECT id, CONCAT(first_name, " ", last_name) 
                        AS full_name
                        FROM employee 
                        WHERE manager_id IS NULL`;
    db.query(managerQuery, (err, res) => {
        // loop through response, push to manager arrays
        for (var i = 0; i < res.length; i++) {
            managerName.push(res[i].full_name);
            managers.push(res[i]);
        }
    });

    // prompt for new employee full name, role (sets id), manager (sets id)
    return inquirer
      .prompt([
          {
            name: "employeeFirstName",
            message: "Employee's first name?",
            validate: input => input ? true : "First name is required"
          },
          {
            name: "employeeLastName",
            message: "Employee's last name?",
            validate: input => input ? true : "Last name is required"
          },
          {
            name: "employeeRole",
            message: "What is this employee's role?",
            type: "list",
            choices: roles
          },
          {
            name: "employeeManager",
            message: "Who is this employee's manager?",
            type: "list",
            choices: managerName
          }
      ])
      .then((answers) => {
        // get manager id from answer, NULL if "None"
        managers.forEach((manager) => {
            if (manager.full_name === answers.employeeManager) {
                answers.employeeManager = manager.id;
            } else if (answers.employeeManager === "None") {
                answers.employeeManager = null;
            }
        });

        // get role id from answer
        db.query(`SELECT id FROM role WHERE title = "${answers.employeeRole}"`, 
          (err, res) => {
            if (err) throw err;
            let empRoleId = res[0].id;

            // insert into table using gathered values
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                    VALUES (?,?,?,?)`,
              [
                answers.employeeFirstName,
                answers.employeeLastName,
                empRoleId,
                answers.employeeManager
              ],
              (err, res) => {
                  if (err) throw err;
                  console.log(`New employee added`);
                  // re-run show employee table for verification, returns to employee section nav
                  viewEmployees();
              });
          });
      });
};

// DELETE AN EMPLOYEE
const removeEmployee = () => {
    // empty array for employee names
    let employeeName = [];
    // empty array for full record (full name and id)
    let employees = [];

    // pull all employee names for prompt
    let empQuery = `SELECT id, CONCAT(first_name, " ", last_name)
                    AS full_name
                    FROM employee`;
    db.query(empQuery, (err, res) => {
        // loop through response, push to arrays
        for (var i = 0; i < res.length; i++) {
            employeeName.push(res[i].full_name);
            employees.push(res[i]);
        }

        // prompt to select which employee to remove
        return inquirer
          .prompt({
            name: "deleteEmployee",
            message: "Which employee would you like to remove?",
            type: "list",
            choices: employeeName
          })
          .then((choice) => {
            // get id based on name match
            employees.forEach((employee) => {
                if (employee.full_name === choice.deleteEmployee) {
                    choice.deleteEmployee = employee.id;
                }
            });
    
            // remove from employee table using id
            db.query(`DELETE FROM employee WHERE ?`,
              { id: choice.deleteEmployee },
              (err, res) => {
                  if (err) throw err;
                  console.log(`Employee removed`);
                  // re-run show employee table for verification, returns to employee section
                  viewEmployees();
              });
          });
    });
};

// UPDATE AN EMPLOYEE ROLE
const updateEmpRole = () => {
  // empty array to hold employee names for prompt
  let employeeName = [];
  // array for full employee record (full name, id, current role_id)
  let employees = [];
  // array to hold role titles for prompt
  let roleTitle = [];
  // array for full role record (title and id)
  let roles = [];

  // pull employee records for prompt
  const empQuery = `SELECT id, CONCAT(first_name, " ", last_name)
                  AS full_name
                  FROM employee`;
  db.query(empQuery, (err, res) => {
      if (err) throw err;
      // loop through response, push to employee arrays
      for (var i = 0; i < res.length; i++) {
          employeeName.push(res[i].full_name);
          employees.push(res[i]);
      }

      // pull role records for prompt
      db.query(`SELECT id, title FROM role`, (err, res) => {
          // loop through response, push to role arrays
          for (var i = 0; i < res.length; i++) {
              roleTitle.push(res[i].title);
              roles.push(res[i]);
          }
      });

      // prompt for which employee and subsequent role to update
      return inquirer
        .prompt([
          {
            name: "employeeName",
            message: "Which employee would you like to update?",
            type: "list",
            choices: employeeName
          },
          {
            name: "newRole",
            message: "What is their new role?",
            type: "list",
            choices: roleTitle
          }
        ])
        .then((answers) => {
            // get employee's id by name match
            employees.forEach((employee) => {
                if (employee.full_name === answers.employeeName) {
                    answers.employeeName = employee.id;
                }
            });
    
            // get role id by title match
            roles.forEach((role) => {
                if (role.title === answers.newRole) {
                    answers.newRole = role.id;
                }
            });
    
            // query to update record using gathered values
            const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
            db.query(sql,
              [
            
                    answers.newRole,
                    answers.employeeName
            
              ],
              (err, res) => {
                if (err) throw err;
                console.log(`Employee role updated`);
                viewEmployees();
            });
        });
  });
};

// UPDATE AN EMPLOYEE'S MANAGER


startPrompts();

module.exports = startPrompts;