INSERT INTO students
(name, email, password, department, year, bio)
VALUES
('Akhila', 'akhila@skillbridge.com', 'password123', 'CSE', 3, 'Web developer and UI designer'),
('Vaishnavi', 'vaishnavi@skillbridge.com', 'password123', 'CSE', 3, 'Database and backend enthusiast'),
('Namitha', 'namitha@skillbridge.com', 'password123', 'ECE', 2, 'Python developer');

INSERT INTO skills
(skill_name, category)
VALUES
('Python', 'Programming'),
('Java', 'Programming'),
('React', 'Web Development'),
('Node.js', 'Backend'),
('PostgreSQL', 'Database'),
('UI/UX', 'Design'),
('Machine Learning', 'AI');

INSERT INTO student_skills
(student_id, skill_id, proficiency)
VALUES
(1, 3, 'Advanced'),
(1, 6, 'Intermediate'),
(2, 5, 'Advanced'),
(2, 4, 'Intermediate'),
(3, 1, 'Advanced');

INSERT INTO tasks
(title, description, category, posted_by, required_skill, deadline)
VALUES
(
'Build Student Dashboard',
'Create a responsive student dashboard using React.',
'Web Development',
1,
3,
'2026-10-15'
),
(
'Create PostgreSQL Database',
'Design and implement a relational database for a student application.',
'Database',
2,
5,
'2026-10-20'
);