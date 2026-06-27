const request = require('supertest');

// Mockear Firebase para que app.js no crashee buscando variables de entorno
jest.mock('../src/config/firebase', () => ({
  db: { collection: jest.fn() }
}));

// Mockear el servicio de autenticación para no provocar console.errors
jest.mock('../src/services/authService', () => {
  return {
    login: jest.fn(async (username, password) => {
      return null; // Simular que siempre falla el login para el test de rate limit
    })
  };
});

const app = require('../app');

describe('Security & Rate Limiting Integration', () => {

  it('Debe incluir las cabeceras de seguridad de Helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-xss-protection']).toBe('0');
  });

  it('Debe rechazar payloads JSON que excedan los 2MB', async () => {
    // Generar un string enorme de más de 2MB
    const hugeString = 'a'.repeat(3 * 1024 * 1024); // 3MB
    const res = await request(app)
      .post('/api/auth/login') // Enviamos a una ruta cualquiera que parsee JSON
      .set('Content-Type', 'application/json')
      .send(`{"huge": "${hugeString}"}`);
    
    // Express JSON por defecto devuelve 413 Payload Too Large
    expect(res.status).toBe(413);
  });

  it('Debe bloquear peticiones excesivas a /api/auth/login (Rate Limit)', async () => {
    // Realizamos 10 peticiones (el límite es 10)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: '123' });
    }

    // La 11va petición debe ser bloqueada con 429
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: '123' });

    expect(res.status).toBe(429);
    expect(res.text).toContain('Demasiados intentos');
  });

});
