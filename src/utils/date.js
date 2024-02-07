

export default {
  toTimeDate(_date) {
    const date = _date instanceof Date ? _date : new Date(_date);
    // Array of month names to get the month from the Date object
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extracting the month, day, and year
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Extracting hours and minutes for the time
    let hours = date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

    // Formatting hours for 12-hour clock format and determining AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Assembling the formatted date string
    return `${hours}:${minutes} ${ampm} • ${month} ${day}, ${year}`;
  }
}