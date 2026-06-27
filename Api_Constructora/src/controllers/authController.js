const authService = require('../services/authService');


async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username y password son requeridos' });
  }

  try {

    const data = await authService.login(username, password);

    if (!data) {
    
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }


    // Configurar cookie HttpOnly
    res.cookie('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    // Retornar solo el usuario, no el token
    return res.json({ usuario: data.usuario });

  } catch (error) {
    console.error('Error en authController.login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


function me(req, res) {
  res.json({ user: req.user });
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada exitosamente' });
}

module.exports = { login, me, logout };