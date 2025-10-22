// import { useState, useMemo } from 'react';
// import '../styles/PlanFeatureManager.css';
// import { FEATURE_PLANS, FEATURES, PLANS } from '../data/mockData';
// import type { Feature, FeatureWithStatus } from '../types';

// const PlanFeatureManager = () => {
//     const [selectedRole, setSelectedRole] = useState<'artisan' | 'annonceur'>('artisan');
//     const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
//     const [featurePlansState, setFeaturePlansState] = useState(FEATURE_PLANS);
//     const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
//     const [newFeatureName, setNewFeatureName] = useState('');
//     const [newFeaturePage, setNewFeaturePage] = useState('');

//     const rolePlans = useMemo(() => {
//         return PLANS.filter(plan => plan.role === selectedRole);
//     }, [selectedRole]);

//     const enterprisePlan = useMemo(() => {
//         return rolePlans.find(plan => plan.is_enterprise);
//     }, [rolePlans]);

//     const selectedPlan = useMemo(() => {
//         return rolePlans.find(plan => plan.id === selectedPlanId);
//     }, [rolePlans, selectedPlanId]);

//     const relevantFeatures = useMemo(() => {
//         if (!enterprisePlan) return [];

//         const enterpriseFeatureIds = featurePlansState
//             .filter(fp => fp.plan_id === enterprisePlan.id)
//             .map(fp => fp.feature_id);

//         return FEATURES.filter(f => enterpriseFeatureIds.includes(f.id));
//     }, [enterprisePlan, featurePlansState]);

//     const featuresWithStatus = useMemo((): FeatureWithStatus[] => {
//         if (!selectedPlan) return [];

//         return relevantFeatures.map(feature => {
//             const isEnabled = featurePlansState.some(
//                 fp => fp.feature_id === feature.id && fp.plan_id === selectedPlan.id
//             );

//             return {
//                 ...feature,
//                 enabled: isEnabled,
//                 inherited: selectedPlan.is_enterprise
//             };
//         });
//     }, [selectedPlan, relevantFeatures, featurePlansState]);

//     const groupedFeatures = useMemo(() => {
//         const grouped: Record<string, FeatureWithStatus[]> = {};

//         featuresWithStatus.forEach(feature => {
//             if (!grouped[feature.page]) {
//                 grouped[feature.page] = [];
//             }
//             grouped[feature.page].push(feature);
//         });

//         return grouped;
//     }, [featuresWithStatus]);

//     const handleToggleFeature = (featureId: number) => {
//         if (!selectedPlan || selectedPlan.is_enterprise) return;

//         const existingIndex = featurePlansState.findIndex(
//             fp => fp.feature_id === featureId && fp.plan_id === selectedPlan.id
//         );

//         if (existingIndex >= 0) {
//             setFeaturePlansState(prev =>
//                 prev.filter((_, index) => index !== existingIndex)
//             );
//         } else {
//             setFeaturePlansState(prev => [
//                 ...prev,
//                 { feature_id: featureId, plan_id: selectedPlan.id }
//             ]);
//         }
//     };

//     const handleAddNewFeature = () => {
//         if (!newFeatureName.trim() || !newFeaturePage.trim() || !enterprisePlan) return;

//         const newFeatureId = Math.max(...FEATURES.map(f => f.id)) + 1;
//         const newFeature: Feature = {
//             id: newFeatureId,
//             name: newFeatureName,
//             page: newFeaturePage,
//             parent_feature_id: null
//         };

//         FEATURES.push(newFeature);

//         setFeaturePlansState(prev => [
//             ...prev,
//             { feature_id: newFeatureId, plan_id: enterprisePlan.id }
//         ]);

//         setNewFeatureName('');
//         setNewFeaturePage('');
//         setShowAddFeatureModal(false);
//     };

//     const getFeatureCount = (planId: number) => {
//         return featurePlansState.filter(fp => fp.plan_id === planId).length;
//     };

//     return (
//         <div className="plan-feature-manager12">
//             <div className="manager-header12">
//                 <h3>Gestion des Features des Plans</h3>
//                 <p style={{ lineHeight: '20px', marginTop: '12px' }}>
//                     Gérez les fonctionnalités disponibles pour chaque plan d'abonnement
//                 </p>
//             </div>

//             <div className="role-selector12">
//                 <label>Sélectionner le rôle :</label>
//                 <div className="role-buttons12">
//                     <button
//                         className={`role-btn12 ${selectedRole === 'artisan' ? 'active' : ''}`}
//                         onClick={() => {
//                             setSelectedRole('artisan');
//                             setSelectedPlanId(null);
//                         }}
//                     >
//                         <i className="fa-solid fa-hammer"></i>
//                         Artisan
//                     </button>
//                     <button
//                         className={`role-btn12 ${selectedRole === 'annonceur' ? 'active' : ''}`}
//                         onClick={() => {
//                             setSelectedRole('annonceur');
//                             setSelectedPlanId(null);
//                         }}
//                     >
//                         <i className="fa-solid fa-bullhorn"></i>
//                         Annonceur
//                     </button>
//                 </div>
//             </div>

//             <div className="plans-grid12">
//                 {rolePlans.map(plan => (
//                     <div
//                         key={plan.id}
//                         className={`plan-card12 ${selectedPlanId === plan.id ? 'selected' : ''} ${plan.is_enterprise ? 'enterprise' : ''}`}
//                         onClick={() => setSelectedPlanId(plan.id)}
//                     >
//                         <div className="plan-header12">
//                             <h4>{plan.name}</h4>
//                             {plan.is_enterprise && (
//                                 <span className="enterprise-badge12">
//                                     <i className="fa-solid fa-crown"></i> Référence
//                                 </span>
//                             )}
//                         </div>
//                         <div className="plan-price12">
//                             <span className="price12">{plan.price}€   <span className="period12">/{plan.period}</span></span>
//                             {/* <span className="period">/{plan.period}</span>  */}
//                         </div>
//                         <div className="plan-features-count12">
//                             <i className="fa-solid fa-check-circle"></i>
//                             {getFeatureCount(plan.id)} fonctionnalités
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {selectedPlan && (
//                 <div className="features-section12">
//                     <div className="features-header12">
//                         <div>
//                             <h4>Fonctionnalités - {selectedPlan.name}</h4>
//                             <p style={{ lineHeight: '20px', marginTop: '8px' }}>
//                                 {selectedPlan.is_enterprise
//                                     ? 'Plan de référence : toutes les fonctionnalités sont activées par défaut'
//                                     : 'Activez ou désactivez les fonctionnalités pour ce plan'
//                                 }
//                             </p>
//                         </div>
//                         {selectedPlan.is_enterprise && (
//                             <button
//                                 className="btn-primary12"
//                                 onClick={() => setShowAddFeatureModal(true)}
//                             >
//                                 <i className="fa-solid fa-plus"></i>
//                                 Ajouter une fonctionnalité
//                             </button>
//                         )}
//                     </div>

//                     {Object.entries(groupedFeatures).map(([page, features]) => (
//                         <div key={page} className="feature-group12">
//                             <h5 className="feature-page-title12">
//                                 <i className="fa-solid fa-folder"></i>
//                                 {page}
//                             </h5>
//                             <div className="features-list12">
//                                 {features.map(feature => (
//                                     <div key={feature.id} className="feature-item12">
//                                         <div className="feature-info12">
//                                             <span className="feature-name12">{feature.name}</span>
//                                             {feature.inherited && (
//                                                 <span className="inherited-badge">Par défaut</span>
//                                             )}
//                                         </div>
//                                         <label className="toggle-switch">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={feature.enabled}
//                                                 onChange={() => handleToggleFeature(feature.id)}
//                                                 disabled={selectedPlan.is_enterprise}
//                                             />
//                                             <span className="toggle-slider"></span>
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}

//                     {Object.keys(groupedFeatures).length === 0 && (
//                         <div className="empty-state12">
//                             <i className="fa-solid fa-inbox"></i>
//                             <p>Aucune fonctionnalité disponible pour ce plan</p>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {!selectedPlan && rolePlans.length > 0 && (
//                 <div className="empty-state12">
//                     <i className="fa-solid fa-hand-pointer"></i>
//                     <p>Sélectionnez un plan pour gérer ses fonctionnalités</p>
//                 </div>
//             )}

//             {showAddFeatureModal && (
//                 <div className="modal-overlay12" onClick={() => setShowAddFeatureModal(false)}>
//                     <div className="modal-content12" onClick={e => e.stopPropagation()}>
//                         <div className="modal-header12">
//                             <h4>Ajouter une nouvelle fonctionnalité</h4>
//                             <button
//                                 className="modal-close12"
//                                 onClick={() => setShowAddFeatureModal(false)}
//                             >
//                                 <i className="fa-solid fa-times"></i>
//                             </button>
//                         </div>
//                         <div className="modal-body12">
//                             <div className="form-group12">
//                                 <label>Nom de la fonctionnalité</label>
//                                 <input
//                                     type="text"
//                                     value={newFeatureName}
//                                     onChange={e => setNewFeatureName(e.target.value)}
//                                     placeholder="Ex: Gestion des projets"
//                                 />
//                             </div>
//                             <div className="form-group12">
//                                 <label>Page/Module</label>
//                                 <input
//                                     type="text"
//                                     value={newFeaturePage}
//                                     onChange={e => setNewFeaturePage(e.target.value)}
//                                     placeholder="Ex: Projets"
//                                 />
//                             </div>
//                             <p className="modal-note12">
//                                 <i className="fa-solid fa-info-circle"></i>
//                                 Cette fonctionnalité sera automatiquement ajoutée au plan Entreprise et activée par défaut.
//                                 Elle sera désactivée dans les autres plans.
//                             </p>
//                         </div>
//                         <div className="modal-footer12">
//                             <button
//                                 className="btn-secondary12"
//                                 onClick={() => setShowAddFeatureModal(false)}
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 className="btn-primary12"
//                                 onClick={handleAddNewFeature}
//                                 disabled={!newFeatureName.trim() || !newFeaturePage.trim()}
//                             >
//                                 <i className="fa-solid fa-plus"></i>
//                                 Ajouter
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PlanFeatureManager;


// import { useState, useMemo, useRef, useEffect } from 'react';
// import { Plan, Feature, FeatureWithStatus } from '../types';
// import { PLANS, FEATURES, FEATURE_PLANS } from '../data/mockData';
// import '../styles/PlanFeatureManager.css'
import { useState, useMemo,useRef, useEffect } from 'react';
import '../styles/PlanFeatureManager.css';
import { FEATURE_PLANS, FEATURES, PLANS } from '../data/mockData';
import type { Feature, FeatureWithStatus } from '../types';

const PlanFeatureManager = () => {
  const [selectedRole, setSelectedRole] = useState<'artisan' | 'annonceur'>('artisan');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [featurePlansState, setFeaturePlansState] = useState(FEATURE_PLANS);
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

  const rolePlans = useMemo(() => {
    return PLANS.filter(plan => plan.role === selectedRole);
  }, [selectedRole]);

  const enterprisePlan = useMemo(() => {
    return rolePlans.find(plan => plan.is_enterprise);
  }, [rolePlans]);

  const selectedPlan = useMemo(() => {
    return rolePlans.find(plan => plan.id === selectedPlanId);
  }, [rolePlans, selectedPlanId]);

  const relevantFeatures = useMemo(() => {
    if (!enterprisePlan) return [];

    const enterpriseFeatureIds = featurePlansState
      .filter(fp => fp.plan_id === enterprisePlan.id)
      .map(fp => fp.feature_id);

    return FEATURES.filter(f => enterpriseFeatureIds.includes(f.id));
  }, [enterprisePlan, featurePlansState]);

  const featuresWithStatus = useMemo((): FeatureWithStatus[] => {
    if (!selectedPlan) return [];

    return relevantFeatures.map(feature => {
      const isEnabled = featurePlansState.some(
        fp => fp.feature_id === feature.id && fp.plan_id === selectedPlan.id
      );

      return {
        ...feature,
        enabled: isEnabled,
        inherited: selectedPlan.is_enterprise
      };
    });
  }, [selectedPlan, relevantFeatures, featurePlansState]);

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

  const handleToggleFeature = (featureId: number) => {
    if (!selectedPlan || selectedPlan.is_enterprise) return;

    const existingIndex = featurePlansState.findIndex(
      fp => fp.feature_id === featureId && fp.plan_id === selectedPlan.id
    );

    if (existingIndex >= 0) {
      setFeaturePlansState(prev =>
        prev.filter((_, index) => index !== existingIndex)
      );
    } else {
      setFeaturePlansState(prev => [
        ...prev,
        { feature_id: featureId, plan_id: selectedPlan.id }
      ]);
    }
  };

  const handleAddNewFeature = () => {
    if (!newFeatureName.trim() || !newFeaturePage.trim() || !enterprisePlan) return;

    const newFeatureId = Math.max(...FEATURES.map(f => f.id)) + 1;
    const newFeature: Feature = {
      id: newFeatureId,
      name: newFeatureName,
      page: newFeaturePage,
      parent_feature_id: null
    };

    FEATURES.push(newFeature);

    setFeaturePlansState(prev => [
      ...prev,
      { feature_id: newFeatureId, plan_id: enterprisePlan.id }
    ]);

    setNewFeatureName('');
    setNewFeaturePage('');
    setShowAddFeatureModal(false);
  };

  const getFeatureCount = (planId: number) => {
    return featurePlansState.filter(fp => fp.plan_id === planId).length;
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

  const handleAddModuleFeatures = () => {
    if (!enterprisePlan) return;

    moduleFeatures.forEach(feature => {
      if (feature.name.trim()) {
        const newFeatureId = Math.max(...FEATURES.map(f => f.id), 0) + 1;
        const newFeature: Feature = {
          id: newFeatureId,
          name: feature.name,
          page: selectedModule,
          parent_feature_id: null
        };

        FEATURES.push(newFeature);

        setFeaturePlansState(prev => [
          ...prev,
          { feature_id: newFeatureId, plan_id: enterprisePlan.id }
        ]);
      }
    });

    setShowModuleAddModal(false);
    setModuleFeatures([]);
  };

  const handleEditModuleFeatures = () => {
    moduleFeatures.forEach(feature => {
      if (feature.id && feature.name.trim()) {
        const featureIndex = FEATURES.findIndex(f => f.id === feature.id);
        if (featureIndex >= 0) {
          FEATURES[featureIndex].name = feature.name;
        }
      }
    });

    setShowModuleEditModal(false);
    setModuleFeatures([]);
  };

  const handleDeleteFeature = (featureId: number, featureName: string) => {
    setFeatureToDelete({ id: featureId, name: featureName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFeature = () => {
    if (!featureToDelete) return;

    const featureIndex = FEATURES.findIndex(f => f.id === featureToDelete.id);
    if (featureIndex >= 0) {
      FEATURES.splice(featureIndex, 1);
    }

    setFeaturePlansState(prev =>
      prev.filter(fp => fp.feature_id !== featureToDelete.id)
    );

    setModuleFeatures(prev => prev.filter(f => f.id !== featureToDelete.id));
    setShowDeleteConfirm(false);
    setFeatureToDelete(null);

    if (moduleFeatures.length <= 1) {
      setShowModuleDeleteModal(false);
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

  return (
    <div className="plan-feature-manager12">
      <div className="manager-header12">
        <h3>Gestion des Features des Plans</h3>
        <p style={{ lineHeight: '20px', marginTop: '12px' }}>
          Gérez les fonctionnalités disponibles pour chaque plan d'abonnement
        </p>
      </div>

      <div className="role-selector12">
        <label>Sélectionner le rôle :</label>
        <div className="role-buttons12">
          <button
            className={`role-btn12 ${selectedRole === 'artisan' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('artisan');
              setSelectedPlanId(null);
            }}
          >
            <i className="fa-solid fa-hammer"></i>
            Artisan
          </button>
          <button
            className={`role-btn12 ${selectedRole === 'annonceur' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('annonceur');
              setSelectedPlanId(null);
            }}
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
              >
                <i className="fa-solid fa-plus"></i>
                Ajouter une fonctionnalité
              </button>
            )}
          </div>

          {Object.entries(groupedFeatures).map(([page, features]) => (
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
                        disabled={selectedPlan.is_enterprise}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedFeatures).length === 0 && (
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

      {showAddFeatureModal && (
        <div className="modal-overlay12" onClick={() => setShowAddFeatureModal(false)}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Ajouter une nouvelle fonctionnalité</h4>
              <button
                className="modal-close12"
                onClick={() => setShowAddFeatureModal(false)}
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
                />
              </div>
              <div className="form-group12">
                <label>Page/Module</label>
                <input
                  type="text"
                  value={newFeaturePage}
                  onChange={e => setNewFeaturePage(e.target.value)}
                  placeholder="Ex: Projets"
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
                className="btn-secondary"
                onClick={() => setShowAddFeatureModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleAddNewFeature}
                disabled={!newFeatureName.trim() || !newFeaturePage.trim()}
              >
                <i className="fa-solid fa-plus"></i>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showModuleAddModal && (
        <div className="modal-overlay12" onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Ajouter des fonctionnalités - {selectedModule}</h4>
              <button
                className="modal-close12"
                onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}
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
                    />
                    {moduleFeatures.length > 1 && (
                      <button
                        className="btn-remove-input12"
                        onClick={() => removeModuleFeatureInput(index)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-add-input12" onClick={addModuleFeatureInput}>
                  <i className="fa-solid fa-plus"></i>
                  Ajouter une autre fonctionnalité
                </button>
              </div>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleAddModuleFeatures}
                disabled={!moduleFeatures.some(f => f.name.trim())}
              >
                <i className="fa-solid fa-check"></i>
                Enregistrer
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
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => { setShowModuleEditModal(false); setModuleFeatures([]); }}
              >
                Annuler
              </button>
              <button
                className="btn-primary12"
                onClick={handleEditModuleFeatures}
              >
                <i className="fa-solid fa-check"></i>
                Enregistrer
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
              >
                Annuler
              </button>
              <button
                className="btn-danger12"
                onClick={confirmDeleteFeature}
              >
                <i className="fa-solid fa-trash"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanFeatureManager;
