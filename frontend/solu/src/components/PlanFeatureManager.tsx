
import { useState, useMemo, useRef, useEffect } from 'react';
import '../styles/PlanFeatureManager.css';

import type { Plan, FeatureWithStatus } from '../types';
import { planFeatureApi } from '../services/planFeatureService';
import ImageWithLoader from './ImageWithLoader';

const PlanFeatureManager = () => {
  const [selectedRole, setSelectedRole] = useState<'artisan' | 'annonceur' | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [featuresWithStatus, setFeaturesWithStatus] = useState<FeatureWithStatus[]>([]);
  const [planFeaturesCount, setPlanFeaturesCount] = useState<{ [key: number]: number }>({});
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
  // const [moduleFeatures, setModuleFeatures] = useState<Array<{ name: string; id?: number }>>([]);
  const [featureToDelete, setFeatureToDelete] = useState<{ id: number; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [newFeatureImage, setNewFeatureImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [moduleFeatures, setModuleFeatures] = useState<Array<{
    name: string;
    id?: number;
    description?: string;
    image_url?: string;
    newImage?: File | null;
    imagePreview?: string | null;
  }>>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  // Fonction pour normaliser les URLs d'images
const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Corriger localhost
  if (url.includes('localhost')) {
    // return url.replace(/http:\/\/localhost:\d+/, 'https://solutravo.zeta-app.fr');
    return url.replace(/http:\/\/localhost:\d+/, 'https://solutravo.zeta-app.fr');
  }
  
  // Corriger URL relative
  if (url.startsWith('/uploads')) {http://localhost:3000
    // return `https://solutravo.zeta-app.fr${url}`;
    return `https://solutravo.zeta-app.fr${url}`
     
  }
  
  return url;
};


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
    const counts: { [key: number]: number } = {};

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
        console.warn('Aucun rôle sélectionné');
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

      //  Recharger TOUTES les données
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
    setLoading(true);

    //Appel simplifié avec imageFile
    const newFeature = await planFeatureApi.createFeature({
      name: newFeatureName.trim(),
      page: newFeaturePage.trim(),
      description: newFeatureDescription.trim() || undefined,
      imageFile: newFeatureImage || undefined, //Passer le fichier directement
      parent_feature_id: null,
      role: selectedRole
    });

    console.log(`Feature créée:`, newFeature);

    // Recharger les données
    if (plans.length > 0) {
      await loadAllPlanFeaturesCount(plans);
    }

    if (selectedPlanId) {
      await loadPlanFeatures(selectedPlanId);
    }

    // Réinitialiser
    setNewFeatureName('');
    setNewFeaturePage('');
    setNewFeatureDescription('');
    setNewFeatureImage(null);
    setImagePreview(null);
    setShowAddFeatureModal(false);

  } catch (err: any) {
    console.error('Erreur création feature:', err);
    setError(`Échec création: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  /****image upload */
  // AJOUTER cette fonction
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFeatureImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewFeatureImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /****apres handleDrop */
  //Gestion des images pour les features du module
  const handleModuleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModuleFeatures(prev => {
          const updated = [...prev];
          updated[index].newImage = file;
          updated[index].imagePreview = reader.result as string;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModuleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModuleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModuleFeatures(prev => {
          const updated = [...prev];
          updated[index].newImage = file;
          updated[index].imagePreview = reader.result as string;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeModuleImage = (index: number) => {
    setModuleFeatures(prev => {
      const updated = [...prev];
      updated[index].newImage = null;
      updated[index].imagePreview = null;
      return updated;
    });
  };

  const updateModuleDescription = (index: number, value: string) => {
    setModuleFeatures(prev => {
      const updated = [...prev];
      updated[index].description = value;
      return updated;
    });
  };

  /***** */

  const handleModuleAction = (module: string, action: 'add' | 'edit' | 'delete') => {
    setSelectedModule(module);
    setActiveModuleDropdown(null);

    const moduleFeaturesData = groupedFeatures[module] || [];

    if (action === 'add') {
      //MODIFICATION : Inclure description et image
      setModuleFeatures([{
        name: '',
        description: '',
        newImage: null,
        imagePreview: null
      }]);
      setShowModuleAddModal(true);
    } else if (action === 'edit') {
      //MODIFICATION : Charger nom, description, image
      setModuleFeatures(moduleFeaturesData.map(f => ({
        name: f.name,
        id: f.id,
        description: f.description || '',
        image_url: f.image_url,
        imagePreview: normalizeImageUrl(f.image_url),
        newImage: null
      })));
      setShowModuleEditModal(true);
    } else if (action === 'delete') {
      setModuleFeatures(moduleFeaturesData.map(f => ({
        name: f.name,
        id: f.id,
        description: f.description,
        image_url: f.image_url
      })));
      setShowModuleDeleteModal(true);
    }
  };


  const handleAddModuleFeatures = async () => {
  if (!enterprisePlan || !selectedRole) return;

  try {
    setError(null);
    setLoading(true);

    for (const feature of moduleFeatures) {
      if (feature.name.trim()) {
        //Upload + Création simplifiés
        const newFeature = await planFeatureApi.createFeature({
          name: feature.name.trim(),
          page: selectedModule,
          description: feature.description?.trim() || undefined,
          imageFile: feature.newImage || undefined, //Direct
          parent_feature_id: null,
          role: selectedRole
        });

        await planFeatureApi.addFeatureToPlan(newFeature.id, enterprisePlan.id);
        console.log(`Feature créée: ${newFeature.id}`);
      }
    }

    // Recharger
    if (plans.length > 0) {
      await loadAllPlanFeaturesCount(plans);
    }

    if (selectedPlanId) {
      await loadPlanFeatures(selectedPlanId);
    }

    setShowModuleAddModal(false);
    setModuleFeatures([]);

  } catch (err: any) {
    setError(err.message);
    console.error('Erreur ajout:', err);
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
    setLoading(true);

    for (const feature of moduleFeatures) {
      if (feature.id) {
        //Update simplifié
        await planFeatureApi.updateFeature(feature.id, {
          name: feature.name.trim(),
          description: feature.description?.trim() || undefined,
          imageFile: feature.newImage || undefined, //Direct
          image_url: feature.newImage ? undefined : feature.image_url // Garde l'ancienne si pas de nouvelle
        });
      }
    }

    await reloadAllData();

    setShowModuleEditModal(false);
    setModuleFeatures([]);
  } catch (err: any) {
    setError(err.message);
    console.error('Erreur édition:', err);
  } finally {
    setLoading(false);
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

      //Recharger TOUTES les données
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
    setModuleFeatures(prev => [...prev, {
      name: '',
      description: '',
      newImage: null,
      imagePreview: null
    }]);
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
        {/*Afficher l'image avec loader */}
        {feature.image_url && (
          <ImageWithLoader
            src={feature.image_url}
            alt={feature.name}
            className="feature-thumbnail"
          />
        )}
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


      {showAddFeatureModal && (
        <div className="modal-overlay12 modal-overlay13" onClick={() => {
          setShowAddFeatureModal(false);
          setNewFeatureName('');
          setNewFeaturePage('');
          setNewFeatureDescription('');
          setNewFeatureImage(null);
          setImagePreview(null);
        }}>
          <div className="modal-content12" onClick={e => e.stopPropagation()}>
            <div className="modal-header12">
              <h4>Ajouter une nouvelle fonctionnalité</h4>
              <button
                className="modal-close12"
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setNewFeatureName('');
                  setNewFeaturePage('');
                  setNewFeatureDescription('');
                  setNewFeatureImage(null);
                  setImagePreview(null);
                }}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body12">
              {/* Page/Module */}
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

              {/* Nom */}
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

              {/*Description */}
              <div className="form-group12">
                <label>Description</label>
                <textarea
                  value={newFeatureDescription}
                  onChange={e => setNewFeatureDescription(e.target.value)}
                  placeholder="Décrivez cette fonctionnalité..."
                  disabled={loading}
                />
              </div>

              {/*Upload d'image */}
              <div className="form-group12">
                <label>Image de la fonctionnalité</label>
                <div
                  className={`image-upload-zone12 ${imagePreview ? 'has-image' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !imagePreview && document.getElementById('file-input-add')?.click()}
                >
                  {imagePreview ? (
                    <div className="image-preview-container12">
                      <img src={imagePreview} alt="Aperçu" className="image-preview12" />
                      <button
                        className="image-remove-btn12"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewFeatureImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-content12">
                      <i className="fa-solid fa-cloud-upload-alt image-upload-icon12"></i>
                      <p className="image-upload-text12">Cliquez ou déposez une image</p>
                      <p className="image-upload-hint12">PNG, JPG, WEBP (max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-input-add"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-file-input12"
                />
              </div>

              <p className="modal-note12">
                <i className="fa-solid fa-info-circle"></i>
                Cette fonctionnalité sera automatiquement ajoutée au plan Entreprise et activée par défaut.
              </p>
            </div>

            <div className="modal-footer12">
              <button
                className="btn-secondary12"
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setNewFeatureName('');
                  setNewFeaturePage('');
                  setNewFeatureDescription('');
                  setNewFeatureImage(null);
                  setImagePreview(null);
                }}
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
        <div className="modal-overlay12 modal-overlay13" onClick={() => { setShowModuleAddModal(false); setModuleFeatures([]); }}>
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
                  <div key={index} className="feature-block12">
                    {/* Nom */}
                    <div className="feature-input-row12">
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

                    {/*Description */}
                    <div className="form-group12" style={{ marginTop: '12px' }}>
                      <textarea
                        value={feature.description || ''}
                        onChange={e => updateModuleDescription(index, e.target.value)}
                        placeholder="Description de la fonctionnalité..."
                        disabled={loading}
                        style={{ minHeight: '80px' }}
                      />
                    </div>

                    {/*Image */}
                    <div className="form-group12" style={{ marginTop: '12px' }}>
                      <div
                        className={`image-upload-zone12 ${feature.imagePreview ? 'has-image' : ''}`}
                        onDragOver={handleModuleDragOver}
                        onDrop={(e) => handleModuleDrop(index, e)}
                        onClick={() => !feature.imagePreview && document.getElementById(`file-input-module-add-${index}`)?.click()}
                      >
                        {feature.imagePreview ? (
                          <div className="image-preview-container12">
                            <img src={feature.imagePreview} alt="Aperçu" className="image-preview12" />
                            <button
                              className="image-remove-btn12"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeModuleImage(index);
                              }}
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="image-upload-content12">
                            <i className="fa-solid fa-cloud-upload-alt image-upload-icon12"></i>
                            <p className="image-upload-text12">Cliquez ou déposez une image</p>
                            <p className="image-upload-hint12">PNG, JPG, WEBP (max 10MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        id={`file-input-module-add-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleModuleImageChange(index, e)}
                        className="hidden-file-input12"
                      />
                    </div>

                    {/* Séparateur entre fonctionnalités */}
                    {index < moduleFeatures.length - 1 && (
                      <div style={{
                        borderBottom: '2px dashed var(--color-border)',
                        margin: '24px 0'
                      }}></div>
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
        <div className="modal-overlay12 modal-overlay13" onClick={() => { setShowModuleEditModal(false); setModuleFeatures([]); }}>
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
                  <div key={index} className="feature-block12">
                    {/* Nom */}
                    <div className="feature-input-row12">
                      <input
                        type="text"
                        value={feature.name}
                        onChange={e => updateModuleFeature(index, e.target.value)}
                        placeholder="Nom de la fonctionnalité"
                        disabled={loading}
                      />
                    </div>

                    {/*Description */}
                    <div className="form-group12" style={{ marginTop: '12px' }}>
                      <textarea
                        value={feature.description || ''}
                        onChange={e => updateModuleDescription(index, e.target.value)}
                        placeholder="Description de la fonctionnalité..."
                        disabled={loading}
                        style={{ minHeight: '80px' }}
                      />
                    </div>

                    {/*Image */}
                    <div className="form-group12" style={{ marginTop: '12px' }}>
                      <div
                        className={`image-upload-zone12 ${feature.imagePreview ? 'has-image' : ''}`}
                        onDragOver={handleModuleDragOver}
                        onDrop={(e) => handleModuleDrop(index, e)}
                        onClick={() => !feature.imagePreview && document.getElementById(`file-input-module-edit-${index}`)?.click()}
                      >
                        {feature.imagePreview ? (
                          <div className="image-preview-container12">
                            <img src={feature.imagePreview} alt="Aperçu" className="image-preview12" />
                            <button
                              className="image-remove-btn12"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeModuleImage(index);
                              }}
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="image-upload-content12">
                            <i className="fa-solid fa-cloud-upload-alt image-upload-icon12"></i>
                            <p className="image-upload-text12">Cliquez ou déposez une image</p>
                            <p className="image-upload-hint12">PNG, JPG, WEBP (max 10MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        id={`file-input-module-edit-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleModuleImageChange(index, e)}
                        className="hidden-file-input12"
                      />
                    </div>

                    {/* Séparateur entre fonctionnalités */}
                    {index < moduleFeatures.length - 1 && (
                      <div style={{
                        borderBottom: '2px dashed var(--color-border)',
                        margin: '24px 0'
                      }}></div>
                    )}
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

