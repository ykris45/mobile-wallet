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

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { ParamListBase } from '@react-navigation/native'

import TopTabBar from '~/components/TopTabBar'
import AddressesScreen from '~/screens/AddressesScreen'
import ContactsScreen from '~/screens/ContactsScreen'

export interface AddressTabsParamList extends ParamListBase {
  AddressesScreen: undefined
  ContactsScreen: undefined
}

const TopTab = createMaterialTopTabNavigator<AddressTabsParamList>()

const AddressesTabNavigation = () => (
  <TopTab.Navigator tabBar={(props) => <TopTabBar {...props} />}>
    <TopTab.Screen name="AddressesScreen" component={AddressesScreen} options={{ title: 'Addresses' }} />
    <TopTab.Screen name="ContactsScreen" component={ContactsScreen} options={{ title: 'Contacts' }} />
  </TopTab.Navigator>
)

export default AddressesTabNavigation
