import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Öğrenci Bilgi Sistemi (OBS) API',
      version: '1.0.0',
      description:
        'OBS REST API — Admin, Akademisyen ve Öğrenci rollerine sahip tam kapsamlı akademik otomasyon sistemi.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Geliştirme Sunucusu',
      },
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
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'İşlem başarılı' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Doğrulama hatası' },
            code: { type: 'string', example: 'VALIDATION_ERROR', nullable: true },
            errors: {
              type: 'array',
              nullable: true,
              items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
              example: [{ field: 'email', message: 'Geçerli bir email adresi giriniz' }],
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Geçersiz veri veya doğrulama hatası',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Unauthorized: {
          description: 'Oturum açılmamış veya token geçersiz',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Yetki yetersiz (Örn: Sadece ADMIN rolü erişebilir)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'İstenen kaynak bulunamadı',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        InternalError: {
          description: 'Sunucu tarafında beklenmeyen hata',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
