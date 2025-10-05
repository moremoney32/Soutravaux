import React, { useState } from 'react';
import type { Plan } from '../types/subscription';
import '../styles/AdminPanel.css';
import { AnimatePresence, motion } from "framer-motion";

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
    plans,
    onUpdatePlan,
    onAddPlan,
    onDeletePlan,
    pageTitle,
    pageSubtitle,
    setPageTitle,
    setPageSubtitle

}) => {
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);



    const handleSaveSettings = async () => {
        const data = {
            hero_title: pageTitle,
            hero_subtitle: pageSubtitle
        }
        try {
            const res = await fetch("http://localhost:3000/api/subscription-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Erreur serveur");

            const result = await res.json();
            if (result) {
                fetch("http://localhost:3000/api/subscription-settings")
                    .then(res => res.json())
                    .then(data => {
                        setPageTitle(data.hero_title);
                        setPageSubtitle(data.hero_subtitle);
                    })
                    .catch(err => console.error("Erreur chargement settings:", err));
            }
            // alert(" Titre et sous-titre mis à jour !");
            setSnackbar({ message: "Titre et sous-titre mis à jour !", type: "success" });
        } catch (err) {
            console.error("Erreur maj settings:", err);
            setSnackbar({ message: "Échec de la mise à jour", type: "error" });
        }
    };


    const handleEditPlan = (plan: Plan) => {
        setEditingPlan({ ...plan });
        setShowAddForm(false);
    };


    const handleSavePlan = async () => {
        if (editingPlan) {
            console.log("Saving plan:", editingPlan);

            try {
                const res = await fetch(`http://localhost:3000/api/plans/${editingPlan.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(editingPlan)
                });
                if (!res.ok) throw new Error("Erreur serveur");
                const result = await res.json();
                console.log(result.message);

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
            stripe_link:''
        };
        setEditingPlan(newPlan);
        setShowAddForm(true);
    };



    const handleCreatePlan = async () => {
        if (editingPlan) {
            try {
                const res = await fetch("http://localhost:3000/api/plans", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingPlan),
                });
                if (!res.ok) throw new Error("Erreur serveur");
                const result = await res.json();
                console.log("Plan créé:", result.plan);

                onAddPlan(result.plan);
                setSnackbar({ message: "Plan créé !", type: "success" });

                setEditingPlan(null);
                setShowAddForm(false);
            } catch (err) {
                console.error("Erreur création du plan:", err);

            }
        }
    };


    const handleDeletePlan = async (planId: string | number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
            try {
                const res = await fetch(`http://localhost:3000/api/plans/${planId}`, {
                    method: "DELETE"
                });
                if (!res.ok) throw new Error("Erreur suppression");
                const result = await res.json();
                console.log(result.message);

                // Mise à jour locale
                onDeletePlan(planId.toString());
                setSnackbar({ message: " Plan supprimé !", type: "success" });
            } catch (err) {
                console.error("Erreur lors de la suppression :", err);
                setSnackbar({ message: " Échec de la suppression", type: "error" });
            }
        }
    };


    const updateEditingPlan = (field: keyof Plan, value: any) => {
        if (editingPlan) {
            console.log("Update:", field, value);
            setEditingPlan({ ...editingPlan, [field]: value });
        }
    };

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

                {/* Nouvelle section pour gérer titre et sous-titre */}
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
                        Enregistrer
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
                                    <div className="plan-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditPlan(plan)}
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeletePlan(plan.id)}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {editingPlan && (
                        <div className="edit-form">
                            <div className="form-header">
                                <h3>
                                    {showAddForm ? '➕ Créer un nouveau plan' : '✏️ Modifier le plan'}
                                </h3>
                            </div>

                            <div className="form-content">
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
                                        <label>Prix (€)</label>
                                        <input
                                            type="number"
                                            value={editingPlan.price}
                                            onChange={(e) => updateEditingPlan('price', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
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
                                        <label>Couleur</label>
                                        <input
                                            type="color"
                                            value={editingPlan.color.startsWith('#') ? editingPlan.color : `#${editingPlan.color}`}
                                            onChange={(e) => updateEditingPlan('color', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Lien Stripe</label>
                                        <input
                                            type="url"
                                            value={editingPlan.stripe_link} 
                                            onChange={(e) => updateEditingPlan('stripe_link', e.target.value)}
                                            // placeholder="https://buy.stripe.com/..."
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
                                    <label>Populaire</label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.popular}
                                            onChange={(e) => updateEditingPlan('popular', e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        Marquer comme plan populaire
                                    </label>
                                </div>

                                <div className="features-section">
                                    <div className="features-header">
                                        <label>Fonctionnalités</label>
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
                                    <button
                                        className="cancel-btn"
                                        onClick={() => {
                                            setEditingPlan(null);
                                            setShowAddForm(false);
                                        }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        className="save-btn"
                                        onClick={showAddForm ? handleCreatePlan : handleSavePlan}
                                    >
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
                        onClick={() => setSnackbar(null)} // clique pour fermer
                    >
                        {snackbar.message}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminPanel;