//calculate age from the current date of birth
 export function calculateAge(dobString) {
  // 1. Convert the input string (e.g., "1988-01-01") into a Date object
  const dob = new Date(dobString);
  const today = new Date();
  // 2. Get the full difference in years
  let age = today.getFullYear() - dob.getFullYear();

  // 3. Adjust age if the birthday hasn't happened yet this year
  // Compare the current month/day to the birth month/day
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}