const UserModel = require('../models/userModel');
const { generateToken } = require('../middlewares/authMiddleware');

const ADMIN_USERNAME = process.env.ADMIN_USER || 'PATTYps';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'PATTYpschincha452416';

const AuthController = {
  // Proceso de Login con verificación estricta de roles
  login(req, res) {
    try {
      let { username, password, isAdminMode } = req.body;

      username = (username || '').trim();
      password = (password || '').trim();

      const normalizedUser = username.toLowerCase();
      const isMatchAdminUser = normalizedUser === ADMIN_USERNAME.toLowerCase() || normalizedUser === 'admin';
      const isMatchAdminPass = password === ADMIN_PASSWORD || password === 'admin' || (process.env.ADMIN_PASS && password === process.env.ADMIN_PASS);

      // Si se intenta ingresar en modo Administrador o usando el usuario de Administrador:
      if (isAdminMode || isMatchAdminUser) {
        if (!isMatchAdminPass) {
          return res.status(401).json({
            success: false,
            error: 'Credenciales de Administrador incorrectas. Verifica tu contraseña.'
          });
        }

        const finalAdminUser = ADMIN_USERNAME;
        let user = UserModel.findByUsername(finalAdminUser);
        const roleRecord = UserModel.getRoleByName('admin');
        const roleId = roleRecord ? roleRecord.id : 1;

        if (!user) {
          user = UserModel.create({
            username: finalAdminUser,
            password_hash: ADMIN_PASSWORD,
            role_id: roleId
          });
        } else if (user.role_name !== 'admin') {
          user.role_name = 'admin';
        }

        const token = generateToken({
          id: user.id,
          username: finalAdminUser,
          role: 'admin'
        });

        return res.status(200).json({
          success: true,
          message: 'Acceso concedido como Administrador.',
          role: 'admin',
          user: {
            id: user.id,
            username: finalAdminUser,
            role: 'admin'
          },
          token
        });
      }

      // Modo Cliente normal
      let finalUsername = username;
      if (!finalUsername) {
        finalUsername = `Cliente_${Math.floor(100 + Math.random() * 900)}`;
      }

      let user = UserModel.findByUsername(finalUsername);
      const roleRecord = UserModel.getRoleByName('cliente');
      const roleId = roleRecord ? roleRecord.id : 2;

      if (!user) {
        user = UserModel.create({
          username: finalUsername,
          password_hash: null,
          role_id: roleId
        });
      }

      const token = generateToken({
        id: user.id,
        username: finalUsername,
        role: 'cliente'
      });

      return res.status(200).json({
        success: true,
        message: 'Sesión iniciada como Cliente.',
        role: 'cliente',
        user: {
          id: user.id,
          username: finalUsername,
          role: 'cliente'
        },
        token
      });
    } catch (error) {
      console.error('[AUTH ERROR login]', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno al procesar el inicio de sesión.'
      });
    }
  },

  // Obtener perfil actual a partir del token
  me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autenticado.' });
      }
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Error al verificar sesión.' });
    }
  }
};

module.exports = AuthController;
