

import React, { useState } from 'react';
import type { Plan } from '../types/subscription';
import '../styles/AdminPanel.css';
import { AnimatePresence, motion } from "framer-motion";

const baseUrlTest = window.location.hostname === "localhost" 
  ? "http://localhost:3000/api" 
  : "https://solutravo.zeta-app.fr/api";

interface AdminPanelProps {
    plans: Plan[];
    onUpdatePlan: (plan: Plan) => void;
    onAddPlan: (plan: Plan) => void;
    onDeletePlan: (planId: string) => void;
    pageTitle: string;
    pageSubtitle: string;
    setPageTitle: (title: string) => void;
    setPageSubtitle: (subtitle: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
    plans, onUpdatePlan, onAddPlan, onDeletePlan,
    pageTitle, pageSubtitle, setPageTitle, setPageSubtitle
}) => {
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleSaveSettings = async () => {
        const data = { hero_title: pageTitle, hero_subtitle: pageSubtitle };
        try {
            const res = await fetch(`${baseUrlTest}/subscription-settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Erreur serveur");
            setSnackbar({ message: "Titre et sous-titre mis à jour !", type: "success" });
        } catch (err) {
            console.error("Erreur maj settings:", err);
            setSnackbar({ message: "Échec de la mise à jour", type: "error" });
        }
    };

    const handleEditPlan = (plan: Plan) => {
        // S'assurer que les nouveaux champs sont bien parsés
        const parsedPlan = {
            ...plan,
            key_benefits: typeof plan.key_benefits === 'string' ? JSON.parse(plan.key_benefits) : plan.key_benefits || [],
            detailed_features: typeof plan.detailed_features === 'string' ? JSON.parse(plan.detailed_features) : plan.detailed_features || []
        };
        setEditingPlan(parsedPlan);
        setShowAddForm(false);
    };

    const handleSavePlan = async () => {
        if (editingPlan) {
            try {
                const res = await fetch(`${baseUrlTest}/plans/${editingPlan.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingPlan)
                });
                if (!res.ok) throw new Error("Erreur serveur");
                onUpdatePlan(editingPlan);
                setSnackbar({ message: "Plan mis à jour !", type: "success" });
                setEditingPlan(null);
            } catch (err) {
                console.error("Erreur mise à jour du plan:", err);
                setSnackbar({ message: "Échec de la mise à jour", type: "error" });
            }
        }
    };

    const handleAddNew = () => {
        const newPlan: Plan = {
            id: `plan-${Date.now()}`,
            name: 'Nouveau Plan',
            price: 0,
            period: 'mois',
            description: 'Description du nouveau plan',
            features: ['Fonctionnalité 1'],
            popular: false,
            color: '#E77131',
            stripe_link: '',
            // NOUVEAUX CHAMPS
            subtitle: '',
            target_audience: '',
            key_benefits: ['Avantage 1'],
            detailed_features: [{ category: 'Catégorie', features: ['Fonctionnalité 1'] }],
            why_choose: '',
            icon_name: 'building',
            gradient: 'linear-gradient(135deg, #E77131 0%, #ff8a50 100%)'
        };
        setEditingPlan(newPlan);
        setShowAddForm(true);
    };

    const handleCreatePlan = async () => {
        if (editingPlan) {
            try {
                const res = await fetch(`${baseUrlTest}/plans`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingPlan),
                });
                if (!res.ok) throw new Error("Erreur serveur");
                const result = await res.json();
                onAddPlan(result.plan);
                setSnackbar({ message: "Plan créé !", type: "success" });
                setEditingPlan(null);
                setShowAddForm(false);
            } catch (err) {
                console.error("Erreur création du plan:", err);
                setSnackbar({ message: "Échec de la création", type: "error" });
            }
        }
    };

    const handleDeletePlan = async (planId: string | number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
            try {
                const res = await fetch(`${baseUrlTest}/plans/${planId}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Erreur suppression");
                onDeletePlan(planId.toString());
                setSnackbar({ message: "Plan supprimé !", type: "success" });
            } catch (err) {
                console.error("Erreur lors de la suppression :", err);
                setSnackbar({ message: "Échec de la suppression", type: "error" });
            }
        }
    };

    const updateEditingPlan = (field: keyof Plan, value: any) => {
        if (editingPlan) {
            setEditingPlan({ ...editingPlan, [field]: value });
        }
    };

    // Gestion des avantages clés
    const addKeyBenefit = () => {
        if (editingPlan) {
            const currentBenefits = Array.isArray(editingPlan.key_benefits) ? editingPlan.key_benefits : [];
            setEditingPlan({
                ...editingPlan,
                key_benefits: [...currentBenefits, 'Nouvel avantage']
            });
        }
    };

    const updateKeyBenefit = (index: number, value: string) => {
        if (editingPlan && editingPlan.key_benefits) {
            const newBenefits = [...editingPlan.key_benefits];
            newBenefits[index] = value;
            setEditingPlan({ ...editingPlan, key_benefits: newBenefits });
        }
    };

    const removeKeyBenefit = (index: number) => {
        if (editingPlan && editingPlan.key_benefits) {
            const newBenefits = editingPlan.key_benefits.filter((_, i) => i !== index);
            setEditingPlan({ ...editingPlan, key_benefits: newBenefits });
        }
    };

    // Gestion des fonctionnalités détaillées
    const addFeatureCategory = () => {
        if (editingPlan) {
            const currentFeatures = Array.isArray(editingPlan.detailed_features) ? editingPlan.detailed_features : [];
            setEditingPlan({
                ...editingPlan,
                detailed_features: [...currentFeatures, { category: 'Nouvelle catégorie', features: [] }]
            });
        }
    };

    const updateFeatureCategory = (categoryIndex: number, field: 'category' | 'features', value: any) => {
        if (editingPlan && editingPlan.detailed_features) {
            const newFeatures = [...editingPlan.detailed_features];
            if (field === 'category') {
                newFeatures[categoryIndex].category = value;
            } else {
                newFeatures[categoryIndex].features = value;
            }
            setEditingPlan({ ...editingPlan, detailed_features: newFeatures });
        }
    };

    const addFeatureToCategory = (categoryIndex: number) => {
        if (editingPlan && editingPlan.detailed_features) {
            const newFeatures = [...editingPlan.detailed_features];
            newFeatures[categoryIndex].features.push('Nouvelle fonctionnalité');
            setEditingPlan({ ...editingPlan, detailed_features: newFeatures });
        }
    };

    const removeFeatureCategory = (categoryIndex: number) => {
        if (editingPlan && editingPlan.detailed_features) {
            const newFeatures = editingPlan.detailed_features.filter((_, i) => i !== categoryIndex);
            setEditingPlan({ ...editingPlan, detailed_features: newFeatures });
        }
    };

    // Gestion des fonctionnalités simples
    const addFeature = () => {
        if (editingPlan) {
            setEditingPlan({
                ...editingPlan,
                features: [...editingPlan.features, 'Nouvelle fonctionnalité']
            });
        }
    };

    const updateFeature = (index: number, value: string) => {
        if (editingPlan) {
            const newFeatures = [...editingPlan.features];
            newFeatures[index] = value;
            setEditingPlan({ ...editingPlan, features: newFeatures });
        }
    };

    const removeFeature = (index: number) => {
        if (editingPlan) {
            const newFeatures = editingPlan.features.filter((_, i) => i !== index);
            setEditingPlan({ ...editingPlan, features: newFeatures });
        }
    };

    return (
        <div className="admin-panel fade-in-up">
            <div className="container">
                <div className="admin-header">
                    <h2>🔧 Panneau d'Administration</h2>
                    <p>Gérez vos plans d'abonnement en temps réel</p>
                </div>

                {/* Section paramètres généraux */}
                <div className="settings-section">
                    <div className="form-group">
                        <label className="form_group_label">Titre de la page</label>
                        <input
                            className="form_group_input"
                            type="text"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form_group_label">Sous-titre de la page</label>
                        <textarea
                            className="form_group_input"
                            rows={3}
                            value={pageSubtitle}
                            onChange={(e) => setPageSubtitle(e.target.value)}
                        />
                    </div>
                    <button className="save-btn1" onClick={handleSaveSettings}>
                        Enregistrer les paramètres
                    </button>
                </div>

                <div className="admin-content">
                    <div className="plans-list">
                        <div className="list-header">
                            <h3>Plans existants</h3>
                            <button className="add-btn" onClick={handleAddNew}>
                                ➕ Ajouter un plan
                            </button>
                        </div>

                        <div className="plans-grid">
                            {plans.map(plan => (
                                <div key={plan.id} className="plan-item">
                                    <div className="plan-info">
                                        <h4>{plan.name}</h4>
                                        <p>{Number(plan.price).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€/{plan.period}</p>
                                        <span className={`popularity ${plan.popular ? 'popular' : ''}`}>
                                            {plan.popular ? '★ Populaire' : 'Standard'}
                                        </span>
                                    </div>
                                    <a href="#edit_form_plan">
                                        <div className="plan-actions">
                                            <button className="edit-btn" onClick={() => handleEditPlan(plan)}>
                                                ✏️ Modifier
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDeletePlan(plan.id)}>
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {editingPlan && (
                        <div className="edit-form" id="edit_form_plan">
                            <div className="form-header">
                                <h3>{showAddForm ? '➕ Créer un nouveau plan' : '✏️ Modifier le plan'}</h3>
                            </div>

                            <div className="form-content">
                                {/* Informations de base */}
                                <div className="form-section">
                                    <h4>Informations de base</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nom du plan</label>
                                            <input
                                                type="text"
                                                value={editingPlan.name}
                                                onChange={(e) => updateEditingPlan('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Sous-titre</label>
                                            <input
                                                type="text"
                                                value={editingPlan.subtitle || ''}
                                                onChange={(e) => updateEditingPlan('subtitle', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Prix (€)</label>
                                            <input
                                                type="number"
                                                value={editingPlan.price}
                                                onChange={(e) => updateEditingPlan('price', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Période</label>
                                            <select
                                                value={editingPlan.period}
                                                onChange={(e) => updateEditingPlan('period', e.target.value)}
                                            >
                                                <option value="mois">mois</option>
                                                <option value="année">année</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Icône</label>
                                            <select
                                                value={editingPlan.icon_name || 'building'}
                                                onChange={(e) => updateEditingPlan('icon_name', e.target.value)}
                                            >
                                                <option value="building">Building</option>
                                                <option value="users">Users</option>
                                                <option value="briefcase">Briefcase</option>
                                                <option value="globe">Globe</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Couleur</label>
                                            <input
                                                type="color"
                                                value={editingPlan.color?.startsWith('#') ? editingPlan.color : `#${editingPlan.color}`}
                                                onChange={(e) => updateEditingPlan('color', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Dégradé</label>
                                            <input
                                                type="text"
                                                value={editingPlan.gradient || ''}
                                                onChange={(e) => updateEditingPlan('gradient', e.target.value)}
                                                placeholder="linear-gradient(135deg, #E77131 0%, #ff8a50 100%)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Lien Stripe</label>
                                            <input
                                                type="url"
                                                value={editingPlan.stripe_link || ''}
                                                onChange={(e) => updateEditingPlan('stripe_link', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={editingPlan.description}
                                            onChange={(e) => updateEditingPlan('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Public cible</label>
                                        <textarea
                                            value={editingPlan.target_audience || ''}
                                            onChange={(e) => updateEditingPlan('target_audience', e.target.value)}
                                            rows={2}
                                            placeholder="Artisans débutants, auto-entrepreneurs, TPE en phase de test"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Pourquoi choisir</label>
                                        <textarea
                                            value={editingPlan.why_choose || ''}
                                            onChange={(e) => updateEditingPlan('why_choose', e.target.value)}
                                            rows={3}
                                            placeholder="Idéal pour tester nos solutions avant de vous engager..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Populaire</label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={editingPlan.popular || false}
                                                onChange={(e) => updateEditingPlan('popular', e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                            Marquer comme plan populaire
                                        </label>
                                    </div>
                                </div>

                                {/* Avantages clés */}
                                <div className="form-section">
                                    <div className="features-header">
                                        <h4>Avantages clés</h4>
                                        <button type="button" className="add-feature-btn" onClick={addKeyBenefit}>
                                            ➕ Ajouter un avantage
                                        </button>
                                    </div>
                                    <div className="features-list">
                                        {(Array.isArray(editingPlan.key_benefits) ? editingPlan.key_benefits : []).map((benefit, index) => (
                                            <div key={index} className="feature-input">
                                                <input
                                                    type="text"
                                                    value={benefit}
                                                    onChange={(e) => updateKeyBenefit(index, e.target.value)}
                                                    placeholder="Avantage clé..."
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-feature-btn"
                                                    onClick={() => removeKeyBenefit(index)}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fonctionnalités détaillées */}
                                <div className="form-section">
                                    <div className="features-header">
                                        <h4>Fonctionnalités détaillées</h4>
                                        <button type="button" className="add-feature-btn" onClick={addFeatureCategory}>
                                            ➕ Ajouter une catégorie
                                        </button>
                                    </div>
                                    
                                    {(Array.isArray(editingPlan.detailed_features) ? editingPlan.detailed_features : []).map((category, categoryIndex) => (
                                        <div key={categoryIndex} className="feature-category-editor">
                                            <div className="category-header">
                                                <input
                                                    type="text"
                                                    value={category.category}
                                                    onChange={(e) => updateFeatureCategory(categoryIndex, 'category', e.target.value)}
                                                    placeholder="Nom de la catégorie"
                                                    className="category-title-input"
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-feature-btn"
                                                    onClick={() => removeFeatureCategory(categoryIndex)}
                                                >
                                                    ❌ Supprimer la catégorie
                                                </button>
                                            </div>
                                            
                                            <div className="category-features">
                                                <button 
                                                    type="button" 
                                                    className="add-feature-btn small"
                                                    onClick={() => addFeatureToCategory(categoryIndex)}
                                                >
                                                    ➕ Ajouter une fonctionnalité
                                                </button>
                                                
                                                {category.features.map((feature, featureIndex) => (
                                                    <div key={featureIndex} className="feature-input">
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={(e) => {
                                                                const newFeatures = [...category.features];
                                                                newFeatures[featureIndex] = e.target.value;
                                                                updateFeatureCategory(categoryIndex, 'features', newFeatures);
                                                            }}
                                                            placeholder="Fonctionnalité..."
                                                        />
                                                        <button
                                                            type="button"
                                                            className="remove-feature-btn"
                                                            onClick={() => {
                                                                const newFeatures = category.features.filter((_, i) => i !== featureIndex);
                                                                updateFeatureCategory(categoryIndex, 'features', newFeatures);
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Fonctionnalités simples (pour PricingCard) */}
                                <div className="form-section">
                                    <div className="features-header">
                                        <h4>Fonctionnalités principales (pour les cartes)</h4>
                                        <button type="button" className="add-feature-btn" onClick={addFeature}>
                                            ➕ Ajouter
                                        </button>
                                    </div>
                                    <div className="features-list">
                                        {editingPlan.features.map((feature, index) => (
                                            <div key={index} className="feature-input">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => updateFeature(index, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-feature-btn"
                                                    onClick={() => removeFeature(index)}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="cancel-btn" onClick={() => { setEditingPlan(null); setShowAddForm(false); }}>
                                        Annuler
                                    </button>
                                    <button className="save-btn" onClick={showAddForm ? handleCreatePlan : handleSavePlan}>
                                        {showAddForm ? 'Créer le plan' : 'Sauvegarder'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {snackbar && (
                    <motion.div
                        key="snackbar"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`snackbar ${snackbar.type}`}
                        onClick={() => setSnackbar(null)}
                    >
                        {snackbar.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;