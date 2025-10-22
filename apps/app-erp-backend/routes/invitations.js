const express = require('express');
const router = express.Router();
const invitationsController = require('../controllers/invitations.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');

/**
 * @route   POST /api/invitations
 * @desc    Crear y enviar una invitación
 * @access  Private (requiere autenticación)
 */
router.post('/', verifyFirebaseToken, invitationsController.createInvitation);

/**
 * @route   GET /api/invitations/verify/:token
 * @desc    Verificar un token de invitación
 * @access  Public
 */
router.get('/verify/:token', invitationsController.verifyInvitation);

/**
 * @route   POST /api/invitations/accept
 * @desc    Aceptar invitación y crear usuario
 * @access  Public
 */
router.post('/accept', invitationsController.acceptInvitation);

/**
 * @route   GET /api/invitations/company
 * @desc    Obtener todas las invitaciones de la empresa
 * @access  Private
 */
router.get('/company', verifyFirebaseToken, invitationsController.getInvitationsByCompany);

/**
 * @route   POST /api/invitations/:invitacion_id/resend
 * @desc    Reenviar una invitación
 * @access  Private
 */
router.post('/:invitacion_id/resend', verifyFirebaseToken, invitationsController.resendInvitation);

/**
 * @route   DELETE /api/invitations/:invitacion_id
 * @desc    Cancelar una invitación
 * @access  Private
 */
router.delete('/:invitacion_id', verifyFirebaseToken, invitationsController.cancelInvitation);

module.exports = router;
