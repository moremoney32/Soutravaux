import { Response } from 'express';

interface SseConnection {
  userId: string;
  response: Response;
  lastPing: number;
}

//  Map stockée en dehors (closure)
const connections = new Map<string, SseConnection[]>();
let pingIntervalId: NodeJS.Timeout | null = null;

/**
 * Initialiser le ping interval
 */
export function initSseService(): void {
  if (pingIntervalId) return; // Déjà initialisé
  
  pingIntervalId = setInterval(() => {
    pingAllConnections();
  }, 30000); // Ping toutes les 30 secondes
  
  console.log(' SSE Service initialisé');
}

/**
 * Ajouter une nouvelle connexion SSE
 */
export function addSseConnection(userId: string, res: Response): void {
  // Headers SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const connection: SseConnection = {
    userId,
    response: res,
    lastPing: Date.now()
  };

  // Ajouter à la map
  if (!connections.has(userId)) {
    connections.set(userId, []);
  }
  connections.get(userId)!.push(connection);

  console.log(` SSE: Connexion ajoutée pour user ${userId}. Total: ${getTotalConnections()}`);

  // Message de bienvenue
  sendToUser(userId, {
    type: 'connected',
    message: 'Connexion SSE établie',
    timestamp: new Date().toISOString()
  });

  // Nettoyer quand le client se déconnecte
  res.on('close', () => {
    removeSseConnection(userId, res);
  });
}

/**
 * Retirer une connexion
 */
function removeSseConnection(userId: string, res: Response): void {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const index = userConnections.findIndex(conn => conn.response === res);
    if (index !== -1) {
      userConnections.splice(index, 1);
      if (userConnections.length === 0) {
        connections.delete(userId);
      }
    }
  }
  console.log(` SSE: Connexion fermée pour user ${userId}. Total: ${getTotalConnections()}`);
}

/**
 * Envoyer à un utilisateur spécifique
 */
export function sendToUser(userId: string, data: any): boolean {
  const userConnections = connections.get(userId);
  if (!userConnections || userConnections.length === 0) {
    console.log(`⚠️ SSE: Aucune connexion pour user ${userId}`);
    return false;
  }

  let sent = 0;
  userConnections.forEach(conn => {
    try {
      conn.response.write(`data: ${JSON.stringify(data)}\n\n`);
      conn.lastPing = Date.now();
      sent++;
    } catch (error) {
      console.error(` SSE: Erreur envoi à user ${userId}:`, error);
    }
  });

  console.log(`📤 SSE: Envoyé à ${sent}/${userConnections.length} connexion(s) de user ${userId}`);
  return sent > 0;
}

/**
 * Envoyer à plusieurs utilisateurs
 */
export function sendToMultipleUsers(userIds: string[], data: any): number {
  let totalSent = 0;
  userIds.forEach(userId => {
    if (sendToUser(userId, data)) {
      totalSent++;
    }
  });
  return totalSent;
}

/**
 * Broadcast à tous les utilisateurs connectés
 */
export function broadcastToAll(data: any): void {
  connections.forEach((_, userId) => {
    sendToUser(userId, data);
  });
}

/**
 * Ping toutes les connexions
 */
function pingAllConnections(): void {
  const now = Date.now();
  connections.forEach((userConnections) => {
    userConnections.forEach(conn => {
      try {
        conn.response.write(`: ping\n\n`);
        conn.lastPing = now;
      } catch (error) {
        // Connexion morte, sera nettoyée automatiquement
      }
    });
  });
}

/**
 * Obtenir le nombre total de connexions
 */
export function getTotalConnections(): number {
  let total = 0;
  connections.forEach(userConnections => {
    total += userConnections.length;
  });
  return total;
}

/**
 * Obtenir les utilisateurs connectés
 */
export function getConnectedUsers(): string[] {
  return Array.from(connections.keys());
}

/**
 * Vérifier si un utilisateur est connecté
 */
export function isUserConnected(userId: string): boolean {
  return connections.has(userId) && connections.get(userId)!.length > 0;
}

/**
 * Nettoyer toutes les connexions (au shutdown)
 */
export function cleanupSseService(): void {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
  
  connections.forEach((userConnections) => {
    userConnections.forEach(conn => {
      conn.response.end();
    });
  });
  connections.clear();
  
  console.log('🧹 SSE Service nettoyé');
}