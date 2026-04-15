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
        ApiResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object', nullable: true }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'admin@busade-emr-demo.com'
            },
            password: {
              type: 'string',
              example: 'admin@123'
            }
          }
        },
        /**
         * =========================
         * AUTH RESPONSE
         * =========================
         */
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    fullName: { type: 'string' },
                    role: { type: 'string' }
                  }
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        },
        AuthData: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' }
              }
            },
            accessToken: {
              type: 'string'
            },
            refreshToken: {
              type: 'string'
            }
          }
        },
        /**
         * =========================
         * AUDIT LOG
         * =========================
         */
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            action: {
              type: 'string',
              example: 'USER_LOGIN'
            },
            entity: {
              type: 'string',
              example: 'patient'
            },
            entityId: {
              type: 'string',
              format: 'uuid'
            },
            ip: {
              type: 'string',
              example: '127.0.0.1'
            },
            userAgent: {
              type: 'string',
              example: 'Mozilla/5.0'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PaginatedAuditLogs: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Audit logs retrieved successfully' },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AuditLog'
                  }
                },
                page: { type: 'integer', example: 1 },
                pages: { type: 'integer', example: 5 },
                total: { type: 'integer', example: 100 }
              }
            }
          }
        },
        
        /**
         * =========================
         * PATIENT (CORE ENTITY)
         * =========================
         */
        PatientCreate: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'dob', 'gender'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@demo.com' },
            password: { type: 'string', example: 'StrongPass123' },
            dob: { type: 'string', format: 'date', example: '1995-01-01' },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'unknown']
            },

            middleName: { type: 'string', nullable: true },
            maritalStatus: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            nationality: { type: 'string', nullable: true },
            stateOfOrigin: { type: 'string', nullable: true },
            occupation: { type: 'string', nullable: true },

            bloodGroup: {
              type: 'string',
              enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
              nullable: true
            },

            genotype: {
              type: 'string',
              enum: ['AA','AS','SS','AC','SC'],
              nullable: true
            },

            emergencyContactName: { type: 'string', nullable: true },
            emergencyContactPhone: { type: 'string', nullable: true },
            emergencyRelationship: { type: 'string', nullable: true },

            profileImage: { type: 'string', nullable: true }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },

            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            fullName: { type: 'string', example: 'John Doe' },

            email: { type: 'string', example: 'john@demo.com' },
            phone: { type: 'string', example: '09055556666' },

            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'unknown']
            },

            dob: { type: 'string', format: 'date', example: '1995-01-01' },

            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'deceased']
            },

            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PatientUpdate: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'unknown']
            },
            maritalStatus: { type: 'string' },
            nationality: { type: 'string' },
            stateOfOrigin: { type: 'string' },
            occupation: { type: 'string' },
            bloodGroup: { type: 'string' },
            genotype: { type: 'string' }
          }
        },
        /**
         * =========================
         * APPOINTMENT
         * =========================
         */
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },

            patientId: { type: 'string', format: 'uuid' },
            staffId: { type: 'string', format: 'uuid' },

            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2026-04-14'
            },

            appointmentTime: {
              type: 'string',
              example: '14:30'
            },

            status: {
              type: 'string',
              enum: [
                'scheduled',
                'checked_in',
                'vitals_taken',
                'in_consultation',
                'completed',
                'canceled',
                'no_show'
              ]
            }
          },
        },

        /**
         * =========================
         * BILLING
         * =========================
         */
        Bill: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },

            patientId: { type: 'string', format: 'uuid' },

            amount: {
              type: 'number',
              example: 5000
            },

            status: {
              type: 'string',
              enum: ['pending', 'paid', 'partially_paid', 'cancelled']
            }
          },
        },
        PaginatedBills: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Bills retrieved successfully' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Bill'
              }
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                pages: { type: 'number', example: 5 },
                total: { type: 'number', example: 100 }
              }
            }
          }
        },
        /**
         * CLINICAL NOTE
         */
        ClinicalNote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            appointmentId: { type: 'string', format: 'uuid' },
            staffId: { type: 'string', format: 'uuid' },

            subjective: { type: 'string', example: 'Patient complains of headache' },
            objective: { type: 'string', example: 'BP 120/80, Temp 37°C' },
            assessment: { type: 'string', example: 'Migraine' },
            plan: { type: 'string', example: 'Prescribed analgesics' },

            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PaginatedClinicalNotes: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Clinical notes retrieved successfully' },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ClinicalNote'
                  }
                },
                page: { type: 'integer', example: 1 },
                pages: { type: 'integer', example: 5 },
                total: { type: 'integer', example: 50 }
              }
            }
          }
        },
        UpdateClinicalNote: {
          type: 'object',
          properties: {
            subjective: { type: 'string' },
            objective: { type: 'string' },
            assessment: { type: 'string' },
            plan: { type: 'string' }
          }
        },
        /**
         * METRICS
         */
        MetricsData: {
          type: 'object',
          properties: {
            patientCount: {
              type: 'integer',
              example: 120
            },
            userCount: {
              type: 'integer',
              example: 45
            },
            totalAppointments: {
              type: 'integer',
              example: 320
            },

            revenue: {
              type: 'number',
              example: 12500.5
            },
            revenuePending: {
              type: 'number',
              example: 2300
            },

            monthlyPatientTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: {
                    type: 'string',
                    example: '2026-01'
                  },
                  visits: {
                    type: 'integer',
                    example: 45
                  }
                }
              }
            },

            clinical: {
              type: 'object',
              description: 'Doctor-facing dashboard metrics'
            },

            nurse: {
              type: 'object',
              description: 'Nurse operational dashboard metrics'
            },

            prometheusMetrics: {
              type: 'string',
              description: 'Raw Prometheus metrics output'
            }
          }
        },
        MetricsResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string', example: 'Metrics retrieved successfully' },
            data: {
              $ref: '#/components/schemas/MetricsData'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'SUCCESS' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {}
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                pages: { type: 'number' },
                total: { type: 'number' }
              }
            }
          }
        }
        
      },
      responses: {
          Unauthorized: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'FAIL' },
                    message: { type: 'string', example: 'Authentication required' }
                  }
                }
              }
            }
          },
          Forbidden: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'FAIL' },
                    message: { type: 'string', example: 'Access denied: Insufficient permissions' }
                  }
                }
              }
            }
          },
          NotFound: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'FAIL' },
                    message: { type: 'string', example: 'Resource not found' }
                  }
                }
              }
            }
        },
        Conflict: {
          description: 'Resource Conflict - (duplicate email, phone, etc)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'FAIL' },
                  message: { type: 'string', example: 'Conflict' }
                }
              }
            }
          }
        }
      }
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