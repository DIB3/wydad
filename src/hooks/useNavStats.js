import { useState, useEffect } from 'react';
import playerService from '../services/player.service';
import visitService from '../services/visit.service';
import certificateService from '../services/certificate.service';
import { useAuth } from '../contexts/AuthContext';

export function useNavStats() {
  const [stats, setStats] = useState({
    players: 0,
    visits: 0,
    certificates: 0,
    loading: true,
    error: null
  });
  
  const { user } = useAuth();

  useEffect(() => {
    // Ne charger que si l'utilisateur est connecté
    if (!user) {
      setStats({
        players: 0,
        visits: 0,
        certificates: 0,
        loading: false,
        error: null
      });
      return;
    }

    const fetchStats = async () => {
      try {
        // Utiliser les services qui gèrent l'authentification
        const playersData = await playerService.getAll();
        const visitsData = await visitService.getAll();
        const certificatesData = await certificateService.getAll();

        setStats({
          players: playersData?.length || 0,
          visits: visitsData?.length || 0,
          certificates: certificatesData?.length || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques de navigation:', error);
        // En cas d'erreur, garder les compteurs à 0 sans casser l'UI
        setStats({
          players: 0,
          visits: 0,
          certificates: 0,
          loading: false,
          error: null
        });
      }
    };

    fetchStats();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return stats;
}

