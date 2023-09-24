import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUserPreferences = async (userId) => {
  try {
    return await prisma.custom_preferences.findFirst({
      where: {
        user_id: userId,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};

const updateUserPreference = async (userId, timeToEdit, enable) => {
  try {
    return await prisma.custom_preferences.update({
      where: { user_id: userId },
      data: {
        time_to_edit: timeToEdit,
        enable: enable,
      },
    });
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
};

const getUserIdByUrl = async (userUrl) => {
  try {
    const user = await prisma.users.findFirst({
      where: { url: userUrl },
      select: { id: true },
    });
    return user ? user.id : null;
  } catch (error) {
    console.error("Error getting user ID by URL:", error);
    throw error;
  }
};

const addUser = async (url, accessToken) => {
  try {
    const user = await prisma.users.create({
      data: {
        url: url,
        access_token: accessToken,
        free_trial_used: false,
      },
    });

    await addUserPreference(user.id, 900, false);
    return user;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const addUserPreference = async (userId, timeToEdit, enable) => {
  try {
    return await prisma.custom_preferences.create({
      data: {
        user_id: userId,
        time_to_edit: timeToEdit,
        enable: enable,
      },
    });
  } catch (error) {
    console.error("Error adding user preference:", error);
    throw error;
  }
};

const getUser = async (userUrl) => {
  try {
    return await prisma.users.findFirst({
      where: { url: userUrl },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

const updateUserDetails = async (
  userId,
  freeTrialUsed,
  backOrdersIncrement,
  editOrdersIncrement,
  custEditOrdersIncrement,
  planValue
) => {
  try {
    // Construct the update data object dynamically
    const updateData = {};
    console.log(" ========= IN UPDATE USER DETAILS ============");

    if (freeTrialUsed !== undefined) {
      updateData.free_trial_used = freeTrialUsed;
    }

    if (backOrdersIncrement !== undefined) {
      updateData.no_back_orders = { increment: backOrdersIncrement };
    }

    if (editOrdersIncrement !== undefined) {
      updateData.no_edit_orders = { increment: editOrdersIncrement };
    }

    if (custEditOrdersIncrement !== undefined) {
      updateData.no_cust_edit_orders = { increment: custEditOrdersIncrement };
    }

    if (planValue !== undefined) {
      updateData.plan = planValue;
    }

    // If no valid update data is provided, return null
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Use Prisma to update the user details
    const result = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return result;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

export {
  updateUserPreference,
  getUserIdByUrl,
  addUser,
  addUserPreference,
  getUserPreferences,
  getUser,
  updateUserDetails,
};
