import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * SWAGGER API DOCUMENTATION CONFIGURATION
 * OpenAPI 3.0 - EMR-Suite Demo Backend
 */
const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Busade EMR-Suite Backend API (Demo)',
      version: '1.0.0',
      description: `
      This is the backend API for the Busade EMR-Suite demo project.
      **Note:** This is a demo of the wiCare EMR system designed to demonstrates:
      - Patient management
      - Appointment scheduling
      - Clinical workflows (Vitals, Notes)
      - Billing & invoices
      - Authentication, RBAC & PBAC
      - Audit logging
            `,
    },

    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api',
        description: 'Development Server',
      },
      {
        url: 'https://emr.busade.dev/api',
        description: 'Production Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header',
        },
      },

      schemas: {
        /**
         * AUTH RESPONSE (FIXED - NO MORE $ref ERROR)
         */
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                email: { type: 'string', example: 'doctor@busade.com' },
                fullName: { type: 'string', example: 'John Doe' },
                role: { type: 'string', example: 'doctor' },
              },
            },
            accessToken: {
              type: 'string',
              example: 'jwt.access.token',
            },
            refreshToken: {
              type: 'string',
              example: 'jwt.refresh.token',
            },
          },
        },

        /**
         * AUDIT LOG
         */
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            userId: { type: 'string', example: 'uuid' },
            action: { type: 'string', example: 'USER_LOGIN' },
            entity: { type: 'string', example: 'user' },
            entityId: { type: 'string', example: 'uuid' },
            ip: { type: 'string', example: '127.0.0.1' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-11T14:00:00Z',
            },
          },
        },

        /**
         * PATIENT (MINIMAL FOR DEMO)
         */
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            gender: { type: 'string' },
            status: { type: 'string' },
          },
        },

        /**
         * APPOINTMENT
         */
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            staffId: { type: 'string' },
            appointmentDate: { type: 'string', format: 'date' },
            appointmentTime: { type: 'string' },
            status: { type: 'string' },
          },
        },

        /**
         * BILLING
         */
        Bill: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string' },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  /**
   * AUTO-SCAN ROUTES (MATCHING YOUR CURRENT DDD STRUCTURE)
   */
  apis: [
    './src/modules/**/*.js',
    './src/shared/**/*.js',
    './src/docs/**/*.yaml',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * Swagger UI Setup
 */
export function setupSwagger(app) {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}
/* 
👉 http://localhost:5000/api/docs

To validate specific route

npx swagger-cli validate src/routes/roles.route.js 

To validate all routes
npx swagger-cli validate swagger.json

*/