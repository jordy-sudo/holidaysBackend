const { response } = require("express");
const event = require("../models/event");
const usuarios = require("../models/usuarios");

const getEventos = async (req, res = response) => {
  const eventos = await event.find().populate("user", "name");
  return res.json({
    ok: true,
    eventos,
  });
};

const getEventosUser = async (req, res = response) => {
  const uid = req.uid;
  try {
    const eventos = await event
      .find({ user: uid })
      .populate({
        path: 'user',
        select: ["name", "boss", "ci", "position", "country", "department", "area", "dateOfJoining","vacationDays"],
        populate: {
          path: 'boss',
          model: 'Usuario',
          select: 'name',
        }
      });

    return res.json({
      ok: true,
      eventos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener eventos del usuario",
    });
  }
};

const getNotifications = async (req, res = response) => {
  const uid = req.uid;
  try {
    const eventos = await event
      .find({ show: false })
      .populate({
        path: 'user',
        match: { boss: uid },
        select: [
          'name',
          'boss',
          'ci',
          'position',
          'country',
          'department',
          'area',
          'dateOfJoining',
        ],
      })
      .exec();

    // Filtra los eventos cuyos usuarios tienen un campo boss igual a uid
    const filteredEventos = eventos.filter((evento) => evento.user);

    return res.json({
      ok: true,
      eventos: filteredEventos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener las notificaciones',
    });
  }
};

const getVacacionesDeEmpleados = async (req, res = response) => {
  try {
    const jefeId = req.uid;
    const eventos = await event.find({})
      .populate({
        path: 'user',
        match: { boss: jefeId },
        select: 'name ',
      });
    console.log(eventos);
    const eventosFiltrados = eventos.filter((evento) => evento.user !== null);

    res.json({
      ok: true,
      eventosFiltrados,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};

const getDocumentosAprobados = async (req, res = response) => {
  try {
    const eventos = await event
      .find({ approved: true })
      .populate({
        path: 'user', 
        select: 'name', 
        populate: {
          path: 'boss', 
          model: 'Usuario', 
          select: 'name', 
        }
      });
    return res.json({
      ok: true,
      eventos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener documentos aprobados",
    });
  }
};


const createEvent = async (req, res = response) => {
  try {
    const { start, end } = req.body;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const eventosSuperpuestos = await event.find({
      user: req.uid,
      $or: [
        {
          start: { $lte: endDate },
          end: { $gte: startDate },
        },
        {
          start: { $lte: endDate },
          end: { $gte: startDate },
        },
      ],
    });

    if (eventosSuperpuestos.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: 'No puedes solicitar vacaciones en fechas superpuestas o coincidentes con solicitudes anteriores.',
      });
    }
    const usuario = await usuarios.findById(req.uid);
    const diasDisponibles = usuario.vacationDays;

    const timeDiff = endDate - startDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff > diasDisponibles) {
      return res.status(400).json({
        ok: false,
        msg: 'No tienes suficientes días disponibles para esta solicitud de vacaciones.',
      });
    }

    const evento = new event({
      ...req.body,
      user: req.uid,
      requestedDays: daysDiff,
    });

    const eventoGuardado = await evento.save();

    res.json({
      ok: true,
      evento: eventoGuardado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};


const actualizarEvento = async (req, res = response) => {
  const eventoId = req.params.id;
  const uid = req.uid;
  try {
    const evento = await event.findById(eventoId);
    if (!evento) {
      res.json({
        ok: false,
        msg: 'No existe un evento con el id'
      });
    }
    if (evento.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tienes provilegios de editar este evento'
      });
    }
    const nuevoEVento = { ...req.body, user: uid }
    const eventoActualizado = await event.findByIdAndUpdate(eventoId, nuevoEVento, { new: true });
    res.json({
      ok: true,
      evento: eventoActualizado
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador'
    });
  }

};

const eliminarEvento = async (req, res = response) => {
  const eventoId = req.params.id;
  const uid = req.uid;
  try {
    const evento = await event.findById(eventoId);
    if (!evento) {
      res.json({
        ok: false,
        msg: 'No existe un evento con el id'
      });
    }
    if (evento.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tienes provilegios de eliminar este evento'
      });
    }
    const eventoEliminado = await event.findByIdAndDelete(eventoId);
    res.json({
      ok: true,
      evento: eventoEliminado
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador'
    });
  }
};

const actualizarEstado = async (req, res = response) => {
  const eventoId = req.params.id;
  const { camp, newStatus } = req.body;

  try {
    const evento = await event.findById(eventoId);
    if (!evento) {
      return res.json({
        ok: false,
        msg: 'No existe un evento con el ID proporcionado',
      });
    }

    evento[camp] = newStatus;
    evento['show'] = newStatus;
    evento['updatedAt'] = new Date().toISOString();

    await evento.save();

    res.json({
      ok: true,
      msg: `La solicitud se ha actualizado correctamente`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};



module.exports = {
  getEventos,
  createEvent,
  actualizarEvento,
  eliminarEvento,
  getVacacionesDeEmpleados,
  actualizarEstado,
  getEventosUser,
  getNotifications,
  getDocumentosAprobados,
};
