import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EMR-Suite Backend API (Demo)',
      version: '1.0.0',
      description: `
        This is the backend API for the EMR-Suite demo project.
        **Note:** This is a demo of the wiCare EMR system for recruitment purposes. 
        Only selected modules and functionalities are exposed.
      `,
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development server'
      },
      {
        url: 'https://your-production-url.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    schemas: {
        AuditLog: {
            type: 'object',
            properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            action: { type: 'string', example: 'LOGIN' },
            resource: { type: 'string', example: 'user' },
            status: { type: 'string', example: 'SUCCESS' },
            ipAddress: { type: 'string', example: '127.0.0.1' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-08-22T14:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-08-22T14:00:00Z' },
            },
        },
        // Add other schemas here for User, Appointment, Patient, etc.
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js', './src/docs/*.yaml'], // Paths to API docs
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}
