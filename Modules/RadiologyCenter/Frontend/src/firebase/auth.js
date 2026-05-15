// src/firebase/auth.js — Firebase removed, stub so old imports don't crash
export const loginUser    = async () => ({ success:false, error:"Firebase removed" });
export const registerUser = async () => ({ success:false, error:"Firebase removed" });
export const logoutUser   = async () => ({ success:true });
export const getCurrentUser = () => null;
export default { loginUser, registerUser, logoutUser, getCurrentUser };