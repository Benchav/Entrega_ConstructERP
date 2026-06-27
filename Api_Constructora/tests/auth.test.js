const request = require('supertest');

// Mockear Firebase para que app.js no crashee
jest.mock('../src/config/firebase', () => ({
  db: { collection: jest.fn() }
}));

const app = require('../app');

// Mockear el servicio de autenticación para no golpear Firebase
jest.mock('../src/services/authService', () => {
  return {
    login: jest.fn(async (username, password) => {
      if (username === 'test' && password === '123') {
        return {
          token: 'fake-jwt-token',
          user: { id: 1, username: 'test', rol: 'CEO' }
        };
      }
      return null;
    })
  };
});

describe('Authentication & HttpOnly Cookies', () => {

  it('Debe generar una cookie HttpOnly al iniciar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: '123' });
    
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeUndefined(); // El token NO debe venir en el body JSON
    
    // Verificar que la cookie fue seteada correctamente
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=fake-jwt-token/);
    expect(cookies[0]).toMatch(/HttpOnly/);
  });

  it('Debe fallar el login con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'wrong' });
    
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined(); // No debe generar cookie
  });

  it('Debe limpiar la cookie al hacer logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    
    expect(res.status).toBe(200);
    // Express res.clearCookie setea Max-Age=0 o un token vacío
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=;/);
  });

});
