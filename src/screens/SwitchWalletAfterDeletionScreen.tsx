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

import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { Alert, BackHandler } from 'react-native'
import styled from 'styled-components/native'

import SwitchWalletScreen, { SwitchWalletScreenProps } from '~/screens/SwitchWalletScreen'

const SwitchWalletAfterDeletion = (props: SwitchWalletScreenProps) => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton)

      return subscription.remove
    }, [])
  )

  const handleBackButton = () => {
    Alert.alert('Select a wallet', 'Please, select a wallet to continue')

    return true
  }

  return <SwitchWalletScreen {...props} />
}

export default styled(SwitchWalletAfterDeletion)`
  margin-top: 20px;
`
