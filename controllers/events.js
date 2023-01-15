const { response } = require("express");
const event = require("../models/event");

const getEventos = async (req, res = response) => {
  const eventos = await event.find().populate("user", "name");
  return res.json({
    ok: true,
    eventos,
  });
};
const crearEvento = async (req, res = response) => {
  const evento = new event(req.body);
  try {
    evento.user = req.uid;
    const eventoGuardado = await evento.save();
    res.json({
      ok: true,
      evento: eventoGuardado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con le administrador",
    });
  }
};
const actualizarEvento = async (req, res = response) => {
    const eventoId = req.params.id;
    const uid = req.uid;
    try {
        const evento = await event.findById(eventoId);
        if(!evento){
            res.json({
                ok:false,
                msg:'No existe un evento con el id'
            });
        }
        if(evento.user.toString() !== uid){
            return res.status(401).json({
                ok:false,
                msg:'No tienes provilegios de editar este evento'
            });
        }
        const nuevoEVento = {...req.body,user:uid}
        const eventoActualizado = await event.findByIdAndUpdate(eventoId,nuevoEVento,{new : true});
        res.json({
            ok:true,
            evento : eventoActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Hable con el administrador'
        });
    }

};
const eliminarEvento = async (req, res = response) => {
  const eventoId = req.params.id;
  const uid = req.uid;
    try {
        const evento = await event.findById(eventoId);
        if(!evento){
            res.json({
                ok:false,
                msg:'No existe un evento con el id'
            });
        }
        if(evento.user.toString() !== uid){
            return res.status(401).json({
                ok:false,
                msg:'No tienes provilegios de eliminar este evento'
            });
        }
        const eventoEliminado = await event.findByIdAndDelete(eventoId);
        res.json({
            ok:true,
            evento: eventoEliminado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Hable con el administrador'
        });
    }
};

module.exports = {
  getEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
};
