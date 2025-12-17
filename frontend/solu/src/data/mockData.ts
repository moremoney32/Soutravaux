// // import { Plan, Feature, FeaturePlan } from '../types';

import type { Departement, PreSociete, Societe } from "../types";




export const mockPreSocietes: PreSociete[] = [
  {
    id: '1',
    nom: 'Bâtiment Pro Services',
    email: 'contact@batimentpro.fr',
    dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: false
  },
  {
    id: '2',
    nom: 'Électricité Moderne',
    email: 'info@elecmoderne.fr',
    dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: false
  },
  {
    id: '3',
    nom: 'Plomberie Express',
    email: 'contact@plomberieexpress.fr',
    dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: true
  },
  {
    id: '4',
    nom: 'Menuiserie Artisanale',
    email: 'hello@menuiserie-artisan.fr',
    dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: false
  },
  {
    id: '5',
    nom: 'Peinture et Décoration',
    email: 'contact@peinture-deco.fr',
    dateCreation: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: true
  },
  {
    id: '6',
    nom: 'Toiture Excellence',
    email: 'info@toiture-excellence.fr',
    dateCreation: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    notificationEnvoyee: false
  },
  {
    id: '7',
    nom: 'Maçonnerie Moderne',
    email: 'contact@maconnerie-moderne.fr',
    dateCreation: new Date(Date.now() - 30 * 60 * 1000),
    notificationEnvoyee: false
  }
];

export const mockSocietes: Societe[] = [
  {
    id: 's1',
    nom: 'Construction Martin SARL',
    email: 'martin@construction.fr',
    artisans: 15
  },
  {
    id: 's2',
    nom: 'Rénovation Dupont & Fils',
    email: 'dupont@renovation.fr',
    artisans: 8
  },
  {
    id: 's3',
    nom: 'Travaux Bernard SAS',
    email: 'bernard@travaux.fr',
    artisans: 22
  },
  {
    id: 's4',
    nom: 'Aménagement Lefebvre',
    email: 'lefebvre@amenagement.fr',
    artisans: 12
  },
  {
    id: 's5',
    nom: 'Installation Thomas EURL',
    email: 'thomas@installation.fr',
    artisans: 6
  }
];

export const mockDepartements: Departement[] = [
  {
    id: 'd1',
    numero: '75',
    nom: 'Paris',
    nombreSocietes: 145
  },
  {
    id: 'd2',
    numero: '13',
    nom: 'Bouches-du-Rhône',
    nombreSocietes: 98
  },
  {
    id: 'd3',
    numero: '69',
    nom: 'Rhône',
    nombreSocietes: 87
  },
  {
    id: 'd4',
    numero: '33',
    nom: 'Gironde',
    nombreSocietes: 76
  },
  {
    id: 'd5',
    numero: '59',
    nom: 'Nord',
    nombreSocietes: 112
  },
  {
    id: 'd6',
    numero: '44',
    nom: 'Loire-Atlantique',
    nombreSocietes: 65
  }
];

