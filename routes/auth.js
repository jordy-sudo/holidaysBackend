/*
    Rutas de usuario / Auth
    host+ /api/auth
*/
const  {Router} = require('express');
const {check} = require('express-validator');
const { loginUsuario, crearUsuario, revalidarToken, actualizarRolUsuario, listarUsuarios, actualizarInformacionUsuario } = require('../controllers/auth');
const { validatorCamps } = require('../middleware/validator-camps');
const usuarios = require('../models/usuarios');
const { isDate } = require('../helpers/isDate');
const router = Router();

//
router.post('/',
[
    check('email','El email es obligatorio').isEmail(),
    validatorCamps
]
,loginUsuario);

//crear usuario
router.post(
    '/new',
    [
        check('name', 'Nombre es requerido').not().isEmpty(),
        check('email', 'Email es requerido').isEmail(),
        check('password', 'La contraseña debe tener 6 caracteres').isLength({ min: 6 }),
        check('role', 'El Rol es requerido').custom((value) => {
            if (!value || (value !== 'Empleado' && value !== 'Jefe' && value !== 'Administrador' && value !== 'rrhh')) {
                throw new Error('Los roles permitidos son "Empleado," "Jefe," "Administrador," or "rrhh"');
            }
            return true;
        }),
        check('boss', 'Se necesita un ID valido del jefe').custom(async (value) => {
            if (value) {
                const bossExists = await usuarios.exists({ _id: value });
                if (!bossExists) {
                    throw new Error('El Jefe especificado no existe');
                }
            }
            return true;
        }),
        check('position', 'El cargo es obligatorio').not().isEmpty(),
        check('vacationDays', 'El numero de vacaciones es obligatorio').not().isEmpty(),
        check('ci', 'La cedula del usuario es obligatorio y debe ser una cedula valida (10 digitos)').not().isEmpty().isLength({ min: 10, max: 10 }),
        check('country', 'La ciudad del usuario es obligatorio').not().isEmpty(),
        check('department', 'El departamento del usuario es obligatorio').not().isEmpty(),
        check('area', 'El area del usuario es obligatorio').not().isEmpty(),
        check('dateOfJoining', 'La fecha de ingreso a la empresa  del usuario es obligatorio').custom(isDate),
        validatorCamps, 
    ],
    crearUsuario
);

//listar usuarios
router.get('/listUsers',listarUsuarios)


//actualizar role
router.patch('/update-rol/:id',[ check('newRole', 'El Rol es requerido').custom((value) => {
    if (!value || (value !== 'Empleado' && value !== 'Jefe' && value !== 'Administrador' && value !== 'rrhh')) {
        throw new Error('Los roles permitidos son "Empleado," "Jefe," "Administrador," or "rrhh"');
    }
    return true;
}),validatorCamps],actualizarRolUsuario);

//actualizar informacion de usuario
router.put('/updateInfouser/:id',actualizarInformacionUsuario);

router.get('/renew',revalidarToken);


module.exports = router;