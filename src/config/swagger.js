import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * SWAGGER API DOCUMENTATION CONFIGURATION
 * Powered by OpenAPI 3.0.0. 
 * This provides the interactive UI for testing EMR endpoints.
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Busade EMR-Suite Backend API (Demo)',
      version: '1.0.0',
      description: `
        This is the backend API for the EMR-Suite demo project.
        **Note:** This is a demo of the wiCare EMR system designed to showcase 
        expertise in healthcare workflows, security (RBAC), and auditability.
      `,
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development server'
      },
      {
        url: 'https://api.your-production-url.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your Access Token to authorize requests.'
        }
      },
      schemas: {
        /**
         * AUDIT LOG SCHEMA
         * Essential for medical compliance (HIPAA/GDPR style logging).
         */
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            action: { type: 'string', example: 'LOGIN' },
            resource: { type: 'string', example: 'user' },
            status: { type: 'string', example: 'SUCCESS' },
            ipAddress: { type: 'string', example: '127.0.0.1' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-04-11T14:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-04-11T14:00:00Z' },
          },
        },
        // Placeholder for User, Appointment, Patient schemas
      },
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  // Automatically scans your route files for JSDoc comments
  apis: ['./src/routes/*.js', './src/docs/*.yaml'], 
};

const specs = swaggerJsdoc(options);

/**
 * Mounts the Swagger UI to the Express application.
 * Access via: http://localhost:5000/api/docs
 */
export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps JWT active after page refresh (Great for DX)
    }
  }));
}
/* 
👉 http://localhost:5000/api/docs

To validate specific route

npx swagger-cli validate src/routes/roles.route.js 

To validate all routes
npx swagger-cli validate swagger.json

*/