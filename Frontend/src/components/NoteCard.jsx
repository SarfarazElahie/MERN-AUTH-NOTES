const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <div className="note-card">
      <h3 className="note-card__title">{note.title}</h3>
      <p className="note-card__content">{note.content}</p>
      <div className="note-card__actions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default NoteCard;