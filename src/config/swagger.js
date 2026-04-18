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
    tags: [
      {
        name: 'Roles',
        description: 'Role management (RBAC core)',
      },
      {
        name: 'Role Permissions',
        description: 'Role-permission matrix operations',
      },
      {
        name: 'User Roles',
        description: 'Assigning roles to users',
      },
      {
        name: 'User Permissions',
        description: 'Direct permission assignment (PBAC override)',
      }
    ],
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
        MaritalStatus: {
          type: 'string',
          enum: ['single', 'married', 'divorced', 'widowed']
        },
        bloodGroup: {
          type: 'string',
          enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
          example: 'O+'
        },

        genotype: {
          type: 'string',
          enum: ['AA','AS','SS','AC','SC'],
          example: 'AA'
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
         * USER
         * =========================
         */
        UserUpdateProfile: {
          type: 'object',
          properties: {
            fName: { type: 'string', example: 'John' },
            lName: { type: 'string', example: 'Doe' },
            designation: { type: 'string', example: 'Senior Nurse' },
            email: { type: 'string', example: 'john@hospital.com' }
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
              example: 'user'
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

            maritalStatus: {
              allOf: [{ $ref: '#/components/schemas/MaritalStatus' }],
              nullable: true,
              example: 'single',
              description: 'Allowed values: single, married, divorced, widowed, separated'
            },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            nationality: { type: 'string', nullable: true },
            stateOfOrigin: { type: 'string', nullable: true },
            occupation: { type: 'string', nullable: true },

            bloodGroup: {
              allOf: [{ $ref: '#/components/schemas/bloodGroup' }],
              nullable: true,
              example: 'single'              
            },

            genotype: {
              allOf: [{ $ref: '#/components/schemas/genotype' }],
              nullable: true,
              example: 'single'
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
            maritalStatus: {
              allOf: [{ $ref: '#/components/schemas/MaritalStatus' }],
              nullable: true,
              example: 'single',
              description: 'Allowed values: single, married, divorced, widowed, separated'
            },
            nationality: { type: 'string' },
            stateOfOrigin: { type: 'string' },
            occupation: { type: 'string' },
            bloodGroup: {
              allOf: [{ $ref: '#/components/schemas/bloodGroup' }],
              nullable: true,
              example: 'single'              
            },

            genotype: {
              allOf: [{ $ref: '#/components/schemas/genotype' }],
              nullable: true,
              example: 'single'
            }
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
            },
            type: {
              type: 'string',
              enum: [
                'consultation',
                'follow_up',
                'emergency',
                'admission',
                'procedure'
              ]
            }
          },
        },
        CreateAppointment: {
          type: 'object',
          required: [
            'patientId',
            'staffId',
            'appointmentDate',
            'appointmentTime',
            'type'
          ],
          properties: {
            patientId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            staffId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2026-04-12',
              description: 'Must be today or a future date. Past dates are not allowed.'
            },
            appointmentTime: {
              type: 'string',
              example: '10:30'
            },
            type: {
              type: 'string',
              enum: ['consultation', 'follow_up', 'emergency', 'procedure'],
              example: 'consultation'
            },
            reason: {
              type: 'string',
              example: 'Routine checkup',
              nullable: true
            },
            notes: {
              type: 'string',
              nullable: true
            }
          }
        },
        UpdateAppointment: {
          type: 'object',
          description: 'Fields are optional. Only provided fields will be updated.',
          properties: {
            staffId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2026-04-12',
              description: 'Must be today or a future date. Past dates are not allowed.'
            },
            appointmentTime: {
              type: 'string',
              example: '10:30'
            },
            type: {
              type: 'string',
              enum: ['consultation', 'follow_up', 'emergency', 'procedure'],
              example: 'consultation'
            },
            status: {
              type: 'string',
              enum: [
                'scheduled',
                'checked_in',
                'awaiting_vitals',
                'vitals_taken',
                'in_consultation',
                'completed',
                'canceled'
              ],
              example: 'checked_in',
              description: 'Must follow allowed lifecycle transitions'
            },
            reason: {
              type: 'string',
              example: 'Routine checkup',
              nullable: true
            },
            notes: {
              type: 'string',
              nullable: true
            },
            updatedBy: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
          }
        },
        PaginatedAppointments: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'SUCCESS'
            },
            message: {
              type: 'string',
              example: 'Appointments retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                rows: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Appointment'
                  }
                },
                page: {
                  type: 'integer',
                  example: 1
                },
                pages: {
                  type: 'integer',
                  example: 5
                },
                total: {
                  type: 'integer',
                  example: 100
                }
              }
            }
          }
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
        CreateBill: {
          type: 'object',
          required: ['patientId', 'appointmentId', 'amount'],
          properties: {
            patientId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            appointmentId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            amount: {
              type: 'number',
              example: 5000,
              description: 'Must be a positive number'
            },
            status: {
              type: 'string',
              enum: ['unpaid', 'paid', 'partially_paid', 'cancelled'],
              default: 'unpaid',
              example: 'unpaid'
            },
            dueDate: {
              type: 'string',
              format: 'date',
              example: '2026-04-20',
              nullable: true
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'transfer', 'insurance'],
              nullable: true,
              example: 'cash'
            },
            notes: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              example: 'Patient paid partially'
            }
          }
        },
        UpdateBill: {
          type: 'object',
          description: 'All fields are optional. Only provided fields will be updated.',
          properties: {
            amount: {
              type: 'number',
              example: 7000,
              description: 'Must be a positive number'
            },
            status: {
              type: 'string',
              enum: ['unpaid', 'paid', 'partially_paid', 'cancelled'],
              example: 'paid'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'transfer', 'insurance'],
              nullable: true,
              example: 'transfer'
            },
            dueDate: {
              type: 'string',
              format: 'date',
              example: '2026-04-25',
              nullable: true
            },
            notes: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              example: 'Updated after payment confirmation'
            }
          }
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
            diagnosis: { 
              type: 'string', 
              example: 'Malaria',
              nullable: true 
            },
            subjective: { type: 'string', example: 'Patient complains of headache' },
            objective: { type: 'string', example: 'BP 120/80, Temp 37°C' },
            assessment: { type: 'string', example: 'Migraine' },
            plan: { type: 'string', example: 'Prescribed analgesics' },

            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateClinicalNote: {
          type: 'object',
          required: ['patientId', 'appointmentId'],
          properties: {
            patientId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            appointmentId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            diagnosis: {
              type: 'string',
              minLength: 3,
              maxLength: 1000,
              example: 'Migraine',
              nullable: true
            },
            subjective: {
              type: 'string',
              example: 'Patient complains of headache',
              nullable: true
            },
            objective: {
              type: 'string',
              example: 'BP 120/80, Temp 37°C',
              nullable: true
            },
            assessment: {
              type: 'string',
              example: 'Migraine',
              nullable: true
            },
            plan: {
              type: 'string',
              example: 'Prescribed analgesics',
              nullable: true
            }
          }
        },
        UpdateClinicalNote: {
          type: 'object',
          description: 'All fields are optional. Only provided fields will be updated.',
          properties: {
            diagnosis: { type: 'string', nullable: true },
            subjective: { type: 'string', nullable: true },
            objective: { type: 'string', nullable: true },
            assessment: { type: 'string', nullable: true },
            plan: { type: 'string', nullable: true }
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
        },
        /**
       * ROLES
       */
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'admin' },
            description: { type: 'string', example: 'System administrator' }
          }
        },

        AttachRole: {
          type: 'object',
          required: ['roleId'],
          properties: {
            roleId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            }
          }
        },

        UpdateUserRoles: {
          type: 'object',
          required: ['roleIds'],
          properties: {
            roleIds: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              },
              example: [
                "550e8400-e29b-41d4-a716-446655440000",
                "550e8400-e29b-41d4-a716-446655440001"
              ]
            }
          }
        },
        RolePermissionsUpdate: {
          type: 'object',
          required: ['permissions'],
          properties: {
            permissions: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'PATIENT_READ',
                  'PATIENT_CREATE',
                  'PATIENT_UPDATE',
                  'PATIENT_DELETE',
                  'APPOINTMENT_READ',
                  'APPOINTMENT_CREATE',
                  'APPOINTMENT_UPDATE'
                ]
              }
            }
          }
        },
        /**
         * PERMISSION
         */
        Permission: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            key: { type: 'string', example: 'USER_CREATE' },
            name: { type: 'string', example: 'Create User' }
          }
        },

        PermissionArray: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Permission'
          }
        },

        UpdateUserPermissions: {
          type: 'object',
          required: ['permissionIds'],
          properties: {
            permissionIds: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              },
              example: [
                "550e8400-e29b-41d4-a716-446655440000",
                "550e8400-e29b-41d4-a716-446655440001"
              ]
            }
          }
        },

        AttachPermission: {
          type: 'object',
          required: ['permissionId'],
          properties: {
            permissionId: {
              type: 'string',
              format: 'uuid',
              example: "550e8400-e29b-41d4-a716-446655440000"
            }
          }
        },
        /**
         * VITALS
         */
        Vital: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              patientId: { type: 'string', format: 'uuid' },
              appointmentId: { type: 'string', format: 'uuid' },
              readingAt: { type: 'string', format: 'date-time' },

              temperature: { type: 'number', example: 36.6 },
              heartRate: { type: 'integer', example: 72 },
              bloodPressure: {
                type: 'string',
                example: '120/80',
                description: 'Format: Systolic/Diastolic. Systolic must be greater than diastolic.'
              },
              respiratoryRate: { type: 'integer', example: 18 },
              weightKg: { type: 'number', example: 70 },
              heightCm: { type: 'number', example: 175 },
              spo2: { type: 'number', example: 98 },
              painScale: { type: 'integer', example: 2 },

              notes: { type: 'string', nullable: true },

              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
        },

        CreateVital: {
          type: 'object',
          required: ['patientId', 'appointmentId', 'readingAt'],
          properties: {
            patientId: { type: 'string', format: 'uuid' },
            appointmentId: { type: 'string', format: 'uuid' },
            readingAt: {
              type: 'string',
              format: 'date-time',
              description: 'ISO 8601 datetime'
            },

            temperature: { type: 'number', minimum: 30, maximum: 45 },
            heartRate: { type: 'integer', minimum: 30, maximum: 200 },

            bloodPressure: {
              type: 'string',
              pattern: '^\\d{2,3}/\\d{2,3}$',
              example: '120/80',
              description: 'Systolic must be greater than diastolic'
            },

            respiratoryRate: { type: 'integer', minimum: 5, maximum: 60 },
            weightKg: { type: 'number' },
            heightCm: { type: 'number' },
            spo2: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              nullable: true
            },
            painScale: { type: 'integer', minimum: 0, maximum: 10 },
            notes: { type: 'string', nullable: true }
          }
        },

        UpdateVital: {
          type: 'object',
          properties: {
            temperature: { type: 'number', minimum: 30, maximum: 45 },
            heartRate: { type: 'integer', minimum: 30, maximum: 220 },
            bloodPressure: {
              type: 'string',
              pattern: '^\\d{2,3}/\\d{2,3}$'
            },
            respiratoryRate: { type: 'integer', minimum: 5, maximum: 60 },
            spo2: { type: 'number', minimum: 50, maximum: 100 },
            weightKg: { type: 'number' },
            heightCm: { type: 'number' },
            notes: { type: 'string' }
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
        tagsSorter: 'alpha'
      },
    })
  );
}
/* 
 http://localhost:5000/api/docs

To validate specific route

npx swagger-cli validate src/routes/roles.route.js 

To validate all routes
npx swagger-cli validate swagger.json

*/