import React, { useState, useEffect } from 'react';
import Header from './Header';
import PricingCard from './PricingCard';
import AdminPanel from './AdminPanel';
// import Footer from './Footer';
import type { Plan, Subscription } from '../types/subscription';
import '../styles/SubscriptionPage.css';
import { useSearchParams } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import nike from "../assets/icons/nike.png";
import close from "../assets/icons/close.png";
import { ArrowLeft, Building2, Users, Briefcase, Globe } from "lucide-react";
import PricingFooter from './PricingFooter';
const baseUrlTest =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"       // → version locale
    : "https://solutravo.zeta-app.fr/api"; // → version production

    //  FONCTIONS HELPERS - AJOUTEZ CES FONCTIONS
const getIconComponent = (iconName?: string) => {
  const iconMap = {
    'building': <Building2 className="plan-icon" />,
    'users': <Users className="plan-icon" />,
    'briefcase': <Briefcase className="plan-icon" />,
    'globe': <Globe className="plan-icon" />,
  };
  return iconMap[iconName as keyof typeof iconMap] || <Building2 className="plan-icon" />;
};

const getDefaultGradient = (price: string | number) => {
   const priceNum = Number(price);
  if (priceNum === 0) return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
  if (priceNum < 50) return 'linear-gradient(135deg, #E77131 0%, #ff8a50 100%)';
  return 'linear-gradient(135deg, #505050 0%, #737373 100%)';
};

//  FONCTION DE TRANSFORMATION DES PLANS


const transformPlansForFooter = (plans: Plan[]): any[] => {
  if (!plans || !Array.isArray(plans)) return [];
  
  return plans.map(plan => {
    // Gestion robuste des sous-titres
    const getSubtitle = () => {
      if (plan.subtitle && plan.subtitle !== 'null') return plan.subtitle;
      
      // Fallback basé sur le nom du plan
      const subtitleMap: Record<string, string> = {
        'Gratuit': 'Découverte',
        'TPE': 'Artisans', 
        'PME': 'Croissance',
        'Entreprise': 'Solutions sur mesure'
      };
      return subtitleMap[plan.name] || 'Solution';
    };

    return {
      id: plan.id,
      title: plan.name,
      subtitle: getSubtitle(),
      price: plan.price.toString(),
      period: plan.period || '/mois',
      description: plan.description,
      targetAudience: plan.target_audience || 'Professionnels du secteur',
      keyBenefits: Array.isArray(plan.key_benefits) && plan.key_benefits.length > 0
        ? plan.key_benefits 
        : ['Solution complète', 'Support professionnel'],
      detailedFeatures: Array.isArray(plan.detailed_features) && plan.detailed_features.length > 0
        ? plan.detailed_features
        : [{
            category: 'Fonctionnalités principales',
            features: Array.isArray(plan.features) ? plan.features : []
          }],
      whyChoose: plan.why_choose || `La solution ${plan.name} adaptée à vos besoins.`,
      icon: getIconComponent(plan.icon_name),
      gradient: plan.gradient || getDefaultGradient(plan.price)
    };
  });
};
const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const token = localStorage.getItem("jwtToken");
  const [searchParams] = useSearchParams();
  const membre_id = searchParams.get("membre_id");
  const societe_id = searchParams.get("societe_id");
  const paymentStatus = searchParams.get("from_stripe");
    const [footerPlans, setFooterPlans] = useState<any[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(paymentStatus === 'success');

  console.log("Payment Status:", paymentStatus);
  console.log("Show Popup:", showSuccessPopup);
  console.log(paymentStatus);
  console.log(transformPlansForFooter)
  //  TRANSFORMER LES PLANS POUR LE FOOTER
  

  useEffect(() => {
    if (plans && plans.length > 0) {
      const transformed = transformPlansForFooter(plans);
      setFooterPlans(transformed);
      console.log("Plans transformés pour footer:", transformed);
    }
  }, [plans]);


  // DÉTECTER si l'utilisateur a un abonnement payant
  const hasPaidSubscription = currentSubscription && 
    currentSubscription.planId !== 'gratuit' && 
    currentSubscription.planId !== "1"; 
  useEffect(() => {
    if (paymentStatus === 'success') {
      setShowSuccessPopup(true);
      getSettings();
      fetchData();
    } else {
      return;
    }

    // //  NETTOYER l'URL IMMÉDIATEMENT
    const cleanUrl = `${window.location.pathname}?membre_id=${membre_id}&societe_id=${societe_id}`;
    window.history.replaceState({}, '', cleanUrl);

  }, [paymentStatus, membre_id, societe_id]);

  function getSettings() {
     fetch(`${baseUrlTest}/subscription-settings`)
      .then(res => res.json())
      .then(data => {
        setPageTitle(data.hero_title);
        setPageSubtitle(data.hero_subtitle);
      })
      .catch(err => console.error("Erreur chargement settings:", err));

  }
  const fetchData = async () => {
    try {
       const res = await fetch(`${baseUrlTest}/check_subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: membre_id,
          societe_id: societe_id
        })
      });

      const data = await res.json();
       console.log("Données API:", data);
      setUserType(data.type);
      setCurrentSubscription(data.subscription);
      setPlans(data.plans);
    } catch (err) {
      console.error("Erreur API:", err);
    }
  };

  useEffect(() => {
    getSettings();

  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleClosePopup = () => {
    setShowSuccessPopup(false);

  };



  useEffect(() => {
    // Animation d'entrée progressive pour les cards
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, index * 200);
    });
  }, [plans]);

  const handleSubscribe = async (planId: string, stripeLink: string) => {
    setLoading(true);
    try {
      if (planId === 'gratuit') {
        // Plan gratuit - pas de redirection Stripe
        const selectedPlan = plans.find(p => p.id === planId);
        if (selectedPlan) {
          setCurrentSubscription({
            id: Date.now().toString(),
            planId,
            status: 'active',
            startDate: new Date(),
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
        }
      } else {
        // Plans payants - redirection vers Stripe
        if (stripeLink) {
          const payload = {
            price_id: stripeLink,
            societe_id: Number(societe_id),
            plan_id: planId
          }
          console.log(payload)
          try {
            const res = await fetch("https://integrations-api.solutravo-compta.fr/api/stripe/customer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.url) {
              return window.location.href = data.url;
            }
          } catch (err) {
            console.error("Erreur API:", err);
          }
        } else {
          console.error('Lien Stripe manquant pour le plan:', planId);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = (updatedPlan: Plan) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    );
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };
  const handleNext = () => {

    const redirectUrl = "https://staging.solutravo-compta.fr/dashboard"
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 300);
  };

  return (
    <div className="subscription-page">
      <Header
        isAdminMode={isAdminMode}
        onToggleAdmin={toggleAdminMode}
        currentSubscription={currentSubscription}
        userType={userType}
      />
      <main className="main-content">
        <div className="hero-section">
          <div className="container">
            <h1 className="hero-title fade-in-up">{pageTitle}</h1>
            <p className="hero-subtitle fade-in-up">{pageSubtitle}</p>
            <button
              onClick={handleNext}
              className="back-button"
            >
              <ArrowLeft size={25} />
              {/* <span className="text-sm font-medium">Retour</span> */}
            </button>
          </div>
        </div>

        <div className="pricing-section">
          <div className="container">
            <div className="pricing-grid">
              {plans.map((plan, index) => {

                return (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    onSubscribe={handleSubscribe}
                    isCurrentPlan={currentSubscription?.id === plan.id}
                    loading={loading}
                    animationDelay={index * 100}
                      hasPaidSubscription={!!hasPaidSubscription}
                  />
                );
              })}
            </div>
          </div>
        </div>


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
                className="popup1"
                initial={{ scale: 0.7, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: -50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <img src={nike} alt="" />
                <div className="popup_text">
                  <span className="popup_title">Félicitations !</span>
                  <span className="popup_title_span">
                    Votre abonnement est maintenant actif. 🎉                               Toute l'équipe <strong style={{ color: '#E77131' }}>Solutravo</strong> vous remercie pour votre confiance.
                    Vous avez désormais accès à toutes les fonctionnalités de ce plan.
                  </span>
                </div>

                <div className="popup_buttons">
                  <div className="popup_buttons1" onClick={handleClosePopup}>
                    FERMER
                  </div>
                </div>

                <img
                  src={close}
                  alt="Fermer"
                  className="close_icon"
                  onClick={handleClosePopup}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </main>

         {/* {!isAdminMode &&(<PricingFooter/>)}   */}

           {/* {!isAdminMode && footerPlans.length > 0 && ( */}
        <PricingFooter plans={footerPlans} />


         {isAdminMode && (
          <AdminPanel
            plans={plans}
            onUpdatePlan={handleUpdatePlan}
            onAddPlan={(newPlan) => setPlans([...plans, newPlan])}
            onDeletePlan={(planId) => setPlans(plans.filter(p => p.id !== planId))}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            setPageTitle={setPageTitle}
            setPageSubtitle={setPageSubtitle}
          />
        )}
      {/* )}  */}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">⚡</div>
            <p>Traitement de votre abonnement...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;