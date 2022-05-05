-- SEED FILE FOR RECORDS
INSERT INTO department (name)
VALUES
  ("I.T."),
  ("Human Resources"),
  ("Research & Development"),
  ("Operations"),
  ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES
("IT Manager", 150000, 1),
("H.R. Director", 180000, 2),
("Lead Technician", 155000, 3),
("Project Manager", 120000, 4),
("Lead Accountant", 120000, 5),
("Software Engineer", 80000, 1),
("Labor Relations Specialist", 77000, 2),
("Research Engineer", 90000, 3),
("Coordinator", 67000, 4),
("Financial Analyst", 125000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Rick", "Sanchez", 1, null),
("Summer", "Smith", 2, null),
("Beth", "Smith", 3, null),
("Morty", "Smith", 4, null),
("Waylon", "Smithers", 5, null),
("Homer", "Simpson", 6, 1),
("Lenny", "Leonard", 7, 2),
("Carl", "Carlson", 8, 3),
("Barney", "Gumble", 9, 4),
("Moe", "Szyslak", 10, 5);