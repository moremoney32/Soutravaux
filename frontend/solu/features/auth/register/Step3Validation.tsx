

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { AnnonceurData } from './AnnonceurRegistration';
// import { fetchData } from '../../../src/helpers/fetchData';

// interface Step3ValidationProps {
//     data: AnnonceurData;
//     onUpdate: (data: Partial<AnnonceurData>) => void;
//     onPrev: () => void;
// }

// const Step3Validation: React.FC<Step3ValidationProps> = ({
//     data,
//     onUpdate,
//     onPrev,
// }) => {
//     const [timeLeft, setTimeLeft] = useState(180);
//     const [error, setError] = useState('');
//     const [otp, setOtp] = useState(["", "", "", ""]);
//     const [canResend, setCanResend] = useState(false);
//     const [resetKey, setResetKey] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [errorPopup, setErrorPopup] = useState<string | null>(null);

//     // Timer pour le renvoi du code
//     useEffect(() => {
//         if (timeLeft > 0) {
//             const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//             return () => clearTimeout(timer);
//         } else {
//             setCanResend(true);
//         }
//     }, [timeLeft]);

//     const handleVerify = async () => {
//         const code = otp.join(""); // concatène les 4 chiffres

//         // Vérif côté frontend
//         if (otp.some((digit) => digit === "")) {
//             setErrorPopup("Veuillez remplir toutes les cases du code.");
//             setTimeout(() => setErrorPopup(null), 3000);
//             return;
//         }
        
//         setLoading(true);

//         try {
//             const result = await fetchData("verifyCode", "POST", {
//                 email: data.emailAnnonceur, // email de l'annonceur
//                 code,
//             });

//             if (result.status === 200) {
//                 console.log("Code vérifié avec succès");
//             }
//         } catch (err: any) {
//             console.error("Erreur vérification:", err.message);
//             setErrorPopup(err.message);
//             setTimeout(() => setErrorPopup(null), 3000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatTime = (seconds: number): string => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const handleResend = async () => {
//         if (!canResend) return;
        
//         try {
//             await fetchData("users/resend-code", "POST", {
//                 email: data.emailAnnonceur
//             });
            
//             console.log("Nouveau code envoyé !");
//             setTimeLeft(180); // reset timer à 3 minutes
//             setResetKey((k) => k + 1);
//             setCanResend(false);
//             setError('');
//             setErrorPopup("Nouveau code envoyé avec succès");
//             setTimeout(() => setErrorPopup(null), 3000);
            
//         } catch (err: any) {
//             console.error("Erreur resend:", err.message);
//             setErrorPopup(err.message || "Erreur lors de l'envoi du code");
//             setTimeout(() => setErrorPopup(null), 3000);
//         }
//     };

//     const handleOtpChange = (index: number, value: string) => {
//         const val = value.replace(/\D/, ""); // uniquement chiffres
//         const newOtp = [...otp];
//         newOtp[index] = val;
//         setOtp(newOtp);
//         setError(''); // Effacer l'erreur quand l'utilisateur tape

//         // Auto-focus sur le champ suivant
//         if (val && index < 3) {
//             const next = document.querySelectorAll<HTMLInputElement>(".otp_input")[index + 1];
//             next?.focus();
//         }

//         // Auto-focus sur le champ précédent si on efface
//         if (!val && index > 0) {
//             const prev = document.querySelectorAll<HTMLInputElement>(".otp_input")[index - 1];
//             prev?.focus();
//         }
//     };

//     return (
//         <div className="step-container">
//             {/* Snackbar pour les erreurs */}
//             <AnimatePresence>
//                 {errorPopup && (
//                     <motion.div
//                         className="role_error_sidebar top_right"
//                         role="alert"
//                         initial={{ x: "100%", opacity: 0 }}
//                         animate={{ x: [0, -120, 0], opacity: [0, 1, 1] }}
//                         exit={{ x: "100%", opacity: 0 }}
//                         transition={{ duration: 2, ease: "easeInOut" }}
//                     >
//                         {errorPopup}
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <h2>Vérifiez votre boîte mail et entrez le code.</h2>
//             <p className="step-description">
//                 Un code de vérification a été envoyé à <strong>{data.emailAnnonceur}</strong>
//             </p>

//             <div className="verification-section">
//                 <div className="otp_inputs">
//                     {otp.map((digit, index) => (
//                         <input
//                             key={`${resetKey}-${index}`}
//                             type="text"
//                             maxLength={1}
//                             value={digit}
//                             onChange={(e) => handleOtpChange(index, e.target.value)}
//                             className="otp_input"
//                             placeholder="0"
//                         />
//                     ))}
//                 </div>

//                 {error && <div className="error-message">{error}</div>}

//                 <div className="otp_footer">
//                     <span
//                         className="resend"
//                         style={{
//                             color: canResend ? "orange" : "gray",
//                             cursor: canResend ? "pointer" : "not-allowed",
//                         }}
//                         onClick={handleResend}
//                     >
//                         Renvoyer le code ?
//                     </span>
//                     <span
//                         className="timer"
//                         style={{ color: canResend ? "black" : "orange" }}
//                     >
//                         {formatTime(timeLeft)}
//                     </span>
//                 </div>
//             </div>

//             <div className="step-actions">
//                 <button className="btn-back" onClick={onPrev} disabled={loading}>
//                     Retour
//                 </button>
//                 <button
//                     className="btn-continue"
//                     onClick={handleVerify}
//                     disabled={otp.some((digit) => digit === "") || loading}
//                 >
//                     {loading ? 'Vérification...' : 'Continuer'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Step3Validation;




import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnnonceurData } from './AnnonceurRegistration';
import { fetchData } from '../../../src/helpers/fetchData';

// Importez vos images (ajustez les chemins selon votre structure)
import nike from "../../../src/assets/icons/nike.png";
import next from "../../../src/assets/icons/next.png";
import close from "../../../src/assets/icons/close.png";

interface Step3ValidationProps {
    data: AnnonceurData;
    onUpdate: (data: Partial<AnnonceurData>) => void;
    onPrev: () => void;
}

const Step3Validation: React.FC<Step3ValidationProps> = ({
    data,
    onPrev,
}) => {
    const [timeLeft, setTimeLeft] = useState(180);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [canResend, setCanResend] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [loadingComplete, setLoadingComplete] = useState(false);

    // Timer pour le renvoi du code
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleVerify = async () => {
        const code = otp.join(""); // concatène les 4 chiffres

        // Vérif côté frontend
        if (otp.some((digit) => digit === "")) {
            setErrorPopup("Veuillez remplir toutes les cases du code.");
            setTimeout(() => setErrorPopup(null), 3000);
            return;
        }
        
        setLoading(true);

        try {
            const result = await fetchData("verifyCode", "POST", {
                email: data.emailAnnonceur, // email de l'annonceur
                code,
            });

            if (result.status === 200) {
                console.log("Code vérifié avec succès");
                // Au lieu de passer à l'étape suivante, on affiche la popup
                setShowSuccessPopup(true);
            }
        } catch (err: any) {
            console.error("Erreur vérification:", err.message);
            setErrorPopup(err.message);
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async () => {
        setLoadingComplete(true);
        try {
            // Ici vous pouvez appeler une API pour finaliser l'inscription si nécessaire
            // ou simplement rediriger vers le dashboard
            console.log("Redirection vers le profil complet...");
            
            // Simuler un chargement
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirection vers le dashboard ou page de profil
            window.location.href = '/dashboard/annonceur';
            
        } catch (err: any) {
            console.error("Erreur:", err.message);
            setErrorPopup(err.message);
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoadingComplete(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResend = async () => {
        if (!canResend) return;
        
        try {
            await fetchData("users/resend-code", "POST", {
                email: data.emailAnnonceur
            });
            
            console.log("Nouveau code envoyé !");
            setTimeLeft(180); // reset timer à 3 minutes
            setResetKey((k) => k + 1);
            setCanResend(false);
            setError('');
            setErrorPopup("Nouveau code envoyé avec succès");
            setTimeout(() => setErrorPopup(null), 3000);
            
        } catch (err: any) {
            console.error("Erreur resend:", err.message);
            setErrorPopup(err.message || "Erreur lors de l'envoi du code");
            setTimeout(() => setErrorPopup(null), 3000);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const val = value.replace(/\D/, ""); // uniquement chiffres
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        setError(''); // Effacer l'erreur quand l'utilisateur tape

        // Auto-focus sur le champ suivant
        if (val && index < 3) {
            const next = document.querySelectorAll<HTMLInputElement>(".otp_input")[index + 1];
            next?.focus();
        }

        // Auto-focus sur le champ précédent si on efface
        if (!val && index > 0) {
            const prev = document.querySelectorAll<HTMLInputElement>(".otp_input")[index - 1];
            prev?.focus();
        }
    };

    return (
        <div className="step-container">
            {/* Snackbar pour les erreurs */}
            <AnimatePresence>
                {errorPopup && (
                    <motion.div
                        className="role_error_sidebar top_right"
                        role="alert"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: [0, -120, 0], opacity: [0, 1, 1] }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        {errorPopup}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Popup de succès */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <>
                        {/* Masque noir semi-transparent */}
                        <motion.div
                            className="masque"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Popup */}
                        <motion.div
                            className="popup"
                            initial={{ scale: 0.7, opacity: 0, y: -50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: -50 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <img src={nike} alt="Succès" />
                            <div className="popup_text">
                                <span className="popup_title">Félicitations !</span>
                                <span className="popup_title_span">
                                    Merci pour votre inscription en tant qu'annonceur. Vous avez maintenant accès au panel.
                                    N'oubliez pas de compléter votre profil dans le dashboard pour débloquer toutes vos options publicitaires.
                                </span>
                            </div>

                            <div className="popup_buttons">
                                <div 
                                    className="popup_buttons1" 
                                    onClick={handleCompleteProfile}
                                >
                                    {loadingComplete ? (
                                        <span>En Cours ...</span>
                                    ) : (
                                        <span>Compléter mon profil</span>
                                    )}
                                    <img src={next} alt="Suivant" />
                                </div>
                            </div>

                            <img
                                src={close}
                                alt="Fermer"
                                className="close_icon"
                                onClick={() => setShowSuccessPopup(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <h2>Vérifiez votre boîte mail et entrez le code.</h2>
            <p className="step-description">
                Un code de vérification a été envoyé à <strong>{data.emailAnnonceur}</strong>
            </p>

            <div className="verification-section">
                <div className="otp_inputs">
                    {otp.map((digit, index) => (
                        <input
                            key={`${resetKey}-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            className="otp_input"
                            placeholder="0"
                        />
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="otp_footer">
                    <span
                        className="resend"
                        style={{
                            color: canResend ? "orange" : "gray",
                            cursor: canResend ? "pointer" : "not-allowed",
                        }}
                        onClick={handleResend}
                    >
                        Renvoyer le code ?
                    </span>
                    <span
                        className="timer"
                        style={{ color: canResend ? "black" : "orange" }}
                    >
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="step-actions">
                <button className="btn-back" onClick={onPrev} disabled={loading}>
                    Retour
                </button>
                <button
                    className="btn-continue"
                    onClick={handleVerify}
                    disabled={otp.some((digit) => digit === "") || loading}
                >
                    {loading ? 'Vérification...' : 'Continuer'}
                </button>
            </div>
        </div>
    );
};

export default Step3Validation;