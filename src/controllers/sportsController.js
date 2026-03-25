const sportsController = {
  getSports: (req, res) => {
    res.send(["Cricket", "Football"]);
  },
};

export default sportsController;
