import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as notesService from "../services/notes";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await notesService.getNotes();
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
    const res = await notesService.createNote(data);
    setNotes((prev) => [res.data.note, ...prev]);
    setShowCreateForm(false);
  };

  const handleUpdate = async (data) => {
    const res = await notesService.updateNote(editingNote._id, data);
    setNotes((prev) =>
      prev.map((n) => (n._id === editingNote._id ? res.data.note : n))
    );
    setEditingNote(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    await notesService.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="notes-page">
      <header className="notes-header">
        <h1>Draftly</h1>
        <div>
          <span>Hi, {user?.name}</span>
          <Link to="/profile">Profile</Link>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      {!showCreateForm && !editingNote && (
        <button onClick={() => setShowCreateForm(true)}>+ Create Note</button>
      )}

      {showCreateForm && (
        <NoteForm onSave={handleCreate} onCancel={() => setShowCreateForm(false)} />
      )}

      {editingNote && (
        <NoteForm
          initialData={editingNote}
          onSave={handleUpdate}
          onCancel={() => setEditingNote(null)}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes yet.</p>
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