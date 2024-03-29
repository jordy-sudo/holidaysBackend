const { response } = require("express");
const Usuario = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const { generarToken } = require("../helpers/jwt");

const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;
  const emailUpperCase = email.toUpperCase();
  try {
    let usuario = await Usuario.findOne({ email: emailUpperCase });
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no esta registrado",
      });
    }
    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Password Incorrecto",
      });
    }
    //jwt
    const token = await generarToken(usuario.id, usuario.name);
    res.json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      role: usuario.role,
      position: usuario.position,
      department: usuario.department,
      vacationDays:usuario.vacationDays,
      dateOfJoining:usuario.dateOfJoining,
      email: usuario.email,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      ok: false,
      msg: "Error",
    });
  }
};

const crearUsuario = async (req, res = response) => {
  const { email, password, ci, boss } = req.body;
  const emailUpperCase = email.toUpperCase();

  try {
    let usuario = await Usuario.findOne({ email: emailUpperCase });
    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya esta en uso",
      });
    }

    let jefeId = null;
    if (boss) {
      const jefe = await Usuario.findOne({ ci: boss });
      if (!jefe) {
        return res.status(400).json({
          ok: false,
          msg: "El jefe con la cédula especificada no existe",
        });
      }
      jefeId = jefe._id;
    }

    usuario = await Usuario.findOne({ ci });
    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "La cédula ya está en uso",
      });
    }
    usuario = new Usuario({ ...req.body, boss: jefeId, email: emailUpperCase });
    var salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);
    await usuario.save();
    //jwt
    const token = await generarToken(usuario.id, usuario.name);
    res.json({
      ok: true,
      uid: usuario.id,
      user: usuario.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      ok: false,
      msg: "Error",
    });
  }
};

const crearUsuariosMasivos = async (req, res = response) => {
  const usuariosParaCrear = req.body.usuarios; // Supongamos que los usuarios se envían en el cuerpo de la solicitud

  // Arrays para almacenar estadísticas
  const usuariosCreados = [];
  const usuariosNoCreados = [];
  let usuariosCreadosCont = 0;
  let usuariosNoCreadosCont = 0;

  try {
    for (const userData of usuariosParaCrear) {
      const { email, password, ci, boss } = userData;
      const emailUpperCase = email.toUpperCase();
      

      let usuario = await Usuario.findOne({ email: emailUpperCase });
      if (usuario) {
        usuariosNoCreadosCont++;
        usuariosNoCreados.push({
          error: "El correo ya está en uso",
          userData,
        }); 
        continue; // Pasar al siguiente usuario
      }

      let jefeId = null;
      if (boss) {
        const jefe = await Usuario.findOne({ ci: boss });
        if (!jefe) {
          usuariosNoCreadosCont++;
          usuariosNoCreados.push({
            error: "El jefe con la cédula especificada no existe",
            userData,
          });
          continue; // Pasar al siguiente usuario
        }
        jefeId = jefe._id;
      }

      usuario = await Usuario.findOne({ ci });
      if (usuario) {
        usuariosNoCreadosCont++;
        usuariosNoCreados.push({
          error: "La cédula ya está en uso",
          userData,
        });
        continue; // Pasar al siguiente usuario
      }

      usuario = new Usuario({
        ...userData,
        boss: jefeId,
        email: emailUpperCase,
      });

      const salt = bcrypt.genSaltSync();
      usuario.password = bcrypt.hashSync(password, salt);

      await usuario.save();

      // Agregar el usuario creado a la lista de usuarios creados
      usuariosCreadosCont++;
      usuariosCreados.push({
        uid: usuario.id,
        user: usuario.name,
      });
    }

    // Devolver estadísticas junto con la respuesta
    res.json({
      ok: true,
      msg:{
        "UsuariosCreados":usuariosCreados,
        "Usuarioscreados":usuariosNoCreados,
      },
      detail:`Usuarios Creados: ${usuariosCreadosCont}, Usuarios no creados: ${usuariosNoCreadosCont}`,
      
    });
  } catch (error) {
    console.error(error);
    res.json({
      ok: false,
      msg: "Error en la carga masiva",
    });
  }
};

const actualizarInformacionUsuario = async (req, res = response) => {
  const usuarioId = req.params.id;
  const nuevaInformacionUsuario = req.body;

  try {
    const usuario = await Usuario.findByIdAndUpdate(usuarioId, nuevaInformacionUsuario, {
      new: true, // Devuelve el documento modificado
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    res.json({
      ok: true,
      usuario: usuario,
      msg: "Información del usuario actualizada correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar la información del usuario",
    });
  }
};

const actualizarRolUsuario = async (req, res = response) => {
  const usuarioId = req.params.id;
  const nuevoRol = req.body.newRole;

  try {
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // Actualiza el rol del usuario
    usuario.role = nuevoRol;
    await usuario.save();

    res.json({
      ok: true,
      msg: `Rol actualizado correctamente nuevo rol ${nuevoRol}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar el rol del usuario",
    });
  }
};

const listarUsuarios = async (req, res = response) => {
  try {
    const usuarios = await Usuario.find()
      .populate({
        path: 'boss',
        select: 'name',  // Puedes incluir los campos que deseas mostrar del objeto boss
      })
      .select('-password');  // Excluye los campos _id y password del resultado principal

    return res.json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener listado de usuarios activos",
    });
  }
};




const revalidarToken = async (req, res = response) => {
  const uid = req.uid;
  const name = req.name;
  //nuevo token
  const token = await generarToken(uid, name);

  res.json({
    ok: true,
    token
  });
};

module.exports = {
  loginUsuario,
  crearUsuario,
  revalidarToken,
  actualizarRolUsuario,
  actualizarInformacionUsuario,
  listarUsuarios,
  crearUsuariosMasivos,
};
