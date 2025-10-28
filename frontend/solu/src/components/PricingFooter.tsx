

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
                                {plan.price.toString().replace('.00', '')}€<small>{plan.period}</small>
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
                                    <span className="price-value"> {activePlan.price.toString().replace('.00', '')}€</span>
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