// config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
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
              description: 'ID du membre'
            },
            societe_id: {
              type: 'string',
              description: 'ID de la société'
            }
          }
        },
        Plan: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '17'
            },
            name: {
              type: 'string',
              example: 'Gratuit'
            },
            price: {
              type: 'number',
              example: 0
            },
            period: {
              type: 'string',
              example: 'mois'
            },
            description: {
              type: 'string',
              example: 'Plan de découverte'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            popular: {
              type: 'boolean',
              example: false
            },
            color: {
              type: 'string',
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
              }
            },
            detailed_features: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            why_choose: {
              type: 'string',
              example: 'Idéal pour tester'
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
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Chemins vers vos fichiers
};


const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 Swagger disponible sur: http://localhost:3000/api-docs');
};