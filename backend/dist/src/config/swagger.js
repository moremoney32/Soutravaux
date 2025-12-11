"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
// config/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Solutravo - Inscription et Gestion des Abonnements',
            version: '1.0.0',
            description: `
API complète pour l'inscription des utilisateurs, la vérification OTP et la gestion des plans d'abonnement.

###  Authentification
Certaines routes nécessitent un JWT token dans le header Authorization.

###  Codes de statut HTTP
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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
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
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Opération réussie'
                        },
                        data: {
                            type: 'object',
                            description: 'Données de réponse'
                        }
                    }
                },
                UserRegisterInput: {
                    type: 'object',
                    required: ['email', 'prenom', 'role'],
                    properties: {
                        role: {
                            type: 'string',
                            enum: ['artisan', 'annonceur', 'fournisseur'],
                            description: 'Rôle de l\'utilisateur'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        prenom: {
                            type: 'string',
                            example: 'John'
                        },
                        nom: {
                            type: 'string',
                            example: 'Doe'
                        },
                        phonenumber: {
                            type: 'string',
                            example: '+33123456789'
                        },
                        address: {
                            type: 'string',
                            example: '123 Rue de Paris'
                        },
                        size: {
                            type: 'string',
                            enum: ['TPE', 'PME', 'ETI', 'GE'],
                            description: 'Taille de l\'entreprise'
                        },
                        name: {
                            type: 'string',
                            example: 'Entreprise ABC',
                            description: 'Nom de l\'entreprise'
                        },
                        legal_form: {
                            type: 'string',
                            enum: ['EI', 'EURL', 'SARL', 'SAS', 'SASU', 'SA'],
                            example: 'SARL'
                        },
                        siret: {
                            type: 'string',
                            example: '12345678901234',
                            description: 'SIRET de l\'entreprise (14 chiffres)'
                        },
                        cp: {
                            type: 'string',
                            example: '75001'
                        },
                        ville: {
                            type: 'string',
                            example: 'Paris'
                        },
                        rue: {
                            type: 'string',
                            example: '123 Avenue des Champs-Élysées'
                        },
                        capital: {
                            type: 'number',
                            example: 10000
                        }
                    }
                },
                VerifyInput: {
                    type: 'object',
                    required: ['email', 'code'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        code: {
                            type: 'string',
                            example: '1234',
                            description: 'Code OTP à 4 chiffres'
                        }
                    }
                },
                CompleteRegistrationInput: {
                    type: 'object',
                    required: ['email', 'passe'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        passe: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            example: 'MonMot2Passe!',
                            description: 'Mot de passe fort (min 8 caractères, 1 majuscule, 1 chiffre)'
                        }
                    }
                },
                SubscriptionCheckInput: {
                    type: 'object',
                    required: ['userId', 'societe_id'],
                    properties: {
                        userId: {
                            type: 'string',
                            description: 'ID du membre dans la base de données',
                            example: '123'
                        },
                        societe_id: {
                            type: 'string',
                            description: 'ID de la société associée au membre',
                            example: '456'
                        }
                    }
                },
                AnnonceurRegisterInput: {
                    type: 'object',
                    required: ['emailAnnonceur', 'firstNameAnnonceur', 'companyNameAnnonceur'],
                    properties: {
                        emailAnnonceur: {
                            type: 'string',
                            format: 'email',
                            example: 'annonceur@example.com',
                            description: 'Email de l\'annonceur'
                        },
                        firstNameAnnonceur: {
                            type: 'string',
                            example: 'Pierre',
                            description: 'Prénom du contact'
                        },
                        lastNameAnnonceur: {
                            type: 'string',
                            example: 'Martin',
                            description: 'Nom du contact'
                        },
                        role: {
                            type: 'string',
                            enum: ['annonceur'],
                            example: 'annonceur',
                            description: 'Rôle de l\'utilisateur'
                        },
                        phoneAnnonceur: {
                            type: 'string',
                            example: '+33123456789',
                            description: 'Numéro de téléphone'
                        },
                        headquartersAnnonceur: {
                            type: 'string',
                            example: '123 Rue de Paris, 75001 Paris',
                            description: 'Adresse du siège social'
                        },
                        activityAnnonceur: {
                            type: 'string',
                            example: 'Publicité digitale',
                            description: 'Secteur d\'activité'
                        },
                        companyNameAnnonceur: {
                            type: 'string',
                            example: 'AGENCE PUB MARTIN',
                            description: 'Raison sociale de l\'entreprise'
                        },
                        howDidYouKnowAnnonceur: {
                            type: 'string',
                            example: 'Recommandation',
                            description: 'Comment avez-vous connu Solutravo ?'
                        },
                        siretAnnonceur: {
                            type: 'string',
                            example: '12345678901234',
                            description: 'Numéro SIRET (14 chiffres)'
                        },
                        size: {
                            type: 'string',
                            enum: ['TPE', 'PME', 'ETI', 'GE'],
                            example: 'PME',
                            description: 'Taille de l\'entreprise'
                        },
                        legal_form: {
                            type: 'string',
                            enum: ['EI', 'EURL', 'SARL', 'SAS', 'SASU', 'SA'],
                            example: 'SARL',
                            description: 'Forme juridique'
                        },
                        cp: {
                            type: 'string',
                            example: '75001',
                            description: 'Code postal'
                        },
                        ville: {
                            type: 'string',
                            example: 'Paris',
                            description: 'Ville'
                        },
                        rue: {
                            type: 'string',
                            example: '123 Avenue des Champs-Élysées',
                            description: 'Rue'
                        },
                        capital: {
                            type: 'number',
                            example: 50000,
                            description: 'Capital social'
                        }
                    }
                },
                FournisseurRegisterInput: {
                    type: 'object',
                    required: ['contactEmail', 'contactFirstName', 'companyName', 'address', 'postalCode', 'city'],
                    properties: {
                        contactEmail: {
                            type: 'string',
                            format: 'email',
                            example: 'fournisseur@example.com',
                            description: 'Email du contact'
                        },
                        contactFirstName: {
                            type: 'string',
                            example: 'Marie',
                            description: 'Prénom du contact'
                        },
                        contactLastName: {
                            type: 'string',
                            example: 'Dubois',
                            description: 'Nom du contact'
                        },
                        contactPosition: {
                            type: 'string',
                            example: 'Directrice Commerciale',
                            description: 'Fonction du contact'
                        },
                        contactPhone: {
                            type: 'string',
                            example: '+33123456789',
                            description: 'Téléphone du contact'
                        },
                        role: {
                            type: 'string',
                            enum: ['fournisseur'],
                            example: 'fournisseur',
                            description: 'Rôle de l\'utilisateur'
                        },
                        companyName: {
                            type: 'string',
                            example: 'MATERIAUX PRO FRANCE',
                            description: 'Nom de l\'entreprise'
                        },
                        siret: {
                            type: 'string',
                            example: '98765432109876',
                            description: 'Numéro SIRET'
                        },
                        address: {
                            type: 'string',
                            example: '456 Avenue du Commerce',
                            description: 'Adresse complète'
                        },
                        postalCode: {
                            type: 'string',
                            example: '69001',
                            description: 'Code postal'
                        },
                        city: {
                            type: 'string',
                            example: 'Lyon',
                            description: 'Ville'
                        },
                        sector: {
                            type: 'string',
                            enum: ['matériaux', 'équipements', 'outillage', 'services', 'autres'],
                            example: 'matériaux',
                            description: 'Secteur d\'activité'
                        },
                        customSector: {
                            type: 'string',
                            example: 'Énergie renouvelable',
                            description: 'Secteur personnalisé (si "autres" est sélectionné)'
                        },
                        message: {
                            type: 'string',
                            example: 'Je souhaite proposer nos matériaux de construction aux artisans de votre plateforme.',
                            description: 'Message additionnel'
                        },
                        cp: {
                            type: 'string',
                            example: '69001',
                            description: 'Code postal (alternatif)'
                        },
                        ville: {
                            type: 'string',
                            example: 'Lyon',
                            description: 'Ville (alternatif)'
                        },
                        rue: {
                            type: 'string',
                            example: '456 Avenue du Commerce',
                            description: 'Rue (alternatif)'
                        }
                    }
                },
                // Dans votre section components/schemas, vous pouvez ajouter :
                INSEEErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: "Erreur lors de la recherche d'entreprises"
                        },
                        error: {
                            type: 'string',
                            example: "INSEE API - Quota exceeded"
                        },
                        statusCode: {
                            type: 'integer',
                            example: 429
                        },
                        details: {
                            type: 'object',
                            properties: {
                                insee_error_code: {
                                    type: 'string',
                                    example: "QUOTA_EXCEEDED"
                                },
                                retry_after: {
                                    type: 'string',
                                    example: "3600"
                                }
                            }
                        }
                    }
                },
                // Dans votre section components/schemas
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Chemins vers vos fichiers
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    console.log('📚 Swagger disponible sur: http://localhost:3000/api-docs');
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map