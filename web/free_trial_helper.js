import dotenv from "dotenv";
dotenv.config();
console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
import {
  updateUserPreference,
  updateUserDetails,
  getUserIdByUrl,
  getUser,
} from "./db.js";

const getFreeTrialDays = async (shopEmail) => {
  var user;
  try {
    user = await getUser(shopEmail);
  } catch {
    return 3;
  }
  //remove after getting the tag
  if (shopEmail == "audittesting.myshopify.com") {
    return 3;
  }

  if (user.free_trial_used) {
    return 0;
  }
  //if false return 3 and set to true
  else {
    const updatedUser = await updateUserDetails(user.id, true);
    return 3;
  }
};

export { getFreeTrialDays };
