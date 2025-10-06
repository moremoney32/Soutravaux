import React, { useState, useEffect } from 'react';
import type { AnnonceurData } from './AnnonceurRegistration';
import { fetchData } from '../../../src/helpers/fetchData';
// import { AnnonceurData } from '../AnnonceurRegistration';

interface Step3ValidationProps {
    data: AnnonceurData;
    onUpdate: (data: Partial<AnnonceurData>) => void;
    onPrev: () => void;
    onComplete: () => void;
}

const Step3Validation: React.FC<Step3ValidationProps> = ({
    data,
    onUpdate,
    onPrev,
    onComplete
}) => {
    const [timeLeft, setTimeLeft] = useState(180)
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
      const [canResend, setCanResend] = useState(false);
       const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        // Simuler l'envoi du code de vérification
        sendVerificationCode();
    }, []);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);
    

    const sendVerificationCode = async () => {
        try {
            console.log('Envoi du code de vérification à:', data.email);
            //  appel à votre API ici
        } catch (error) {
            console.error('Erreur lors de l\'envoi du code:', error);
        }
    };

    // const handleCodeChange = (value: string) => {
    //     // Limiter à 4chiffres
    //     const cleanValue = value.replace(/\D/g, '').slice(0, 4);
    //     onUpdate({ verificationCode: cleanValue });
    //     setError('');
    // };

    // const handleResendCode = async () => {
    //     setIsResending(true);
    //     await sendVerificationCode();
    //     setTimeLeft(180)
    //     setIsResending(false);
    // };

    const handleValidate = async () => {
        if (data.verificationCode.length !== 4){
            setError('Le code doit contenir 4chiffres');
            return;
        }

        try {
            // Simuler la validation du code
            // Dans un vrai projet, vous valideriez le code avec votre API
            console.log('Validation du code:', data.verificationCode);

            // Simuler une validation réussie
            if (data.verificationCode === '1456') {
                onComplete();
            } else {
                setError('Code de vérification incorrect');
            }
        } catch (error) {
            setError('Erreur lors de la validation');
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Renvoyer un nouveau code
        const handleResend = async () => {
            if (!canResend) return;
            try {
                await fetchData("users/resend-code", "POST", {
                    email: data.email
                });
                console.log(" Nouveau code envoyé !");
                setTimeLeft(180); // reset timer
                setResetKey((k) => k + 1);
                setCanResend(false);
            } catch (err: any) {
                console.error("Erreur resend:", err.message);
                // setErrorPopup(err.message);
                // setTimeout(() => setErrorPopup(null), 3000);
            }
        };

    return (
        <div className="step-container">
            <h2>Vérifiez votre boîte mail et entrez le code.</h2>
            <p className="step-description">
                Un code de vérification a été envoyé à <strong>{data.email}</strong>
            </p>

            <div className="verification-section">
                {/* <div className="code-input-container">
                    <input
                        type="text"
                        value={data.verificationCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="000000"
                        className={`code-input ${error ? 'error' : ''}`}
                        maxLength={6}
                    />
                </div> */}
                <div className="otp_inputs">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/, ""); // uniquement chiffres
                                const newOtp = [...otp];
                                newOtp[i] = val;
                                setOtp(newOtp);

                                // focus auto sur le suivant
                                if (val && i < 7) {
                                    const next = document.querySelectorAll<HTMLInputElement>(
                                        ".otp_input"
                                    )[i + 1];
                                    next?.focus();
                                }
                            }}
                            className="otp_input"
                        />
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* <div className="resend-section">
                    <span>Renvoyer le code ?</span>
                    {timeLeft > 0 ? (
                        <span className="timer">{formatTime(timeLeft)}</span>
                    ) : (
                        <button
                            className="resend-btn"
                            onClick={handleResendCode}
                            disabled={isResending}
                        >
                            {isResending ? 'Envoi...' : 'Renvoyer'}
                        </button>
                    )}
                </div> */}
                 {/* Timer + Resend */}
                            <div className="otp_footer">
                                <span
                                    className="resend"
                                    style={{
                                        color: canResend ? "orange" : "black",
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
                <button className="btn-back" onClick={onPrev}>
                    Retour
                </button>
                <button
                    className="btn-continue"
                    onClick={handleValidate}
                    disabled={data.verificationCode.length !== 4}
                >
                    Continuer
                </button>
            </div>
        </div>
    );
};

export default Step3Validation;