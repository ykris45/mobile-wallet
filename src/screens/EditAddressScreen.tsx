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
import { useState } from 'react'

import SpinnerModal from '~/components/SpinnerModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AddressFormScreen from '~/screens/AddressFormScreen'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { AddressSettings } from '~/types/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'EditAddressScreen'>

const EditAddressScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()

  const [loading, setLoading] = useState(false)

  if (!address) return null

  const handleSavePress = async (settings: AddressSettings) => {
    if (address.settings.isMain && !settings.isMain) return

    setLoading(true)

    await persistAddressSettings({ ...address, settings })
    dispatch(addressSettingsSaved({ ...address, settings }))

    setLoading(false)
    navigation.goBack()
  }

  return (
    <>
      <AddressFormScreen
        initialValues={address.settings}
        onSubmit={handleSavePress}
        buttonText="Save"
        disableIsMainToggle={address.settings.isMain}
        addressHash={address.hash}
      />
      <SpinnerModal isActive={loading} text="Saving address..." />
    </>
  )
}

export default EditAddressScreen
