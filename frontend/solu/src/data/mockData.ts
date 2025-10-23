// // import { Plan, Feature, FeaturePlan } from '../types';

// import type { Feature, FeaturePlan, Plan } from "../types";

// export const PLANS: Plan[] = [
//   {
//     id: 17,
//     name: 'Gratuit',
//     role: 'artisan',
//     price: 0.00,
//     period: 'mois',
//     color: '#505050'
//   },
//   {
//     id: 18,
//     name: 'TPE',
//     role: 'artisan',
//     price: 9.00,
//     period: 'mois',
//     color: '#E77131'
//   },
//   {
//     id: 19,
//     name: 'PME',
//     role: 'artisan',
//     price: 29.00,
//     period: 'mois',
//     color: '#E77131'
//   },
//   {
//     id: 20,
//     name: 'Entreprise',
//     role: 'artisan',
//     price: 69.00,
//     period: 'mois',
//     color: '#2C3E50',
//     is_enterprise: true
//   },
//   {
//     id: 21,
//     name: 'Découverte',
//     role: 'annonceur',
//     price: 0.00,
//     period: 'mois',
//     color: '#505050'
//   },
//   {
//     id: 22,
//     name: 'Standard',
//     role: 'annonceur',
//     price: 19.00,
//     period: 'mois',
//     color: '#E77131'
//   },
//   {
//     id: 23,
//     name: 'Premium',
//     role: 'annonceur',
//     price: 49.00,
//     period: 'mois',
//     color: '#E77131'
//   },
//   {
//     id: 24,
//     name: 'Entreprise',
//     role: 'annonceur',
//     price: 99.00,
//     period: 'mois',
//     color: '#2C3E50',
//     is_enterprise: true
//   }
// ];

// export const FEATURES: Feature[] = [
//   { id: 1, name: 'Créer une nouvelle société', page: 'Tableau de bord', parent_feature_id: null },
//   { id: 2, name: 'Créer/modifier un nouveau produit/prestation', page: 'Catalogue', parent_feature_id: null },
//   { id: 3, name: 'Ajouter une bibliothèque fournisseur', page: 'Catalogue', parent_feature_id: null },
//   { id: 4, name: 'Accéder/Modifier à la bibliothèque Solutravo', page: 'Catalogue', parent_feature_id: null },
//   { id: 5, name: 'Accéder aux bibliothèques fournisseurs', page: 'Catalogue', parent_feature_id: null },
//   { id: 6, name: 'Créer un devis', page: 'Devis', parent_feature_id: null },
//   { id: 7, name: 'Modifier un devis', page: 'Devis', parent_feature_id: null },
//   { id: 8, name: 'Envoyer un devis par email', page: 'Devis', parent_feature_id: null },
//   { id: 9, name: 'Connexion bancaire', page: 'Comptabilité', parent_feature_id: null },
//   { id: 10, name: 'Gestion des collaborateurs', page: 'RH', parent_feature_id: null },
//   { id: 11, name: 'Gestion des stocks', page: 'Inventaire', parent_feature_id: null },
//   { id: 12, name: 'Rapports financiers', page: 'Comptabilité', parent_feature_id: null },
//   { id: 13, name: 'Support prioritaire', page: 'Support', parent_feature_id: null },
//   { id: 14, name: 'API personnalisée', page: 'Développeur', parent_feature_id: null },
//   { id: 15, name: 'Formation équipe', page: 'Formation', parent_feature_id: null },
//   { id: 16, name: 'Créer une annonce', page: 'Annonces', parent_feature_id: null },
//   { id: 17, name: 'Modifier une annonce', page: 'Annonces', parent_feature_id: null },
//   { id: 18, name: 'Statistiques des annonces', page: 'Annonces', parent_feature_id: null },
//   { id: 19, name: 'Annonces mises en avant', page: 'Annonces', parent_feature_id: null },
//   { id: 20, name: 'Annonces illimitées', page: 'Annonces', parent_feature_id: null }
// ];

// export const FEATURE_PLANS: FeaturePlan[] = [
//   { feature_id: 1, plan_id: 18 },
//   { feature_id: 1, plan_id: 19 },
//   { feature_id: 1, plan_id: 20 },
//   { feature_id: 2, plan_id: 17 },
//   { feature_id: 2, plan_id: 18 },
//   { feature_id: 2, plan_id: 19 },
//   { feature_id: 2, plan_id: 20 },
//   { feature_id: 3, plan_id: 18 },
//   { feature_id: 3, plan_id: 19 },
//   { feature_id: 3, plan_id: 20 },
//   { feature_id: 4, plan_id: 18 },
//   { feature_id: 4, plan_id: 19 },
//   { feature_id: 4, plan_id: 20 },
//   { feature_id: 5, plan_id: 19 },
//   { feature_id: 5, plan_id: 20 },
//   { feature_id: 6, plan_id: 17 },
//   { feature_id: 6, plan_id: 18 },
//   { feature_id: 6, plan_id: 19 },
//   { feature_id: 6, plan_id: 20 },
//   { feature_id: 7, plan_id: 18 },
//   { feature_id: 7, plan_id: 19 },
//   { feature_id: 7, plan_id: 20 },
//   { feature_id: 8, plan_id: 18 },
//   { feature_id: 8, plan_id: 19 },
//   { feature_id: 8, plan_id: 20 },
//   { feature_id: 9, plan_id: 18 },
//   { feature_id: 9, plan_id: 19 },
//   { feature_id: 9, plan_id: 20 },
//   { feature_id: 10, plan_id: 19 },
//   { feature_id: 10, plan_id: 20 },
//   { feature_id: 11, plan_id: 19 },
//   { feature_id: 11, plan_id: 20 },
//   { feature_id: 12, plan_id: 20 },
//   { feature_id: 13, plan_id: 20 },
//   { feature_id: 14, plan_id: 20 },
//   { feature_id: 15, plan_id: 20 },
//   { feature_id: 16, plan_id: 21 },
//   { feature_id: 16, plan_id: 22 },
//   { feature_id: 16, plan_id: 23 },
//   { feature_id: 16, plan_id: 24 },
//   { feature_id: 17, plan_id: 22 },
//   { feature_id: 17, plan_id: 23 },
//   { feature_id: 17, plan_id: 24 },
//   { feature_id: 18, plan_id: 22 },
//   { feature_id: 18, plan_id: 23 },
//   { feature_id: 18, plan_id: 24 },
//   { feature_id: 19, plan_id: 23 },
//   { feature_id: 19, plan_id: 24 },
//   { feature_id: 20, plan_id: 24 }
// ];
