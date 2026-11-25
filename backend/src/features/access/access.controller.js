// backend/src/features/access/access.controller.js
// responde si el usuario del token tiene un permiso

import { accessService } from "./access.service.js";

export const accessController = {
  // permisos actuales del usuario del token (el frontend los pide para mostrar u ocultar cosas)
  async me(req, res) {
    try {
      const access = await accessService.getMyAccess(req.user.id);
      // si lo inhabilitaron, la sesion se cierra
      if (!access.active) return res.status(401).json({ error: "La cuenta está inhabilitada" });
      res.json(access);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error consultando los permisos" });
    }
  },

  async checkPermission(req, res) {
    try {
      const userId = req.user.id;
      const { permissionCode } = req.params;

      const hasPermission = await accessService.hasPermission(userId, permissionCode);

      res.json({
        userId,
        permission: permissionCode,
        granted: hasPermission,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error verificando permiso",
      });
    }
  },
};
