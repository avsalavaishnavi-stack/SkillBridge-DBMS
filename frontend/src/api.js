import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

export const getTasks = () =>
    api.get("/tasks");

export const createTask = (task) =>
    api.post("/tasks", task);

export const deleteTask = (id) =>
    api.delete(`/tasks/${id}`);

export const applyForTask = (application) =>
    api.post("/applications", application);

export const getApplications = () =>
    api.get("/applications");

export const getStudentApplications = (studentId) =>
    api.get(`/applications/student/${studentId}`);

export const updateApplicationStatus = (id, status) =>
    api.patch(`/applications/${id}/status`, { status });

export const getAssignments = () =>
    api.get("/assignments");

export const getAssignment = (id) =>
    api.get(`/assignments/${id}`);

export const updateAssignmentStatus = (id, status) =>
    api.patch(`/assignments/${id}/status`, { status });

export const createSubmission = (submission) =>
    api.post("/submissions", submission);

export const getSubmissions = () =>
    api.get("/submissions");

export const getSubmission = (id) =>
    api.get(`/submissions/${id}`);

export const createReview = (review) =>
    api.post("/reviews", review);

export const getReviews = () =>
    api.get("/reviews");

export const getStudentReviews = (studentId) =>
    api.get(`/reviews/student/${studentId}`);

export const getMatchedTasks = (studentId) =>
    api.get(`/matching/${studentId}`);

export default api;