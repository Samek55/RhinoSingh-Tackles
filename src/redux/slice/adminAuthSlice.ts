import {createSlice} from '@reduxjs/toolkit';

interface AdminAuthState {
  isAdminLoggedIn: boolean;
}

const initialState: AdminAuthState = {
  isAdminLoggedIn: false,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    loginAdmin: state => {
      state.isAdminLoggedIn = true;
    },
    logoutAdmin: state => {
      state.isAdminLoggedIn = false;
    },
  },
});

export const {loginAdmin, logoutAdmin} = adminAuthSlice.actions;
export default adminAuthSlice.reducer;