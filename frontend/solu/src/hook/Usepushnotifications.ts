import { useState, useEffect, useCallback } from 'react';
import { pushNotificationApi } from '../services/Pushnotificationapi';
import type {
  PreSociete,
  Societe,
  Activite,
  Departement,
  GroupType,
  NotificationType
} from '../types/pushNotifications';

export function usePushNotifications() {
  // États pour les données
  const [activites, setActivites] = useState<Activite[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [preSocietes, setPreSocietes] = useState<PreSociete[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  
  // États pour les filtres
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedActivites, setSelectedActivites] = useState<string[]>([]);
  const [selectedDepartements, setSelectedDepartements] = useState<string[]>([]);
  const [searchBy, setSearchBy] = useState<'presocietes' | 'societes'>('presocietes');
  
  // États pour les loading et erreurs
  const [loadingActivites, setLoadingActivites] = useState(false);
  const [loadingDepartements, setLoadingDepartements] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les activités au montage
  useEffect(() => {
    async function fetchActivites() {
      setLoadingActivites(true);
      try {
        const data = await pushNotificationApi.getActivites();
        setActivites(data);
      } catch (err: any) {
        console.error('Erreur chargement activités:', err);
        setError(err.message);
      } finally {
        setLoadingActivites(false);
      }
    }
    
    fetchActivites();
  }, []);

  // Charger les départements au montage
  useEffect(() => {
    async function fetchDepartements() {
      setLoadingDepartements(true);
      try {
        const data = await pushNotificationApi.getDepartements();
        setDepartements(data);
      } catch (err: any) {
        console.error('Erreur chargement départements:', err);
        setError(err.message);
      } finally {
        setLoadingDepartements(false);
      }
    }
    
    fetchDepartements();
  }, []);

  // Charger les présociétés/sociétés quand les filtres changent
  useEffect(() => {
    if (!selectedGroup) {
      setPreSocietes([]);
      setSocietes([]);
      return;
    }

    async function fetchEntities() {
      setLoadingEntities(true);
      setError(null);
      
      try {
        // Si des filtres activité/département sont sélectionnés, on charge TOUJOURS les sociétés
        if (selectedActivites.length > 0 || selectedDepartements.length > 0) {
          const societesData = await pushNotificationApi.getSocietes(
            selectedGroup!,
            selectedActivites.length > 0 ? selectedActivites : undefined,
            selectedDepartements.length > 0 ? selectedDepartements : undefined
          );
          setSocietes(societesData);
          setPreSocietes([]);
          setSearchBy('societes');
        } else {
          // Sinon, on charge selon le searchBy
          if (searchBy === 'presocietes') {
            const preSocietesData = await pushNotificationApi.getPreSocietes(selectedGroup!);
            setPreSocietes(preSocietesData);
            setSocietes([]);
          } else {
            const societesData = await pushNotificationApi.getSocietes(selectedGroup!);
            setSocietes(societesData);
            setPreSocietes([]);
          }
        }
      } catch (err: any) {
        console.error('Erreur chargement entités:', err);
        setError(err.message);
        setPreSocietes([]);
        setSocietes([]);
      } finally {
        setLoadingEntities(false);
      }
    }

    fetchEntities();
  }, [selectedGroup, selectedActivites, selectedDepartements, searchBy]);

  // Fonction pour envoyer une notification
  const sendNotification = useCallback(async (
    message: string,
    emoji: string,
    notificationTypes: NotificationType[],
    recipientIds: string[]
  ) => {
    setSending(true);
    setError(null);

    try {
      // Déterminer si les IDs sont des présociétés ou des sociétés
      const payload = {
        message,
        emoji,
        notificationTypes,
        recipients: searchBy === 'presocietes' || (selectedActivites.length === 0 && selectedDepartements.length === 0 && preSocietes.length > 0)
          ? { preSocieteIds: recipientIds }
          : { societeIds: recipientIds },
        filters: {
          group: selectedGroup!,
          ...(selectedActivites.length > 0 && { activiteIds: selectedActivites }),
          ...(selectedDepartements.length > 0 && { departementIds: selectedDepartements })
        }
      };

      const result = await pushNotificationApi.sendNotification(payload);
      
      return result;
      
    } catch (err: any) {
      console.error('Erreur envoi notification:', err);
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [selectedGroup, selectedActivites, selectedDepartements, searchBy, preSocietes.length]);

  // Fonctions de sélection de groupe
  const selectGroup = useCallback((group: GroupType) => {
    setSelectedGroup(group);
    // Réinitialiser les filtres
    setSelectedActivites([]);
    setSelectedDepartements([]);
    setSearchBy('presocietes');
  }, []);

  return {
    // Données
    activites,
    departements,
    preSocietes,
    societes,
    
    // États de sélection
    selectedGroup,
    selectedActivites,
    selectedDepartements,
    searchBy,
    
    // Loading states
    loadingActivites,
    loadingDepartements,
    loadingEntities,
    sending,
    error,
    
    // Actions
    selectGroup,
    setSelectedActivites,
    setSelectedDepartements,
    setSearchBy,
    sendNotification,
    
    // Helpers
    currentEntities: preSocietes.length > 0 ? preSocietes : societes,
    isShowingPreSocietes: preSocietes.length > 0,
  };
}