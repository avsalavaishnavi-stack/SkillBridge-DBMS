CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    year INT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100)
);

CREATE TABLE student_skills (
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
    proficiency VARCHAR(50),
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    posted_by INT REFERENCES students(student_id) ON DELETE CASCADE,
    required_skill INT REFERENCES skills(skill_id),
    deadline DATE,
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(task_id) ON DELETE CASCADE,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, student_id)
);

CREATE TABLE assignments (
    assignment_id SERIAL PRIMARY KEY,
    application_id INT UNIQUE REFERENCES applications(application_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'ASSIGNED'
);

CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    assignment_id INT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_url TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'SUBMITTED'
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(submission_id) ON DELETE CASCADE,
    reviewer_id INT REFERENCES students(student_id),
    reviewee_id INT REFERENCES students(student_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_skill ON tasks(required_skill);
CREATE INDEX idx_applications_task ON applications(task_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);