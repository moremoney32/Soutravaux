// import type { Activite, Departement, PreSociete, Societe } from "../types/pushNotifications";


// export const mockPreSocietes: PreSociete[] = [
//   { id: 'ps1', name: 'Pré-Société Electricité Martin', email: 'martin@email.com', createdDate: '2025-01-15', isNotified: false, group: 'artisan' },
//   { id: 'ps2', name: 'Pré-Société Plomberie Durand', email: 'durand@email.com', createdDate: '2025-01-20', isNotified: true, group: 'artisan' },
//   { id: 'ps3', name: 'Pré-Société Menuiserie Blanc', email: 'blanc@email.com', createdDate: '2025-02-01', isNotified: false, group: 'artisan' },
//   { id: 'ps4', name: 'Pré-Société Pub Digital', email: 'pubdigital@email.com', createdDate: '2025-01-18', isNotified: true, group: 'annonceur' },
//   { id: 'ps5', name: 'Pré-Société Marketing Pro', email: 'marketing@email.com', createdDate: '2025-02-05', isNotified: false, group: 'annonceur' },
//   { id: 'ps6', name: 'Pré-Société Matériaux Pro', email: 'materiaux@email.com', createdDate: '2025-01-25', isNotified: false, group: 'fournisseur' },
//   { id: 'ps7', name: 'Pré-Société Outillage Plus', email: 'outillage@email.com', createdDate: '2025-02-10', isNotified: true, group: 'fournisseur' },
//   { id: 'ps8', name: 'Pré-Société Peinture Dubois', email: 'dubois@email.com', createdDate: '2025-01-12', isNotified: false, group: 'artisan' },
//   { id: 'ps9', name: 'Pré-Société Chauffage Bernard', email: 'bernard@email.com', createdDate: '2025-02-08', isNotified: false, group: 'artisan' },
//   { id: 'ps10', name: 'Pré-Société Com Express', email: 'comexpress@email.com', createdDate: '2025-01-22', isNotified: true, group: 'annonceur' },
// ];

// export const mockSocietes: Societe[] = [
//   { id: 's1', name: 'Electricité Martin SARL', email: 'contact@martin-elec.com', createdDate: '2024-06-15', isNotified: true, group: 'artisan', activite: 'act1', departement: 'dep1' },
//   { id: 's2', name: 'Plomberie Durand & Fils', email: 'info@durand-plomberie.com', createdDate: '2024-08-20', isNotified: false, group: 'artisan', activite: 'act2', departement: 'dep1' },
//   { id: 's3', name: 'Menuiserie Blanc SAS', email: 'contact@blanc-menuiserie.com', createdDate: '2024-09-10', isNotified: false, group: 'artisan', activite: 'act3', departement: 'dep2' },
//   { id: 's4', name: 'Pub Digital France', email: 'hello@pubdigital.fr', createdDate: '2024-07-05', isNotified: true, group: 'annonceur', activite: 'act6', departement: 'dep3' },
//   { id: 's5', name: 'Marketing Pro Solutions', email: 'contact@marketingpro.fr', createdDate: '2024-10-12', isNotified: false, group: 'annonceur', activite: 'act6', departement: 'dep4' },
//   { id: 's6', name: 'Matériaux Pro Distribution', email: 'commercial@materiauxpro.com', createdDate: '2024-05-18', isNotified: true, group: 'fournisseur', activite: 'act7', departement: 'dep1' },
//   { id: 's7', name: 'Outillage Plus Industrie', email: 'vente@outillageplus.fr', createdDate: '2024-11-01', isNotified: false, group: 'fournisseur', activite: 'act8', departement: 'dep2' },
//   { id: 's8', name: 'Peinture Dubois Décoration', email: 'contact@dubois-peinture.com', createdDate: '2024-04-22', isNotified: false, group: 'artisan', activite: 'act4', departement: 'dep3' },
//   { id: 's9', name: 'Chauffage Bernard Confort', email: 'info@bernard-chauffage.com', createdDate: '2024-09-30', isNotified: true, group: 'artisan', activite: 'act5', departement: 'dep4' },
//   { id: 's10', name: 'Com Express Agence', email: 'agence@comexpress.fr', createdDate: '2024-08-15', isNotified: false, group: 'annonceur', activite: 'act6', departement: 'dep1' },
//   { id: 's11', name: 'Maçonnerie Lefebvre', email: 'contact@lefebvre-macon.com', createdDate: '2024-07-28', isNotified: false, group: 'artisan', activite: 'act9', departement: 'dep2' },
//   { id: 's12', name: 'Couverture Moreau Toiture', email: 'info@moreau-couverture.fr', createdDate: '2024-06-05', isNotified: true, group: 'artisan', activite: 'act10', departement: 'dep3' },
//   { id: 's13', name: 'Fournitures BTP Express', email: 'contact@btpexpress.com', createdDate: '2024-10-20', isNotified: false, group: 'fournisseur', activite: 'act7', departement: 'dep4' },
//   { id: 's14', name: 'Media Solutions France', email: 'hello@mediasolutions.fr', createdDate: '2024-05-30', isNotified: true, group: 'annonceur', activite: 'act6', departement: 'dep2' },
//   { id: 's15', name: 'Quincaillerie Professionnelle', email: 'vente@quincailleriepro.fr', createdDate: '2024-11-15', isNotified: false, group: 'fournisseur', activite: 'act8', departement: 'dep1' },
// ];

// export const mockActivites: Activite[] = [
//   { id: 'act1', name: 'Électricité' },
//   { id: 'act2', name: 'Plomberie' },
//   { id: 'act3', name: 'Menuiserie' },
//   { id: 'act4', name: 'Peinture' },
//   { id: 'act5', name: 'Chauffage' },
//   { id: 'act6', name: 'Marketing & Publicité' },
//   { id: 'act7', name: 'Fourniture Matériaux' },
//   { id: 'act8', name: 'Outillage' },
//   { id: 'act9', name: 'Maçonnerie' },
//   { id: 'act10', name: 'Couverture' },
// ];

// export const mockDepartements: Departement[] = [
//   { id: 'dep1', name: 'Paris', code: '75' },
//   { id: 'dep2', name: 'Yvelines', code: '78' },
//   { id: 'dep3', name: 'Essonne', code: '91' },
//   { id: 'dep4', name: 'Hauts-de-Seine', code: '92' },
//   { id: 'dep5', name: 'Seine-Saint-Denis', code: '93' },
//   { id: 'dep6', name: 'Val-de-Marne', code: '94' },
//   { id: 'dep7', name: 'Val-d\'Oise', code: '95' },
//   { id: 'dep8', name: 'Nord', code: '59' },
//   { id: 'dep9', name: 'Bouches-du-Rhône', code: '13' },
//   { id: 'dep10', name: 'Rhône', code: '69' },
// ];

// export const mockEmojis: string[] = [
//   '🎉', '✅', '📢', '🔔', '💼', '🏗️', '⚡', '🔧', '🎨', '🚀',
//   '💡', '🎯', '⭐', '👍', '📣', '🛠️', '📌', '✨', '🔥', '💪',
//   '📊', '🎊', '🏆', '💻', '📱', '🌟', '🎁', '📝', '👏', '🌈'
// ];
