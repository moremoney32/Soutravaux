// import React, { useState, useEffect } from 'react';
// import Header from './Header';
// import PricingCard from './PricingCard';
// import AdminPanel from './AdminPanel';
// // import Footer from './Footer';
// import type { Plan, Subscription } from '../types/subscription';
// import '../styles/SubscriptionPage.css';
// import { useSearchParams } from "react-router-dom";
// // import { ArrowLeft } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import nike from "../assets/icons/nike.png";
// import close from "../assets/icons/close.png";
// import { ArrowLeft, Building2, Users, Briefcase, Globe } from "lucide-react";
// import PricingFooter from './PricingFooter';
// const baseUrlTest =
//   window.location.hostname === "localhost"
//     ? "http://localhost:3000/api"       // → version locale
//     : "https://solutravo.zeta-app.fr/api"; // → version production

//     //  FONCTIONS HELPERS - AJOUTEZ CES FONCTIONS
// const getIconComponent = (iconName?: string) => {
//   const iconMap = {
//     'building': <Building2 className="plan-icon" />,
//     'users': <Users className="plan-icon" />,
//     'briefcase': <Briefcase className="plan-icon" />,
//     'globe': <Globe className="plan-icon" />,
//   };
//   return iconMap[iconName as keyof typeof iconMap] || <Building2 className="plan-icon" />;
// };

// const getDefaultGradient = (price: string | number) => {
//    const priceNum = Number(price);
//   if (priceNum === 0) return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
//   if (priceNum < 50) return 'linear-gradient(135deg, #E77131 0%, #ff8a50 100%)';
//   return 'linear-gradient(135deg, #505050 0%, #737373 100%)';
// };

// //  FONCTION DE TRANSFORMATION DES PLANS


// const transformPlansForFooter = (plans: Plan[]): any[] => {
//   if (!plans || !Array.isArray(plans)) return [];
  
//   return plans.map(plan => {
//     // Gestion robuste des sous-titres
//     const getSubtitle = () => {
//       if (plan.subtitle && plan.subtitle !== 'null') return plan.subtitle;
      
//       // Fallback basé sur le nom du plan
//       const subtitleMap: Record<string, string> = {
//         'Gratuit': 'Découverte',
//         'TPE': 'Artisans', 
//         'PME': 'Croissance',
//         'Entreprise': 'Solutions sur mesure'
//       };
//       return subtitleMap[plan.name] || 'Solution';
//     };

//     return {
//       id: plan.id,
//       title: plan.name,
//       subtitle: getSubtitle(),
//       price: plan.price.toString(),
//       period: plan.period || '/mois',
//       description: plan.description,
//       targetAudience: plan.target_audience || 'Professionnels du secteur',
//       keyBenefits: Array.isArray(plan.key_benefits) && plan.key_benefits.length > 0
//         ? plan.key_benefits 
//         : ['Solution complète', 'Support professionnel'],
//       detailedFeatures: Array.isArray(plan.detailed_features) && plan.detailed_features.length > 0
//         ? plan.detailed_features
//         : [{
//             category: 'Fonctionnalités principales',
//             features: Array.isArray(plan.features) ? plan.features : []
//           }],
//       whyChoose: plan.why_choose || `La solution ${plan.name} adaptée à vos besoins.`,
//       icon: getIconComponent(plan.icon_name),
//       gradient: plan.gradient || getDefaultGradient(plan.price)
//     };
//   });
// };
// const SubscriptionPage: React.FC = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [userType, setUserType] = useState<string | null>(null);
//   const [isAdminMode, setIsAdminMode] = useState(false);
//   const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageSubtitle, setPageSubtitle] = useState("");
//   const token = localStorage.getItem("jwtToken");
//   const [searchParams] = useSearchParams();
//   const membre_id = searchParams.get("membre_id");
//   const societe_id = searchParams.get("societe_id");
//   const paymentStatus = searchParams.get("from_stripe");
//     const [footerPlans, setFooterPlans] = useState<any[]>([]);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(paymentStatus === 'success');

//   console.log("Payment Status:", paymentStatus);
//   console.log("Show Popup:", showSuccessPopup);
//   console.log(paymentStatus);
//   console.log(transformPlansForFooter)
//   //  TRANSFORMER LES PLANS POUR LE FOOTER
  

//   useEffect(() => {
//     if (plans && plans.length > 0) {
//       const transformed = transformPlansForFooter(plans);
//       setFooterPlans(transformed);
//       console.log("Plans transformés pour footer:", transformed);
//     }
//   }, [plans]);


//   // DÉTECTER si l'utilisateur a un abonnement payant
//   const hasPaidSubscription = currentSubscription && 
//     currentSubscription.planId !== 'gratuit' && 
//     currentSubscription.planId !== "1"; 
//   useEffect(() => {
//     if (paymentStatus === 'success') {
//       setShowSuccessPopup(true);
//       getSettings();
//       fetchData();
//     } else {
//       return;
//     }

//     // //  NETTOYER l'URL IMMÉDIATEMENT
//     const cleanUrl = `${window.location.pathname}?membre_id=${membre_id}&societe_id=${societe_id}`;
//     window.history.replaceState({}, '', cleanUrl);

//   }, [paymentStatus, membre_id, societe_id]);

//   function getSettings() {
//      fetch(`${baseUrlTest}/subscription-settings`)
//       .then(res => res.json())
//       .then(data => {
//         setPageTitle(data.hero_title);
//         setPageSubtitle(data.hero_subtitle);
//       })
//       .catch(err => console.error("Erreur chargement settings:", err));

//   }
//   const fetchData = async () => {
//     try {
//        const res = await fetch(`${baseUrlTest}/check_subscription`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           userId: membre_id,
//           societe_id: societe_id
//         })
//       });

//       const data = await res.json();
//        console.log("Données API:", data);
//       setUserType(data.type);
//       setCurrentSubscription(data.subscription);
//       setPlans(data.plans);
//     } catch (err) {
//       console.error("Erreur API:", err);
//     }
//   };

//   useEffect(() => {
//     getSettings();

//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleClosePopup = () => {
//     setShowSuccessPopup(false);

//   };



//   useEffect(() => {
//     // Animation d'entrée progressive pour les cards
//     const cards = document.querySelectorAll('.pricing-card');
//     cards.forEach((card, index) => {
//       setTimeout(() => {
//         card.classList.add('fade-in-up');
//       }, index * 200);
//     });
//   }, [plans]);

//   const handleSubscribe = async (planId: string, stripeLink: string) => {
//     setLoading(true);
//     try {
//       if (planId === 'gratuit') {
//         // Plan gratuit - pas de redirection Stripe
//         const selectedPlan = plans.find(p => p.id === planId);
//         if (selectedPlan) {
//           setCurrentSubscription({
//             id: Date.now().toString(),
//             planId,
//             status: 'active',
//             startDate: new Date(),
//             nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
//           });
//         }
//       } else {
//         // Plans payants - redirection vers Stripe
//         if (stripeLink) {
//           const payload = {
//             price_id: stripeLink,
//             societe_id: Number(societe_id),
//             plan_id: planId
//           }
//           console.log(payload)
//           try {
//             const res = await fetch("https://integrations-api.solutravo-compta.fr/api/stripe/customer", {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify(payload)
//             });

//             const data = await res.json();
//             if (data.url) {
//               return window.location.href = data.url;
//             }
//           } catch (err) {
//             console.error("Erreur API:", err);
//           }
//         } else {
//           console.error('Lien Stripe manquant pour le plan:', planId);
//         }
//       }
//     } catch (error) {
//       console.error('Erreur lors de l\'abonnement:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdatePlan = (updatedPlan: Plan) => {
//     setPlans(prevPlans =>
//       prevPlans.map(plan =>
//         plan.id === updatedPlan.id ? updatedPlan : plan
//       )
//     );
//   };

//   const toggleAdminMode = () => {
//     setIsAdminMode(!isAdminMode);
//   };
//   const handleNext = () => {

//     const redirectUrl = "https://staging.solutravo-compta.fr/dashboard"
//     setTimeout(() => {
//       window.location.href = redirectUrl;
//     }, 300);
//   };

//   return (
//     <div className="subscription-page">
//       <Header
//         isAdminMode={isAdminMode}
//         onToggleAdmin={toggleAdminMode}
//         currentSubscription={currentSubscription}
//         userType={userType}
//       />
//       <main className="main-content">
//         <div className="hero-section">
//           <div className="container">
//             <h1 className="hero-title fade-in-up">{pageTitle}</h1>
//             <p className="hero-subtitle fade-in-up">{pageSubtitle}</p>
//             <button
//               onClick={handleNext}
//               className="back-button"
//             >
//               <ArrowLeft size={25} />
//               {/* <span className="text-sm font-medium">Retour</span> */}
//             </button>
//           </div>
//         </div>

//         <div className="pricing-section">
//           <div className="container">
//             <div className="pricing-grid">
//               {plans.map((plan, index) => {

//                 return (
//                   <PricingCard
//                     key={plan.id}
//                     plan={plan}
//                     onSubscribe={handleSubscribe}
//                     isCurrentPlan={currentSubscription?.id === plan.id}
//                     loading={loading}
//                     animationDelay={index * 100}
//                   />
//                 );
//               })}
//             </div>
//           </div>
//         </div>


//         <AnimatePresence>
//           {showSuccessPopup && (
//             <>
//               {/* Masque noir semi-transparent */}
//               <motion.div
//                 className="masque"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 0.6 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//               />

//               {/* Popup */}
//               <motion.div
//                 className="popup1"
//                 initial={{ scale: 0.7, opacity: 0, y: -50 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.7, opacity: 0, y: -50 }}
//                 transition={{ duration: 0.4, ease: "easeOut" }}
//               >
//                 <img src={nike} alt="" />
//                 <div className="popup_text">
//                   <span className="popup_title">Félicitations !</span>
//                   <span className="popup_title_span">
//                     Votre abonnement est maintenant actif. 🎉 Toute l'équipe <strong style={{ color: '#E77131' }}>Solutravo</strong> vous remercie pour votre confiance.
//                     Vous avez désormais accès à toutes les fonctionnalités de ce plan.
//                   </span>
//                 </div>

//                 <div className="popup_buttons">
//                   <div className="popup_buttons1" onClick={handleClosePopup}>
//                     FERMER
//                   </div>
//                 </div>

//                 <img
//                   src={close}
//                   alt="Fermer"
//                   className="close_icon"
//                   onClick={handleClosePopup}
//                 />
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>

//       </main>

//          {/* {!isAdminMode &&(<PricingFooter/>)}   */}

//            {/* {!isAdminMode && footerPlans.length > 0 && ( */}
//         <PricingFooter plans={footerPlans} />


//          {isAdminMode && (
//           <AdminPanel
//             plans={plans}
//             onUpdatePlan={handleUpdatePlan}
//             onAddPlan={(newPlan) => setPlans([...plans, newPlan])}
//             onDeletePlan={(planId) => setPlans(plans.filter(p => p.id !== planId))}
//             pageTitle={pageTitle}
//             pageSubtitle={pageSubtitle}
//             setPageTitle={setPageTitle}
//             setPageSubtitle={setPageSubtitle}
//           />
//         )}
//       {/* )}  */}

//       {loading && (
//         <div className="loading-overlay">
//           <div className="loading-content">
//             <div className="loading-spinner">⚡</div>
//             <p>Traitement de votre abonnement...</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubscriptionPage;



// import React, { useState, useEffect } from 'react';
// import Header from './Header';
// import PricingCard from './PricingCard';
// import AdminPanel from './AdminPanel';
// import type { Plan, Subscription } from '../types/subscription';
// import '../styles/SubscriptionPage.css';
// import { useSearchParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import nike from "../assets/icons/nike.png";
// import close from "../assets/icons/close.png";
// import { ArrowLeft, Building2, Users, Briefcase, Globe } from "lucide-react";
// import PricingFooter from './PricingFooter';

// const baseUrlTest =
//   window.location.hostname === "localhost"
//     ? "http://localhost:3000/api"
//     : "https://solutravo.zeta-app.fr/api";

// // FONCTIONS HELPERS
// const getIconComponent = (iconName?: string) => {
//   const iconMap = {
//     'building': <Building2 className="plan-icon" />,
//     'users': <Users className="plan-icon" />,
//     'briefcase': <Briefcase className="plan-icon" />,
//     'globe': <Globe className="plan-icon" />,
//   };
//   return iconMap[iconName as keyof typeof iconMap] || <Building2 className="plan-icon" />;
// };

// const getDefaultGradient = (price: string | number) => {
//    const priceNum = Number(price);
//   if (priceNum === 0) return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
//   if (priceNum < 50) return 'linear-gradient(135deg, #E77131 0%, #ff8a50 100%)';
//   return 'linear-gradient(135deg, #505050 0%, #737373 100%)';
// };

// const transformPlansForFooter = (plans: Plan[]): any[] => {
//   if (!plans || !Array.isArray(plans)) return [];
  
//   return plans.map(plan => {
//     const getSubtitle = () => {
//       if (plan.subtitle && plan.subtitle !== 'null') return plan.subtitle;
      
//       const subtitleMap: Record<string, string> = {
//         'Gratuit': 'Découverte',
//         'TPE': 'Artisans', 
//         'PME': 'Croissance',
//         'Entreprise': 'Solutions sur mesure'
//       };
//       return subtitleMap[plan.name] || 'Solution';
//     };

//     return {
//       id: plan.id,
//       title: plan.name,
//       subtitle: getSubtitle(),
//       price: plan.price.toString(),
//       period: plan.period || '/mois',
//       description: plan.description,
//       targetAudience: plan.target_audience || 'Professionnels du secteur',
//       keyBenefits: Array.isArray(plan.key_benefits) && plan.key_benefits.length > 0
//         ? plan.key_benefits 
//         : ['Solution complète', 'Support professionnel'],
//       detailedFeatures: Array.isArray(plan.detailed_features) && plan.detailed_features.length > 0
//         ? plan.detailed_features
//         : [{
//             category: 'Fonctionnalités principales',
//             features: Array.isArray(plan.features) ? plan.features : []
//           }],
//       whyChoose: plan.why_choose || `La solution ${plan.name} adaptée à vos besoins.`,
//       icon: getIconComponent(plan.icon_name),
//       gradient: plan.gradient || getDefaultGradient(plan.price)
//     };
//   });
// };

// const SubscriptionPage: React.FC = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [userType, setUserType] = useState<string | null>(null);
//   const [isAdminMode, setIsAdminMode] = useState(false);
//   const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageSubtitle, setPageSubtitle] = useState("");
//   const token = localStorage.getItem("jwtToken");
//   const [searchParams] = useSearchParams();
//   const membre_id = searchParams.get("membre_id");
//   const societe_id = searchParams.get("societe_id");
//   const paymentStatus = searchParams.get("from_stripe");
//   const [footerPlans, setFooterPlans] = useState<any[]>([]);
//   const [showSuccessPopup, setShowSuccessPopup] = useState(paymentStatus === 'success');

//   // NOUVEAUX ÉTATS POUR LA LOGIQUE DE CONFIRMATION
//   const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
//   const [pendingPlan, setPendingPlan] = useState<{id: string, stripeLink: string} | null>(null);
//   const [confirmationType, setConfirmationType] = useState<'downgrade' | 'downgrade-to-free' | null>(null);

//   // FONCTIONS UTILITAIRES POUR LA COMPARAISON PAR PRIX
//   const getPlanPrice = (planId: string): number => {
//     const plan = plans.find(p => p.id === planId);
//     return plan ? Number(plan.price) : 0;
//   };

//   const getCurrentPlanPrice = (): number => {
//     if (!currentSubscription) return 0;
//     return getPlanPrice(currentSubscription.planId);
//   };

//   const determineChangeType = (newPlanId: string): 'upgrade' | 'downgrade' | 'downgrade-to-free' => {
//     const currentPrice = getCurrentPlanPrice();
//     console.log("Current Price:", currentPrice);
//     const newPrice = getPlanPrice(newPlanId);
//     const isNewPlanFree = newPrice === 0;

//     if (isNewPlanFree && currentPrice > 0) return 'downgrade-to-free';
//     if (newPrice < currentPrice) return 'downgrade';
//     return 'upgrade';
//   };

//   // FONCTIONS DE TRAITEMENT DES ABONNEMENTS
//   const processStripeSubscription = async (planId: string, stripeLink: string) => {
//     setLoading(true);
//     try {
//       const payload = {
//         price_id: stripeLink,
//         societe_id: Number(societe_id),
//         plan_id: planId
//       };
      
//       const res = await fetch("https://integrations-api.solutravo-compta.fr/api/stripe/customer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (data.url) {
//         window.location.href = data.url;
//       }
//     } catch (err) {
//       console.error("Erreur Stripe:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processFreeSubscription = async (planId: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${baseUrlTest}/downgrade-to-free`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           societe_id: societe_id,
//           plan_id: planId
//         })
//       });

//       if (res.ok) {
//         await fetchData();
//         setShowConfirmationPopup(false);
//         setPendingPlan(null);
//       } else {
//         throw new Error("Erreur lors du passage au gratuit");
//       }
//     } catch (err) {
//       console.error("Erreur downgrade gratuit:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmSubscriptionChange = async () => {
//     if (!pendingPlan) return;

//     if (confirmationType === 'downgrade-to-free') {
//       await processFreeSubscription(pendingPlan.id);
//     } else {
//       await processStripeSubscription(pendingPlan.id, pendingPlan.stripeLink);
//     }
//   };

//   // FONCTION PRINCIPALE DE SOUSCRIPTION
//   const handleSubscribe = async (planId: string, stripeLink: string) => {
//     if (loading || currentSubscription?.planId === planId) return;

//     if (!currentSubscription) {
//       await processStripeSubscription(planId, stripeLink);
//       return;
//     }

//     const changeType = determineChangeType(planId);
    
//     if (changeType === 'upgrade') {
//       await processStripeSubscription(planId, stripeLink);
//       return;
//     }
    
//     setPendingPlan({ id: planId, stripeLink });
//     setConfirmationType(changeType);
//     setShowConfirmationPopup(true);
//   };

//   // FONCTIONS EXISTANTES
//   useEffect(() => {
//     if (plans && plans.length > 0) {
//       const transformed = transformPlansForFooter(plans);
//       setFooterPlans(transformed);
//     }
//   }, [plans]);

//   useEffect(() => {
//     if (paymentStatus === 'success') {
//       setShowSuccessPopup(true);
//       getSettings();
//       fetchData();
//       const cleanUrl = `${window.location.pathname}?membre_id=${membre_id}&societe_id=${societe_id}`;
//       window.history.replaceState({}, '', cleanUrl);
//     }
//   }, [paymentStatus, membre_id, societe_id]);

//   function getSettings() {
//      fetch(`${baseUrlTest}/subscription-settings`)
//       .then(res => res.json())
//       .then(data => {
//         setPageTitle(data.hero_title);
//         setPageSubtitle(data.hero_subtitle);
//       })
//       .catch(err => console.error("Erreur chargement settings:", err));
//   }

//   const fetchData = async () => {
//     try {
//       const res = await fetch(`${baseUrlTest}/check_subscription`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           userId: membre_id,
//           societe_id: societe_id
//         })
//       });

//       const data = await res.json();
//       setUserType(data.type);
//       setCurrentSubscription(data.subscription);
//       console.log("Données features:", data.type, data.subscription);
//       console.log("plans",data.plans)
//       setPlans(data.plans);
//     } catch (err) {
//       console.error("Erreur API:", err);
//     }
//   };

//   useEffect(() => {
//     getSettings();
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleClosePopup = () => {
//     setShowSuccessPopup(false);
//   };

//   useEffect(() => {
//     const cards = document.querySelectorAll('.pricing-card');
//     cards.forEach((card, index) => {
//       setTimeout(() => {
//         card.classList.add('fade-in-up');
//       }, index * 200);
//     });
//   }, [plans]);

//   const handleUpdatePlan = (updatedPlan: Plan) => {
//     setPlans(prevPlans =>
//       prevPlans.map(plan =>
//         plan.id === updatedPlan.id ? updatedPlan : plan
//       )
//     );
//   };

//   const toggleAdminMode = () => {
//     setIsAdminMode(!isAdminMode);
//   };

//   const handleNext = () => {
//     const redirectUrl = "https://staging.solutravo-compta.fr/dashboard";
//     setTimeout(() => {
//       window.location.href = redirectUrl;
//     }, 300);
//   };

//   return (
//     <div className="subscription-page">
//       <Header
//         isAdminMode={isAdminMode}
//         onToggleAdmin={toggleAdminMode}
//         currentSubscription={currentSubscription}
//         userType={userType}
//       />
//       <main className="main-content">
//         <div className="hero-section">
//           <div className="container">
//             <h1 className="hero-title fade-in-up">{pageTitle}</h1>
//             <p className="hero-subtitle fade-in-up">{pageSubtitle}</p>
//             <button onClick={handleNext} className="back-button">
//               <ArrowLeft size={25} />
//             </button>
//           </div>
//         </div>

//         <div className="pricing-section">
//           <div className="container">
//             <div className="pricing-grid">
//               {plans.map((plan, index) => (
//                 <PricingCard
//                   key={plan.id}
//                   plan={plan}
//                   onSubscribe={handleSubscribe}
//                   isCurrentPlan={currentSubscription?.id === plan.id}
//                   loading={loading}
//                   animationDelay={index * 100}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Popup de succès */}
//         <AnimatePresence>
//           {showSuccessPopup && (
//             <>
//               <motion.div
//                 className="masque"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 0.6 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//               />
//               <motion.div
//                 className="popup1"
//                 initial={{ scale: 0.7, opacity: 0, y: -50 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.7, opacity: 0, y: -50 }}
//                 transition={{ duration: 0.4, ease: "easeOut" }}
//               >
//                 <img src={nike} alt="" />
//                 <div className="popup_text">
//                   <span className="popup_title">Félicitations !</span>
//                   <span className="popup_title_span">
//                     Votre abonnement est maintenant actif. 🎉 Toute l'équipe <strong style={{ color: '#E77131' }}>Solutravo</strong> vous remercie pour votre confiance.
//                     Vous avez désormais accès à toutes les fonctionnalités de ce plan.
//                   </span>
//                 </div>
//                 <div className="popup_buttons">
//                   <div className="popup_buttons1" onClick={handleClosePopup}>
//                     FERMER
//                   </div>
//                 </div>
//                 <img
//                   src={close}
//                   alt="Fermer"
//                   className="close_icon"
//                   onClick={handleClosePopup}
//                 />
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>

//         {/* NOUVELLE POPUP DE CONFIRMATION */}
//         <AnimatePresence>
//           {showConfirmationPopup && (
//             <>
//               <motion.div
//                 className="masque"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 0.6 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//               />
//               <motion.div
//                 className="popup1"
//                 initial={{ scale: 0.7, opacity: 0, y: -50 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.7, opacity: 0, y: -50 }}
//                 transition={{ duration: 0.4, ease: "easeOut" }}
//               >
//                 <div className="popup_text">
//                   <span className="popup_title">Confirmez votre changement</span>
//                   <span className="popup_title_span">
//                     {confirmationType === 'downgrade-to-free' && 
//                       "Vous allez passer à l'offre gratuite. Vous perdrez l'accès à certaines fonctionnalités premium. Souhaitez-vous continuer ?"}
//                     {confirmationType === 'downgrade' && 
//                       "Vous allez passer à une offre inférieure. Certaines fonctionnalités ne seront plus disponibles. Souhaitez-vous continuer ?"}
//                   </span>
//                 </div>
//                 <div className="popup_buttons">
//                   <div className="popup_buttons1" onClick={() => setShowConfirmationPopup(false)}>
//                     Annuler
//                   </div>
//                   <div 
//                     className="popup_buttons1" 
//                     style={{ backgroundColor: '#E77131' }}
//                     onClick={confirmSubscriptionChange}
//                   >
//                     Confirmer
//                   </div>
//                 </div>
//                 <img
//                   src={close}
//                   alt="Fermer"
//                   className="close_icon"
//                   onClick={() => setShowConfirmationPopup(false)}
//                 />
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </main>

//       <PricingFooter plans={footerPlans} />

//       {isAdminMode && (
//         <AdminPanel
//           plans={plans}
//           onUpdatePlan={handleUpdatePlan}
//           onAddPlan={(newPlan) => setPlans([...plans, newPlan])}
//           onDeletePlan={(planId) => setPlans(plans.filter(p => p.id !== planId))}
//           pageTitle={pageTitle}
//           pageSubtitle={pageSubtitle}
//           setPageTitle={setPageTitle}
//           setPageSubtitle={setPageSubtitle}
//         />
//       )}

//       {loading && (
//         <div className="loading-overlay">
//           <div className="loading-content">
//             <div className="loading-spinner">⚡</div>
//             <p>Traitement de votre abonnement...</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubscriptionPage;




import React, { useState, useEffect } from 'react';
import Header from './Header';
import PricingCard from './PricingCard';
import AdminPanel from './AdminPanel';
import type { Plan, Subscription } from '../types/subscription';
import '../styles/SubscriptionPage.css';
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import nike from "../assets/icons/nike.png";
import close from "../assets/icons/close.png";
import { ArrowLeft, Building2, Users, Briefcase, Globe } from "lucide-react";
import PricingFooter from './PricingFooter';

const baseUrlTest =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://solutravo.zeta-app.fr/api";

// FONCTIONS HELPERS
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

const transformPlansForFooter = (plans: Plan[]): any[] => {
  if (!plans || !Array.isArray(plans)) return [];
  
  return plans.map(plan => {
    const getSubtitle = () => {
      if (plan.subtitle && plan.subtitle !== 'null') return plan.subtitle;
      
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

  // NOUVEAUX ÉTATS POUR LA LOGIQUE DE CONFIRMATION
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{id: string, stripeLink: string} | null>(null);
  const [confirmationType, setConfirmationType] = useState<'downgrade' | 'downgrade-to-free' | null>(null);

  // FONCTIONS UTILITAIRES POUR LA COMPARAISON PAR PRIX - CORRIGÉES
  const getCurrentPlanPrice = (): number => {
    if (!currentSubscription) {
      console.log("Aucun abonnement actuel");
      return 0;
    }
    
    console.log("Plan actuel:", currentSubscription.name, "Prix:", currentSubscription.price);
    return Number(currentSubscription.price);
  };

  const getNewPlanPrice = (newPlanId: string): number => {
    const newPlan = plans.find(p => p.id === newPlanId);
    if (!newPlan) {
      console.log("Nouveau plan non trouvé avec id:", newPlanId);
      return 0;
    }
    
    console.log("Nouveau plan:", newPlan.name, "Prix:", newPlan.price);
    return Number(newPlan.price);
  };

  const determineChangeType = (newPlanId: string): 'upgrade' | 'downgrade' | 'downgrade-to-free' => {
    const currentPrice = getCurrentPlanPrice();
    const newPrice = getNewPlanPrice(newPlanId);
    
    console.log("=== COMPARAISON DES PRIX ===");
    console.log("Prix actuel:", currentPrice);
    console.log("Nouveau prix:", newPrice);
    console.log("Nouveau plan est gratuit:", newPrice === 0);
    
    if (newPrice === 0 && currentPrice > 0) {
      console.log("→ downgrade-to-free");
      return 'downgrade-to-free';
    }
    if (newPrice < currentPrice) {
      console.log("→ downgrade");
      return 'downgrade';
    }
    console.log("→ upgrade");
    return 'upgrade';
  };

  // FONCTIONS DE TRAITEMENT DES ABONNEMENTS
  const processStripeSubscription = async (planId: string, stripeLink: string) => {
    setLoading(true);
    try {
      const payload = {
        price_id: stripeLink,
        societe_id: Number(societe_id),
        plan_id: planId
      };
      
      const res = await fetch("https://integrations-api.solutravo-compta.fr/api/stripe/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Erreur Stripe:", err);
    } finally {
      setLoading(false);
    }
  };

  const processFreeSubscription = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrlTest}/downgrade-to-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          societe_id: societe_id,
          plan_id: planId
        })
      });

      if (res.ok) {
        await fetchData();
        setShowConfirmationPopup(false);
        setPendingPlan(null);
      } else {
        throw new Error("Erreur lors du passage au gratuit");
      }
    } catch (err) {
      console.error("Erreur downgrade gratuit:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmSubscriptionChange = async () => {
    if (!pendingPlan) return;

    if (confirmationType === 'downgrade-to-free') {
      await processFreeSubscription(pendingPlan.id);
    } else {
      await processStripeSubscription(pendingPlan.id, pendingPlan.stripeLink);
    }
  };

  // FONCTION PRINCIPALE DE SOUSCRIPTION
  const handleSubscribe = async (planId: string, stripeLink: string) => {
    console.log("=== DÉBUT SOUSCRIPTION ===");
    console.log("Plan choisi:", planId);
    console.log("Abonnement actuel:", currentSubscription?.id);
    
    if (loading || currentSubscription?.id === planId) {
      console.log("→ Annulé: déjà en cours ou même plan");
      return;
    }

    if (!currentSubscription) {
      console.log("→ Premier abonnement → Stripe direct");
      await processStripeSubscription(planId, stripeLink);
      return;
    }

    const changeType = determineChangeType(planId);
    
    if (changeType === 'upgrade') {
      console.log("→ Upgrade → Stripe direct");
      await processStripeSubscription(planId, stripeLink);
      return;
    }
    
    console.log("→ Downgrade → Popup de confirmation");
    setPendingPlan({ id: planId, stripeLink });
    setConfirmationType(changeType);
    setShowConfirmationPopup(true);
  };

  // FONCTIONS EXISTANTES
  useEffect(() => {
    if (plans && plans.length > 0) {
      const transformed = transformPlansForFooter(plans);
      setFooterPlans(transformed);
    }
  }, [plans]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      setShowSuccessPopup(true);
      getSettings();
      fetchData();
      const cleanUrl = `${window.location.pathname}?membre_id=${membre_id}&societe_id=${societe_id}`;
      window.history.replaceState({}, '', cleanUrl);
    }
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
      setUserType(data.type);
      setCurrentSubscription(data.subscription);
      console.log("Données reçues - Subscription:", data.subscription);
      console.log("Plans disponibles:", data.plans);
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
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, index * 200);
    });
  }, [plans]);

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
    const redirectUrl = "https://staging.solutravo-compta.fr/dashboard";
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
            <button onClick={handleNext} className="back-button">
              <ArrowLeft size={25} />
            </button>
          </div>
        </div>

        <div className="pricing-section">
          <div className="container">
            <div className="pricing-grid">
              {plans.map((plan, index) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isCurrentPlan={currentSubscription?.id === plan.id}
                  loading={loading}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Popup de succès */}
        <AnimatePresence>
          {showSuccessPopup && (
            <>
              <motion.div
                className="masque"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
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
                    Votre abonnement est maintenant actif. 🎉 Toute l'équipe <strong style={{ color: '#E77131' }}>Solutravo</strong> vous remercie pour votre confiance.
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

        {/* NOUVELLE POPUP DE CONFIRMATION */}
        <AnimatePresence>
          {showConfirmationPopup && (
            <>
              <motion.div
                className="masque"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="popup21"
                initial={{ scale: 0.7, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: -50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="popup_text2">
                  <span className="popup_title2">Confirmez votre changement</span>
                  <span className="popup_title_span">
                    {confirmationType === 'downgrade-to-free' && 
                      "Vous allez passer à l'offre gratuite. Vous perdrez l'accès à certaines fonctionnalités. Souhaitez-vous continuer ?"}
                    {confirmationType === 'downgrade' && 
                      "Vous allez passer à une offre inférieure. Certaines fonctionnalités ne seront plus disponibles. Souhaitez-vous continuer ?"}
                  </span>
                </div>
                <div className="popup_buttons">
                  <div className="popup_buttons1" onClick={() => setShowConfirmationPopup(false)}>
                    Annuler
                  </div>
                  <div 
                    className="popup_buttons1" 
                    style={{ backgroundColor: '#E77131' }}
                    onClick={confirmSubscriptionChange}
                  >
                    Confirmer
                  </div>
                </div>
                <img
                  src={close}
                  alt="Fermer"
                  className="close_icon"
                  onClick={() => setShowConfirmationPopup(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

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