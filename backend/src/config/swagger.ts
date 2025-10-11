import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { swaggerDefinitions } from './swagger-definitions';

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinitions,
  apis: [] // Vous n'avez plus besoin de scanner les fichiers
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 Swagger disponible sur: http://localhost:3000/api-docs');
};