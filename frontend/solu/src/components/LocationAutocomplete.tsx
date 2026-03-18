// // LocationAutocomplete.tsx
// import React, { useState, useEffect, useRef } from 'react';

// interface LocationSuggestion {
//   label: string;
//   name: string;
//   postcode: string;
//   city: string;
//   context: string;
// }

// interface LocationAutocompleteProps {
//   value: string;
//   onChange: (location: string) => void;
//   placeholder?: string;
//   required?: boolean;
// }

// const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
//   value,
//   onChange,
//   placeholder = 'Ex: 12 rue de la Paix, Paris',
//   required = false
// }) => {
//   const [inputValue, setInputValue] = useState(value);
//   const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [justSelected, setJustSelected] = useState(false);
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   // Fermer suggestions si clic extérieur
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//         setShowSuggestions(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Sync avec value externe
//   useEffect(() => {
//     setInputValue(value);
//   }, [value]);

//   // Recherche API Adresse
//   useEffect(() => {
//     const timer = setTimeout(async () => {
//       if (inputValue.length >= 3) {
//         setIsLoading(true);
//         try {
//           const response = await fetch(
//             `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputValue)}&limit=5`
//           );
//           const data = await response.json();
          
//           const results: LocationSuggestion[] = data.features.map((feature: any) => ({
//             label: feature.properties.label,
//             name: feature.properties.name,
//             postcode: feature.properties.postcode,
//             city: feature.properties.city,
//             context: feature.properties.context
//           }));
          
//           setSuggestions(results);
//           setShowSuggestions(true);
//         } catch (error) {
//           console.error('Erreur API Adresse:', error);
//           setSuggestions([]);
//         } finally {
//           setIsLoading(false);
//         }
//       } else {
//         setSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 300); // Debounce 300ms

//     return () => clearTimeout(timer);
//   }, [inputValue]);

//   const handleSelect = (suggestion: LocationSuggestion) => {
//     setInputValue(suggestion.label)
//     onChange(suggestion.label);
//     setShowSuggestions(false);
//     setSuggestions([]);
//      setJustSelected(true);
//   };

//   return (
//     <div ref={wrapperRef} style={{ position: 'relative'}}>
//       <div style={{ position: 'relative',width:"100%" }}>
//         <input
//         style={{ width:"100%" }}
//           type="text"
//           className="calendar-form-input"
//           value={inputValue}
//           onChange={(e) => {
//             setInputValue(e.target.value);
//             onChange(e.target.value);
//             setJustSelected(false);
//           }}
//         //   onFocus={() => {
//         //     if (suggestions.length > 0) setShowSuggestions(true);
//         //   }}
//           onFocus={() => {
//             if (!justSelected && suggestions.length > 0) {  // ✅ Vérifier flag
//               setShowSuggestions(true);
//             }
//           }}
//           placeholder={placeholder}
//            required={required}
//         //   style={{
//         //     paddingRight: '40px'
//         //   }}
//         />
        
//       </div>

//       {/* Suggestions dropdown */}
//       {showSuggestions && suggestions.length > 0 && (
//         <div style={{
//           position: 'absolute',
//           top: 'calc(100% + 4px)',
//           left: 0,
//           right: 0,
//           backgroundColor: 'white',
//           border: '1px solid #ddd',
//           borderRadius: '8px',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//           maxHeight: '280px',
//           overflowY: 'auto',
//           zIndex: 1000
//         }}>
//           {suggestions.map((suggestion, index) => (
//             <div
//               key={index}
//               onClick={() => handleSelect(suggestion)}
//               style={{
//                 padding: '12px 16px',
//                 cursor: 'pointer',
//                 borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
//                 transition: 'background 0.15s'
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.backgroundColor = '#f5f5f5';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.backgroundColor = 'white';
//               }}
//             >
//               <div style={{
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 color: '#333',
//                 marginBottom: '4px'
//               }}>
//                 {suggestion.name}
//               </div>
//               <div style={{
//                 fontSize: '12px',
//                 color: '#666'
//               }}>
//                 {suggestion.postcode} {suggestion.city}
//                 {suggestion.context && (
//                   <span style={{ marginLeft: '8px', color: '#999' }}>
//                     • {suggestion.context}
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Message si pas de résultats */}
//       {showSuggestions && !isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
//         <div style={{
//           position: 'absolute',
//           top: 'calc(100% + 4px)',
//           left: 0,
//           right: 0,
//           backgroundColor: 'white',
//           border: '1px solid #ddd',
//           borderRadius: '8px',
//           padding: '12px 16px',
//           fontSize: '13px',
//           color: '#666',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//           zIndex: 1000
//         }}>
//           Aucune adresse trouvée pour "{inputValue}"
//         </div>
//       )}
//     </div>
//   );
// };

// export default LocationAutocomplete;




// LocationAutocomplete.tsx
import React, { useState, useEffect, useRef } from 'react';

interface LocationSuggestion {
  label: string;
  name: string;
  postcode: string;
  city: string;
  context: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Ex: 12 rue de la Paix, Paris',
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer suggestions si clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync avec value externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Recherche API Adresse
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.length >= 3 && !justSelected) {  // ✅ Ne pas chercher si vient de sélectionner
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputValue)}&limit=5`
          );
          const data = await response.json();
          
          const results: LocationSuggestion[] = data.features.map((feature: any) => ({
            label: feature.properties.label,
            name: feature.properties.name,
            postcode: feature.properties.postcode,
            city: feature.properties.city,
            context: feature.properties.context
          }));
          
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Erreur API Adresse:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else if (inputValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [inputValue, justSelected]);  // ✅ Ajouter justSelected dans dependencies

  const handleSelect = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.label);
    onChange(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setJustSelected(true);  // ✅ Marquer comme sélectionné (sans timeout)
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="calendar-form-input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setJustSelected(false);  // ✅ Reset SEULEMENT lors modification manuelle
          }}
          onFocus={() => {
            if (!justSelected && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            paddingRight: '40px',
            fontSize:"13px"

          }}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxHeight: '280px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelect(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '4px'
              }}>
                {suggestion.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                {suggestion.postcode} {suggestion.city}
                {suggestion.context && (
                  <span style={{ marginLeft: '8px', color: '#999' }}>
                    • {suggestion.context}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si pas de résultats */}
      {showSuggestions && !isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#666',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          Aucune adresse trouvée pour "{inputValue}"
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;