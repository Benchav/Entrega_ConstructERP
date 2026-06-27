const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const usuariosService = require('./usuariosService'); 

const authService = {
  login: async (username, password) => {
    

    const user = await usuariosService.findUserByUsername(username);

    if (!user) {
      console.log('Intento de login: Usuario no encontrado:', username);
      return null; 
    }


    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log('Intento de login: Contraseña incorrecta para:', username);
      return null; 
    }


    const payload = {
      id: user.id,
      rol: user.rol,
      nombre: user.nombre,
      proyectoAsignadoId: user.proyectoAsignadoId
    };


    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const token = jwt.sign(payload, secret, { expiresIn });


    const { password: _, ...userWithoutPass } = user;

    return {
      token,
      usuario: userWithoutPass
    };
  }
};

module.exports = authService;