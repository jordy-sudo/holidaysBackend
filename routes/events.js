const { Router } = require("express");
const {
  getEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
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

//crear un nuevo evento
router.post(
  "/",
  [
    check("title", "el titulo es obligatorio").not().isEmpty(),
    check("start", "La fecha de inicio es obligatoria").custom(isDate),
    check("end", "La fecha final es obligatoria").custom(isDate),
    validatorCamps,
  ],
  crearEvento
);

//actulaizar un nuevo evento
router.put("/:id", actualizarEvento);

//borrar Evento
router.delete("/:id", eliminarEvento);

module.exports = router;
