// import { useState } from 'react';
// import type { NotificationType } from '../types/pushNotifications';
// import { mockEmojis } from '../data/mockDataPushNotifications';
// // import { NotificationType } from '../types/pushNotifications';
// // import { mockEmojis } from '../data/mockDataPushNotifications';

// interface Column3Props {
//   selectedRecipients: string[];
//   onClearRecipients: () => void;
// }

// function Column3PushNotifications({ selectedRecipients, onClearRecipients }: Column3Props) {
//   const [message, setMessage] = useState('');
//   const [selectedEmoji, setSelectedEmoji] = useState('');
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);

//   const handleEmojiSelect = (emoji: string) => {
//     setSelectedEmoji(emoji);
//     setMessage(prev => prev + emoji);
//     setShowEmojiPicker(false);
//   };

//   const handleNotificationTypeToggle = (type: NotificationType) => {
//     if (notificationTypes.includes(type)) {
//       setNotificationTypes(notificationTypes.filter(t => t !== type));
//     } else {
//       setNotificationTypes([...notificationTypes, type]);
//     }
//   };

//   const handleSendNotification = () => {
//     if (!message.trim() || notificationTypes.length === 0 || selectedRecipients.length === 0) {
//       alert('Veuillez remplir le message, sélectionner au moins un type de notification et des destinataires');
//       return;
//     }

//     console.log('Sending notification:', {
//       message,
//       emoji: selectedEmoji,
//       types: notificationTypes,
//       recipients: selectedRecipients,
//     });

//     alert(`Notification envoyée à ${selectedRecipients.length} destinataire(s) !`);

//     setMessage('');
//     setSelectedEmoji('');
//     setNotificationTypes([]);
//     onClearRecipients();
//   };

//   return (
//     <div className="column3PushNotifications">
//       <div className="notificationFormPushNotifications">
//         <h3 className="formTitlePushNotifications">Envoyer une notification</h3>

//         <div className="recipientCountPushNotifications">
//           <span className="countBadgePushNotifications">{selectedRecipients.length}</span>
//           <span>destinataire(s) sélectionné(s)</span>
//         </div>

//         <div className="messageContainerPushNotifications">
//           <div className="messageHeaderPushNotifications">
//             <label className="labelPushNotifications">Message</label>
//             <button
//               className="emojiButtonPushNotifications"
//               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//               type="button"
//             >
//               😊
//             </button>
//           </div>

//           {showEmojiPicker && (
//             <div className="emojiPickerPushNotifications">
//               {mockEmojis.map((emoji, index) => (
//                 <button
//                   key={index}
//                   className="emojiOptionPushNotifications"
//                   onClick={() => handleEmojiSelect(emoji)}
//                   type="button"
//                 >
//                   {emoji}
//                 </button>
//               ))}
//             </div>
//           )}

//           <textarea
//             className="textareaPushNotifications"
//             placeholder="Écrivez votre message ici..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             rows={6}
//           />
//         </div>

//         <div className="notificationTypeContainerPushNotifications">
//           <label className="labelPushNotifications">Type de notification</label>
//           <div className="checkboxGroupPushNotifications">
//             <label className="checkboxItemLargePushNotifications">
//               <input
//                 type="checkbox"
//                 checked={notificationTypes.includes('push')}
//                 onChange={() => handleNotificationTypeToggle('push')}
//               />
//               <span>Notification Push</span>
//             </label>
//             <label className="checkboxItemLargePushNotifications">
//               <input
//                 type="checkbox"
//                 checked={notificationTypes.includes('internal')}
//                 onChange={() => handleNotificationTypeToggle('internal')}
//               />
//               <span>Notification Interne</span>
//             </label>
//           </div>
//         </div>

//         <button
//           className="sendButtonPushNotifications"
//           onClick={handleSendNotification}
//           disabled={!message.trim() || notificationTypes.length === 0 || selectedRecipients.length === 0}
//         >
//           Envoyer la notification
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Column3PushNotifications;



import { useState } from 'react';
import type { NotificationType } from '../types/pushNotifications';

const EMOJIS = [
  '🎉', '✅', '📢', '🔔', '💼', '🏗️', '⚡', '🔧', '🎨', '🚀',
  '💡', '🎯', '⭐', '👍', '📣', '🛠️', '📌', '✨', '🔥', '💪',
  '📊', '🎊', '🏆', '💻', '📱', '🌟', '🎁', '📝', '👏', '🌈'
];

interface Column3Props {
  selectedRecipients: string[];
  onClearRecipients: () => void;
  onSendNotification: (
    message: string,
    emoji: string,
    notificationTypes: NotificationType[],
    recipientIds: string[]
  ) => Promise<any>;
  sending: boolean;
}

function Column3PushNotifications({ 
  selectedRecipients, 
  onClearRecipients,
  onSendNotification,
  sending
}: Column3Props) {
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleNotificationTypeToggle = (type: NotificationType) => {
    if (notificationTypes.includes(type)) {
      setNotificationTypes(notificationTypes.filter(t => t !== type));
    } else {
      setNotificationTypes([...notificationTypes, type]);
    }
  };

  const handleSendNotification = async () => {
    // Validation
    if (!message.trim()) {
      setErrorMessage('Veuillez saisir un message');
      return;
    }

    if (notificationTypes.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un type de notification');
      return;
    }

    if (selectedRecipients.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un destinataire');
      return;
    }

    // Reset messages
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await onSendNotification(
        message,
        selectedEmoji,
        notificationTypes,
        selectedRecipients
      );

      setSuccessMessage(
        `✅ ${result.message} (${result.sentCount} envoyé${result.sentCount > 1 ? 's' : ''})`
      );

      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        setMessage('');
        setSelectedEmoji('');
        setNotificationTypes([]);
        onClearRecipients();
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="column3PushNotifications">
      <div className="notificationFormPushNotifications">
        <h3 className="formTitlePushNotifications">Envoyer une notification</h3>

        <div className="recipientCountPushNotifications">
          <span className="countBadgePushNotifications">{selectedRecipients.length}</span>
          <span>destinataire(s) sélectionné(s)</span>
        </div>

        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="alertSuccessPushNotifications">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alertErrorPushNotifications">
            {errorMessage}
          </div>
        )}

        <div className="messageContainerPushNotifications">
          <div className="messageHeaderPushNotifications">
            <label className="labelPushNotifications">Message</label>
            <button
              className="emojiButtonPushNotifications"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              type="button"
            >
              😊
            </button>
          </div>

          {showEmojiPicker && (
            <div className="emojiPickerPushNotifications">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  className="emojiOptionPushNotifications"
                  onClick={() => handleEmojiSelect(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <textarea
            className="textareaPushNotifications"
            placeholder="Écrivez votre message ici..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
          />
          <small className="charCountPushNotifications">
            {message.length} caractères
          </small>
        </div>

        <div className="notificationTypeContainerPushNotifications">
          <label className="labelPushNotifications">Type de notification</label>
          <div className="checkboxGroupPushNotifications">
            <label className="checkboxItemLargePushNotifications">
              <input
                type="checkbox"
                checked={notificationTypes.includes('push')}
                onChange={() => handleNotificationTypeToggle('push')}
              />
              <span>Notification Push</span>
            </label>
            <label className="checkboxItemLargePushNotifications">
              <input
                type="checkbox"
                checked={notificationTypes.includes('internal')}
                onChange={() => handleNotificationTypeToggle('internal')}
              />
              <span>Notification Interne</span>
            </label>
          </div>
        </div>

        <button
          className="sendButtonPushNotifications"
          onClick={handleSendNotification}
          disabled={sending || !message.trim() || notificationTypes.length === 0 || selectedRecipients.length === 0}
        >
          {sending ? (
            <>
              <span className="spinnerPushNotifications">⏳</span>
              Envoi en cours...
            </>
          ) : (
            `Envoyer la notification (${selectedRecipients.length})`
          )}
        </button>
      </div>
    </div>
  );
}

export default Column3PushNotifications;
