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
import React, { useEffect, useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import AssetRow from '~/screens/Send/AssetsScreen/AssetRow'
import { BackButton, ContinueButton } from '~/screens/Send/SendScreenHeader'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'
import { makeSelectAddressesAssets, selectAddressByHash } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'> {
  style?: StyleProp<ViewStyle>
}

const AssetsScreen = ({ navigation, style }: ScreenProps) => {
  const { fromAddress, assetAmounts, buildTransaction } = useSendContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector((s) => selectAddressesAssets(s, address ? [address.hash] : []))

  const isContinueButtonDisabled = assetAmounts.length < 1

  useEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => (
        <ContinueButton
          onPress={() =>
            buildTransaction({
              onBuildSuccess: () => navigation.navigate('VerifyScreen'),
              onConsolidationSuccess: () => navigation.navigate('TransfersScreen')
            })
          }
          disabled={isContinueButtonDisabled}
        />
      )
    })
  }, [buildTransaction, isContinueButtonDisabled, navigation])

  if (!address) return null

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro title="Assets" subtitle="With Alephium, you can send multiple assets in one transaction." />
      <ScreenSection>
        <AssetsList>
          {assets.map((asset, index) => (
            <AssetRow key={asset.id} asset={asset} isLast={index === assets.length - 1} />
          ))}
        </AssetsList>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default AssetsScreen

const AssetsList = styled.View`
  gap: 20px;
`
