import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as notesService from "../services/notes";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

const Notes = () => {
  const { user, secureRequest } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await secureRequest((token) => notesService.getNotes(token));
      setNotes(res.data.notes);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (data) => {
    try {
      const res = await secureRequest((token) =>
        notesService.createNote(data, token)
      );
      setNotes((prev) => [res.data.note, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create note");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await secureRequest((token) =>
        notesService.updateNote(editingNote._id, data, token)
      );
      setNotes((prev) =>
        prev.map((n) => (n._id === editingNote._id ? res.data.note : n))
      );
      setEditingNote(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update note");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await secureRequest((token) => notesService.deleteNote(id, token));
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  return (
    <div className="notes-page">
      <header className="notes-header">
        <h1>Draftly</h1>
        <div className="notes-header__user">
          <span>Hi, {user?.name}</span>
          <Link to="/profile">Profile</Link>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      {!showCreateForm && !editingNote && (
        <button onClick={() => setShowCreateForm(true)}>+ Create Note</button>
      )}

      {showCreateForm && (
        <NoteForm
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingNote && (
        <NoteForm
          initialData={editingNote}
          onSave={handleUpdate}
          onCancel={() => setEditingNote(null)}
        />
      )}

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes yet. Create your first one!</p>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDelete(note._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;