import env from './env';

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
});

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SMK - Gestor de Documentos CSV - API',
    version: '1.0.0',
    description:
      'API REST para autenticacion (JWT), gestion de usuarios con roles (RBAC) y carga/validacion/descarga de documentos CSV.',
  },
  servers: [{ url: `http://localhost:${env.port}/api`, description: 'Servidor local' }],
  tags: [
    { name: 'Auth', description: 'Registro y autenticacion de usuarios' },
    { name: 'Documents', description: 'Carga, listado, descarga y borrado de documentos CSV' },
    { name: 'Health', description: 'Estado del servicio' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Mensaje de error' },
          details: {
            type: 'array',
            items: {},
            nullable: true,
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'password', 'confirmPassword', 'role'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 80, example: 'juan_perez' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
          confirmPassword: { type: 'string', minLength: 6, example: 'secret123' },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description:
'No se permite crear administradores desde el registro público. Solo el primer usuario del sistema puede ser administrador. Todos los usuarios creados después tendrán el rol "user".',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'juan_perez' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'juan_perez' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
      LoginResponseData: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/UserPublic' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          originalName: { type: 'string', example: 'clientes.csv' },
          storedName: { type: 'string', example: 'a1b2c3d4.csv' },
          storageKey: { type: 'string', example: 'documents/a1b2c3d4.csv' },
          recordCount: { type: 'integer', example: 3 },
          userId: { type: 'integer', example: 1 },
          uploadedAt: { type: 'string', format: 'date-time' },
          uploadedBy: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'juan_perez' },
            },
          },
        },
      },
      CsvRowError: {
        type: 'object',
        properties: {
          row: { type: 'integer', example: 3 },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'correo' },
                message: { type: 'string', example: 'Formato de correo invalido: "no-es-email"' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica que el servicio esta activo',
        responses: {
          200: {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean' }, status: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registra un nuevo usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserPublic' },
                  },
                },
              },
            },
          },
          400: errorResponse('Datos de entrada invalidos (ej. contrasenas no coinciden)'),
          409: errorResponse('El nombre de usuario ya existe'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica un usuario y retorna un JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/LoginResponseData' },
                  },
                },
              },
            },
          },
          401: errorResponse('Credenciales invalidas'),
        },
      },
    },
    '/documents': {
      get: {
        tags: ['Documents'],
        summary: 'Lista todos los documentos cargados',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado de documentos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
                  },
                },
              },
            },
          },
          401: errorResponse('Token no proporcionado o invalido'),
        },
      },
    },
    '/documents/template': {
      get: {
        tags: ['Documents'],
        summary: 'Descarga la plantilla CSV de ejemplo',
        description:
          'Sirve un CSV de muestra con las columnas y el formato esperado (correo, nombre, ' +
          'telefono, ciudad, notas). Se genera una sola vez y se guarda en S3 al arrancar el servidor.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Plantilla CSV',
            content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
          },
          401: errorResponse('Token no proporcionado o invalido'),
        },
      },
    },
    '/documents/upload': {
      post: {
        tags: ['Documents'],
        summary: 'Carga y valida un archivo CSV',
        description:
          'Valida cada fila del CSV (correo, nombre, telefono, ciudad obligatorios; notas opcional). ' +
          'Si alguna fila es invalida, se rechaza el archivo completo (422) con el detalle fila por fila.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Archivo procesado y guardado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
            },
          },
          400: errorResponse('No se adjunto archivo o el archivo no es .csv'),
          401: errorResponse('Token no proporcionado o invalido'),
          422: {
            description: 'El CSV contiene filas invalidas o la estructura de columnas es incorrecta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    details: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CsvRowError' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/documents/{id}/download': {
      get: {
        tags: ['Documents'],
        summary: 'Descarga el archivo CSV original',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Archivo CSV',
            content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
          },
          401: errorResponse('Token no proporcionado o invalido'),
          404: errorResponse('Documento no encontrado'),
        },
      },
    },
    '/documents/{id}': {
      delete: {
        tags: ['Documents'],
        summary: 'Elimina un documento y sus registros (solo admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Documento eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean' }, message: { type: 'string' } },
                },
              },
            },
          },
          401: errorResponse('Token no proporcionado o invalido'),
          403: errorResponse('El usuario autenticado no tiene rol admin'),
          404: errorResponse('Documento no encontrado'),
        },
      },
    },
  },
};

export default swaggerSpec;
