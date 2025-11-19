const swaggerDefinitions = require('./swaggerDefinitions');

/**
 * Get API base URL dynamically
 * Always uses request hostname if available, falls back to environment variable or localhost
 */
function getApiBaseUrl(req = null) {
  // Priority 1: Use API_BASE_URL if set (most reliable for production)
  if (process.env.API_BASE_URL) {
    try {
      const url = new URL(process.env.API_BASE_URL);
      // Validate it's a proper URL
      if (url.hostname && url.hostname !== 'localhost') {
        return process.env.API_BASE_URL;
      }
    } catch (e) {
      // Invalid URL, continue to next priority
    }
  }
  
  // Priority 2: Get from request (auto-detects hostname)
  if (req) {
    // Get protocol (handles reverse proxy correctly with trust proxy)
    // Check X-Forwarded-Proto header first (from reverse proxy)
    let protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    // Ensure https for production (if not explicitly http)
    if (protocol !== 'https' && protocol !== 'http') {
      protocol = 'https';
    }
    
    // Get host from request headers (most reliable)
    // X-Forwarded-Host is set by reverse proxies
    const forwardedHost = req.get('x-forwarded-host');
    const hostHeader = req.get('host');
    const host = forwardedHost || hostHeader || req.hostname;
    
    // Only use request hostname if it's not localhost (means it's a real server)
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      // Get base path from request or API_BASE_URL
      let basePath = '';
      
      // Check if API_BASE_URL has a path
      if (process.env.API_BASE_URL) {
        try {
          const url = new URL(process.env.API_BASE_URL);
          basePath = url.pathname;
        } catch (e) {
          // Invalid URL, try to detect from request
          const requestPath = req.originalUrl || req.url || '';
          if (requestPath.startsWith('/dev/')) {
            basePath = '/dev';
          }
        }
      } else {
        // Detect from request path
        const requestPath = req.originalUrl || req.url || '';
        if (requestPath.startsWith('/dev/')) {
          basePath = '/dev';
        }
      }
      
      const fullUrl = `${protocol}://${host}${basePath}`;
      return fullUrl;
    }
  }
  
  // Priority 3: Fallback to API_BASE_URL even if localhost (better than nothing)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Priority 4: Default to localhost for development
  return 'http://localhost:5000';
}

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

// Export function to get dynamic config
swaggerConfig.getApiBaseUrl = getApiBaseUrl;

module.exports = swaggerConfig;

