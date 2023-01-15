/*
    Rutas de usuario / Auth
    host+ /api/auth
*/
const  {Router} = require('express');
const {check} = require('express-validator');
const { loginUsuario, crearUsuario, revalidarToken } = require('../controllers/auth');
const { validatorCamps } = require('../middleware/validator-camps');
const router = Router();

router.post('/',
[
    check('email','El email es obligatorio').isEmail(),
    validatorCamps
]
,loginUsuario);
router.post('/new',[
    check('name','El nombre es obligatorio').not().isEmpty(),
    check('email','El email es obligatorio').isEmail(),
    check('password','El password debe tener minimo 6 caracteres').isLength({min:6}),
    validatorCamps
],crearUsuario);
router.get('/renew',revalidarToken);


module.exports = router;