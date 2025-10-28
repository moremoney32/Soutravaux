

import type { Plan } from '../types/subscription';
import '../styles/PricingCard.css';

interface PricingCardProps {
    plan: Plan;
    onSubscribe: (planId: string, stripeLink: string) => void;
    isCurrentPlan: boolean;
    loading: boolean;
    animationDelay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({
    plan,
    onSubscribe,
    isCurrentPlan,
    loading,
    animationDelay,
}) => {

    const handleSubscribe = () => {
        if (!loading && !isCurrentPlan) {
            // console.log(plan.id, plan.stripe_link);
            onSubscribe(plan.id, plan.stripe_link);
        }
    };

    const getButtonText = () => {
        if (loading) {
            return (
                <>
                    <span className="loading-spinner">⚡</span>
                    Traitement...
                </>
            );
        }
        
        if (isCurrentPlan) {
            return 'Plan actuel';
        }
        
        return 'Activer cette Offre';
    };

    return (
        <div
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
            style={{
                animationDelay: `${animationDelay}ms`,
                '--plan-color': plan.color
            } as React.CSSProperties}
        >
            {plan.popular && (
                <div className="popular-badge">
                    <span className='star_black'>★</span>
                    <span>Plus populaire</span>
                </div>
            )}

            {isCurrentPlan && (
                <div className="current-badge">
                    <span className='star_white'>✓</span>
                    <span>Votre plan actuel</span>
                </div>
            )}

            <div className="card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
            </div>

            <div className="price-section">
                <div className="price">
                    <span className="currency">€</span>
                    <span className="amount">
                        {Number(plan.price).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="period">/{plan.period}</span>
                </div>

                <div className="card-footer">
                    <button
                        style={{ backgroundColor: plan.color }}
                        className={`subscribe-btn ${isCurrentPlan ? 'current' : ''} ${loading ? 'loading' : ''}`}
                        onClick={handleSubscribe}
                        disabled={loading || isCurrentPlan}
                    >
                        {getButtonText()}
                    </button>
                </div>
            </div>
            
            <div className="features-section">
                <ul className="features-list">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span className="feature-text">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PricingCard;