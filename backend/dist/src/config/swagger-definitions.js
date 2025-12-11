"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDefinitions = void 0;
exports.swaggerDefinitions = {
    openapi: '3.0.0',
    info: {
        title: 'API Solutravo - Inscription et Gestion des Abonnements',
        version: '1.0.0',
        description: `
API complète pour l'inscription des utilisateurs, la vérification OTP et la gestion des plans d'abonnement.

### Authentification
Certaines routes nécessitent un JWT token dans le header Authorization.

### Codes de statut HTTP
- 200: Succès
- 201: Créé avec succès
- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 409: Conflit (doublon)
- 410: Compte non vérifié
- 422: Données invalides
- 500: Erreur serveur interne
    `,
        contact: {
            name: 'Support Solutravo',
            email: 'support@solutravo.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Serveur de développement'
        },
        {
            url: 'https://solutravo.zeta-app.fr',
            description: 'Serveur de production'
        }
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'Inscription et authentification des utilisateurs'
        },
        {
            name: 'Subscriptions',
            description: 'Gestion des abonnements et plans'
        },
        {
            name: 'Companies',
            description: 'Recherche d\'entreprises'
        },
        {
            name: 'Suppliers',
            description: 'Gestion des fournisseurs'
        },
        {
            name: 'Plans',
            description: 'Gestion des plans d\'abonnement'
        },
        {
            name: 'Settings',
            description: 'Paramètres de l\'application'
        }
    ],
    paths: {
        '/api/register': {
            post: {
                summary: 'Inscription d\'un nouvel utilisateur',
                description: 'Crée un nouveau compte utilisateur avec envoi d\'un code OTP par email. Processus en 3 étapes : 1. Inscription → 2. Vérification OTP → 3. Définition du mot de passe',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UserRegisterInput'
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Inscription réussie, code OTP envoyé',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: {
                                            type: 'boolean',
                                            example: true
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Inscription réussie, code envoyé'
                                        },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                email: {
                                                    type: 'string',
                                                    example: 'john.doe@example.com'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        $ref: '#/components/responses/ValidationError'
                    },
                    '409': {
                        description: 'Email ou SIRET déjà utilisé',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '422': {
                        description: 'Email invalide',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/api/verifyCode': {
            post: {
                summary: 'Vérification du code OTP',
                description: 'Vérifie le code OTP envoyé par email pour valider l\'inscription',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/VerifyInput'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Code vérifié avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: {
                                            type: 'boolean',
                                            example: true
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Code vérifié avec succès'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Code invalide ou expiré',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '404': {
                        description: 'Utilisateur non trouvé',
                        $ref: '#/components/responses/ErrorResponse'
                    }
                }
            }
        },
        '/api/register/complete': {
            post: {
                summary: 'Finalisation de l\'inscription',
                description: 'Définit le mot de passe final après vérification OTP réussie',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CompleteRegistrationInput'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Inscription complétée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: {
                                            type: 'boolean',
                                            example: true
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Inscription complétée. Vous pouvez vous connecter.'
                                        },
                                        user: {
                                            type: 'object',
                                            properties: {
                                                id: {
                                                    type: 'integer',
                                                    example: 1
                                                },
                                                email: {
                                                    type: 'string',
                                                    example: 'john.doe@example.com'
                                                },
                                                prenom: {
                                                    type: 'string',
                                                    example: 'John'
                                                }
                                            }
                                        },
                                        token: {
                                            type: 'string',
                                            description: 'JWT token d\'authentification'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '410': {
                        description: 'Compte non vérifié (OTP manquant)',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '422': {
                        description: 'Mot de passe trop faible',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '404': {
                        description: 'Utilisateur non trouvé',
                        $ref: '#/components/responses/ErrorResponse'
                    }
                }
            }
        },
        '/api/users/resend-code': {
            post: {
                summary: 'Renvoi du code OTP',
                description: 'Envoie un nouveau code OTP par email',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: {
                                    email: {
                                        type: 'string',
                                        format: 'email',
                                        example: 'john.doe@example.com'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Nouveau code envoyé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: {
                                            type: 'boolean',
                                            example: true
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Nouveau code envoyé par email'
                                        },
                                        result: {
                                            type: 'object',
                                            properties: {
                                                email: {
                                                    type: 'string',
                                                    example: 'john.doe@example.com'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '404': {
                        description: 'Utilisateur non trouvé',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '400': {
                        description: 'Utilisateur déjà vérifié',
                        $ref: '#/components/responses/ErrorResponse'
                    }
                }
            }
        },
        '/api/check_subscription': {
            post: {
                summary: 'Vérification de l\'abonnement utilisateur',
                description: 'Récupère les informations d\'abonnement d\'un utilisateur, le plan actif et tous les plans disponibles pour son rôle',
                tags: ['Subscriptions'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SubscriptionCheckInput'
                            },
                            examples: {
                                example1: {
                                    summary: 'Exemple de requête',
                                    value: {
                                        userId: '123',
                                        societe_id: '456'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Informations d\'abonnement récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        role: {
                                            type: 'string',
                                            example: 'artisan',
                                            description: 'Rôle de l\'utilisateur'
                                        },
                                        type: {
                                            type: 'string',
                                            example: 'membre',
                                            description: 'Type de compte'
                                        },
                                        subscription: {
                                            $ref: '#/components/schemas/Plan',
                                            description: 'Plan d\'abonnement actif'
                                        },
                                        plans: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Plan'
                                            },
                                            description: 'Liste de tous les plans disponibles pour ce rôle'
                                        }
                                    }
                                },
                                examples: {
                                    successResponse: {
                                        summary: 'Réponse réussie',
                                        value: {
                                            role: 'artisan',
                                            type: 'membre',
                                            subscription: {
                                                id: '18',
                                                name: 'TPE',
                                                price: 49,
                                                period: 'mois',
                                                description: 'Solution complète pour les artisans',
                                                features: ['Gestion multi-chantiers', 'Facturation professionnelle'],
                                                popular: true,
                                                color: '#E77131',
                                                stripe_link: 'price_abc123'
                                            },
                                            plans: [
                                                {
                                                    id: '17',
                                                    name: 'Gratuit',
                                                    price: 0,
                                                    period: 'mois',
                                                    description: 'Plan de découverte',
                                                    features: ['1 chantier simultané', 'Devis simples']
                                                },
                                                {
                                                    id: '18',
                                                    name: 'TPE',
                                                    price: 49,
                                                    period: 'mois',
                                                    description: 'Solution complète pour les artisans',
                                                    features: ['Gestion multi-chantiers', 'Facturation professionnelle']
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Non authentifié ou utilisateur non trouvé',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/api/registerAnnonceur': {
            post: {
                summary: 'Inscription d\'un annonceur',
                description: 'Crée un compte annonceur avec envoi d\'un code OTP par email',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AnnonceurRegisterInput'
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Inscription réussie'
                    },
                    '400': {
                        description: 'Données invalides'
                    },
                    '409': {
                        description: 'Email ou SIRET déjà utilisé'
                    },
                    '422': {
                        description: 'Email invalide'
                    },
                    '500': {
                        description: 'Erreur serveur'
                    }
                }
            }
        },
        '/api/registerFournisseur': {
            post: {
                summary: 'Demande de contact fournisseur',
                description: 'Enregistre une demande de contact de fournisseur',
                tags: ['Suppliers'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/FournisseurRegisterInput'
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Demande envoyée avec succès'
                    },
                    '400': {
                        description: 'Données invalides'
                    },
                    '422': {
                        description: 'Email invalide'
                    },
                    '500': {
                        description: 'Erreur serveur'
                    }
                }
            }
        },
        '/api/entreprises': {
            get: {
                summary: 'Recherche d\'entreprises par SIRET dans la base SIRENE',
                description: 'Recherche des entreprises dans la base de données SIRENE de l\'INSEE à partir d\'un numéro SIRET',
                tags: ['Companies'],
                parameters: [
                    {
                        in: 'query',
                        name: 'siret',
                        required: true,
                        schema: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 14,
                            pattern: '^[0-9]+$'
                        },
                        description: 'Numéro SIRET ou début du numéro SIRET (minimum 3 chiffres)',
                        example: '123456789'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Liste des entreprises trouvées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            nom: {
                                                type: 'string',
                                                example: 'ENTREPRISE EXAMPLE SARL'
                                            },
                                            siren: {
                                                type: 'string',
                                                example: '123456789'
                                            },
                                            siret: {
                                                type: 'string',
                                                example: '12345678901234'
                                            },
                                            activite: {
                                                type: 'string',
                                                example: '62.01Z'
                                            },
                                            rue: {
                                                type: 'string',
                                                example: 'RUE'
                                            },
                                            ville: {
                                                type: 'string',
                                                example: 'DE L EXAMPLE'
                                            },
                                            cp: {
                                                type: 'string',
                                                example: '123'
                                            },
                                            libelle: {
                                                type: 'string',
                                                example: 'PARIS'
                                            },
                                            type: {
                                                type: 'string',
                                                example: 'RUE'
                                            },
                                            code: {
                                                type: 'string',
                                                example: '75001'
                                            },
                                            pays: {
                                                type: 'string',
                                                example: 'FRANCE'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Paramètre SIRET invalide ou manquant',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '500': {
                        description: 'Erreur lors de la recherche dans l\'API INSEE',
                        $ref: '#/components/responses/ErrorResponse'
                    }
                }
            }
        },
        // Ajoutez ici toutes vos autres routes (plans, settings, etc.)
        '/api/plans': {
            get: {
                summary: 'Récupérer les plans d\'abonnement par rôle',
                description: 'Retourne tous les plans d\'abonnement disponibles pour un rôle spécifique',
                tags: ['Plans'],
                parameters: [
                    {
                        in: 'query',
                        name: 'role',
                        required: true,
                        schema: {
                            type: 'string',
                            enum: ['artisan', 'annonceur', 'fournisseur']
                        },
                        description: 'Rôle pour lequel récupérer les plans',
                        example: 'artisan'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Liste des plans récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Plan'
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Paramètre role manquant ou invalide',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            post: {
                summary: 'Créer un nouveau plan d\'abonnement',
                description: 'Crée un nouveau plan d\'abonnement avec toutes ses caractéristiques',
                tags: ['Plans'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Plan'
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Plan créé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Plan créé avec succès'
                                        },
                                        plan: {
                                            $ref: '#/components/schemas/Plan'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        $ref: '#/components/responses/ValidationError'
                    },
                    '401': {
                        description: 'Non authentifié'
                    },
                    '403': {
                        description: 'Non autorisé - droits administrateur requis'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/api/plans/{id}': {
            put: {
                summary: 'Mettre à jour un plan d\'abonnement',
                description: 'Met à jour toutes les informations d\'un plan d\'abonnement existant',
                tags: ['Plans'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: {
                            type: 'integer',
                            minimum: 1
                        },
                        description: 'ID du plan à mettre à jour',
                        example: 17
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Plan'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Plan mis à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Plan mis à jour avec succès'
                                        },
                                        plan: {
                                            $ref: '#/components/schemas/Plan'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Données invalides ou ID incohérent',
                        $ref: '#/components/responses/ErrorResponse'
                    },
                    '404': {
                        $ref: '#/components/responses/NotFound'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            delete: {
                summary: 'Supprimer un plan d\'abonnement',
                description: 'Supprime un plan d\'abonnement existant. La suppression n\'est possible que si le plan n\'est pas utilisé par des sociétés',
                tags: ['Plans'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: {
                            type: 'integer',
                            minimum: 1
                        },
                        description: 'ID du plan à supprimer',
                        example: 17
                    }
                ],
                responses: {
                    '200': {
                        description: 'Plan supprimé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Plan supprimé avec succès'
                                        },
                                        deletedId: {
                                            type: 'integer',
                                            example: 17
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Plan utilisé par des sociétés, impossible à supprimer',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                },
                                example: {
                                    error: 'Impossible de supprimer ce plan car il est utilisé par des sociétés',
                                    code: 'PLAN_IN_USE'
                                }
                            }
                        }
                    },
                    '404': {
                        $ref: '#/components/responses/NotFound'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/api/subscription-settings': {
            get: {
                summary: 'Récupérer les paramètres de la page d\'abonnement',
                description: 'Retourne les paramètres d\'affichage de la page d\'abonnement (titre et sous-titre)',
                tags: ['Settings'],
                responses: {
                    '200': {
                        description: 'Paramètres récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SubscriptionSettings'
                                }
                            }
                        }
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            put: {
                summary: 'Mettre à jour les paramètres de la page d\'abonnement',
                description: 'Met à jour le titre et le sous-titre de la page d\'abonnement',
                tags: ['Settings'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SubscriptionSettings'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Paramètres mis à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Settings mis à jour avec succès'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        $ref: '#/components/responses/ValidationError'
                    },
                    '401': {
                        description: 'Non authentifié'
                    },
                    '403': {
                        description: 'Non autorisé - droits administrateur requis'
                    },
                    '500': {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            // Vos schémas existants (ErrorResponse, UserRegisterInput, etc.)
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    message: {
                        type: 'string',
                        example: 'Message d\'erreur détaillé'
                    },
                    error: {
                        type: 'string',
                        example: 'Description technique de l\'erreur'
                    },
                    statusCode: {
                        type: 'integer',
                        example: 400
                    }
                }
            },
            // ... Tous vos autres schémas (identique à votre configuration actuelle)
            Plan: {
                type: 'object',
                required: ['name', 'price', 'period', 'role'],
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        example: 17
                    },
                    name: {
                        type: 'string',
                        example: 'Gratuit'
                    },
                    price: {
                        type: 'number',
                        minimum: 0,
                        example: 0
                    },
                    period: {
                        type: 'string',
                        enum: ['mois', 'an'],
                        example: 'mois'
                    },
                    role: {
                        type: 'string',
                        enum: ['artisan', 'annonceur', 'fournisseur'],
                        example: 'artisan'
                    },
                    description: {
                        type: 'string',
                        example: 'Plan de découverte gratuit'
                    },
                    features: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        example: ['1 chantier simultané', 'Devis simples']
                    },
                    popular: {
                        type: 'boolean',
                        example: false
                    },
                    color: {
                        type: 'string',
                        pattern: '^#[0-9A-Fa-f]{6}$',
                        example: '#E77131'
                    },
                    stripe_link: {
                        type: 'string',
                        example: 'price_abc123'
                    },
                    subtitle: {
                        type: 'string',
                        example: 'Découverte'
                    },
                    target_audience: {
                        type: 'string',
                        example: 'Artisans débutants'
                    },
                    key_benefits: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        example: ['Découverte sans engagement', 'Interface intuitive']
                    },
                    detailed_features: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    example: 'Gestion de base'
                                },
                                features: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    example: ['1 chantier simultané', 'Devis simples et rapides']
                                }
                            }
                        }
                    },
                    why_choose: {
                        type: 'string',
                        example: 'Idéal pour tester nos solutions'
                    },
                    icon_name: {
                        type: 'string',
                        example: 'building'
                    },
                    gradient: {
                        type: 'string',
                        example: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    }
                }
            },
            SubscriptionSettings: {
                type: 'object',
                required: ['hero_title', 'hero_subtitle'],
                properties: {
                    hero_title: {
                        type: 'string',
                        example: 'Choisissez le plan parfait pour votre entreprise'
                    },
                    hero_subtitle: {
                        type: 'string',
                        example: 'Découvrez nos solutions adaptées à vos besoins et budget'
                    }
                }
            },
            // ... Ajoutez tous vos autres schémas ici
        },
        responses: {
            ValidationError: {
                description: 'Données invalides',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Ressource non trouvée',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            ServerError: {
                description: 'Erreur interne du serveur',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            },
            ErrorResponse: {
                description: 'Erreur générale',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        }
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=swagger-definitions.js.map