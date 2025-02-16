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

import { Check } from 'lucide-react-native'
import { useMemo } from 'react'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesAssets, selectAddressByHash } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

const AddressBox = ({ addressHash }: { addressHash: AddressHash }) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector((s) => selectAddressesAssets(s, address ? [address.hash] : []))
  const { fromAddress, setFromAddress } = useSendContext()
  const theme = useTheme()

  if (!address) return null

  const isSelected = address.hash === fromAddress

  return (
    <AddressBoxStyled onPress={() => setFromAddress(address.hash)}>
      <AddressBoxTop style={{ backgroundColor: isSelected ? theme.bg.accent : undefined }}>
        <AddressBadgeStyled addressHash={address.hash} textStyle={{ fontSize: 18 }} />
        {isSelected && (
          <Checkmark>
            <Check color="white" size={15} strokeWidth={3} />
          </Checkmark>
        )}
      </AddressBoxTop>
      <AddressBoxBottom>
        <AssetsRow>
          {assets.map((asset) => (
            <AssetAmountWithLogo
              key={asset.id}
              assetId={asset.id}
              logoSize={15}
              amount={asset.balance - asset.lockedBalance}
            />
          ))}
        </AssetsRow>
      </AddressBoxBottom>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressBoxStyled = styled.Pressable`
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 9px;
  overflow: hidden;
`

const AddressBoxTop = styled.View`
  padding: 15px;
  flex-direction: row;
  justify-content: space-between;
`

const AddressBoxBottom = styled.View`
  padding: 13px 15px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.secondary};
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 80%;
`

const Checkmark = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.global.accent};
  align-items: center;
  justify-content: center;
`

const AssetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`
