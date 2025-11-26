/**
 * Centralized Swagger API Definitions
 * All API endpoint documentation in one place
 */

module.exports = {
  paths: {
    // ==================== System Endpoints ====================
    '/': {
      get: {
        summary: 'Health check endpoint',
        description: 'Returns API status and version information',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Y4D Backend API is running!' },
                    version: { type: 'string', example: '1.0.0' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/test-db': {
      get: {
        summary: 'Test database connection',
        description: 'Tests the database connection and returns a simple query result',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Database connection successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    solution: { type: 'integer', example: 2 },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Database connection failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },

    // ==================== Authentication ====================
    '/api/auth/login': {
      post: {
        summary: 'User login',
        description: 'Authenticate user with username/email and password. Returns JWT token on success.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { username: 'admin', password: 'password123' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '400': {
            description: 'Missing required fields',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials or account not approved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register new user',
        description: 'Register a new user account. User will be in pending status until approved by admin.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    userId: { type: 'integer' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': {
            description: 'Username or email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/verify': {
      get: {
        summary: 'Verify JWT token',
        description: 'Verify if the provided JWT token is valid and return user information',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Token is valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    },

    // ==================== Users ====================
    '/api/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users. Requires admin or super_admin role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '403': { $ref: '#/components/responses/ForbiddenError' }
        }
      },
      post: {
        summary: 'Create new user',
        description: 'Create a new user account. Requires admin or super_admin role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password', 'role'],
                properties: {
                  username: { type: 'string', example: 'newuser' },
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', format: 'password' },
                  role: { type: 'string', enum: ['admin', 'editor', 'viewer'], example: 'editor' },
                  mobile_number: { type: 'string', nullable: true },
                  address: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '403': { $ref: '#/components/responses/ForbiddenError' }
        }
      }
    },
    '/api/users/profile': {
      get: {
        summary: 'Get current user profile',
        description: 'Get the profile information of the currently authenticated user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      }
    },

    // ==================== Banners ====================
    '/api/banners': {
      get: {
        summary: 'Get all banners',
        description: 'Retrieve all banners with optional filtering',
        tags: ['Banners'],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'string' } },
          { in: 'query', name: 'section', schema: { type: 'string' } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'active_only', schema: { type: 'string', enum: ['true', 'false'] } }
        ],
        responses: {
          '200': {
            description: 'List of banners',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Banner' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new banner',
        description: 'Upload and create a new banner with image or video',
        tags: ['Banners'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['media_type', 'page', 'section', 'media'],
                properties: {
                  media: { type: 'string', format: 'binary', description: 'Image or video file (max 50MB)' },
                  media_type: { type: 'string', enum: ['image', 'video'] },
                  page: { type: 'string' },
                  section: { type: 'string' },
                  category: { type: 'string' },
                  is_active: { type: 'boolean', default: true }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Banner created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    id: { type: 'integer' },
                    banner: { $ref: '#/components/schemas/Banner' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' }
        }
      }
    },
    '/api/banners/{id}': {
      put: {
        summary: 'Update a banner',
        description: 'Update an existing banner. Can optionally upload new media file.',
        tags: ['Banners'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['media_type', 'page', 'section'],
                properties: {
                  media: { type: 'string', format: 'binary' },
                  media_type: { type: 'string', enum: ['image', 'video'] },
                  page: { type: 'string' },
                  section: { type: 'string' },
                  category: { type: 'string' },
                  is_active: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Banner updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    banner: { $ref: '#/components/schemas/Banner' }
                  }
                }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      },
      delete: {
        summary: 'Delete a banner',
        description: 'Delete a banner and its associated media file',
        tags: ['Banners'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'Banner deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      }
    },

    // ==================== Mentors ====================
    '/api/mentors': {
      get: {
        summary: 'Get all mentors',
        description: 'Retrieve a list of all mentors',
        tags: ['Mentors'],
        responses: {
          '200': {
            description: 'List of mentors',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' },
                      position: { type: 'string' },
                      bio: { type: 'string' },
                      image: { type: 'string' },
                      social_links: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new mentor',
        description: 'Create a new mentor with image upload',
        tags: ['Mentors'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  position: { type: 'string' },
                  bio: { type: 'string' },
                  image: { type: 'string', format: 'binary' },
                  social_links: { type: 'string', description: 'JSON string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Mentor created successfully' },
          '400': { $ref: '#/components/responses/ValidationError' }
        }
      }
    },
    '/api/mentors/{id}': {
      get: {
        summary: 'Get a single mentor',
        description: 'Retrieve details of a specific mentor by ID',
        tags: ['Mentors'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Mentor retrieved successfully' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      },
      put: {
        summary: 'Update a mentor',
        description: 'Update an existing mentor. Can optionally upload new image.',
        tags: ['Mentors'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  position: { type: 'string' },
                  bio: { type: 'string' },
                  image: { type: 'string', format: 'binary' },
                  social_links: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Mentor updated successfully' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      },
      delete: {
        summary: 'Delete a mentor',
        description: 'Delete a mentor by ID',
        tags: ['Mentors'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Mentor deleted successfully' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      }
    },

    // ==================== Media ====================
    '/api/media/published/{type}': {
      get: {
        summary: 'Get published media items by type',
        description: 'Retrieve all published media items for a specific type (for frontend)',
        tags: ['Media'],
        parameters: [
          {
            in: 'path',
            name: 'type',
            required: true,
            schema: {
              type: 'string',
              enum: ['newsletters', 'stories', 'events', 'blogs', 'documentaries']
            }
          }
        ],
        responses: {
          '200': { description: 'Published media items retrieved successfully' },
          '400': { description: 'Invalid media type' }
        }
      }
    },
    '/api/media/{type}': {
      get: {
        summary: 'Get all media items by type (Admin)',
        description: 'Retrieve all media items for a type (admin view). Requires authentication.',
        tags: ['Media'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'type',
            required: true,
            schema: {
              type: 'string',
              enum: ['newsletters', 'stories', 'events', 'blogs', 'documentaries']
            }
          }
        ],
        responses: {
          '200': { description: 'Media items retrieved successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    },

    // ==================== Our Work ====================
    '/api/our-work/published/{category}': {
      get: {
        summary: 'Get published work items by category',
        description: 'Retrieve all published items for a specific work category (for frontend)',
        tags: ['Our Work'],
        parameters: [
          {
            in: 'path',
            name: 'category',
            required: true,
            schema: {
              type: 'string',
              enum: ['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development']
            }
          }
        ],
        responses: {
          '200': { description: 'Published items retrieved successfully' },
          '400': { description: 'Invalid category' }
        }
      }
    },
    '/api/our-work/published/{category}/{id}': {
      get: {
        summary: 'Get single published work item by ID',
        description: 'Retrieve a single published item by category and ID (for frontend)',
        tags: ['Our Work'],
        parameters: [
          {
            in: 'path',
            name: 'category',
            required: true,
            schema: {
              type: 'string',
              enum: ['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development']
            }
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Item ID'
          }
        ],
        responses: {
          '200': { 
            description: 'Published item retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    content: { type: 'string' },
                    image_url: { type: 'string' },
                    video_url: { type: 'string' },
                    is_active: { type: 'boolean' },
                    display_order: { type: 'integer' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid category' },
          '404': { description: 'Item not found or not published' }
        }
      }
    },
    '/api/our-work/admin/{category}': {
      get: {
        summary: 'Get all work items by category (Admin)',
        description: 'Retrieve all items for a category (admin view). Requires authentication.',
        tags: ['Our Work'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'category',
            required: true,
            schema: {
              type: 'string',
              enum: ['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development']
            }
          }
        ],
        responses: {
          '200': { description: 'Items retrieved successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    },

    // ==================== Management ====================
    '/api/management': {
      get: {
        summary: 'Get all management team members',
        description: 'Retrieve a list of all management team members',
        tags: ['Management'],
        responses: {
          '200': {
            description: 'List of management members',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' },
                      position: { type: 'string' },
                      bio: { type: 'string' },
                      image: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/management/{id}': {
      get: {
        summary: 'Get a management team member',
        description: 'Retrieve details of a specific management team member',
        tags: ['Management'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Management member retrieved successfully' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      }
    },

    // ==================== Board Trustees ====================
    '/api/board-trustees': {
      get: {
        summary: 'Get all board trustees',
        description: 'Retrieve a list of all board of trustees members',
        tags: ['Board Trustees'],
        responses: {
          '200': {
            description: 'List of board trustees',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' }
                }
              }
            }
          }
        }
      }
    },

    // ==================== Careers ====================
    '/api/careers': {
      get: {
        summary: 'Get all careers',
        description: 'Retrieve a list of all career/job postings',
        tags: ['Careers'],
        responses: {
          '200': {
            description: 'List of careers',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' }
                }
              }
            }
          }
        }
      }
    },

    // ==================== Reports ====================
    '/api/reports': {
      get: {
        summary: 'Get all reports',
        description: 'Retrieve all reports. Requires authentication.',
        tags: ['Reports'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Reports retrieved successfully' },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    },

    // ==================== Accreditations ====================
    '/api/accreditations': {
      get: {
        summary: 'Get all accreditations',
        description: 'Retrieve a list of all accreditations',
        tags: ['Accreditations'],
        responses: {
          '200': {
            description: 'List of accreditations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' }
                }
              }
            }
          }
        }
      }
    },

    // ==================== Permissions ====================
    '/api/permissions/user/{userId}': {
      get: {
        summary: 'Get user permissions',
        description: 'Retrieve all permissions for a specific user. Requires admin or super_admin role.',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'userId', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'User permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      user_id: { type: 'integer' },
                      section: { type: 'string' },
                      sub_section: { type: 'string', nullable: true },
                      can_view: { type: 'boolean' },
                      can_create: { type: 'boolean' },
                      can_edit: { type: 'boolean' },
                      can_delete: { type: 'boolean' },
                      can_publish: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '403': { $ref: '#/components/responses/ForbiddenError' }
        }
      },
      put: {
        summary: 'Update user permissions',
        description: 'Update permissions for a specific user. Requires admin or super_admin role.',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'userId', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  permissions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        section: { type: 'string' },
                        sub_section: { type: 'string', nullable: true },
                        can_view: { type: 'boolean' },
                        can_create: { type: 'boolean' },
                        can_edit: { type: 'boolean' },
                        can_delete: { type: 'boolean' },
                        can_publish: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Permissions updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    updatedCount: { type: 'integer' }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '403': { $ref: '#/components/responses/ForbiddenError' }
        }
      }
    },
    '/api/permissions/my-permissions': {
      get: {
        summary: 'Get current user permissions',
        description: 'Retrieve permissions for the currently authenticated user',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    roleBased: { type: 'boolean' },
                    permissions: {
                      oneOf: [
                        { type: 'object', description: 'Role-based permissions' },
                        { type: 'array', description: 'Custom permissions array' }
                      ]
                    }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    }
  }
};

