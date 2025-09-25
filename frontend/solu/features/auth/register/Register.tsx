

import { useEffect, useState } from "react";
import "./register.css";
import { motion, AnimatePresence } from "framer-motion";

// Import des images
import step1 from "../../../src/assets/images/step1.png";
import step2 from "../../../src/assets/images/step2.png";
import step3 from "../../../src/assets/images/step3.png";
import logo from "../../../src/assets/images/logo.png";
import eyesOpen from "../../../src/assets/icons/eyesOpen.png";
import eyesLock from "../../../src/assets/icons/eyesLock.png";
import nike from "../../../src/assets/icons/nike.png";
import next from "../../../src/assets/icons/next.png";
import close from "../../../src/assets/icons/close.png";
import { div } from "framer-motion/client";
import artisan from "../../../src/assets/icons/artisan.svg";
import fournisseur from "../../../src/assets/icons/fournisseur.svg";
import annonceur from "../../../src/assets/icons/annonceur.svg";
import solutravo from "../../../src/assets/images/solutravo.png";
import { useForm } from "react-hook-form";
import { useInputState } from "../../../src/customHooks/useInputState";
import { fetchData } from "../../../src/helpers/fetchData";
import { Variants } from "framer-motion";

function Register() {
    const roles = ["Artisan", "Annonceur", "Fournisseur"];
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorPopup3, setErrorPopup3] = useState<string | null>(null);
    const [loading3, setLoading3] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [companyStatus, setCompanyStatus] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [direction, setDirection] = useState("next");
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [fade, setFade] = useState(true);
    const [showRoleError, setShowRoleError] = useState(false);
    const [subStep, setSubStep] = useState(1);
    const [checkSiret, setCheckSiret] = useState("");
    const [isValidStep2, setIsValidStep2] = useState(false);
    const [errorPopup, setErrorPopup] = useState<string | null>(null);
    const [errorPopup1, setErrorPopup1] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180); // 3 min = 180 sec
    const [resetKey, setResetKey] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);

    // fonction pour formater mm:ss

    // Form react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger
    } = useForm({ mode: "onSubmit" });


    const {
        iconColor: iconColorCompany,
        inputBorderColor: inputBorderColorCompany,
        handleFocus: handleFocusCompany,
        handleBlur: handleBlurCompany,
    } = useInputState(false, errors.companyName);
    const {
        iconColor: iconColorFirstName,
        inputBorderColor: inputBorderColorFirstName,
        handleFocus: handleFocusFirstName,
        handleBlur: handleBlurFirstName,
    } = useInputState(false, errors.firstName);
    const {
        iconColor: iconColorAdresseSocial,
        inputBorderColor: inputBorderColorAdresseSocial,
        handleFocus: handleFocusAdresseSocial,
        handleBlur: handleBlurAdresseSocial,
    } = useInputState(false, errors.AdresseSocial);
    const {
        iconColor: iconColorEmailName,
        inputBorderColor: inputBorderColorEmail,
        handleFocus: handleFocusEmail,
        handleBlur: handleBlurEmail,
    } = useInputState(false, errors.email);
    const {
        iconColor: iconColorPhone,
        inputBorderColor: inputBorderColorPhone,
        handleFocus: handleFocusPhone,
        handleBlur: handleBlurPhone,
    } = useInputState(false, errors.Phone);
    const {
        iconColor: iconColorPassword,
        inputBorderColor: inputBorderColorPassword,
        handleFocus: handleFocusPassword,
        handleBlur: handleBlurPassword,
    } = useInputState(false, errors.password);
    const {
        iconColor: iconColorConfirm,
        inputBorderColor: inputBorderColorConfirm,
        handleFocus: handleFocusConfirm,
        handleBlur: handleBlurConfirm,
    } = useInputState(false, errors.confirm);

    const onSubmitRegister = async (data: any) => {
        console.log(data)
        setLoading(true);
        try {
            const payload = {
                role: data.role,
                email: data.email,
                prenom: data.firstName,
                companyName: data.companyName,
                lieu: data.address,
                numero: data.phone,
                companySize: selectedSize,
                legalForm: data.legalForm || "Inconnu",
                siret: data.siret || "",
            };

            const result = await fetchData('register', 'POST', payload);
            console.log(result)
            if (result.status === 201) {
                setDirection("next");
                setCurrentStep(3);
                setSubStep(1);
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorPopup1(err.message); // ✅
            } else {
                setErrorPopup1("Erreur inconnue");
            }

            setTimeout(() => setErrorPopup1(null), 3000);
        } finally {
            setLoading(false); // remet le bouton normal
        }
    };



    // Variants pour les deux côtés
    const sideVariants: Variants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    // Variants pour les éléments en cascade
    const containerVariants: Variants = {
        visible: {
            transition: { staggerChildren: 0.4 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };
    const slides = [
        {
            image: step1,
            title: "Gérez en toute simplicité",
            subtitle: [
                "Clients, projets, documents, tâches...",
                "Retrouvez tout ce dont vous avez besoin sur une seule plateforme intuitive.",
            ],
        },
        {
            image: step2,
            title: "Votre bureau dans la poche",
            subtitle: [
                "Une application web conçue pour vous suivre sur vos chantiers",
                "et dans tous vos déplacements.",
            ],
        },
        {
            image: step3,
            title: "Collaborez avec votre réseau",
            subtitle: [
                "Professionnels, partenaires, fournisseurs...",
                "Solutravo facilite la communication et la coordination de vos projets.",
            ],
        },
    ];
    const sizes = [
        "Je suis seul",
        "2 à 5 Personnes",
        "6 à 10 Personnes",
        "Plus de 10 personnes",
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setFade(false);

            // Après 500ms (temps du fade-out), on change le slide
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % slides.length);
                setFade(true); // Fade in
            }, 500);
        }, 4000);

        return () => clearInterval(interval);
    }, [slides.length]);
    useEffect(() => {
        if (companyName.length >= 3 && companyStatus === "existante") {
            const timer = setTimeout(async () => {
                try {
                    const { result } = await fetchData(`entreprises?nom=${companyName}`, "GET", null, "");
                    console.log(result)
                    setSuggestions(result || []);
                } catch (err) {
                    console.error("Erreur API entreprises:", err);
                    setSuggestions([]);
                }
            }, 400); // debounce 400ms

            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [companyName]);

    // quand on choisit une suggestion
    const handleSelectCompany = (company: any) => {
        console.log(company)
        setCompanyName(company.nom);
        setCheckSiret(company.siret); // stockage du siret/siren
        setValue("siret", company.siret, { shouldValidate: true });
        setSuggestions([]); // on cache la liste
    };
    const handleNextStep1 = () => {
        if (!companyStatus || !selectedSize) {
            setErrorPopup("Veuillez cocher toutes les cases.");
            setIsValidStep2(false);
            return;
        }

        if (!watch("companyName")) {
            setErrorPopup("Veuillez mettre le nom de l'entreprise.");
            setIsValidStep2(false);
            return;
        }

        // ✅ tout est bon
        setIsValidStep2(true);
        setErrorPopup(null);
        setSubStep(2);
    };
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // décrémentation du timer
    useEffect(() => {
        if (currentStep !== 3) return; // ⛔ n'active le timer qu'en step3

        setTimeLeft(180);   // 🔄 reset à 3 minutes
        setCanResend(false);

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentStep, resetKey]);



    // Vérifier le code
    const handleVerify = async () => {
        const code = otp.join(""); // concatène les 4 chiffres

        // 👉 Vérif côté frontend
        if (otp.some((digit) => digit === "")) {
            setErrorPopup("Veuillez remplir toutes les cases du code.");
            setTimeout(() => setErrorPopup(null), 3000);
            return;
        }
        setLoading1(true)

        try {
            const result = await fetchData("verifyCode", "POST", {
                email: watch("email"), // récupère l’email
                code,
            });

            if (result.status === 200) {
                console.log("Code vérifié");
                setDirection("next");
                setCurrentStep(4);
            }
        } catch (err: any) {
            console.error("Erreur vérification:", err.message);
            setErrorPopup(err.message);
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoading1(false)
        }
    };


    // Renvoyer un nouveau code
    const handleResend = async () => {
        if (!canResend) return;
        try {
            await fetchData("users/resend-code", "POST", {
                email: watch("email"),
            });
            console.log("📨 Nouveau code envoyé !");
            setTimeLeft(180); // reset timer
            setResetKey((k) => k + 1);
            setCanResend(false);
        } catch (err: any) {
            console.error("Erreur resend:", err.message);
            setErrorPopup(err.message);
            setTimeout(() => setErrorPopup(null), 3000);
        }
    };

    const handleCompleteRegistration = async () => {
        const valid = await trigger(["password", "confirmPassword"]);
        if (!valid) return; // erreurs gérées par RHF + affichées sous inputs

        try {
            setLoading3(true);
            const result = await fetchData("register/complete", "POST", {
                email: watch("email"),
                passe: watch("password"),
            });

            console.log("Inscription finalisée :", result);
            setShowPopup(true); // affiche ton interface finale
        } catch (err: any) {
            console.error("Erreur registration:", err.message);
            setErrorPopup(err.message || "Erreur serveur");
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoading3(false);
        }
    };


    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h3 className="register_question">Vous êtes ?</h3>
                        <div className="roles_container">
                            {roles.map((role) => (
                                <div
                                    key={role}
                                    className={`role_card ${selectedRole === role ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedRole(role);
                                        setValue("role", role.toLowerCase(), { shouldValidate: true });
                                    }}
                                >
                                    {role}
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 2:
                return (
                    <form onSubmit={handleSubmit(onSubmitRegister)} className="step2_container">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={subStep}
                                className="step2_container"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {subStep === 1 && (
                                    <>
                                        <h3 className="register_question1">Où en est votre entreprise ?</h3>
                                        <div className="choice_container">
                                            <button
                                                type="button"
                                                className={`choice_btn ${companyStatus === "existante" ? "active" : ""}`}
                                                onClick={() => setCompanyStatus("existante")}
                                            >
                                                Elle est existante
                                            </button>
                                            <button
                                                type="button"
                                                className={`choice_btn ${companyStatus === "nouvelle" ? "active" : ""}`}
                                                onClick={() => setCompanyStatus("nouvelle")}
                                            >
                                                Je crée mon entreprise
                                            </button>
                                        </div>

                                        <h3 className="register_question1">Quelle taille fait votre entreprise ?</h3>
                                        <div className="size_container">
                                            {sizes.map((size) => (
                                                <button
                                                    type="button"
                                                    key={size}
                                                    className={`size_btn ${selectedSize === size ? "active" : ""}`}
                                                    onClick={() => {
                                                        setSelectedSize(size);
                                                        setValue("companySize", size, { shouldValidate: true }); // update react-hook-form
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="form_group_column">
                                            <div className="sous_form_group">
                                                <label htmlFor="nom_entreprise">Nom de l'entreprise</label>
                                                <input type="text" placeholder="Exp:Solutravo" value={companyName} className="suggestion_item_input"
                                                    onChange={(e) => {
                                                        setCompanyName(e.target.value);
                                                        setValue("companyName", e.target.value, { shouldValidate: true });
                                                    }}
                                                    onFocus={handleFocusCompany}
                                                    onBlur={handleBlurCompany}
                                                    style={{ borderColor: inputBorderColorCompany }} />
                                                {suggestions.length > 0 && companyStatus === "existante" && (
                                                    <div className="suggestions_list">
                                                        {suggestions.map((company, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="suggestion_item"
                                                                onClick={() => handleSelectCompany(company)}
                                                            >
                                                                <strong>{company.nom}</strong> &nbsp;
                                                                <span>({company.siren})</span>
                                                                <br />
                                                                <small>
                                                                    {company.activite} • {company.cp} {company.ville}
                                                                </small>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* {errors.companyName && <span className="error">Nom requis</span>} */}
                                            {companyStatus === "existante" && (
                                                <div className="sous_form_group">
                                                    <label htmlFor="siren">Numéro de SIRET</label>
                                                    <input type="text" placeholder="123456789" value={checkSiret} {...register("siret")} className="siret_number" readOnly />
                                                </div>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {errorPopup && (
                                                <motion.div
                                                    className="role_error_sidebar top_right"
                                                    role="alert"
                                                    initial={{ x: "100%", opacity: 0 }}
                                                    animate={{
                                                        x: [0, -120, 0],
                                                        opacity: [0, 1, 1]
                                                    }}
                                                    exit={{ x: "100%", opacity: 0 }}
                                                    transition={{
                                                        duration: 2,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    {errorPopup}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </>
                                )}

                                {subStep === 2 && (
                                    <>
                                        <span className="register_question1">Forme juridique</span>
                                        <div className="radio_group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="SASU"
                                                    {...register("legalForm", { required: "Veuillez choisir une forme juridique" })}
                                                /> SASU
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="EIRL"
                                                    {...register("legalForm", { required: "Veuillez choisir une forme juridique" })}
                                                /> EIRL
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="EURL"
                                                    {...register("legalForm", { required: "Veuillez choisir une forme juridique" })}
                                                /> EURL
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="Inconnu"
                                                    {...register("legalForm", { required: "Veuillez choisir une forme juridique" })}
                                                /> Je ne sais pas
                                            </label>
                                        </div>
                                        {errors.legalForm && (
                                            <span className="error">{errors.legalForm.message as string}</span>
                                        )}

                                        <div className="form_group">
                                            <div className="sous_form_group">
                                                <input
                                                    type="text"
                                                    placeholder="Nom et prénom"
                                                    {...register("firstName", { required: "Veuillez entrer votre nom complet" })}
                                                    onFocus={handleFocusFirstName}
                                                    onBlur={handleBlurFirstName}
                                                    style={{ borderColor: inputBorderColorFirstName }} />
                                                {errors.firstName && (
                                                    <span className="error">{errors.firstName.message as string}</span>
                                                )}
                                            </div>
                                            <div className="sous_form_group">
                                                <input
                                                    type="text"
                                                    placeholder="Adresse du siège social"
                                                    {...register("address", { required: "Veuillez entrer l'adresse du siège social" })}
                                                    onFocus={handleFocusAdresseSocial}
                                                    onBlur={handleBlurAdresseSocial}
                                                    style={{ borderColor: inputBorderColorAdresseSocial }}
                                                />
                                                {errors.address && (
                                                    <span className="error">{errors.address.message as string}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form_group">
                                            <div className="sous_form_group">
                                                <input
                                                    type="text"
                                                    placeholder="Numéro de téléphone"
                                                    {...register("phone", {
                                                        required: "Veuillez entrer un numéro de téléphone",
                                                        pattern: {
                                                            value: /^(?:\+33|0)[1-9]\d{8}$/,
                                                            message: "Numéro de téléphone français invalide",
                                                        },
                                                    })}
                                                    onFocus={handleFocusPhone}
                                                    onBlur={handleBlurPhone}
                                                    style={{ borderColor: inputBorderColorPhone }}
                                                />
                                                {errors.phone && (
                                                    <span className="error">{errors.phone.message as string}</span>
                                                )}
                                            </div>
                                            <div className="sous_form_group">
                                                <input
                                                    type="email"
                                                    placeholder="Adresse Email"
                                                    {...register("email", {
                                                        required: "Veuillez entrer une adresse email",
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "Adresse email invalide",
                                                        },
                                                    })}
                                                    onFocus={handleFocusEmail}
                                                    onBlur={handleBlurEmail}
                                                    style={{ borderColor: inputBorderColorEmail }}
                                                />
                                                {errors.email && (
                                                    <span className="error">{errors.email.message as string}</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                            </motion.div>
                        </AnimatePresence>


                        <div id="sous_buttons_container">
                            {subStep === 1 ? (
                                <>
                                    <button
                                        type="button"
                                        className="register_btn1"
                                        onClick={() => {
                                            setDirection("prev");
                                            setCurrentStep((s) => s - 1);
                                        }}
                                    >
                                        Retour
                                    </button>
                                    <span

                                        className="register_btn"
                                        onClick={handleNextStep1}
                                    >
                                        Suivant
                                    </span>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="register_btn1"
                                        onClick={() => setSubStep(1)}
                                    >
                                        Revenir
                                    </button>

                                    <button className="register_btn" type="submit" disabled={loading}>
                                        {loading ? (
                                            <span className="dots">
                                                En cours<span className="dot1">.</span>
                                                <span className="dot2">.</span>
                                                <span className="dot3">.</span>
                                            </span>
                                        ) : (
                                            "Continuer"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                        <AnimatePresence>
                            {errorPopup1 && (
                                <motion.div
                                    className="role_error_sidebar top_right"
                                    role="alert"
                                    initial={{ x: "100%", opacity: 0 }}
                                    animate={{ x: [0, -120, 0], opacity: [0, 1, 1] }}
                                    exit={{ x: "100%", opacity: 0 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                >
                                    {errorPopup1}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                );

            case 3:
                return (
                    <>
                        <div className="step3_container">
                            <h3 className="register_question">
                                Vérifiez votre boite mail et entrez le code.
                            </h3>

                            {/* Inputs OTP */}
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

                            {/* Boutons navigation */}
                            <div className="buttons_container finish">
                                <button
                                    className="register_btn1"
                                    onClick={() => setCurrentStep((s) => s - 1)}
                                >
                                    Retour
                                </button>
                                {/* <button className="register_btn" onClick={handleVerify}>
                                    Continuer
                                </button> */}
                                <button className="register_btn" onClick={handleVerify} disabled={loading1}>
                                    {loading1 ? (
                                        <span className="dots">
                                            En cours<span className="dot1">.</span>
                                            <span className="dot2">.</span>
                                            <span className="dot3">.</span>
                                        </span>
                                    ) : (
                                        "Continuer"
                                    )}
                                </button>
                            </div>
                        </div>
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
                    </>
                );
            case 4:
                return (
                    <>
                        <h3 className="register_question">Définissez maintenant votre mot de passe</h3>
                        <div className="form_group_password">
                            {/* Password */}
                            <div className="sous_form_group_password">
                                <label htmlFor="password">Mot de passe</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="********"
                                    {...register("password", {
                                        required: "Veuillez entrer un mot de passe",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                            message:
                                                "Le mot de passe doit contenir 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
                                        },
                                    })}
                                    onFocus={handleFocusPassword}
                                    onBlur={handleBlurPassword}
                                    style={{ borderColor: inputBorderColorPassword }} />
                                <img
                                    src={showPassword ? eyesOpen : eyesLock}
                                    alt="toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="eye_icon"
                                />
                                {errors.password && (
                                    <span className="error">{errors.password.message as string}</span>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="sous_form_group_password">
                                <label htmlFor="confirm_password">Confirmer le mot de passe</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm_password"
                                    placeholder="********"
                                    {...register("confirmPassword", {
                                        required: "Veuillez confirmer le mot de passe",
                                        validate: (value) =>
                                            value === watch("password") || "Les mots de passe ne correspondent pas",
                                    })}
                                    onFocus={handleFocusConfirm}
                                    onBlur={handleBlurConfirm}
                                    style={{ borderColor: inputBorderColorConfirm }} />
                                <img
                                    src={showConfirmPassword ? eyesOpen : eyesLock}
                                    alt="toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="eye_icon"
                                />
                                {errors.confirmPassword && (
                                    <span className="error">
                                        {errors.confirmPassword.message as string}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                );



            default:
                return null;
        }
    };


    return (
        <div className="register_container">

            {currentStep === 1 && (<AnimatePresence>
                <motion.div
                    className="composant_statique_left"
                    variants={sideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.div
                        className="sous_contenair_mail"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Logo + phrase */}
                        <motion.div className="info_logo" variants={itemVariants}>
                            <img src={solutravo} alt="solutravaux" className="solutravaux" />
                            <p className="info_logo_p">
                                Votre univers connecté 100% bâtiment
                            </p>
                        </motion.div>

                        {/* Liste des rôles */}
                        <motion.div className="information_solutravaux" variants={containerVariants}>
                            <motion.div className="role_user" variants={itemVariants}>
                                <div className="sous_role_user">
                                    <img src={artisan} alt="artisan" />
                                    <span className="sous_role_user_span">Artisans</span>
                                </div>
                                <span>
                                    Pilotez et développez votre activité en toute simplicité tout
                                    en profitant d’avantages toute l’année.
                                </span>
                            </motion.div>

                            <motion.div className="role_user" variants={itemVariants}>
                                <div className="sous_role_user">
                                    <img src={fournisseur} alt="fournisseur" />
                                    <span className="sous_role_user_span">Fournisseurs</span>
                                </div>
                                <span>
                                    Rejoignez l’environnement Solutravo et permettez aux artisans
                                    d’intégrer vos produits à leurs devis en un clic !
                                </span>
                            </motion.div>

                            <motion.div className="role_user" variants={itemVariants}>
                                <div className="sous_role_user">
                                    <img src={annonceur} alt="annonceur" />
                                    <span className="sous_role_user_span">Annonceurs</span>
                                </div>
                                <span>
                                    Présentez vos produits et services en avant-première aux
                                    artisans Solutravo !
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>)}
            {/* Partie gauche = Slider */}
            {currentStep > 1 && (<div className="composant_statique">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="slide_content"
                    >
                        <div className="image_section">
                            <img src={slides[currentIndex].image} alt="illustration" />
                        </div>
                        <div className="text_section">
                            <h1 className="text_section_title">
                                {slides[currentIndex].title}
                            </h1>
                            <div className="text_section_subtitle">
                                {slides[currentIndex].subtitle.map((line, idx) => (
                                    <span key={idx}>{line}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Petits points indicateurs */}
                <div className="dots_container">
                    {slides.map((_, idx) => (
                        <span
                            key={idx}
                            className={`dot ${currentIndex === idx ? "active" : ""}`}
                        ></span>
                    ))}
                </div>
            </div>)}
            <AnimatePresence>
                {showPopup && (
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
                            <img src={nike} alt="" />
                            <div className="popup_text">
                                <span className="popup_title">Félicitations !</span>
                                <span className="popup_title_span">
                                    Merci pour votre inscription. Vous avez maintenant accès au panel.
                                    N’oubliez pas de compléter votre profil dans le dashboard pour débloquer toutes vos options.
                                </span>
                            </div>

                            <div className="popup_buttons">
                                <div className="popup_buttons1">
                                    <span>Compléter mon profil</span>
                                    <img src={next} alt="" />
                                </div>
                            </div>

                            <img
                                src={close}
                                alt="Fermer"
                                className="close_icon"
                                onClick={() => setShowPopup(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <div className="composant_dynamique">
                {/* Titre /logo*/}
                <div className="register_header">
                    <img src={logo} alt="Logo" />
                    <h2 className="register_title">Inscription</h2>
                </div>
                <span className="register_subtitle">Veuillez suivre chaque étape.</span>

                {/* Étapes */}
                <div className="progress_container">
                    <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                        Vous êtes ?
                    </div>
                    <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                        Informations entreprise
                    </div>
                    <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                        Validation
                    </div>
                    <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
                        Terminé
                    </div>
                </div>

                {/* AnimatePresence pour transition douce */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        initial={{ x: direction === "next" ? 100 : -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction === "next" ? -100 : 100, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Boutons navigation globaux */}
                {currentStep !== 2 && currentStep !== 3 && (
                    <div className={`buttons_container ${currentStep === 1 ? "single" : "finish"}`}>
                        {currentStep > 1 && (
                            <button
                                onClick={() => {
                                    setDirection("prev");
                                    setCurrentStep((s) => s - 1);
                                }}
                                className="register_btn1"
                            >
                                Retour
                            </button>
                        )}

                        {currentStep < 4 ? (
                            <button
                                className="register_btn"
                                onClick={() => {
                                    if (currentStep === 1 && !selectedRole) {
                                        setShowRoleError(true);
                                        setTimeout(() => setShowRoleError(false), 4000);
                                        return;
                                    }
                                    setDirection("next");
                                    setCurrentStep((s) => s + 1);
                                }}
                            >
                                Continuer
                            </button>
                        ) : (
                            <button className="register_btn" onClick={handleCompleteRegistration} disabled={loading3}>
                                {loading3 ? (
                                    <span className="dots">
                                        En cours<span className="dot1">.</span>
                                        <span className="dot2">.</span>
                                        <span className="dot3">.</span>
                                    </span>
                                ) : (
                                    "Terminer"
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Boutons navigation */}

            </div>
            <AnimatePresence>
                {showRoleError && (
                    <motion.div
                        className="role_error_sidebar top_right"
                        role="alert"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{
                            x: [0, -120, 0],
                            opacity: [0, 1, 1]
                        }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{
                            duration: 2,
                            ease: "easeInOut"
                        }}
                    >
                        Veuillez choisir un rôle
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Register;






