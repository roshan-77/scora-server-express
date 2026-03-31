import playerService from "../services/playerService.js";

const playerController = {
  getPlayers: async (req, res, next) => {
    try {
      const players = await playerService.getAllPlayers();
      res.status(200).json(players);
    } catch (error) {
      next(error);
    }
  },

  updatePlayer: async (req, res, next) => {
    try {
      const updatedPlayer = await playerService.updatePlayer(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        data: updatedPlayer,
        message: "Player detail successfully updated",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default playerController;
