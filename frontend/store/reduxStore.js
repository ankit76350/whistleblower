import { configureStore } from '@reduxjs/toolkit';
import tenantsReducer from './tenantsSlice';

export const store = configureStore({
    reducer: {
        tenants: tenantsReducer,
    },
});

export default store;
