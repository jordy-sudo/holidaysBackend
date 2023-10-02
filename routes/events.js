const { Router } = require("express");
const {
  getEventos,
  getEventosUser,
  createEvent,
  actualizarEvento,
  eliminarEvento,
  getVacacionesDeEmpleados,
  actualizarEstado,
  getNotifications,
  getDocumentosAprobados,
} = require("../controllers/events");
const { check } = require("express-validator");
const { validarJwt } = require("../middleware/validat-jwt");
const { validatorCamps } = require("../middleware/validator-camps");
const { isDate } = require("../helpers/isDate");

const router = Router();
//validacion de token
router.use(validarJwt);
//obtener eventos
router.get("/", getEventos);
router.get("/vacations",getEventosUser);
router.get("/employee-vacations", 
[
  check("jefeId", "Es obligatorio la referencia del JEFE").exists(),validatorCamps
], 
getVacacionesDeEmpleados);
router.get("/notifications",getNotifications);
router.get("/documents",getDocumentosAprobados);

//crear un nuevo evento
router.post(
  "/",
  [
    check("start", "La fecha de inicio es obligatoria").custom(isDate),
    check("end", "La fecha final es obligatoria").custom(isDate),
    validatorCamps,
  ],
  createEvent
);
//actulaizar estado o pdf 
router.patch('/update-status/:id',
[
  check("camp","El campo a modificar es obligatorio").not().isEmpty(),
  check("newStatus","El nuevo valor del estado es obligatorio").not().isEmpty(),
  validatorCamps
],actualizarEstado);


//actulaizar un nuevo evento
router.put("/:id", actualizarEvento);

//borrar Evento
router.delete("/:id", eliminarEvento);

module.exports = router;
