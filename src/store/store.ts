/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { configureStore } from '@reduxjs/toolkit'

import activeWalletSlice from './activeWalletSlice'
import addressDiscoverySlice from './addressDiscoverySlice'
import addressesSlice from './addressesSlice'
import appMetadataSlice from './appMetadataSlice'
import credentialsSlice from './credentialsSlice'
import networkSlice from './networkSlice'
import priceSlice from './priceSlice'
import settingsSlice, { settingsListenerMiddleware } from './settingsSlice'
import tokenMetadataSlice from './tokenMetadataSlice'
import walletGenerationSlice from './walletGenerationSlice'

export const store = configureStore({
  reducer: {
    walletGeneration: walletGenerationSlice.reducer,
    network: networkSlice.reducer,
    settings: settingsSlice.reducer,
    credentials: credentialsSlice.reducer,
    activeWallet: activeWalletSlice.reducer,
    addresses: addressesSlice.reducer,
    price: priceSlice.reducer,
    appMetadata: appMetadataSlice.reducer,
    tokenMetadata: tokenMetadataSlice.reducer,
    addressDiscovery: addressDiscoverySlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(settingsListenerMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
