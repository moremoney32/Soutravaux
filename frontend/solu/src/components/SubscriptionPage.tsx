import React, { useState, useEffect } from 'react';
import Header from './Header';
import PricingCard from './PricingCard';
import AdminPanel from './AdminPanel';
// import Footer from './Footer';
import type { Plan, Subscription } from '../types/subscription';
import '../styles/SubscriptionPage.css';
import { useSearchParams } from "react-router-dom";


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

  useEffect(() => {
    fetch("https://solutravo.zeta-app.fr/api/subscription-settings")
      .then(res => res.json())
      .then(data => {
        console.log("Données settings:", data);
        setPageTitle(data.hero_title);
        setPageSubtitle(data.hero_subtitle);
      })
      .catch(err => console.error("Erreur chargement settings:", err));
  }, []);
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const res = await fetch("http://localhost:3000/api/check_subscription", {
  //           // headers: { Authorization: `Bearer ${token}` }
  //           method:"post",
  //           headers: {
  //   "Content-Type": "application/json",
  //   "Authorization": `Bearer ${token}`
  // }
  //         });
  //         const data = await res.json();
  //         console.log("Données API:", data);
  //         console.log(data.subscription);
  //         setUserType(data.type) // rôle de l'utilisateur

  //         setCurrentSubscription(data.subscription); // plan actif
  //         setPlans(data.plans); // tous les plans du rôle
  //       } catch (err) {
  //         console.error("Erreur API:", err);
  //       }
  //     };
  //     fetchData();
  //   }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://solutravo.zeta-app.fr/api/check_subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: membre_id,
            societe_id: societe_id
          })
        });

        const data = await res.json();
        console.log("Données API:", data);

        // utilisation des données reçues
        setUserType(data.type);                 // rôle de l'utilisateur
        setCurrentSubscription(data.subscription); // plan actif
        setPlans(data.plans);                   // tous les plans
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    fetchData();
  }, []);




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
          window.location.href = stripeLink;
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
                  isCurrentPlan={currentSubscription?.planId === plan.id}
                  loading={loading}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </div>

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
      </main>

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