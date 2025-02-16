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

import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useState } from 'react'

import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Screen from '~/components/layout/Screen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deriveWalletStoredAddresses, rememberActiveWallet } from '~/persistent-storage/wallets'
import { walletSwitched, walletUnlocked } from '~/store/activeWalletSlice'
import { AddressPartial } from '~/types/addresses'
import { ActiveWalletState } from '~/types/wallet'
import { resetNavigationState, setNavigationState } from '~/utils/navigation'

type ScreenProps = StackScreenProps<RootStackParamList, 'LoginScreen'>

const LoginScreen = ({
  route: {
    params: { walletIdToLogin, workflow }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false)

  const handleSuccessfulLogin = useCallback(
    async (pin?: string, wallet?: ActiveWalletState) => {
      if (!pin || !wallet) return

      setLoading(true)
      setIsPinModalVisible(false)
      let addressesToInitialize = [] as AddressPartial[]

      await rememberActiveWallet(wallet.metadataId)

      if (workflow === 'wallet-switch') {
        addressesToInitialize = await deriveWalletStoredAddresses(wallet)

        dispatch(walletSwitched({ wallet, addressesToInitialize, pin }))
        resetNavigationState()
      } else if (workflow === 'wallet-unlock') {
        if (addressesStatus === 'uninitialized') {
          addressesToInitialize = await deriveWalletStoredAddresses(wallet)
        }

        dispatch(walletUnlocked({ wallet, addressesToInitialize, pin }))
        lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()
      }

      setLoading(false)
    },
    [addressesStatus, dispatch, lastNavigationState, workflow]
  )

  return (
    <Screen style={{ marginTop: 40 }}>
      {isPinModalVisible && (
        <ConfirmWithAuthModal usePin onConfirm={handleSuccessfulLogin} walletId={walletIdToLogin} />
      )}
      {/*<SpinnerModal isActive={loading} text="Unlocking wallet..." /> CANT SHOW 2 MODALS ON IOS*/}
    </Screen>
  )
}

export default LoginScreen
