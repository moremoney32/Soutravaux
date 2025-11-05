// import { useState } from 'react';
// import '../styles/pushNotifications.css';
// import type { FilterType, GroupType } from '../types/pushNotifications';
// import Column1PushNotifications from './Column1PushNotifications';
// import Column2PushNotifications from './Column2PushNotifications';
// import Column3PushNotifications from './Column3PushNotifications';

// function PushNotificationAppPushNotifications() {
//   const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
//   const [selectedFilter, setSelectedFilter] = useState<FilterType>('presocietes');
//   const [selectedActivites, setSelectedActivites] = useState<string[]>([]);
//   const [selectedDepartements, setSelectedDepartements] = useState<string[]>([]);
//   const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

//   return (
//     <div className="appContainerPushNotifications">
//       <Column1PushNotifications
//         selectedGroup={selectedGroup}
//         onSelectGroup={setSelectedGroup}
//         selectedFilter={selectedFilter}
//         onSelectFilter={setSelectedFilter}
//         selectedActivites={selectedActivites}
//         onSelectActivites={setSelectedActivites}
//         selectedDepartements={selectedDepartements}
//         onSelectDepartements={setSelectedDepartements}
//       />
//       <Column2PushNotifications
//         selectedGroup={selectedGroup}
//         selectedFilter={selectedFilter}
//         selectedActivites={selectedActivites}
//         selectedDepartements={selectedDepartements}
//         selectedRecipients={selectedRecipients}
//         onSelectRecipients={setSelectedRecipients}
//       />
//       <Column3PushNotifications
//         selectedRecipients={selectedRecipients}
//         onClearRecipients={() => setSelectedRecipients([])}
//       />
//     </div>
//   );
// }

// export default PushNotificationAppPushNotifications;


import { useState } from 'react';
import '../styles/pushNotifications.css';

import Column1PushNotifications from './Column1PushNotifications';
import Column2PushNotifications from './Column2PushNotifications';
import Column3PushNotifications from './Column3PushNotifications';
import { usePushNotifications } from '../hook/Usepushnotifications';

function PushNotificationAppPushNotifications() {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // Utiliser le hook personnalisé
  const {
    // Données
    activites,
    departements,
    preSocietes,
    societes,
    
    // États de sélection
    selectedGroup,
    selectedActivites,
    selectedDepartements,
    searchBy,
    
    // Loading states
    loadingActivites,
    loadingDepartements,
    loadingEntities,
    sending,
    error,
    
    // Actions
    selectGroup,
    setSelectedActivites,
    setSelectedDepartements,
    setSearchBy,
    sendNotification,
    
    // Helpers
    isShowingPreSocietes,
  } = usePushNotifications();

  // Handler pour envoyer la notification
  const handleSendNotification = async (
    message: string,
    emoji: string,
    notificationTypes: any[],
    recipientIds: string[]
  ) => {
    const result = await sendNotification(message, emoji, notificationTypes, recipientIds);
    console.log(recipientIds)
    return result;
  };

  return (
    <div className="appContainerPushNotifications">
      {/* Message d'erreur global */}
      {error && (
        <div className="globalErrorPushNotifications">
          ❌ {error}
        </div>
      )}

      {/* Colonne 1 : Filtres */}
      <Column1PushNotifications
        selectedGroup={selectedGroup}
        onSelectGroup={selectGroup}
        selectedActivites={selectedActivites}
        onSelectActivites={setSelectedActivites}
        selectedDepartements={selectedDepartements}
        onSelectDepartements={setSelectedDepartements}
        activites={activites}
        departements={departements}
        loadingActivites={loadingActivites}
        loadingDepartements={loadingDepartements}
      />

      {/* Colonne 2 : Liste des entités */}
      <Column2PushNotifications
        selectedGroup={selectedGroup}
        selectedActivites={selectedActivites}
        selectedDepartements={selectedDepartements}
        selectedRecipients={selectedRecipients}
        onSelectRecipients={setSelectedRecipients}
        preSocietes={preSocietes}
        societes={societes}
        searchBy={searchBy}
        onSetSearchBy={setSearchBy}
        loadingEntities={loadingEntities}
        isShowingPreSocietes={isShowingPreSocietes}
      />

      {/* Colonne 3 : Formulaire d'envoi */}
      <Column3PushNotifications
        selectedRecipients={selectedRecipients}
        onClearRecipients={() => setSelectedRecipients([])}
        onSendNotification={handleSendNotification}
        sending={sending}
      />
    </div>
  );
}

export default PushNotificationAppPushNotifications;