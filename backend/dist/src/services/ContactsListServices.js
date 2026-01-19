"use strict";
// // services/contactListService.ts
// // VERSION MISE À JOUR POUR contact_list_members
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactListsBySociete = getContactListsBySociete;
exports.getContactListById = getContactListById;
exports.getPhoneNumbersFromLists = getPhoneNumbersFromLists;
exports.getContactsFromLists = getContactsFromLists;
exports.countContactsInLists = countContactsInLists;
// import pool from '../config/db'; // Adapter selon votre config
// import { RowDataPacket } from 'mysql2';
// /**
//  * Interface pour une liste de contacts
//  */
// export interface ContactList {
//   id: number;
//   id_sms_contact: string;
//   name: string;
//   societe_id: number;
//   membre_id: number | null;
//   description: string | null;
//   contacts_count: number;
//   created_at: string | null;
//   updated_at: string | null;
// }
// /**
//  * Interface pour un contact individuel
//  */
// export interface Contact {
//   id: number;
//   phone_number: string;
//   nom: string | null;
//   prenom: string | null;
//   email: string | null;
//   status: 'active' | 'blocked';
// }
// /**
//  * Interface pour la réponse complète d'une liste avec ses contacts
//  */
// export interface ContactListWithContacts extends ContactList {
//   contacts: Contact[];
// }
// /**
//  * RÉCUPÉRER TOUTES LES LISTES D'UNE SOCIÉTÉ
//  * avec le compteur de contacts pour chaque liste
//  */
// export async function getContactListsBySociete(societeId: number): Promise<ContactList[]> {
//   if (!societeId || isNaN(societeId)) {
//     const err = new Error("ID société invalide");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   const conn = await pool.getConnection();
//   try {
//     // Requête SQL qui compte les contacts pour chaque liste
//     // UTILISE contact_list_members au lieu de contact_list_contacts
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         cl.id,
//         cl.id_sms_contact,
//         cl.name,
//         cl.societe_id,
//         cl.membre_id,
//         cl.description,
//         cl.created_at,
//         cl.updated_at,
//         COUNT(clm.contact_id) AS contacts_count
//       FROM contact_lists cl
//       LEFT JOIN contact_list_members clm ON cl.id = clm.contact_list_id 
//         AND clm.societe_id = cl.societe_id
//       WHERE cl.societe_id = ?
//       GROUP BY cl.id, cl.id_sms_contact, cl.name, cl.societe_id, 
//                cl.membre_id, cl.description, cl.created_at, cl.updated_at
//       ORDER BY cl.created_at DESC`,
//       [societeId]
//     );
//     if (!rows || rows.length === 0) {
//       return [];
//     }
//     return rows as ContactList[];
//   } catch (error: any) {
//     console.error('Erreur getContactListsBySociete:', error);
//     const err = new Error("Erreur lors de la récupération des listes de contacts");
//     (err as any).statusCode = 500;
//     (err as any).originalError = error.message;
//     throw err;
//   } finally {
//     conn.release();
//   }
// }
// /**
//  * RÉCUPÉRER UNE LISTE SPÉCIFIQUE AVEC SES CONTACTS
//  * Pour afficher les détails ou préparer l'envoi
//  */
// export async function getContactListById(listId: number, societeId: number): Promise<ContactListWithContacts> {
//   if (!listId || isNaN(listId)) {
//     const err = new Error("ID liste invalide");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   const conn = await pool.getConnection();
//   try {
//     // 1. Récupérer les infos de la liste
//     const [listRows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         id,
//         id_sms_contact,
//         name,
//         societe_id,
//         membre_id,
//         description,
//         created_at,
//         updated_at
//       FROM contact_lists
//       WHERE id = ? AND societe_id = ?`,
//       [listId, societeId]
//     );
//     if (!listRows || listRows.length === 0) {
//       const err = new Error("Liste de contacts introuvable");
//       (err as any).statusCode = 404;
//       throw err;
//     }
//     const contactList = listRows[0];
//     // 2. Récupérer tous les contacts de cette liste
//     // UTILISE contact_list_members
//     const [contactRows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         c.id,
//         c.phone_number,
//         c.nom,
//         c.prenom,
//         c.email,
//         c.status
//       FROM contacts c
//       INNER JOIN contact_list_members clm ON c.id = clm.contact_id
//       WHERE clm.contact_list_id = ? 
//         AND clm.societe_id = ?
//         AND c.status = 'active'
//       ORDER BY c.nom, c.prenom`,
//       [listId, societeId]
//     );
//     const contacts = contactRows as Contact[];
//     // 3. Combiner liste + contacts
//     const result: ContactListWithContacts = {
//       ...contactList,
//       contacts_count: contacts.length,
//       contacts: contacts
//     };
//     return result;
//   } catch (error: any) {
//     if ((error as any).statusCode) {
//       throw error;
//     }
//     console.error('Erreur getContactListById:', error);
//     const err = new Error("Erreur lors de la récupération de la liste");
//     (err as any).statusCode = 500;
//     (err as any).originalError = error.message;
//     throw err;
//   } finally {
//     conn.release();
//   }
// }
// /**
//  * RÉCUPÉRER LES NUMÉROS DE TÉLÉPHONE DE PLUSIEURS LISTES
//  * Pour préparer l'envoi de campagne SMS
//  * Retourne un tableau de numéros dédupliqués
//  */
// export async function getPhoneNumbersFromLists(
//   listIds: number[], 
//   societeId: number
// ): Promise<string[]> {
//   if (!listIds || listIds.length === 0) {
//     const err = new Error("Aucune liste sélectionnée");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   // Validation des IDs
//   if (!listIds.every(id => !isNaN(id))) {
//     const err = new Error("IDs de listes invalides");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   const conn = await pool.getConnection();
//   try {
//     // Vérifier que toutes les listes appartiennent à la société
//     const [verificationRows] = await conn.query<RowDataPacket[]>(
//       `SELECT COUNT(*) as count 
//        FROM contact_lists 
//        WHERE id IN (?) AND societe_id = ?`,
//       [listIds, societeId]
//     );
//     const verificationCount = (verificationRows[0] as any).count;
//     if (verificationCount !== listIds.length) {
//       const err = new Error("Certaines listes n'appartiennent pas à cette société");
//       (err as any).statusCode = 403;
//       throw err;
//     }
//     // Récupérer les numéros (DISTINCT pour éviter les doublons)
//     // UTILISE contact_list_members
//     const [phoneRows] = await conn.query<RowDataPacket[]>(
//       `SELECT DISTINCT c.phone_number
//        FROM contacts c
//        INNER JOIN contact_list_members clm ON c.id = clm.contact_id
//        WHERE clm.contact_list_id IN (?)
//          AND clm.societe_id = ?
//          AND c.status = 'active'
//          AND c.phone_number IS NOT NULL
//          AND c.phone_number != ''
//        ORDER BY c.phone_number`,
//       [listIds, societeId]
//     );
//     const phoneNumbers = phoneRows.map(row => row.phone_number);
//     if (phoneNumbers.length === 0) {
//       console.warn(`Aucun contact actif trouvé pour les listes: ${listIds.join(', ')}`);
//     }
//     return phoneNumbers;
//   } catch (error: any) {
//     if ((error as any).statusCode) {
//       throw error;
//     }
//     console.error('Erreur getPhoneNumbersFromLists:', error);
//     const err = new Error("Erreur lors de la récupération des numéros");
//     (err as any).statusCode = 500;
//     (err as any).originalError = error.message;
//     throw err;
//   } finally {
//     conn.release();
//   }
// }
// /**
//  * RÉCUPÉRER LES CONTACTS COMPLETS DE PLUSIEURS LISTES
//  * Pour avoir plus d'infos (nom, prénom, email) si besoin
//  */
// export async function getContactsFromLists(
//   listIds: number[], 
//   societeId: number
// ): Promise<Contact[]> {
//   if (!listIds || listIds.length === 0) {
//     const err = new Error("Aucune liste sélectionnée");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   if (!listIds.every(id => !isNaN(id))) {
//     const err = new Error("IDs de listes invalides");
//     (err as any).statusCode = 400;
//     throw err;
//   }
//   const conn = await pool.getConnection();
//   try {
//     // Vérification société
//     const [verificationRows] = await conn.query<RowDataPacket[]>(
//       `SELECT COUNT(*) as count 
//        FROM contact_lists 
//        WHERE id IN (?) AND societe_id = ?`,
//       [listIds, societeId]
//     );
//     const verificationCount = (verificationRows[0] as any).count;
//     if (verificationCount !== listIds.length) {
//       const err = new Error("Certaines listes n'appartiennent pas à cette société");
//       (err as any).statusCode = 403;
//       throw err;
//     }
//     // Récupérer contacts complets (DISTINCT par phone_number)
//     // UTILISE contact_list_members
//     const [contactRows] = await conn.query<RowDataPacket[]>(
//       `SELECT DISTINCT
//         c.id,
//         c.phone_number,
//         c.nom,
//         c.prenom,
//         c.email,
//         c.status
//        FROM contacts c
//        INNER JOIN contact_list_members clm ON c.id = clm.contact_id
//        WHERE clm.contact_list_id IN (?)
//          AND clm.societe_id = ?
//          AND c.status = 'active'
//          AND c.phone_number IS NOT NULL
//          AND c.phone_number != ''
//        ORDER BY c.nom, c.prenom`,
//       [listIds, societeId]
//     );
//     return contactRows as Contact[];
//   } catch (error: any) {
//     if ((error as any).statusCode) {
//       throw error;
//     }
//     console.error('Erreur getContactsFromLists:', error);
//     const err = new Error("Erreur lors de la récupération des contacts");
//     (err as any).statusCode = 500;
//     (err as any).originalError = error.message;
//     throw err;
//   } finally {
//     conn.release();
//   }
// }
// /**
//  * COMPTER LES CONTACTS TOTAUX DE PLUSIEURS LISTES
//  * Utile pour afficher le total avant envoi
//  */
// export async function countContactsInLists(
//   listIds: number[], 
//   societeId: number
// ): Promise<number> {
//   if (!listIds || listIds.length === 0) {
//     return 0;
//   }
//   const conn = await pool.getConnection();
//   try {
//     // UTILISE contact_list_members
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT COUNT(DISTINCT c.id) as total
//        FROM contacts c
//        INNER JOIN contact_list_members clm ON c.id = clm.contact_id
//        INNER JOIN contact_lists cl ON clm.contact_list_id = cl.id
//        WHERE clm.contact_list_id IN (?)
//          AND clm.societe_id = ?
//          AND c.status = 'active'
//          AND c.phone_number IS NOT NULL
//          AND c.phone_number != ''`,
//       [listIds, societeId]
//     );
//     return (rows[0] as any).total || 0;
//   } catch (error: any) {
//     console.error('Erreur countContactsInLists:', error);
//     return 0;
//   } finally {
//     conn.release();
//   }
// }
// services/contactListService.ts
// VERSION CORRIGÉE - TOUS LES TYPES EXPLICITES
// Adapter selon votre config
const db_1 = __importDefault(require("../config/db"));
/**
 * RÉCUPÉRER TOUTES LES LISTES D'UNE SOCIÉTÉ
 * avec le compteur de contacts pour chaque liste
 */
async function getContactListsBySociete(societeId) {
    if (!societeId || isNaN(societeId)) {
        const err = new Error("ID société invalide");
        err.statusCode = 400;
        throw err;
    }
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT 
        cl.id,
        cl.id_sms_contact,
        cl.name,
        cl.societe_id,
        cl.membre_id,
        cl.description,
        cl.created_at,
        cl.updated_at,
        COUNT(clm.contact_id) AS contacts_count
      FROM contact_lists cl
      LEFT JOIN contact_list_members clm ON cl.id = clm.contact_list_id 
        AND clm.societe_id = cl.societe_id
      WHERE cl.societe_id = ?
      GROUP BY cl.id, cl.id_sms_contact, cl.name, cl.societe_id, 
               cl.membre_id, cl.description, cl.created_at, cl.updated_at
      ORDER BY cl.created_at DESC`, [societeId]);
        if (!rows || rows.length === 0) {
            return [];
        }
        return rows;
    }
    catch (error) {
        console.error('Erreur getContactListsBySociete:', error);
        const err = new Error("Erreur lors de la récupération des listes de contacts");
        err.statusCode = 500;
        err.originalError = error.message;
        throw err;
    }
    finally {
        conn.release();
    }
}
/**
 * RÉCUPÉRER UNE LISTE SPÉCIFIQUE AVEC SES CONTACTS
 * Pour afficher les détails ou préparer l'envoi
 */
async function getContactListById(listId, societeId) {
    if (!listId || isNaN(listId)) {
        const err = new Error("ID liste invalide");
        err.statusCode = 400;
        throw err;
    }
    const conn = await db_1.default.getConnection();
    try {
        // 1. Récupérer les infos de la liste
        const [listRows] = await conn.query(`SELECT 
        id,
        id_sms_contact,
        name,
        societe_id,
        membre_id,
        description,
        created_at,
        updated_at
      FROM contact_lists
      WHERE id = ? AND societe_id = ?`, [listId, societeId]);
        if (!listRows || listRows.length === 0) {
            const err = new Error("Liste de contacts introuvable");
            err.statusCode = 404;
            throw err;
        }
        const contactList = listRows[0];
        // 2. Récupérer tous les contacts de cette liste
        const [contactRows] = await conn.query(`SELECT 
        c.id,
        c.phone_number,
        c.nom,
        c.prenom,
        c.email,
        c.status
      FROM contacts c
      INNER JOIN contact_list_members clm ON c.id = clm.contact_id
      WHERE clm.contact_list_id = ? 
        AND clm.societe_id = ?
        AND c.status = 'active'
      ORDER BY c.nom, c.prenom`, [listId, societeId]);
        const contacts = contactRows;
        // 3. Combiner liste + contacts avec type explicite
        const result = {
            id: contactList.id,
            id_sms_contact: contactList.id_sms_contact,
            name: contactList.name,
            societe_id: contactList.societe_id,
            membre_id: contactList.membre_id,
            description: contactList.description,
            created_at: contactList.created_at,
            updated_at: contactList.updated_at,
            contacts_count: contacts.length,
            contacts: contacts
        };
        return result;
    }
    catch (error) {
        if (error.statusCode) {
            throw error;
        }
        console.error('Erreur getContactListById:', error);
        const err = new Error("Erreur lors de la récupération de la liste");
        err.statusCode = 500;
        err.originalError = error.message;
        throw err;
    }
    finally {
        conn.release();
    }
}
/**
 * RÉCUPÉRER LES NUMÉROS DE TÉLÉPHONE DE PLUSIEURS LISTES
 * Pour préparer l'envoi de campagne SMS
 * Retourne un tableau de numéros dédupliqués
 */
async function getPhoneNumbersFromLists(listIds, societeId) {
    if (!listIds || listIds.length === 0) {
        const err = new Error("Aucune liste sélectionnée");
        err.statusCode = 400;
        throw err;
    }
    if (!listIds.every(id => !isNaN(id))) {
        const err = new Error("IDs de listes invalides");
        err.statusCode = 400;
        throw err;
    }
    const conn = await db_1.default.getConnection();
    try {
        // Vérifier que toutes les listes appartiennent à la société
        const [verificationRows] = await conn.query(`SELECT COUNT(*) as count 
       FROM contact_lists 
       WHERE id IN (?) AND societe_id = ?`, [listIds, societeId]);
        const verificationCount = verificationRows[0].count;
        if (verificationCount !== listIds.length) {
            const err = new Error("Certaines listes n'appartiennent pas à cette société");
            err.statusCode = 403;
            throw err;
        }
        // Récupérer les numéros (DISTINCT pour éviter les doublons)
        const [phoneRows] = await conn.query(`SELECT DISTINCT c.phone_number
       FROM contacts c
       INNER JOIN contact_list_members clm ON c.id = clm.contact_id
       WHERE clm.contact_list_id IN (?)
         AND clm.societe_id = ?
         AND c.status = 'active'
         AND c.phone_number IS NOT NULL
         AND c.phone_number != ''
       ORDER BY c.phone_number`, [listIds, societeId]);
        const phoneNumbers = phoneRows.map(row => row.phone_number);
        if (phoneNumbers.length === 0) {
            console.warn(`Aucun contact actif trouvé pour les listes: ${listIds.join(', ')}`);
        }
        return phoneNumbers;
    }
    catch (error) {
        if (error.statusCode) {
            throw error;
        }
        console.error('Erreur getPhoneNumbersFromLists:', error);
        const err = new Error("Erreur lors de la récupération des numéros");
        err.statusCode = 500;
        err.originalError = error.message;
        throw err;
    }
    finally {
        conn.release();
    }
}
/**
 * RÉCUPÉRER LES CONTACTS COMPLETS DE PLUSIEURS LISTES
 * Pour avoir plus d'infos (nom, prénom, email) si besoin
 */
async function getContactsFromLists(listIds, societeId) {
    if (!listIds || listIds.length === 0) {
        const err = new Error("Aucune liste sélectionnée");
        err.statusCode = 400;
        throw err;
    }
    if (!listIds.every(id => !isNaN(id))) {
        const err = new Error("IDs de listes invalides");
        err.statusCode = 400;
        throw err;
    }
    const conn = await db_1.default.getConnection();
    try {
        // Vérification société
        const [verificationRows] = await conn.query(`SELECT COUNT(*) as count 
       FROM contact_lists 
       WHERE id IN (?) AND societe_id = ?`, [listIds, societeId]);
        const verificationCount = verificationRows[0].count;
        if (verificationCount !== listIds.length) {
            const err = new Error("Certaines listes n'appartiennent pas à cette société");
            err.statusCode = 403;
            throw err;
        }
        // Récupérer contacts complets (DISTINCT par phone_number)
        const [contactRows] = await conn.query(`SELECT DISTINCT
        c.id,
        c.phone_number,
        c.nom,
        c.prenom,
        c.email,
        c.status
       FROM contacts c
       INNER JOIN contact_list_members clm ON c.id = clm.contact_id
       WHERE clm.contact_list_id IN (?)
         AND clm.societe_id = ?
         AND c.status = 'active'
         AND c.phone_number IS NOT NULL
         AND c.phone_number != ''
       ORDER BY c.nom, c.prenom`, [listIds, societeId]);
        return contactRows;
    }
    catch (error) {
        if (error.statusCode) {
            throw error;
        }
        console.error('Erreur getContactsFromLists:', error);
        const err = new Error("Erreur lors de la récupération des contacts");
        err.statusCode = 500;
        err.originalError = error.message;
        throw err;
    }
    finally {
        conn.release();
    }
}
/**
 * COMPTER LES CONTACTS TOTAUX DE PLUSIEURS LISTES
 * Utile pour afficher le total avant envoi
 */
async function countContactsInLists(listIds, societeId) {
    if (!listIds || listIds.length === 0) {
        return 0;
    }
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT COUNT(DISTINCT c.id) as total
       FROM contacts c
       INNER JOIN contact_list_members clm ON c.id = clm.contact_id
       INNER JOIN contact_lists cl ON clm.contact_list_id = cl.id
       WHERE clm.contact_list_id IN (?)
         AND clm.societe_id = ?
         AND c.status = 'active'
         AND c.phone_number IS NOT NULL
         AND c.phone_number != ''`, [listIds, societeId]);
        return rows[0].total || 0;
    }
    catch (error) {
        console.error('Erreur countContactsInLists:', error);
        return 0;
    }
    finally {
        conn.release();
    }
}
//# sourceMappingURL=ContactsListServices.js.map