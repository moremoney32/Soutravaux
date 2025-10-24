



import { useState, useMemo, useRef, useEffect } from 'react';
import '../styles/PlanFeatureManager.css';

import type { Plan,  FeatureWithStatus } from '../types';
import { planFeatureApi } from '../services/planFeatureService';

const PlanFeatureManager = () => {
 const [selectedRole, setSelectedRole] = useState<'artisan' | 'annonceur' | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [featuresWithStatus, setFeaturesWithStatus] = useState<FeatureWithStatus[]>([]);
  const [planFeaturesCount, setPlanFeaturesCount] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeaturePage, setNewFeaturePage] = useState('');

  const [activeModuleDropdown, setActiveModuleDropdown] = useState<string | null>(null);
  const [showModuleAddModal, setShowModuleAddModal] = useState(false);
  const [showModuleEditModal, setShowModuleEditModal] = useState(false);
  const [showModuleDeleteModal, setShowModuleDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [moduleFeatures, setModuleFeatures] = useState<Array<{ name: string; id?: number }>>([]);
  const [featureToDelete, setFeatureToDelete] = useState<{ id: number; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);



  // CE QU'IL FAUT :

 const loadPlansByRole = async (role: 'artisan' | 'annonceur') => {
    try {
      setLoading(true);
      setError(null);
      console.log(` Chargement des plans pour le rôle: ${role}`);
      
      const plansData = await planFeatureApi.getPlansByRole(role);
      console.log(` Plans chargés pour ${role}:`, plansData);
      
      if (!plansData || !Array.isArray(plansData)) {
        throw new Error(`Données des plans invalides pour le rôle ${role}`);
      }
      
      setPlans(plansData);
      setSelectedPlanId(null); // Réinitialiser la sélection de plan
      // Charger le comptage des fonctionnalités pour tous les plans
      await loadAllPlanFeaturesCount(plansData);
      
    } catch (err: any) {
      console.error(`Erreur chargement plans ${role}:`, err);
      setError(`Échec du chargement des plans ${role}`);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
    if (selectedRole) {
      loadPlansByRole(selectedRole);
    } else {
      // Si aucun rôle sélectionné, vider les plans
      setPlans([]);
      setSelectedPlanId(null);
    }
  }, [selectedRole]);

  const loadAllPlanFeaturesCount = async (plansData: Plan[]) => {
  const counts: {[key: number]: number} = {};
  
  if (!selectedRole) {
    console.warn('Aucun rôle pour le comptage');
    return;
  }
  
  // Charger les features du rôle une seule fois
  const featuresForRole = await planFeatureApi.getFeaturesByRole(selectedRole);
  console.log(`Comptage: ${featuresForRole.length} features pour ${selectedRole}`);
  
  // Pour chaque plan, compter ses fonctionnalités activées
  for (const plan of plansData) {
    try {
      const planFeatures = await planFeatureApi.getPlanFeatures(plan.id);
      const enabledFeatureIds = planFeatures
        .filter((pf: any) => pf.enabled)
        .map((pf: any) => pf.id);
      
      // Compter seulement les features du rôle qui sont activées
      const enabledCount = featuresForRole.filter(f => 
        enabledFeatureIds.includes(f.id)
      ).length;
      
      counts[plan.id] = enabledCount;
      console.log(`Plan ${plan.name}: ${enabledCount}/${featuresForRole.length} fonctionnalités`);
    } catch (err) {
      console.error(`Erreur comptage plan ${plan.id}:`, err);
      counts[plan.id] = 0;
    }
  }
  
  setPlanFeaturesCount(counts);
};


  // Charger les fonctionnalités quand un plan est sélectionné
  useEffect(() => {
    if (selectedPlanId) {
      loadPlanFeatures(selectedPlanId);
    } else {
      setFeaturesWithStatus([]);
    }
  }, [selectedPlanId]);


  const loadPlanFeatures = async (planId: number) => {
  try {
    setLoading(true);
    console.log(`Chargement features pour plan: ${planId}, rôle: ${selectedRole}`);
    
    if (!selectedRole) {
      console.warn('⚠️ Aucun rôle sélectionné');
      setFeaturesWithStatus([]);
      return;
    }
    
    // CHANGEMENT CRITIQUE : Charger SEULEMENT les features du rôle actuel
    const featuresForRole = await planFeatureApi.getFeaturesByRole(selectedRole);
    console.log(`Features disponibles pour ${selectedRole}:`, featuresForRole.length);
    
    // Récupérer les features activées pour ce plan spécifique
    const planFeatures = await planFeatureApi.getPlanFeatures(planId);
    const enabledFeatureIds = planFeatures
      .filter((pf: any) => pf.enabled)
      .map((pf: any) => pf.id);
    
    console.log(`Features activées pour plan ${planId}:`, enabledFeatureIds.length);
    
    // Combiner les données
    const featuresWithStatus = featuresForRole.map((feature: any) => ({
      ...feature,
      enabled: enabledFeatureIds.includes(feature.id),
      inherited: selectedPlan?.is_enterprise || false
    }));
    
    setFeaturesWithStatus(featuresWithStatus);
    console.log(`${featuresWithStatus.length} features avec statut chargées`);
    
  } catch (err: any) {
    console.error('Erreur chargement features:', err);
    setError(`Erreur chargement: ${err.message}`);
    setFeaturesWithStatus([]);
  } finally {
    setLoading(false);
  }
};
  // CORRECTION : Méthode de comptage utilisant l'état dédié
  const getFeatureCount = (planId: number) => {
    return planFeaturesCount[planId] || 0;
  };

  const rolePlans = useMemo(() => {
    return plans.filter(plan => plan.role === selectedRole);
  }, [plans, selectedRole]);

  const enterprisePlan = useMemo(() => {
    return rolePlans.find(plan => plan.is_enterprise);
  }, [rolePlans]);

  const selectedPlan = useMemo(() => {
    return rolePlans.find(plan => plan.id === selectedPlanId);
  }, [rolePlans, selectedPlanId]);

  const groupedFeatures = useMemo(() => {
    const grouped: Record<string, FeatureWithStatus[]> = {};

    featuresWithStatus.forEach(feature => {
      if (!grouped[feature.page]) {
        grouped[feature.page] = [];
      }
      grouped[feature.page].push(feature);
    });

    return grouped;
  }, [featuresWithStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveModuleDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleFeature = async (featureId: number) => {
  if (!selectedPlan || selectedPlan.is_enterprise) return;

  try {
    setError(null);
    const feature = featuresWithStatus.find(f => f.id === featureId);
    
    if (feature?.enabled) {
      await planFeatureApi.removeFeatureFromPlan(featureId, selectedPlan.id);
    } else {
      await planFeatureApi.addFeatureToPlan(featureId, selectedPlan.id);
    }

    // CORRECTION : Recharger TOUTES les données
    await reloadAllData();
    
  } catch (err: any) {
    setError(err.message);
    console.error('Erreur toggle feature:', err);
  }
};



const handleAddNewFeature = async () => {
  if (!newFeatureName.trim() || !newFeaturePage.trim() || !enterprisePlan || !selectedRole) return;

  try {
    setError(null);
    console.log(`Début création feature pour rôle: ${selectedRole}`);
    setLoading(true);

    const newFeature = await planFeatureApi.createFeature({
      name: newFeatureName.trim(),
      page: newFeaturePage.trim(),
      parent_feature_id: null,
      role: selectedRole
    });

    console.log(`Frontend: Feature créée:`, newFeature);

    // ✅ CORRECTION : Recharger MANUELLEMENT le comptage
    if (plans.length > 0) {
      await loadAllPlanFeaturesCount(plans); // ✅ Appel DIRECT
    }
    
    // ✅ ET recharger les features si un plan est sélectionné
    if (selectedPlanId) {
      await loadPlanFeatures(selectedPlanId);
    }

    setNewFeatureName('');
    setNewFeaturePage('');
    setShowAddFeatureModal(false);
    
  } catch (err: any) {
    console.error('Erreur création feature:', err);
    setError(`Échec création: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const handleModuleAction = (module: string, action: 'add' | 'edit' | 'delete') => {
    setSelectedModule(module);
    setActiveModuleDropdown(null);

    const moduleFeaturesData = groupedFeatures[module] || [];

    if (action === 'add') {
      setModuleFeatures([{ name: '' }]);
      setShowModuleAddModal(true);
    } else if (action === 'edit') {
      setModuleFeatures(moduleFeaturesData.map(f => ({ name: f.name, id: f.id })));
      setShowModuleEditModal(true);
    } else if (action === 'delete') {
      setModuleFeatures(moduleFeaturesData.map(f => ({ name: f.name, id: f.id })));
      setShowModuleDeleteModal(true);
    }
  };

  const handleAddModuleFeatures = async () => {
  if (!enterprisePlan || !selectedRole) return;

  try {
    setError(null);
    setLoading(true);
    
    console.log(`Création de ${moduleFeatures.length} features pour module: ${selectedModule}`);
    
    for (const feature of moduleFeatures) {
      if (feature.name.trim()) {
        console.log(`Création: "${feature.name.trim()}"`);
        
        const newFeature = await planFeatureApi.createFeature({
          name: feature.name.trim(),
          page: selectedModule,
          parent_feature_id: null,
          role: selectedRole
        });
        
        await planFeatureApi.addFeatureToPlan(newFeature.id, enterprisePlan.id);
        console.log(`Feature créée et liée: ${newFeature.id}`);
      }
    }

    // CORRECTION : Recharger MANUELLEMENT le comptage
    if (plans.length > 0) {
      await loadAllPlanFeaturesCount(plans); // Appel DIRECT
    }
    
    // ET recharger les features si un plan est sélectionné
    if (selectedPlanId) {
      await loadPlanFeatures(selectedPlanId);
    }

    setShowModuleAddModal(false);
    setModuleFeatures([]);
    
  } catch (err: any) {
    setError(err.message);
    console.error('Erreur ajout module features:', err);
  } finally {
    setLoading(false);
  }
};
// FONCTION : Recharger toutes les données (pour delete/toggle)
const reloadAllData = async () => {
  if (!selectedRole || plans.length === 0) return;
  
  console.log('Rechargement complet des données');
  
  // 1. Recharger le comptage
  await loadAllPlanFeaturesCount(plans);
  
  // 2. Si un plan est sélectionné, recharger ses features
  if (selectedPlanId) {
    await loadPlanFeatures(selectedPlanId);
  }
};


const handleEditModuleFeatures = async () => {
  try {
    setError(null);
    
    for (const feature of moduleFeatures) {
      if (feature.id && feature.name.trim()) {
        await planFeatureApi.updateFeature(feature.id, {
          name: feature.name.trim()
        });
      }
    }

    // CORRECTION : Recharger TOUTES les données
    await reloadAllData();

    setShowModuleEditModal(false);
    setModuleFeatures([]);
  } catch (err: any) {
    setError(err.message);
    console.error('Erreur édition features:', err);
  }
};

  const handleDeleteFeature = (featureId: number, featureName: string) => {
    setFeatureToDelete({ id: featureId, name: featureName });
    setShowDeleteConfirm(true);
  };


const confirmDeleteFeature = async () => {
  if (!featureToDelete) return;

  try {
    setError(null);
    await planFeatureApi.deleteFeature(featureToDelete.id);

    // ✅ CORRECTION : Recharger TOUTES les données
    await reloadAllData();

    setModuleFeatures(prev => prev.filter(f => f.id !== featureToDelete.id));
    setShowDeleteConfirm(false);
    setFeatureToDelete(null);

    if (moduleFeatures.length <= 1) {
      setShowModuleDeleteModal(false);
    }
  } catch (err: any) {
    setError(err.message);
    console.error('Erreur suppression feature:', err);
  }
};
  const addModuleFeatureInput = () => {
    setModuleFeatures(prev => [...prev, { name: '' }]);
  };

  const updateModuleFeature = (index: number, value: string) => {
    setModuleFeatures(prev => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  const removeModuleFeatureInput = (index: number) => {
    setModuleFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoleChange = (role: 'artisan' | 'annonceur') => {
    setSelectedRole(role);
    setSelectedPlanId(null);
    setFeaturesWithStatus([]);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="plan-feature-manager12">
        <div className="empty-state12">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-feature-manager12">
      <div className="manager-header12">
        <h3>Gestion des Features des Plans</h3>
        <p style={{ lineHeight: '20px', marginTop: '12px' }}>
          Gérez les fonctionnalités disponibles pour chaque plan d'abonnement
        </p>
      </div>

      {error && (
        <div className="error-message" style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#c33',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}

      <div className="role-selector12">
        <label>Sélectionner le rôle :</label>
        <div className="role-buttons12">
          <button
            className={`role-btn12 ${selectedRole === 'artisan' ? 'active' : ''}`}
            onClick={() => handleRoleChange('artisan')}
          >
            <i className="fa-solid fa-hammer"></i>
            Artisan
          </button>
          <button
            className={`role-btn12 ${selectedRole === 'annonceur' ? 'active' : ''}`}
            onClick={() => handleRoleChange('annonceur')}
          >
            <i className="fa-solid fa-bullhorn"></i>
            Annonceur
          </button>
        </div>
      </div>

      <div className="plans-grid12">
        {rolePlans.map(plan => (
          <div
            key={plan.id}
            className={`plan-card12 ${selectedPlanId === plan.id ? 'selected' : ''} ${plan.is_enterprise ? 'enterprise' : ''}`}
            onClick={() => setSelectedPlanId(plan.id)}
          >
            <div className="plan-header12">
              <h4>{plan.name}</h4>
              {plan.is_enterprise && (
                <span className="enterprise-badge12">
                  <i className="fa-solid fa-crown"></i> Référence
                </span>
              )}
            </div>
            <div className="plan-price12">
              <span className="price12">{plan.price}€</span>
              <span className="period12">/{plan.period}</span>
            </div>
            <div className="plan-features-count12">
              <i className="fa-solid fa-check-circle"></i>
              {/* {getFeatureCount(plan.id)} fonctionnalités */}
               {getFeatureCount(plan.id)} fonctionnalités
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="features-section12">
          <div className="features-header12">
            <div>
              <h4>Fonctionnalités - {selectedPlan.name}</h4>
              <p style={{ lineHeight: '20px', marginTop: '8px' }}>
                {selectedPlan.is_enterprise
                  ? 'Plan de référence : toutes les fonctionnalités sont activées par défaut'
                  : 'Activez ou désactivez les fonctionnalités pour ce plan'
                }
              </p>
            </div>
            {selectedPlan.is_enterprise && (
              <button
                className="btn-primary12"
                onClick={() => setShowAddFeatureModal(true)}
                disabled={loading}
              >
                <i className="fa-solid fa-plus"></i>
                Ajouter une fonctionnalité
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-state12">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Chargement des fonctionnalités...</p>
            </div>
          ) : Object.keys(groupedFeatures).length > 0 ? (
            Object.entries(groupedFeatures).map(([page, features]) => (
              <div key={page} className="feature-group12">
                <div className="feature-page-title-wrapper12">
                  <h5 className="feature-page-title12">
                    <i className="fa-solid fa-folder"></i>
                    {page}
                  </h5>
                  {selectedPlan.is_enterprise && (
                    <div className="module-actions-wrapper12" ref={activeModuleDropdown === page ? dropdownRef : null}>
                      <button
                        className="module-action-btn12"
                        onClick={() => setActiveModuleDropdown(activeModuleDropdown === page ? null : page)}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                      {activeModuleDropdown === page && (
                        <div className="module-dropdown12">
                          <button
                            className="dropdown-option12"
                            onClick={() => handleModuleAction(page, 'add')}
                          >
                            <i className="fa-solid fa-plus"></i>
                            Ajouter une fonctionnalité
                          </button>
                          <button
                            className="dropdown-option12"
                            onClick={() => handleModuleAction(page, 'edit')}
                          >
                            <i className="fa-solid fa-pen"></i>
                            Modifier le module
                          </button>
                          <button
                            className="dropdown-option12 delete"
                            onClick={() => handleModuleAction(page, 'delete')}
                          >
                            <i className="fa-solid fa-trash"></i>
                            Supprimer le module
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="features-list12">
                  {features.map(feature => (
                    <div key={feature.id} className="feature-item12">
                      <div className="feature-info12">
                        <span className="feature-name12">{feature.name}</span>
                        {feature.inherited && (
                          <span className="inherited-badge">Par défaut</span>
                        )}
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={feature.enabled}
                          onChange={() => handleToggleFeature(feature.id)}
                          disabled={selectedPlan.is_enterprise || loading}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state12">
              <i className="fa-solid fa-inbox"></i>
              <p>Aucune fonctionnalité disponible pour ce plan</p>
            </div>
          )}
        </div>
      )}

      {!selectedPlan && rolePlans.length > 0 && (
        <div className="empty-state12">
          <i className="fa-solid fa-hand-pointer"></i>
          <p>Sélectionnez un plan pour gérer ses fonctionnalités</p>
        </div>
      )}

      {/* Modales (restent identiques mais avec gestion du loading) */}
      {showAddFeatureModal && (
        <div className="modal-overlay12" onClick={() => setShowAddFeatureModal(false)}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Ajouter une nouvelle fonctionnalité</h4>
              <button
                className="modal-close12"
                onClick={() => setShowAddFeatureModal(false)}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body12">
              <div className="form-group12">
                <label>Nom de la fonctionnalité</label>
                <input
                  type="text"
                  value={newFeatureName}
                  onChange={e => setNewFeatureName(e.target.value)}
                  placeholder="Ex: Gestion des projets"
                  disabled={loading}
                />
              </div>
              <div className="form-group12">
                <label>Page/Module</label>
                <input
                  type="text"
                  value={newFeaturePage}
                  onChange={e => setNewFeaturePage(e.target.value)}
                  placeholder="Ex: Projets"
                  disabled={loading}
                />
              </div>
              <p className="modal-note12">
                <i className="fa-solid fa-info-circle"></i>
                Cette fonctionnalité sera automatiquement ajoutée au plan Entreprise et activée par défaut.
                Elle sera désactivée dans les autres plans.
              </p>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => setShowAddFeatureModal(false)}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleAddNewFeature}
                disabled={!newFeatureName.trim() || !newFeaturePage.trim() || loading}
              >
                <i className="fa-solid fa-plus"></i>
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Les autres modales restent similaires avec l'ajout du paramètre loading */}
      {showModuleAddModal && (
        <div className="modal-overlay12" onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Ajouter des fonctionnalités - {selectedModule}</h4>
              <button
                className="modal-close12"
                onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body12">
              <div className="form-group12">
                <label>Module</label>
                <input
                  type="text"
                  value={selectedModule}
                  disabled
                  className="input-disabled12"
                />
              </div>
              <div className="features-inputs-list12">
                <label>Fonctionnalités</label>
                {moduleFeatures.map((feature, index) => (
                  <div key={index} className="feature-input-row12">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={e => updateModuleFeature(index, e.target.value)}
                      placeholder="Nom de la fonctionnalité"
                      disabled={loading}
                    />
                    {moduleFeatures.length > 1 && (
                      <button
                        className="btn-remove-input12"
                        onClick={() => removeModuleFeatureInput(index)}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-add-input12" onClick={addModuleFeatureInput} disabled={loading}>
                  <i className="fa-solid fa-plus"></i>
                  Ajouter une autre fonctionnalité
                </button>
              </div>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleAddModuleFeatures}
                disabled={!moduleFeatures.some(f => f.name.trim()) || loading}
              >
                <i className="fa-solid fa-check"></i>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModuleEditModal && (
        <div className="modal-overlay12" onClick={() => { setShowModuleEditModal(false); setModuleFeatures([]); }}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Modifier le module - {selectedModule}</h4>
              <button
                className="modal-close12"
                onClick={() => { setShowModuleEditModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body12">
              <div className="form-group12">
                <label>Module</label>
                <input
                  type="text"
                  value={selectedModule}
                  disabled
                  className="input-disabled12"
                />
              </div>
              <div className="features-inputs-list12">
                <label>Fonctionnalités</label>
                {moduleFeatures.map((feature, index) => (
                  <div key={index} className="feature-input-row12">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={e => updateModuleFeature(index, e.target.value)}
                      placeholder="Nom de la fonctionnalité"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowModuleEditModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleEditModuleFeatures}
                disabled={loading}
              >
                <i className="fa-solid fa-check"></i>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModuleDeleteModal && (
        <div className="modal-overlay12" onClick={() => { setShowModuleDeleteModal(false); setModuleFeatures([]); }}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Supprimer des fonctionnalités - {selectedModule}</h4>
              <button
                className="modal-close12"
                onClick={() => { setShowModuleDeleteModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body12">
              <p className="modal-note12 warning">
                <i className="fa-solid fa-exclamation-triangle"></i>
                Cliquez sur la croix à côté d'une fonctionnalité pour la supprimer définitivement.
              </p>
              <div className="delete-features-list12">
                {moduleFeatures.map((feature) => (
                  <div key={feature.id} className="delete-feature-item12">
                    <span>{feature.name}</span>
                    <button
                      className="btn-delete-feature12"
                      onClick={() => feature.id && handleDeleteFeature(feature.id, feature.name)}
                      disabled={loading}
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              {moduleFeatures.length === 0 && (
                <p className="empty-message12">Toutes les fonctionnalités ont été supprimées.</p>
              )}
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowModuleDeleteModal(false); setModuleFeatures([]); }}
                disabled={loading}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && featureToDelete && (
        <div className="modal-overlay12" onClick={() => { setShowDeleteConfirm(false); setFeatureToDelete(null); }}>
          <div className="modal-content12 modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Confirmer la suppression</h4>
              <button
                className="modal-close12"
                onClick={() => { setShowDeleteConfirm(false); setFeatureToDelete(null); }}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body12">
              <p style={{ lineHeight: '22px', fontSize: '14px' }}>
                Voulez-vous vraiment supprimer la fonctionnalité <strong>"{featureToDelete.name}"</strong> ?
              </p>
              <p className="modal-note12 warning">
                <i className="fa-solid fa-exclamation-triangle"></i>
                Cette action est irréversible et supprimera la fonctionnalité de tous les plans.
              </p>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowDeleteConfirm(false); setFeatureToDelete(null); }}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="btn-danger12"
                onClick={confirmDeleteFeature}
                disabled={loading}
              >
                <i className="fa-solid fa-trash"></i>
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanFeatureManager;
