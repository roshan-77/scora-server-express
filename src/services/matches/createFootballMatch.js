const createFootballMatch = (data, user) => {
  const { sport, teams, dateTime, duration } = data;

  if (!duration || duration <= 0) {
    throw new Error("Invalid duration");
  }

  if (duration % 2 !== 0) {
    throw new Error("Duration must be divisible by 2");
  }

  return {
    sport,
    teams,
    score: {
      home: 0,
      away: 0,
    },
    status: "not_started",
    dateTime,
    duration,
    halfDuration: duration / 2,
    periods: [
      { name: "1st Half", startTime: null, endTime: null },
      { name: "2nd Half", startTime: null, endTime: null },
    ],

    events: [],
    createdAt: new Date(),
    createdBy: user,
  };
};

export default createFootballMatch;
