import dotenv from "dotenv";
dotenv.config();
console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
import {
  updateUserPreference,
  updateUserDetails,
  getUserIdByUrl,
  getUser,
} from "./db.js";

const getFreeTrialDays = async (shop) => {
  if (
    shop == "audittesting.myshopify.com" ||
    shop == "systemsdirect-com.myshopify.com"
  ) {
    return 3;
  }
  var user;
  try {
    user = await getUser(shop);
  } catch {
    return 3;
  }
  //remove after getting the tag
  if (shop == "audittesting.myshopify.com") {
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
