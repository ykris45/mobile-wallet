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

// TODO: Same as in desktop wallet

import { TokenList } from '@alephium/token-list'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from '~/store/store'

export const syncNetworkTokensInfo = createAsyncThunk('assets/syncNetworkTokensInfo', async (_, { getState }) => {
  const state = getState() as RootState

  let metadata = undefined
  const network =
    state.network.settings.networkId === 0 ? 'mainnet' : state.network.settings.networkId === 1 ? 'testnet' : undefined

  if (network) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`
      )
      metadata = (await response.json()) as TokenList
    } catch (e) {
      console.warn('No metadata for network ID ', state.network.settings.networkId)
    }
  }

  return metadata
})
