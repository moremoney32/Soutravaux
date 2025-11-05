import { useState } from 'react';
import '../styles/NotificationForm.css';

interface NotificationFormProps {
  onSend: (titre: string, emoji: string, description: string) => void;
  selectedCount: number;
}

const NotificationForm = ({ onSend, selectedCount }: NotificationFormProps) => {
  const [titre, setTitre] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titre && description && selectedCount > 0) {
      onSend(titre, emoji, description);
      setTitre('');
      setEmoji('');
      setDescription('');
    }
  };

  return (
    <div className="notification-form_notifications">
      <h4 className="form-title_notifications">Envoyer une notification</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group_notifications">
          <label htmlFor="titre">Titre</label>
          <input
            type="text"
            id="titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de la notification"
            required
          />
        </div>

        {/* <div className="form-group_notifications">
          <label htmlFor="emoji">Emoji</label>
          <input
            type="text"
            id="emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="😊 Ajouter un emoji"
            maxLength={2}
          />
        </div> */}

        <div className="form-group_notifications">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="😊 Message de la notification"
            rows={4}
            required
          />
        </div>

        <div className="form-footer_notifications">
          <span className="selected-count_notifications">
            {selectedCount} destinataire{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
          <button
            type="submit"
            className="btn-primary"
            disabled={selectedCount === 0}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationForm;
