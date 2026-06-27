const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { UsuarioSchema, UsuarioCreate, UsuarioUpdate } = require('./src/models/usuario');
const { ProyectoSchema, ProyectoCreate, ProyectoUpdate } = require('./src/models/proyecto');
const { InventarioItemSchema, InventarioItemCreate, InventarioItemUpdate } = require('./src/models/inventario');
const { EmpleadoSchema, EmpleadoCreate, EmpleadoUpdate } = require('./src/models/empleado');
const { FinanzaSchema, FinanzaCreate, FinanzaUpdate } = require('./src/models/finanza');
const { LicitacionSchema, LicitacionCreate, LicitacionUpdate } = require('./src/models/licitacion');
const { PlanoSchema, PlanoCreate, PlanoUpdate } = require('./src/models/plano');
const { ReporteDiarioSchema, ReporteDiarioCreate, ReporteDiarioUpdate } = require('./src/models/reporteDiario');
const { SolicitudMaterialSchema, SolicitudMaterialCreate, SolicitudMaterialUpdate } = require('./src/models/solicitudMaterial');
const { SolicitudDineroSchema, SolicitudDineroCreate, SolicitudDineroUpdate } = require('./src/models/solicitudDinero');
const { OrdenCompraSchema, OrdenCompraCreate, OrdenCompraUpdate } = require('./src/models/ordenCompra');
const { InspeccionCalidadSchema, InspeccionCalidadCreate, InspeccionCalidadUpdate } = require('./src/models/inspeccionCalidad');
const { IncidenteSeguridadSchema, IncidenteSeguridadCreate, IncidenteSeguridadUpdate } = require('./src/models/incidenteSeguridad');

const app = express();
app.use(helmet()); // Seguridad HTTP básica

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' })); // Prevenir payloads excesivamente grandes
app.use(cookieParser());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send({ message: 'API en linea (construcción) - /api' });
});

// Swagger options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Construcción en Linea',
      version: '1.0.0',
      description: 'API REST en Linea para tu Frontend'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
      
        Usuario: UsuarioSchema,
        UsuarioCreate: UsuarioCreate,
        UsuarioUpdate: UsuarioUpdate,

        Proyecto: ProyectoSchema,
        ProyectoCreate: ProyectoCreate,
        ProyectoUpdate: ProyectoUpdate,

        InventarioItem: InventarioItemSchema,
        InventarioItemCreate: InventarioItemCreate,
        InventarioItemUpdate: InventarioItemUpdate,

        Empleado: EmpleadoSchema,
        EmpleadoCreate: EmpleadoCreate,
        EmpleadoUpdate: EmpleadoUpdate,

        Finanza: FinanzaSchema,
        FinanzaCreate: FinanzaCreate,
        FinanzaUpdate: FinanzaUpdate,

        Licitacion: LicitacionSchema,
        LicitacionCreate: LicitacionCreate,
        LicitacionUpdate: LicitacionUpdate,

        Plano: PlanoSchema,
        PlanoCreate: PlanoCreate,
        PlanoUpdate: PlanoUpdate,

        ReporteDiario: ReporteDiarioSchema,
        ReporteDiarioCreate: ReporteDiarioCreate,
        ReporteDiarioUpdate: ReporteDiarioUpdate,

        SolicitudMaterial: SolicitudMaterialSchema,
        SolicitudMaterialCreate: SolicitudMaterialCreate,
        SolicitudMaterialUpdate: SolicitudMaterialUpdate,

        SolicitudDinero: SolicitudDineroSchema,
        SolicitudDineroCreate: SolicitudDineroCreate,
        SolicitudDineroUpdate: SolicitudDineroUpdate,

        OrdenCompra: OrdenCompraSchema,
        OrdenCompraCreate: OrdenCompraCreate,
        OrdenCompraUpdate: OrdenCompraUpdate,

        InspeccionCalidad: InspeccionCalidadSchema,
        InspeccionCalidadCreate: InspeccionCalidadCreate,
        InspeccionCalidadUpdate: InspeccionCalidadUpdate,

        IncidenteSeguridad: IncidenteSeguridadSchema,
        IncidenteSeguridadCreate: IncidenteSeguridadCreate,
        IncidenteSeguridadUpdate: IncidenteSeguridadUpdate
      }
    },
    
     security: [{ bearerAuth: [] }]
  },
  apis: [
    './src/routes/*.js' 
  ]
};

const swaggerSpec = swaggerJsdoc(options);
console.log('Swagger schemas:', Object.keys(swaggerSpec.components?.schemas || {}));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;