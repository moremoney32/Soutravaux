import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import "./Inscription.css"
import logo from "../assets/images/logo.png"
import { fetchData } from "../helpers/fetchData"

interface InscriptionForm {
  nom: string
  prenom: string
  nomEntreprise: string
  tailleEntreprise: string
  telephone: string
  email: string
  passe: string
  confirmPasse: string
}

const TAILLES = [
  "Je suis seul",
  "2 à 5 personnes",
  "6 à 10 personnes",
  "Plus de 10 personnes",
]

const PHONE_REGEX = /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/

export default function Inscription() {
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPasse, setShowPasse] = useState(false)
  const [showConfirmPasse, setShowConfirmPasse] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InscriptionForm>()

  const onSubmit = async (data: InscriptionForm) => {
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
        email: data.email,
        passe: data.passe,
      })
      setSubmittedEmail(data.email)
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="insc-grid">

            <div className="insc-field">
              <label>Nom <span className="insc-required">*</span></label>
              <input
                {...register("nom", { required: "Le nom est obligatoire" })}
                placeholder="Dupont"
              />
              {errors.nom && <span className="insc-err">{errors.nom.message}</span>}
            </div>

            <div className="insc-field">
              <label>Prénom <span className="insc-required">*</span></label>
              <input
                {...register("prenom", { required: "Le prénom est obligatoire" })}
                placeholder="Jean"
              />
              {errors.prenom && <span className="insc-err">{errors.prenom.message}</span>}
            </div>

            <div className="insc-field">
              <label>Nom de l'entreprise <span className="insc-required">*</span></label>
              <input
                {...register("nomEntreprise", {
                  required: "Le nom de l'entreprise est obligatoire",
                })}
                placeholder="Dupont BTP"
              />
              {errors.nomEntreprise && (
                <span className="insc-err">{errors.nomEntreprise.message}</span>
              )}
            </div>

            <div className="insc-field">
              <label>Taille de l'entreprise <span className="insc-required">*</span></label>
              <select
                {...register("tailleEntreprise", {
                  required: "Sélectionnez la taille de votre entreprise",
                })}
              >
                <option value="">-- Sélectionner --</option>
                {TAILLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tailleEntreprise && (
                <span className="insc-err">{errors.tailleEntreprise.message}</span>
              )}
            </div>

            <div className="insc-field">
              <label>Téléphone <span className="insc-required">*</span></label>
              <input
                {...register("telephone", {
                  required: "Le numéro de téléphone est obligatoire",
                  validate: (v) => {
                    const clean = v.replace(/[\s\-\(\)\.]/g, "")
                    return (
                      PHONE_REGEX.test(clean) ||
                      "Format invalide (ex : 06 12 34 56 78)"
                    )
                  },
                })}
                placeholder="06 12 34 56 78"
              />
              {errors.telephone && (
                <span className="insc-err">{errors.telephone.message}</span>
              )}
            </div>

            <div className="insc-field">
              <label>Email <span className="insc-required">*</span></label>
              <input
                type="email"
                {...register("email", {
                  required: "L'email est obligatoire",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Adresse email invalide",
                  },
                })}
                placeholder="jean@dupont-btp.fr"
              />
              {errors.email && (
                <span className="insc-err">{errors.email.message}</span>
              )}
            </div>

            <div className="insc-field">
              <label>Mot de passe <span className="insc-required">*</span></label>
              <div className="insc-password-wrapper">
                <input
                  type={showPasse ? "text" : "password"}
                  {...register("passe", {
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
              {errors.passe && (
                <span className="insc-err">{errors.passe.message}</span>
              )}
            </div>

            <div className="insc-field">
              <label>Confirmer le mot de passe <span className="insc-required">*</span></label>
              <div className="insc-password-wrapper">
                <input
                  type={showConfirmPasse ? "text" : "password"}
                  {...register("confirmPasse", {
                    required: "Veuillez confirmer votre mot de passe",
                    validate: (v, formValues) =>
                      v === formValues.passe || "Les mots de passe ne correspondent pas",
                  })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="insc-eye"
                  onClick={() => setShowConfirmPasse((p) => !p)}
                  tabIndex={-1}
                  aria-label={showConfirmPasse ? "Masquer" : "Afficher"}
                >
                  {showConfirmPasse ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPasse && (
                <span className="insc-err">{errors.confirmPasse.message}</span>
              )}
            </div>
          </div>

          {apiError && <p className="insc-api-error">{apiError}</p>}

          <button type="submit" className="insc-submit" disabled={loading}>
            {loading ? "Inscription en cours…" : "S'inscrire"}
          </button>
        </form>
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
                reset()
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
