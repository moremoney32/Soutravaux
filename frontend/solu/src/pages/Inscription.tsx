import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import "./Inscription.css"
import logo from "../assets/images/logo.png"
import { fetchData } from "../helpers/fetchData"

interface Step1Form {
  email: string
  passe: string
}

interface Step2Form {
  nom: string
  prenom: string
  nomEntreprise: string
  tailleEntreprise: string
  telephone: string
}

const TAILLES = [
  "Je suis seul",
  "2 à 5 personnes",
  "6 à 10 personnes",
  "Plus de 10 personnes",
]

const PHONE_REGEX = /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/

export default function Inscription() {
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPasse, setShowPasse] = useState(false)

  const form1 = useForm<Step1Form>()
  const form2 = useForm<Step2Form>()

  const onStep1Submit = (data: Step1Form) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2Submit = async (data: Step2Form) => {
    if (!step1Data) return
    setLoading(true)
    setApiError(null)
    try {
      const phone = data.telephone.replace(/[\s\-\(\)\.]/g, "")
      await fetchData("auth/inscription", "POST", {
        nom: data.nom,
        prenom: data.prenom,
        name: data.nomEntreprise,
        size: data.tailleEntreprise,
        phonenumber: phone,
        email: step1Data.email,
        passe: step1Data.passe,
      })
      setSubmittedEmail(step1Data.email)
      setShowSuccess(true)
    } catch (err: any) {
      setApiError(err.message || "Une erreur est survenue, veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="insc-page"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="insc-overlay" />

      <div className="insc-modal">
        <div className="insc-header">
          <img src={logo} alt="Solutravo" className="insc-logo" />
          <div>
            <h2 className="insc-title">Créez votre compte</h2>
            <p className="insc-subtitle">
              La plateforme BTP qui simplifie votre gestion au quotidien
            </p>
          </div>
        </div>

        <div className="insc-divider" />

        {/* Indicateur d'étapes */}
        <div className="insc-steps">
          <div className={`insc-step ${step >= 1 ? "insc-step--active" : ""} ${step > 1 ? "insc-step--done" : ""}`}>
            <span className="insc-step-num">{step > 1 ? "✓" : "1"}</span>
            <span className="insc-step-label">Connexion</span>
          </div>
          <div className="insc-step-line" />
          <div className={`insc-step ${step >= 2 ? "insc-step--active" : ""}`}>
            <span className="insc-step-num">2</span>
            <span className="insc-step-label">Société</span>
          </div>
        </div>

        <div className="insc-divider" />

        {/* ÉTAPE 1 */}
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onStep1Submit)} noValidate>
            <div className="insc-grid insc-grid--single">

              <div className="insc-field">
                <label>Email <span className="insc-required">*</span></label>
                <input
                  type="email"
                  {...form1.register("email", {
                    required: "L'email est obligatoire",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Adresse email invalide",
                    },
                  })}
                  placeholder="jean@dupont-btp.fr"
                />
                {form1.formState.errors.email && (
                  <span className="insc-err">{form1.formState.errors.email.message}</span>
                )}
              </div>

              <div className="insc-field">
                <label>Mot de passe <span className="insc-required">*</span></label>
                <div className="insc-password-wrapper">
                  <input
                    type={showPasse ? "text" : "password"}
                    {...form1.register("passe", {
                      required: "Le mot de passe est obligatoire",
                      minLength: { value: 8, message: "Minimum 8 caractères" },
                      validate: (v) =>
                        /[A-Z]/.test(v) || "Au moins une majuscule requise",
                    })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="insc-eye"
                    onClick={() => setShowPasse((p) => !p)}
                    tabIndex={-1}
                    aria-label={showPasse ? "Masquer" : "Afficher"}
                  >
                    {showPasse ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form1.formState.errors.passe && (
                  <span className="insc-err">{form1.formState.errors.passe.message}</span>
                )}
              </div>
            </div>

            <button type="submit" className="insc-submit">
              Continuer →
            </button>
          </form>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onStep2Submit)} noValidate>
            <div className="insc-grid">

              <div className="insc-field">
                <label>Nom <span className="insc-required">*</span></label>
                <input
                  {...form2.register("nom", { required: "Le nom est obligatoire" })}
                  placeholder="Dupont"
                />
                {form2.formState.errors.nom && (
                  <span className="insc-err">{form2.formState.errors.nom.message}</span>
                )}
              </div>

              <div className="insc-field">
                <label>Prénom <span className="insc-required">*</span></label>
                <input
                  {...form2.register("prenom", { required: "Le prénom est obligatoire" })}
                  placeholder="Jean"
                />
                {form2.formState.errors.prenom && (
                  <span className="insc-err">{form2.formState.errors.prenom.message}</span>
                )}
              </div>

              <div className="insc-field">
                <label>Nom de l'entreprise <span className="insc-required">*</span></label>
                <input
                  {...form2.register("nomEntreprise", {
                    required: "Le nom de l'entreprise est obligatoire",
                  })}
                  placeholder="Dupont BTP"
                />
                {form2.formState.errors.nomEntreprise && (
                  <span className="insc-err">{form2.formState.errors.nomEntreprise.message}</span>
                )}
              </div>

              <div className="insc-field">
                <label>Taille de l'entreprise <span className="insc-required">*</span></label>
                <select
                  {...form2.register("tailleEntreprise", {
                    required: "Sélectionnez la taille de votre entreprise",
                  })}
                >
                  <option value="">-- Sélectionner --</option>
                  {TAILLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {form2.formState.errors.tailleEntreprise && (
                  <span className="insc-err">{form2.formState.errors.tailleEntreprise.message}</span>
                )}
              </div>

              <div className="insc-field">
                <label>Téléphone <span className="insc-required">*</span></label>
                <input
                  {...form2.register("telephone", {
                    required: "Le numéro de téléphone est obligatoire",
                    validate: (v) => {
                      const clean = v.replace(/[\s\-\(\)\.]/g, "")
                      return PHONE_REGEX.test(clean) || "Format invalide (ex : 06 12 34 56 78)"
                    },
                  })}
                  placeholder="06 12 34 56 78"
                />
                {form2.formState.errors.telephone && (
                  <span className="insc-err">{form2.formState.errors.telephone.message}</span>
                )}
              </div>

            </div>

            {apiError && <p className="insc-api-error">{apiError}</p>}

            <div className="insc-step2-actions">
              <button
                type="button"
                className="insc-back"
                onClick={() => setStep(1)}
              >
                ← Retour
              </button>
              <button type="submit" className="insc-submit insc-submit--flex" disabled={loading}>
                {loading ? "Inscription en cours…" : "S'inscrire"}
              </button>
            </div>
          </form>
        )}
      </div>

      {showSuccess && (
        <div className="insc-success-overlay">
          <div className="insc-success-modal">
            <div className="insc-success-icon">✓</div>
            <h3>Félicitations !</h3>
            <p>Votre inscription a bien été enregistrée.</p>
            <p className="insc-success-cta">
              Pour finaliser, allez confirmer dans votre boîte mail :
            </p>
            <strong className="insc-success-email">{submittedEmail}</strong>
            <button
              className="insc-success-close"
              onClick={() => {
                setShowSuccess(false)
                setSubmittedEmail("")
                setStep(1)
                form1.reset()
                form2.reset()
              }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
