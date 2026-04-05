const calculateTimeElapsed = (startTime) => {
  const currentTime = new Date();

  const secondElapsed = Math.floor((currentTime - new Date(startTime)) / 1000);

  let hours = Math.floor(secondElapsed / 3600);
  let minutes = Math.floor((secondElapsed % 3600) / 60);
  let seconds = Math.floor(secondElapsed % 60);

  const formatTime = (num) => String(num).padStart(2, "0");

  hours = formatTime(hours);
  minutes = formatTime(minutes);
  seconds = formatTime(seconds);

  return { hours, minutes, seconds };
};

export default calculateTimeElapsed;
