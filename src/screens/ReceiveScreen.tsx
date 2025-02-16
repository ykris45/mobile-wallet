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

import { calculateAmountWorth } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { Clipboard as ClipboardIcon } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, Text } from 'react-native'
import QRCode from 'react-qr-code'
import { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import Button from '~/components/buttons/Button'
import HighlightRow from '~/components/HighlightRow'
import AddressSelector from '~/components/inputs/AddressSelector'
import { BottomModalScreenTitle, CenteredScreenSection, ScreenSection } from '~/components/layout/Screen'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressByHash, selectDefaultAddress } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { AddressHash } from '~/types/addresses'
import { copyAddressToClipboard } from '~/utils/addresses'
import { currencies } from '~/utils/currencies'

type ScreenProps = StackScreenProps<RootStackParamList, 'ReceiveScreen'>

const ReceiveScreen = ({
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [toAddressHash, setToAddressHash] = useState<AddressHash>(addressHash ?? defaultAddress?.hash)
  const toAddress = useAppSelector((s) => selectAddressByHash(s, toAddressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const { data: price } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: !toAddress || BigInt(toAddress.balance) === BigInt(0)
  })
  const theme = useTheme()

  if (!toAddress) return null

  const balance = calculateAmountWorth(BigInt(toAddress.balance), price ?? 0)

  return (
    <>
      <ScreenSection>
        <BottomModalScreenTitle>Receive</BottomModalScreenTitle>
      </ScreenSection>
      <ScrollView>
        <ScreenSection>
          <AddressSelector label="To address" value={toAddressHash} onValueChange={setToAddressHash} />
        </ScreenSection>
        <CenteredScreenSection>
          <QRCode size={200} bgColor={theme.bg.secondary} fgColor={theme.font.primary} value={toAddressHash} />
        </CenteredScreenSection>
        <CenteredScreenSection>
          <Button title="Copy address" onPress={() => copyAddressToClipboard(toAddressHash)} Icon={ClipboardIcon} />
        </CenteredScreenSection>
        <ScreenSection>
          <HighlightRow title="Address">
            <Text numberOfLines={1} ellipsizeMode="middle">
              {toAddressHash}
            </Text>
          </HighlightRow>
          <HighlightRow title="Current estimated value">
            <Amount value={balance} isFiat suffix={currencies[currency].symbol} bold />
          </HighlightRow>
        </ScreenSection>
      </ScrollView>
    </>
  )
}

export default ReceiveScreen
