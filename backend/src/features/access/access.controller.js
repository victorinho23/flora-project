// backend/src/features/access/access.controller.js
// responde si el usuario del token tiene un permiso

import { accessService } from "./access.service.js";

export const accessController = {
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
