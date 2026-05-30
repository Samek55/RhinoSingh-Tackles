import {configureStore} from '@reduxjs/toolkit';
import formReducer from './slice/formSlice';
import adminAuthReducer from './slice/adminAuthSlice';

export const store = configureStore({
  reducer: {
    form: formReducer,
    adminAuth: adminAuthReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
