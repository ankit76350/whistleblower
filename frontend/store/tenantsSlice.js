import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchTenants = createAsyncThunk(
    'tenants/fetchTenants',
    async (_, { rejectWithValue }) => {
        try {
            const data = await api.getTenants();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tenants');
        }
    }
);

const tenantsSlice = createSlice({
    name: 'tenants',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTenants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default tenantsSlice.reducer;
