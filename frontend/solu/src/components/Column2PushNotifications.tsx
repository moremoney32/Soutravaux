// import { useState, useMemo } from 'react';
// import type { FilterType, GroupType } from '../types/pushNotifications';
// import { mockPreSocietes, mockSocietes } from '../data/mockDataPushNotifications';
// // import { GroupType, FilterType } from '../types/pushNotifications';
// // import { mockPreSocietes, mockSocietes } from '../data/mockDataPushNotifications';

// interface Column2Props {
//   selectedGroup: GroupType | null;
//   selectedFilter: FilterType;
//   selectedActivites: string[];
//   selectedDepartements: string[];
//   selectedRecipients: string[];
//   onSelectRecipients: (recipients: string[]) => void;
// }

// function Column2PushNotifications({
//   selectedGroup,
//   selectedFilter,
//   selectedActivites,
//   selectedDepartements,
//   selectedRecipients,
//   onSelectRecipients,
// }: Column2Props) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchBy, setSearchBy] = useState<'presocietes' | 'societes'>('presocietes');

//   const filteredData = useMemo(() => {
//     if (selectedActivites.length > 0 || selectedDepartements.length > 0) {
//       let filtered = mockSocietes;

//       if (selectedActivites.length > 0) {
//         filtered = filtered.filter(s => s.activite && selectedActivites.includes(s.activite));
//       }

//       if (selectedDepartements.length > 0) {
//         filtered = filtered.filter(s => s.departement && selectedDepartements.includes(s.departement));
//       }

//       return filtered;
//     }

//     if (!selectedGroup) return [];

//     if (selectedFilter === 'presocietes' || searchBy === 'presocietes') {
//       return mockPreSocietes.filter(ps =>
//         ps.group === selectedGroup &&
//         (ps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//          ps.email.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     return mockSocietes.filter(s =>
//       s.group === selectedGroup &&
//       (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        s.email.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   }, [selectedGroup, selectedFilter, searchBy, searchTerm, selectedActivites, selectedDepartements]);

//   const handleToggleRecipient = (id: string) => {
//     if (selectedRecipients.includes(id)) {
//       onSelectRecipients(selectedRecipients.filter(r => r !== id));
//     } else {
//       onSelectRecipients([...selectedRecipients, id]);
//     }
//   };

//   const handleToggleAll = () => {
//     if (selectedRecipients.length === filteredData.length) {
//       onSelectRecipients([]);
//     } else {
//       onSelectRecipients(filteredData.map(item => item.id));
//     }
//   };

//   const showingPreSocietes = (selectedFilter === 'presocietes' || searchBy === 'presocietes') &&
//                               selectedActivites.length === 0 &&
//                               selectedDepartements.length === 0;

//   return (
//     <div className="column2PushNotifications">
//       <div className="filterHeaderPushNotifications">
//         <div className="searchContainerPushNotifications">
//           <input
//             type="text"
//             className="searchInputMainPushNotifications"
//             placeholder={`Rechercher par ${searchBy === 'presocietes' ? 'pré-société' : 'société'}...`}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {selectedGroup && selectedActivites.length === 0 && selectedDepartements.length === 0 && (
//           <div className="filterByGroupPushNotifications">
//             <select
//               value={searchBy}
//               onChange={(e) => setSearchBy(e.target.value as 'presocietes' | 'societes')}
//               className="selectFilterPushNotifications"
//             >
//               <option value="presocietes">Pré-sociétés</option>
//               <option value="societes">Sociétés</option>
//             </select>
//           </div>
//         )}
//       </div>

//       {filteredData.length > 0 && (
//         <div className="selectAllContainerPushNotifications">
//           <label className="checkboxItemPushNotifications">
//             <input
//               type="checkbox"
//               checked={selectedRecipients.length === filteredData.length}
//               onChange={handleToggleAll}
//             />
//             <span className="selectAllTextPushNotifications">Tout sélectionner</span>
//           </label>
//         </div>
//       )}

//       <div className="cardsContainerPushNotifications">
//         {filteredData.length === 0 ? (
//           <div className="emptyStatePushNotifications">
//             <p>Sélectionnez un groupe, une activité ou un département pour voir les résultats</p>
//           </div>
//         ) : (
//           filteredData.map(item => (
//             <div
//               key={item.id}
//               className={`cardPushNotifications ${selectedRecipients.includes(item.id) ? 'selectedCardPushNotifications' : ''}`}
//               onClick={() => handleToggleRecipient(item.id)}
//             >
//               <div className="cardHeaderPushNotifications">
//                 <input
//                   type="checkbox"
//                   checked={selectedRecipients.includes(item.id)}
//                   onChange={() => handleToggleRecipient(item.id)}
//                   onClick={(e) => e.stopPropagation()}
//                 />
//                 <h4 className="cardTitlePushNotifications">{item.name}</h4>
//               </div>
//               <p className="cardEmailPushNotifications">{item.email}</p>
//               <div className="cardFooterPushNotifications">
//                 <span className="cardDatePushNotifications">
//                   Créé le: {new Date(item.createdDate).toLocaleDateString('fr-FR')}
//                 </span>
//                 {item.isNotified && (
//                   <span className="notifiedBadgePushNotifications">Déjà notifié</span>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default Column2PushNotifications;



import { useState, useMemo } from 'react';
import type { GroupType, PreSociete, Societe } from '../types/pushNotifications';

interface Column2Props {
  selectedGroup: GroupType | null;
  selectedActivites: string[];
  selectedDepartements: string[];
  selectedRecipients: string[];
  onSelectRecipients: (recipients: string[]) => void;
  preSocietes: PreSociete[];
  societes: Societe[];
  searchBy: 'presocietes' | 'societes';
  onSetSearchBy: (value: 'presocietes' | 'societes') => void;
  loadingEntities: boolean;
  isShowingPreSocietes: boolean;
}

function Column2PushNotifications({
  selectedGroup,
  selectedActivites,
  selectedDepartements,
  selectedRecipients,
  onSelectRecipients,
  preSocietes,
  societes,
  searchBy,
  onSetSearchBy,
  loadingEntities,
  isShowingPreSocietes
}: Column2Props) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les données selon le terme de recherche
  const filteredData = useMemo(() => {
    const data: Array<PreSociete | Societe> = isShowingPreSocietes ? preSocietes : societes;
    
    if (!searchTerm.trim()) return data;

    return data.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = 'email' in item && item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const siretMatch = item.siret && item.siret.includes(searchTerm);
      
      return nameMatch || emailMatch || siretMatch;
    });
  }, [isShowingPreSocietes, preSocietes, societes, searchTerm]);

  const handleToggleRecipient = (id: string) => {
    if (selectedRecipients.includes(id)) {
      onSelectRecipients(selectedRecipients.filter(r => r !== id));
    } else {
      onSelectRecipients([...selectedRecipients, id]);
    }
  };

  const handleToggleAll = () => {
    if (selectedRecipients.length === filteredData.length && filteredData.length > 0) {
      onSelectRecipients([]);
    } else {
      onSelectRecipients(filteredData.map(item => item.id));
    }
  };

  // Afficher le select uniquement si pas de filtres actifs
  const showSelect = selectedGroup && selectedActivites.length === 0 && selectedDepartements.length === 0;

  return (
    <div className="column2PushNotifications">
      <div className="filterHeaderPushNotifications">
        <div className="searchContainerPushNotifications">
          <input
            type="text"
            className="searchInputMainPushNotifications"
            placeholder={`Rechercher par ${isShowingPreSocietes ? 'pré-société' : 'société'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showSelect && (
          <div className="filterByGroupPushNotifications">
            <select
              value={searchBy}
              onChange={(e) => onSetSearchBy(e.target.value as 'presocietes' | 'societes')}
              className="selectFilterPushNotifications"
            >
              <option value="presocietes">Pré-sociétés</option>
              <option value="societes">Sociétés</option>
            </select>
          </div>
        )}
      </div>

      {loadingEntities ? (
        <div className="emptyStatePushNotifications">
          <p>⏳ Chargement des données...</p>
        </div>
      ) : (
        <>
          {filteredData.length > 0 && (
            <div className="selectAllContainerPushNotifications">
              <label className="checkboxItemPushNotifications">
                <input
                  type="checkbox"
                  checked={selectedRecipients.length === filteredData.length && filteredData.length > 0}
                  onChange={handleToggleAll}
                />
                <span className="selectAllTextPushNotifications">
                  Tout sélectionner ({filteredData.length})
                </span>
              </label>
            </div>
          )}

          <div className="cardsContainerPushNotifications">
            {filteredData.length === 0 ? (
              <div className="emptyStatePushNotifications">
                {!selectedGroup ? (
                  <p>👈 Sélectionnez un groupe pour commencer</p>
                ) : searchTerm ? (
                  <p>🔍 Aucun résultat trouvé pour "{searchTerm}"</p>
                ) : (
                  <p>Aucune donnée disponible pour les filtres sélectionnés</p>
                )}
              </div>
            ) : (
              filteredData.map(item => (
                <div
                  key={item.id}
                  className={`cardPushNotifications ${selectedRecipients.includes(item.id) ? 'selectedCardPushNotifications' : ''}`}
                  onClick={() => handleToggleRecipient(item.id)}
                >
                  <div className="cardHeaderPushNotifications">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(item.id)}
                      onChange={() => handleToggleRecipient(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h4 className="cardTitlePushNotifications">{item.name}</h4>
                  </div>
                  
                  {'email' in item && item.email && (
                    <p className="cardEmailPushNotifications">📧 {item.email}</p>
                  )}
                  
                  {item.siret && (
                    <p className="cardSiretPushNotifications">🏢 SIRET: {item.siret}</p>
                  )}
                  
                  {isShowingPreSocietes && 'ville' in item && item.ville && (
                    <p className="cardVillePushNotifications">📍 {item.ville}</p>
                  )}
                  
                  <div className="cardFooterPushNotifications">
                    <span className="cardDatePushNotifications">
                      Créé le: {new Date(item.createdDate).toLocaleDateString('fr-FR')}
                    </span>
                    {item.isNotified && (
                      <span className="notifiedBadgePushNotifications">Déjà notifié</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Column2PushNotifications;
