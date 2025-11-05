



// import { useState} from 'react';
// import type { GroupType, Activite, Departement } from '../types/pushNotifications';
// import solutravo from "../assets/images/solutravo.png";

// interface Column1Props {
//   selectedGroup: GroupType | null;
//   onSelectGroup: (group: GroupType) => void;
//   selectedActivites: string[];
//   onSelectActivites: (activites: string[]) => void;
//   selectedDepartements: string[];
//   onSelectDepartements: (departements: string[]) => void;
//   activites: Activite[];
//   departements: Departement[];
//   loadingActivites: boolean;
//   loadingDepartements: boolean;
// }

// function Column1PushNotifications({
//   selectedGroup,
//   onSelectGroup,
//   selectedActivites,
//   onSelectActivites,
//   selectedDepartements,
//   onSelectDepartements,
//   activites,
//   departements,
//   loadingActivites,
//   loadingDepartements
// }: Column1Props) {
//   const [activiteSearch, setActiviteSearch] = useState('');
//   const [departementSearch, setDepartementSearch] = useState('');

//   const handleActiviteToggle = (activiteId: string) => {
//     if (selectedActivites.includes(activiteId)) {
//       onSelectActivites(selectedActivites.filter(id => id !== activiteId));
//     } else {
//       onSelectActivites([...selectedActivites, activiteId]);
//     }
//   };

//   const handleDepartementToggle = (departementId: string) => {
//     if (selectedDepartements.includes(departementId)) {
//       onSelectDepartements(selectedDepartements.filter(id => id !== departementId));
//     } else {
//       onSelectDepartements([...selectedDepartements, departementId]);
//     }
//   };

//   const filteredActivites = activites.filter(act =>
//     act.name.toLowerCase().includes(activiteSearch.toLowerCase())
//   );

//   const filteredDepartements = departements.filter(dep =>
//     dep.name.toLowerCase().includes(departementSearch.toLowerCase()) ||
//     dep.code.includes(departementSearch)
//   );

//   return (
//     <div className="column1PushNotifications">
//       <div className="logoContainerPushNotifications">
//         <img src={solutravo} alt="Logo" className="logoPushNotifications" />
//       </div>

//       <div className="sectionPushNotifications">
//         <h3 className="sectionTitlePushNotifications">Groupes</h3>
//         <div className="buttonGroupPushNotifications">
//           <button
//             className={`groupButtonPushNotifications ${selectedGroup === 'artisan' ? 'activePushNotifications' : ''}`}
//             onClick={() => onSelectGroup('artisan')}
//           >
//             Artisan
//           </button>
//           <button
//             className={`groupButtonPushNotifications ${selectedGroup === 'annonceur' ? 'activePushNotifications' : ''}`}
//             onClick={() => onSelectGroup('annonceur')}
//             disabled={true}
//             style={{ opacity: 0.5, cursor: 'not-allowed' }}
//             title="Bientôt disponible"
//           >
//             Annonceur
//           </button>
//           <button
//             className={`groupButtonPushNotifications ${selectedGroup === 'fournisseur' ? 'activePushNotifications' : ''}`}
//             onClick={() => onSelectGroup('fournisseur')}
//             disabled={true}
//             style={{ opacity: 0.5, cursor: 'not-allowed' }}
//             title="Bientôt disponible"
//           >
//             Fournisseur
//           </button>
//         </div>
//       </div>

//       <div className="sectionPushNotifications">
//         <h3 className="sectionTitlePushNotifications">
//           Activités {selectedActivites.length > 0 && `(${selectedActivites.length})`}
//         </h3>
//         <input
//           type="text"
//           className="searchInputPushNotifications"
//           placeholder="Rechercher une activité..."
//           value={activiteSearch}
//           onChange={(e) => setActiviteSearch(e.target.value)}
//         />
//         {loadingActivites ? (
//           <div className="loadingStatePushNotifications">
//             <p>Chargement des activités...</p>
//           </div>
//         ) : (
//           <div className="checkboxListPushNotifications">
//             {filteredActivites.length === 0 ? (
//               <p className="emptyTextPushNotifications">Aucune activité trouvée</p>
//             ) : (
//               filteredActivites.map(activite => (
//                 <label key={activite.id} className="checkboxItemPushNotifications">
//                   <input
//                     type="checkbox"
//                     checked={selectedActivites.includes(activite.id)}
//                     onChange={() => handleActiviteToggle(activite.id)}
//                   />
//                   <span>{activite.name}</span>
//                 </label>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       <div className="sectionPushNotifications">
//         <h3 className="sectionTitlePushNotifications">
//           Départements {selectedDepartements.length > 0 && `(${selectedDepartements.length})`}
//         </h3>
//         <input
//           type="text"
//           className="searchInputPushNotifications"
//           placeholder="Rechercher un département..."
//           value={departementSearch}
//           onChange={(e) => setDepartementSearch(e.target.value)}
//         />
//         {loadingDepartements ? (
//           <div className="loadingStatePushNotifications">
//             <p>Chargement des départements...</p>
//           </div>
//         ) : (
//           <div className="checkboxListPushNotifications">
//             {filteredDepartements.length === 0 ? (
//               <p className="emptyTextPushNotifications">Aucun département trouvé</p>
//             ) : (
//               filteredDepartements.map(departement => (
//                 <label key={departement.id} className="checkboxItemPushNotifications">
//                   <input
//                     type="checkbox"
//                     checked={selectedDepartements.includes(departement.id)}
//                     onChange={() => handleDepartementToggle(departement.id)}
//                   />
//                   <span>{departement.code} - {departement.name}</span>
//                 </label>
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Column1PushNotifications;



import { useState } from 'react';
import type { GroupType, Activite, Departement } from '../types/pushNotifications';
import solutravo from "../assets/images/solutravo.png";

interface Column1Props {
  selectedGroup: GroupType | null;
  onSelectGroup: (group: GroupType) => void;
  selectedActivites: string[];
  onSelectActivites: (activites: string[]) => void;
  selectedDepartements: string[];
  onSelectDepartements: (departements: string[]) => void;
  activites: Activite[];
  departements: Departement[];
  loadingActivites: boolean;
  loadingDepartements: boolean;
}

function Column1PushNotifications({
  selectedGroup,
  onSelectGroup,
  selectedActivites,
  onSelectActivites,
  selectedDepartements,
  onSelectDepartements,
  activites,
  departements,
  loadingActivites,
  loadingDepartements
}: Column1Props) {
  const [activiteSearch, setActiviteSearch] = useState('');
  const [departementSearch, setDepartementSearch] = useState('');

  const handleActiviteToggle = (activiteId: string) => {
    if (selectedActivites.includes(activiteId)) {
      onSelectActivites(selectedActivites.filter(id => id !== activiteId));
    } else {
      onSelectActivites([...selectedActivites, activiteId]);
    }
  };

  const handleDepartementToggle = (departementId: string) => {
    if (selectedDepartements.includes(departementId)) {
      onSelectDepartements(selectedDepartements.filter(id => id !== departementId));
    } else {
      onSelectDepartements([...selectedDepartements, departementId]);
    }
  };

  const filteredActivites = activites.filter(act =>
    act.name.toLowerCase().includes(activiteSearch.toLowerCase())
  );

  const filteredDepartements = departements.filter(dep =>
    dep.name.toLowerCase().includes(departementSearch.toLowerCase()) ||
    dep.code.includes(departementSearch)
  );

  return (
    <div className="column1PushNotifications">
      <div className="logoContainerPushNotifications">
        <img src={solutravo} alt="Logo" className="logoPushNotifications" />
      </div>

      <div className="sectionPushNotifications">
        <h3 className="sectionTitlePushNotifications">Groupes</h3>
        <div className="buttonGroupPushNotifications">
          <button
            className={`groupButtonPushNotifications ${selectedGroup === 'artisan' ? 'activePushNotifications' : ''}`}
            onClick={() => onSelectGroup('artisan')}
          >
            Artisan
          </button>
          <button
            className={`groupButtonPushNotifications ${selectedGroup === 'annonceur' ? 'activePushNotifications' : ''}`}
            onClick={() => onSelectGroup('annonceur')}
            disabled={true}
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Bientôt disponible"
          >
            Annonceur
          </button>
          <button
            className={`groupButtonPushNotifications ${selectedGroup === 'fournisseur' ? 'activePushNotifications' : ''}`}
            onClick={() => onSelectGroup('fournisseur')}
            disabled={true}
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Bientôt disponible"
          >
            Fournisseur
          </button>
        </div>
      </div>

      <div className="sectionPushNotifications">
        <h3 className="sectionTitlePushNotifications">
          Activités {selectedActivites.length > 0 && `(${selectedActivites.length})`}
        </h3>
        <input
          type="text"
          className="searchInputPushNotifications"
          placeholder="Rechercher une activité..."
          value={activiteSearch}
          onChange={(e) => setActiviteSearch(e.target.value)}
        />
        {loadingActivites ? (
          <div className="loadingStatePushNotifications">
            <p>Chargement des activités...</p>
          </div>
        ) : (
          <div className="checkboxListPushNotifications">
            {filteredActivites.length === 0 ? (
              <p className="emptyTextPushNotifications">Aucune activité trouvée</p>
            ) : (
              filteredActivites.map(activite => (
                <label key={activite.id} className="checkboxItemPushNotifications">
                  <input
                    type="checkbox"
                    checked={selectedActivites.includes(activite.id)}
                    onChange={() => handleActiviteToggle(activite.id)}
                  />
                  <span>{activite.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      <div className="sectionPushNotifications">
        <h3 className="sectionTitlePushNotifications">
          Départements {selectedDepartements.length > 0 && `(${selectedDepartements.length})`}
        </h3>
        <input
          type="text"
          className="searchInputPushNotifications"
          placeholder="Rechercher un département..."
          value={departementSearch}
          onChange={(e) => setDepartementSearch(e.target.value)}
        />
        {loadingDepartements ? (
          <div className="loadingStatePushNotifications">
            <p>Chargement des départements...</p>
          </div>
        ) : (
          <div className="checkboxListPushNotifications">
            {filteredDepartements.length === 0 ? (
              <p className="emptyTextPushNotifications">Aucun département trouvé</p>
            ) : (
              filteredDepartements.map(departement => (
                <label key={departement.id} className="checkboxItemPushNotifications">
                  <input
                    type="checkbox"
                    checked={selectedDepartements.includes(departement.id)}
                    onChange={() => handleDepartementToggle(departement.id)}
                  />
                  <span>{departement.code} - {departement.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Column1PushNotifications;