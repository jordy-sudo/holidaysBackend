const { response } = require("express");
const Usuario = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const { generarToken } = require("../helpers/jwt");

const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
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
  const { email, password } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya esta en uso",
      });
    }
    usuario = new Usuario(req.body);
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

const revalidarToken = async (req, res = response) => {
  const uid = req.uid;
  const name = req.name;
  //nuevo token
  const token = await generarToken(uid,name);

  res.json({
    ok: true,
    token
  });
};

module.exports = {
  loginUsuario,
  crearUsuario,
  revalidarToken,
};
