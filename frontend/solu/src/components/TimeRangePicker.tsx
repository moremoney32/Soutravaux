// // TimeRangePicker.tsx
// import React, { useState, useEffect } from 'react';

// interface TimeRangePickerProps {
//   startTime: string;
//   endTime: string;
//   onStartTimeChange: (time: string) => void;
//   onEndTimeChange: (time: string) => void;
//   defaultDuration?: number; // en minutes (défaut: 60)
// }

// const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
//   startTime,
//   endTime,
//   onStartTimeChange,
//   onEndTimeChange,
//   defaultDuration = 60
// }) => {
//   const [showEndDropdown, setShowEndDropdown] = useState(false);

//   // Générer options d'heures (toutes les 15 min)
//   const generateTimeOptions = (): string[] => {
//     const options: string[] = [];
//     for (let h = 0; h < 24; h++) {
//       for (let m = 0; m < 60; m += 15) {
//         const hours = h.toString().padStart(2, '0');
//         const minutes = m.toString().padStart(2, '0');
//         options.push(`${hours}:${minutes}`);
//       }
//     }
//     return options;
//   };

//   // Calculer durée en minutes entre deux heures
//   const calculateDuration = (start: string, end: string): number => {
//     const [startH, startM] = start.split(':').map(Number);
//     const [endH, endM] = end.split(':').map(Number);
//     return (endH * 60 + endM) - (startH * 60 + startM);
//   };

//   // Formater durée (ex: 75 min → "1 h 15")
//   const formatDuration = (minutes: number): string => {
//     if (minutes === 0) return '0 min';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hours === 0) return `${mins} min`;
//     if (mins === 0) return `${hours} h`;
//     return `${hours} h ${mins}`;
//   };

//   // Ajouter minutes à une heure
//   const addMinutes = (time: string, minutes: number): string => {
//     const [h, m] = time.split(':').map(Number);
//     let totalMinutes = h * 60 + m + minutes;
    
//     // Gérer débordement 24h
//     if (totalMinutes >= 24 * 60) totalMinutes = 24 * 60 - 15;
//     if (totalMinutes < 0) totalMinutes = 0;
    
//     const newHours = Math.floor(totalMinutes / 60);
//     const newMinutes = totalMinutes % 60;
//     return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
//   };

//   // Générer options durée (relative à startTime)
//   const generateDurationOptions = (): Array<{ time: string; duration: number; label: string }> => {
//     const options = [];
//     const durations = [0, 15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300, 360, 480]; // en minutes
    
//     for (const duration of durations) {
//       const time = addMinutes(startTime, duration);
//       options.push({
//         time,
//         duration,
//         label: `${time} (${formatDuration(duration)})`
//       });
//     }
    
//     return options;
//   };

//   // // Quand startTime change, ajuster endTime automatiquement

//   useEffect(() => {
//   // ✅ Fin = début + 1h toujours
//   const newEndTime = addMinutes(startTime, defaultDuration);
//   onEndTimeChange(newEndTime);
// }, [startTime]);

//   const handleStartTimeChange = (newStartTime: string) => {
//     onStartTimeChange(newStartTime);
//     // L'useEffect ci-dessus ajustera automatiquement endTime
//   };

//   const handleEndTimeSelect = (newEndTime: string) => {
//     onEndTimeChange(newEndTime);
//     setShowEndDropdown(false);
//   };

//   const currentDuration = calculateDuration(startTime, endTime);
//   const durationOptions = generateDurationOptions();

//   return (
//     <div className="calendar-form-row">
//       {/* HEURE DÉBUT */}
//       <div className="calendar-form-group">
//         <label className="calendar-form-label">Début</label>
//         <select
//           className="calendar-form-input"
//           value={startTime}
//           onChange={(e) => handleStartTimeChange(e.target.value)}
//           style={{
//             cursor: 'pointer'
//           }}
//         >
//           {generateTimeOptions().map((time) => (
//             <option key={time} value={time}>
//               {time}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* HEURE FIN (avec durée relative) */}
//       <div className="calendar-form-group" style={{ position: 'relative' }}>
//         <label className="calendar-form-label">Fin</label>
        
//         {/* Affichage actuel */}
//         <div
//           onClick={() => setShowEndDropdown(!showEndDropdown)}
//           style={{
//             padding: '10px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             backgroundColor: 'white',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginTop:"5px",
//           }}
//         >
//           <span style={{ fontSize: '14px' }}>
//             {endTime}
//           </span>
//           <span style={{ fontSize: '12px', color: '#666' }}>
//             ({formatDuration(currentDuration)})
//           </span>
//         </div>

//         {/* Dropdown durées */}
//         {showEndDropdown && (
//           <div
//             style={{
//               position: 'absolute',
//               top: 'calc(100% + 4px)',
//               left: 0,
//               right: 0,
//               backgroundColor: 'white',
//               border: '1px solid #ddd',
//               borderRadius: '8px',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//               maxHeight: '300px',
//               overflowY: 'auto',
//               zIndex: 1000
//             }}
//           >
//             {durationOptions.map((option) => (
//               <div
//                 key={option.time}
//                 onClick={() => handleEndTimeSelect(option.time)}
//                 style={{
//                   padding: '10px 16px',
//                   cursor: 'pointer',
//                   backgroundColor: option.time === endTime ? '#E3F2FD' : 'white',
//                   borderBottom: '1px solid #f0f0f0',
//                   fontSize: '14px',
//                   transition: 'background 0.15s'
//                 }}
//                 onMouseEnter={(e) => {
//                   if (option.time !== endTime) {
//                     e.currentTarget.style.backgroundColor = '#f5f5f5';
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (option.time !== endTime) {
//                     e.currentTarget.style.backgroundColor = 'white';
//                   }
//                 }}
//               >
//                 <span style={{ fontWeight: option.time === endTime ? '500' : '400' }}>
//                   {option.time}
//                 </span>
//                 <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
//                   ({formatDuration(option.duration)})
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Fermer dropdown si clic extérieur */}
//       {showEndDropdown && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             zIndex: 999
//           }}
//           onClick={() => setShowEndDropdown(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default TimeRangePicker;



import React, { useEffect } from 'react';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  defaultDuration?: number;
  startExtra?: React.ReactNode;
  hideEnd?: boolean;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  defaultDuration = 60,
  startExtra,
  hideEnd = false
}) => {

  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes <= 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins}`;
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    let totalMinutes = h * 60 + m + minutes;
    if (totalMinutes >= 24 * 60) totalMinutes = 23 * 60 + 59;
    if (totalMinutes < 0) totalMinutes = 0;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // const generateTimeOptions = (): string[] => {
  //   const options: string[] = [];
  //   for (let h = 0; h < 24; h++) {
  //     for (let m = 0; m < 60; m += 15) {
  //       options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  //     }
  //   }
  //   return options;
  // };

  // ✅ Fin = début + defaultDuration quand début change
  useEffect(() => {
    const newEndTime = addMinutes(startTime, defaultDuration);
    onEndTimeChange(newEndTime);
  }, [startTime]);

  const currentDuration = calculateDuration(startTime, endTime);

  // return (
  //   <div className="calendar-form-row">

  //     {/* ── HEURE DÉBUT ────────────────────────────── */}
  //     <div className="calendar-form-group">
  //       <label className="calendar-form-label">Début</label>
  //       <select
  //         className="calendar-form-input"
  //         value={startTime}
  //         onChange={(e) => onStartTimeChange(e.target.value)}
  //         style={{ cursor: 'pointer' }}
  //       >
  //         {generateTimeOptions().map((time) => (
  //           <option key={time} value={time}>{time}</option>
  //         ))}
  //       </select>
  //     </div>

  //     {/* ── HEURE FIN — input libre + boutons rapides ── */}
  //     <div className="calendar-form-group">
  //       <label className="calendar-form-label">
  //         Fin {currentDuration > 0 && (
  //           <span style={{ fontWeight: 400, color: '#999', fontSize: '11px', marginLeft: '6px' }}>
  //             ({formatDuration(currentDuration)})
  //           </span>
  //         )}
  //       </label>

  //       {/* ✅ Input natif time — très flexible */}
  //       <input
  //         type="time"
  //         value={endTime}
  //         onChange={(e) => onEndTimeChange(e.target.value)}
  //         style={{
  //           width: '100%', padding: '10px 12px',
  //           border: '1px solid #ddd', borderRadius: '6px',
  //           fontSize: '14px', cursor: 'pointer',
  //           boxSizing: 'border-box', marginTop: '5px'
  //         }}
  //       />

  //       {/* ✅ Boutons rapides */}
  //       <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
  //         {[
  //           { label: '+15m', min: 15 },
  //           { label: '+30m', min: 30 },
  //           { label: '+45m', min: 45 },
  //           { label: '+1h',  min: 60 },
  //           { label: '+2h',  min: 120 },
  //           { label: '+3h',  min: 180 },
  //         ].map(({ label, min }) => (
  //           <button
  //             key={min}
  //             type="button"
  //             onClick={() => onEndTimeChange(addMinutes(startTime, min))}
  //             style={{
  //               padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
  //               border: `1px solid ${addMinutes(startTime, min) === endTime ? '#E77131' : '#ddd'}`,
  //               background: addMinutes(startTime, min) === endTime ? '#FFF3E0' : 'white',
  //               color: addMinutes(startTime, min) === endTime ? '#E77131' : '#666',
  //               cursor: 'pointer', transition: 'all 0.15s'
  //             }}
  //           >
  //             {label}
  //           </button>
  //         ))}
  //       </div>
  //     </div>

  //   </div>
  // );

  return (
  <div className="calendar-form-row">

    {/* ── HEURE DÉBUT — input libre ─────────────── */}
    <div className="calendar-form-group">
      <label className="calendar-form-label">Début</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => onStartTimeChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid #ddd', borderRadius: '6px',
          fontSize: '14px', cursor: 'pointer',
          boxSizing: 'border-box', marginTop: '5px'
        }}
      />
      {startExtra && <div style={{ marginTop: '5px' }}>{startExtra}</div>}
    </div>

    {/* ── HEURE FIN — masqué si multi-jours ── */}
    <div className="calendar-form-group" style={{ display: hideEnd ? 'none' : undefined }}>
      <label className="calendar-form-label">
        Fin {currentDuration > 0 && (
          <span style={{ fontWeight: 400, color: '#999', fontSize: '11px', marginLeft: '6px' }}>
            ({formatDuration(currentDuration)})
          </span>
        )}
      </label>

      <input
        type="time"
        value={endTime}
        onChange={(e) => onEndTimeChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid #ddd', borderRadius: '6px',
          fontSize: '14px', cursor: 'pointer',
          boxSizing: 'border-box', marginTop: '5px'
        }}
      />

      {/* Boutons rapides */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
        {[
          { label: '+15m', min: 15 },
          { label: '+30m', min: 30 },
          { label: '+45m', min: 45 },
          { label: '+1h',  min: 60 },
          { label: '+2h',  min: 120 },
          { label: '+3h',  min: 180 },
        ].map(({ label, min }) => (
          <button
            key={min}
            type="button"
            onClick={() => onEndTimeChange(addMinutes(startTime, min))}
            style={{
              padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
              border: `1px solid ${addMinutes(startTime, min) === endTime ? '#E77131' : '#ddd'}`,
              background: addMinutes(startTime, min) === endTime ? '#FFF3E0' : 'white',
              color: addMinutes(startTime, min) === endTime ? '#E77131' : '#666',
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

  </div>
);
};

export default TimeRangePicker;