const swaggerDefinitions = require('./swaggerDefinitions');

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Y4D Backend API',
    version: '1.0.0',
    description: 'RESTful API documentation for Y4D (Youth 4 Development) Dashboard',
    contact: {
      name: 'Y4D API Support',
      email: 'support@y4d.org'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'editor', 'viewer'],
              description: 'User role'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'suspended'],
              description: 'User account status'
            },
            mobile_number: {
              type: 'string',
              nullable: true,
              description: 'Mobile number'
            },
            address: {
              type: 'string',
              nullable: true,
              description: 'User address'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username or email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['admin', 'editor', 'viewer'],
              default: 'viewer',
              description: 'User role (optional)'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details (development only)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        },
        // Banner Schema
        Banner: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            media_type: {
              type: 'string',
              enum: ['image', 'video']
            },
            media: {
              type: 'string',
              description: 'Media file name'
            },
            page: {
              type: 'string',
              description: 'Page where banner is displayed'
            },
            section: {
              type: 'string',
              description: 'Section on the page'
            },
            category: {
              type: 'string',
              description: 'Banner category'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether banner is active'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Access token required'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Validation failed',
                details: 'Missing required fields'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'System',
        description: 'System and health check endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Admin only)'
      },
      {
        name: 'Banners',
        description: 'Banner management endpoints'
      },
      {
        name: 'Mentors',
        description: 'Mentor management'
      },
      {
        name: 'Media',
        description: 'Media content management'
      },
      {
        name: 'Our Work',
        description: 'Our work content management'
      },
      {
        name: 'Management',
        description: 'Management team management'
      },
      {
        name: 'Board Trustees',
        description: 'Board of trustees management'
      },
      {
        name: 'Careers',
        description: 'Career/job posting management'
      },
      {
        name: 'Reports',
        description: 'Reports management'
      },
      {
        name: 'Accreditations',
        description: 'Accreditations management'
      },
      {
        name: 'Permissions',
        description: 'User permissions management'
      }
    ],
    paths: swaggerDefinitions.paths
};

module.exports = swaggerConfig;

