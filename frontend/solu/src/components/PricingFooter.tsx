// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChevronDown, ChevronUp, Building2, Users, Briefcase, Globe } from 'lucide-react';
// import '../styles/PricingFooter.css';

// interface PlanDetails {
//     id: string;
//     title: string;
//     subtitle: string;
//     price: string;
//     period: string;
//     description: string;
//     targetAudience: string;
//     keyBenefits: string[];
//     detailedFeatures: {
//         category: string;
//         features: string[];
//     }[];
//     whyChoose: string;
//     icon: React.ReactNode;
//     gradient: string;
// }

// const PricingFooter = () => {
//     const [activeTab, setActiveTab] = useState<string>('pme');
//     const [expandedSection, setExpandedSection] = useState<string | null>(null);

//     const plans: PlanDetails[] = [
//         {
//             id: 'gratuit',
//             title: 'Gratuit',
//             subtitle: 'Découverte',
//             price: '0',
//             period: '/mois',
//             description: 'La porte d\'entrée parfaite pour découvrir l\'écosystème Solutravo et commencer votre transformation digitale.',
//             targetAudience: 'Artisans débutants, auto-entrepreneurs, TPE en phase de test',
//             keyBenefits: [
//                 'Découverte sans engagement',
//                 'Interface intuitive simplifiée',
//                 'Support communautaire actif',
//                 'Formation de base incluse'
//             ],
//             detailedFeatures: [
//                 {
//                     category: 'Gestion de base',
//                     features: [
//                         '1 chantier simultané',
//                         'Devis simples et rapides',
//                         'Suivi basique des matériaux',
//                         'Support par la communauté'
//                     ]
//                 }
//             ],
//             whyChoose: 'Idéal pour tester nos solutions avant de vous engager. Parfait pour les nouveaux entrepreneurs qui souhaitent digitaliser leurs premiers projets.',
//             icon: <Building2 className="plan-icon" />,
//             gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
//         },
//         {
//             id: 'tpe',
//             title: 'TPE',
//             subtitle: 'Artisans',
//             price: '49',
//             period: '/mois',
//             description: 'Solution complète conçue spécifiquement pour les artisans et très petites entreprises qui veulent professionnaliser leur activité.',
//             targetAudience: 'Artisans établis, TPE de 1-5 employés, entreprises familiales',
//             keyBenefits: [
//                 'Gestion multi-chantiers efficace',
//                 'Facturation professionnelle',
//                 'Suivi matériaux optimisé',
//                 'Support email prioritaire'
//             ],
//             detailedFeatures: [
//                 {
//                     category: 'Gestion avancée',
//                     features: [
//                         'Jusqu\'à 5 chantiers simultanés',
//                         'Devis et factures personnalisés',
//                         'Gestion stock et approvisionnement',
//                         'Planification des interventions'
//                     ]
//                 },
//                 {
//                     category: 'Outils professionnels',
//                     features: [
//                         'Templates de documents',
//                         'Suivi rentabilité par chantier',
//                         'Intégration comptabilité',
//                         'Support email sous 24h'
//                     ]
//                 }
//             ],
//             whyChoose: 'Le choix des artisans qui veulent passer au niveau supérieur. Outils professionnels à prix accessible pour développer votre entreprise.',
//             icon: <Users className="plan-icon" />,
//             gradient: 'linear-gradient(135deg, #E77131 0%, #ff8a50 100%)'
//         },
//         {
//             id: 'pme',
//             title: 'PME',
//             subtitle: 'Croissance',
//             price: '99',
//             period: '/mois',
//             description: 'La solution de référence pour les PME en croissance. Outils avancés de gestion d\'équipe et d\'analyse de performance.',
//             targetAudience: 'PME de 5-50 employés, entreprises en expansion, groupes régionaux',
//             keyBenefits: [
//                 'Chantiers illimités',
//                 'Gestion équipe complète',
//                 'Planning avancé multi-projets',
//                 'Analyses détaillées et KPI',
//                 'Support prioritaire'
//             ],
//             detailedFeatures: [
//                 {
//                     category: 'Gestion d\'entreprise',
//                     features: [
//                         'Chantiers illimités',
//                         'Gestion complète des équipes',
//                         'Planning multi-projets avancé',
//                         'Analyses et tableaux de bord'
//                     ]
//                 },
//                 {
//                     category: 'Outils de croissance',
//                     features: [
//                         'Suivi performance individuelle',
//                         'Optimisation des coûts',
//                         'Prévisions financières',
//                         'Support prioritaire sous 4h'
//                     ]
//                 }
//             ],
//             whyChoose: 'Le choix des entreprises ambitieuses. Tous les outils nécessaires pour structurer votre croissance et piloter efficacement votre activité.',
//             icon: <Briefcase className="plan-icon" />,
//             gradient: 'linear-gradient(135deg, #E77131 0%, #d4651f 100%)'
//         },
//         {
//             id: 'entreprise',
//             title: 'Entreprise',
//             subtitle: 'Solutions sur mesure',
//             price: '199',
//             period: '/mois',
//             description: 'Solution enterprise complète avec fonctionnalités avancées, API personnalisée et support dédié 24/7.',
//             targetAudience: 'Grandes entreprises, groupes nationaux, donneurs d\'ordre',
//             keyBenefits: [
//                 'Toutes fonctionnalités PME incluses',
//                 'Multi-sites et filiales',
//                 'API personnalisée',
//                 'Support dédié 24/7',
//                 'Formation équipe complète'
//             ],
//             detailedFeatures: [
//                 {
//                     category: 'Solutions enterprise',
//                     features: [
//                         'Gestion multi-sites',
//                         'API et intégrations sur mesure',
//                         'Support dédié 24/7',
//                         'Formation équipe personnalisée'
//                     ]
//                 },
//                 {
//                     category: 'Services premium',
//                     features: [
//                         'Développements spécifiques',
//                         'Accompagnement stratégique',
//                         'Intégration ERP/CRM',
//                         'Chef de projet dédié'
//                     ]
//                 }
//             ],
//             whyChoose: 'Pour les leaders qui ne font pas de compromis. Solution sur mesure avec accompagnement premium pour transformer votre organisation.',
//             icon: <Globe className="plan-icon" />,
//             gradient: 'linear-gradient(135deg, #505050 0%, #737373 100%)'
//         }
//     ];

    

//     const toggleSection = (section: string) => {
//         setExpandedSection(expandedSection === section ? null : section);
//     };

//     const activePlan = plans.find(plan => plan.id === activeTab) || plans[2];

//     return (
//         <footer className="pricing-footer">
//             <div className="footer-container">
//                 {/* <motion.div 
//           className="footer-header"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           <h2 className="footer-title gotham">
//             Chaque forfait, une solution pensée pour votre réussite
//           </h2>
//           <p className="footer-subtitle">
//             Leader du BTP en France, nous accompagnons plus de 10 000 entreprises dans leur transformation digitale
//           </p>
//         </motion.div> */}

//                 <div className="plans-navigation">
//                     {plans.map((plan, index) => (
//                         <motion.button
//                             key={plan.id}
//                             className={`nav-button ${activeTab === plan.id ? 'active' : ''}`}
//                             onClick={() => setActiveTab(plan.id)}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: index * 0.1 }}
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                         >
//                             {plan.icon}
//                             <span className="nav-button-text">
//                                 <strong>{plan.title}</strong>
//                                 <small>{plan.subtitle}</small>
//                             </span>
//                             <span className="nav-button-price">
//                                 {plan.price}€<small>/mois</small>
//                             </span>
//                         </motion.button>
//                     ))}
//                 </div>

//                 <AnimatePresence mode="wait">
//                     <motion.div
//                         key={activeTab}
//                         className="plan-details"
//                         initial={{ opacity: 0, x: 50 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: -50 }}
//                         transition={{ duration: 0.6 }}
//                     >
//                         <div className="plan-hero" style={{ background: activePlan.gradient }}>
//                             <div className="plan-hero-content">
//                                 <div className="plan-hero-text">
//                                     <h3 className="plan-hero-title gotham">{activePlan.title}</h3>
//                                     <p className="plan-hero-description">{activePlan.description}</p>
//                                     <div className="plan-hero-audience">
//                                         <strong>Pour qui ?</strong> {activePlan.targetAudience}
//                                     </div>
//                                 </div>
//                                 <div className="plan-hero-price">
//                                     <span className="price-value">{activePlan.price}€</span>
//                                     <span className="price-period">/mois</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="plan-content">
//                             <div className="content-section">
//                                 <button
//                                     className="section-toggle"
//                                     onClick={() => toggleSection('benefits')}
//                                 >
//                                     <h4 className="gotham text_dark">Avantages clés</h4>
//                                     {expandedSection === 'benefits' ? <ChevronUp /> : <ChevronDown />}
//                                 </button>
//                                 <AnimatePresence>
//                                     {expandedSection === 'benefits' && (
//                                         <motion.div
//                                             className="section-content"
//                                             initial={{ height: 0, opacity: 0 }}
//                                             animate={{ height: 'auto', opacity: 1 }}
//                                             exit={{ height: 0, opacity: 0 }}
//                                             transition={{ duration: 0.4 }}
//                                         >
//                                             <ul className="benefits-list">
//                                                 {activePlan.keyBenefits.map((benefit, index) => (
//                                                     <motion.li
//                                                         key={index}
//                                                         initial={{ opacity: 0, x: -20 }}
//                                                         animate={{ opacity: 1, x: 0 }}
//                                                         transition={{ duration: 0.4, delay: index * 0.1 }}
//                                                     >
//                                                         <span className="benefit-bullet">✓</span>
//                                                         {benefit}
//                                                     </motion.li>
//                                                 ))}
//                                             </ul>
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>
//                             </div>

//                             <div className="content-section">
//                                 <button
//                                     className="section-toggle"
//                                     onClick={() => toggleSection('features')}
//                                 >
//                                     <h4 className="gotham text_dark">Fonctionnalités détaillées</h4>
//                                     {expandedSection === 'features' ? <ChevronUp /> : <ChevronDown />}
//                                 </button>
//                                 <AnimatePresence>
//                                     {expandedSection === 'features' && (
//                                         <motion.div
//                                             className="section-content"
//                                             initial={{ height: 0, opacity: 0 }}
//                                             animate={{ height: 'auto', opacity: 1 }}
//                                             exit={{ height: 0, opacity: 0 }}
//                                             transition={{ duration: 0.4 }}
//                                         >
//                                             <div className="features-grid">
//                                                 {activePlan.detailedFeatures.map((category, index) => (
//                                                     <motion.div
//                                                         key={index}
//                                                         className="feature-category"
//                                                         initial={{ opacity: 0, y: 20 }}
//                                                         animate={{ opacity: 1, y: 0 }}
//                                                         transition={{ duration: 0.4, delay: index * 0.1 }}
//                                                     >
//                                                         <h5 className="category-title">{category.category}</h5>
//                                                         <ul className="feature-list">
//                                                             {category.features.map((feature, featureIndex) => (
//                                                                 <li key={featureIndex}>{feature}</li>
//                                                             ))}
//                                                         </ul>
//                                                     </motion.div>
//                                                 ))}
//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>
//                             </div>

//                             <div className="content-section">
//                                 <button
//                                     className="section-toggle"
//                                     onClick={() => toggleSection('why')}
//                                 >
//                                     <h4 className="gotham text_dark">Pourquoi choisir ce forfait ?</h4>
//                                     {expandedSection === 'why' ? <ChevronUp /> : <ChevronDown />}
//                                 </button>
//                                 <AnimatePresence>
//                                     {expandedSection === 'why' && (
//                                         <motion.div
//                                             className="section-content"
//                                             initial={{ height: 0, opacity: 0 }}
//                                             animate={{ height: 'auto', opacity: 1 }}
//                                             exit={{ height: 0, opacity: 0 }}
//                                             transition={{ duration: 0.4 }}
//                                         >
//                                             <p className="why-choose-text">{activePlan.whyChoose}</p>
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>
//                             </div>
//                         </div>
//                     </motion.div>
//                 </AnimatePresence>

//                 <motion.div
//                     className="footer-bottom"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 1, delay: 0.5 }}
//                 >
//                     {/* <div className="trust-indicators">
//                         <div className="indicator">
//                             <strong>10 000+</strong>
//                             <span>Entreprises nous font confiance</span>
//                         </div>
//                         <div className="indicator">
//                             <strong>Leader</strong>
//                             <span>BTP en France</span>
//                         </div>
//                         <div className="indicator">
//                             <strong>24/7</strong>
//                             <span>Support disponible</span>
//                         </div>
//                         <div className="indicator">
//                             <strong>International</strong>
//                             <span>Qualité reconnue</span>
//                         </div>
//                     </div> */}

//                     <div className="footer-cta">
//                         <p className="cta-text">Prêt à transformer votre entreprise BTP ?</p>
//                         <motion.button
//                             className="cta-button"
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => {
//     const section = document.querySelector(".pricing-card");
//     section?.scrollIntoView({ behavior: "smooth" });
//   }}
//                         >
//                             Commencer maintenant
//                         </motion.button>
//                     </div>
//                 </motion.div>
//             </div>
//         </footer>
//     );
// };

// export default PricingFooter;



import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/PricingFooter.css';

interface PlanDetails {
    id: string | number;
    title: string;
    subtitle: string;
    price: string;
    period: string;
    description: string;
    targetAudience: string;
    keyBenefits: string[];
    detailedFeatures: {
        category: string;
        features: string[];
    }[];
    whyChoose: string;
    icon: React.ReactNode;
    gradient: string;
}

interface PricingFooterProps {
    plans: PlanDetails[];
}

const PricingFooter: React.FC<PricingFooterProps> = ({ plans }) => {
    const [activeTab, setActiveTab] = useState<string>(plans[0]?.id.toString() || '');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const activePlan = plans.find(plan => plan.id.toString() === activeTab) || plans[0];

    if (!plans || plans.length === 0) {
        return null;
    }

    return (
        <footer className="pricing-footer">
            <div className="footer-container">
                <div className="plans-navigation">
                    {plans.map((plan, index) => (
                        <motion.button
                            key={plan.id}
                            className={`nav-button ${activeTab === plan.id.toString() ? 'active' : ''}`}
                            onClick={() => setActiveTab(plan.id.toString())}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {plan.icon}
                            <span className="nav-button-text">
                                <strong>{plan.title}</strong>
                                <small>{plan.subtitle}</small>
                            </span>
                            <span className="nav-button-price">
                                {plan.price}€<small>{plan.period}</small>
                            </span>
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="plan-details"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="plan-hero" style={{ background: activePlan.gradient }}>
                            <div className="plan-hero-content">
                                <div className="plan-hero-text">
                                    <h3 className="plan-hero-title gotham">{activePlan.title}</h3>
                                    <p className="plan-hero-description">{activePlan.description}</p>
                                    <div className="plan-hero-audience">
                                        <strong>Pour qui ?</strong> {activePlan.targetAudience}
                                    </div>
                                </div>
                                <div className="plan-hero-price">
                                    <span className="price-value">{activePlan.price}€</span>
                                    <span className="price-period">{activePlan.period}</span>
                                </div>
                            </div>
                        </div>

                        {/* ⭐ SECTION MANQUANTE - CONTENU DÉPLIABLE */}
                        <div className="plan-content">
                            {/* Section Avantages clés */}
                            <div className="content-section">
                                <button
                                    className="section-toggle"
                                    onClick={() => toggleSection('benefits')}
                                >
                                    <h4 className="gotham text_dark">Avantages clés</h4>
                                    {expandedSection === 'benefits' ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {expandedSection === 'benefits' && (
                                        <motion.div
                                            className="section-content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <ul className="benefits-list">
                                                {activePlan.keyBenefits.map((benefit, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                                    >
                                                        <span className="benefit-bullet">✓</span>
                                                        {benefit}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Section Fonctionnalités détaillées */}
                            <div className="content-section">
                                <button
                                    className="section-toggle"
                                    onClick={() => toggleSection('features')}
                                >
                                    <h4 className="gotham text_dark">Fonctionnalités détaillées</h4>
                                    {expandedSection === 'features' ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {expandedSection === 'features' && (
                                        <motion.div
                                            className="section-content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <div className="features-grid">
                                                {activePlan.detailedFeatures.map((category, index) => (
                                                    <motion.div
                                                        key={index}
                                                        className="feature-category"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                                    >
                                                        <h5 className="category-title">{category.category}</h5>
                                                        <ul className="feature-list">
                                                            {category.features.map((feature, featureIndex) => (
                                                                <li key={featureIndex}>{feature}</li>
                                                            ))}
                                                        </ul>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Section Pourquoi choisir */}
                            <div className="content-section">
                                <button
                                    className="section-toggle"
                                    onClick={() => toggleSection('why')}
                                >
                                    <h4 className="gotham text_dark">Pourquoi choisir ce forfait ?</h4>
                                    {expandedSection === 'why' ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {expandedSection === 'why' && (
                                        <motion.div
                                            className="section-content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <p className="why-choose-text">{activePlan.whyChoose}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Section CTA */}
                <motion.div
                    className="footer-bottom"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <div className="footer-cta">
                        <p className="cta-text">Prêt à transformer votre entreprise BTP ?</p>
                        <motion.button
                            className="cta-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const section = document.querySelector(".pricing-card");
                                section?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Commencer maintenant
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default PricingFooter;