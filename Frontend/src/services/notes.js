import api from "./api";

const bearer = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createNote = (data, token) =>
  api.post("/notes", data, bearer(token));

export const getNotes = (token) => api.get("/notes", bearer(token));

export const getNote = (id, token) => api.get(`/notes/${id}`, bearer(token));

export const updateNote = (id, data, token) =>
  api.put(`/notes/${id}`, data, bearer(token));

export const deleteNote = (id, token) =>
  api.delete(`/notes/${id}`, bearer(token));