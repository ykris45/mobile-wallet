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

import { useNavigation, useScrollToTop } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import { ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native'

import { useScrollEventHandler } from '../../contexts/ScrollContext'
import Screen from './Screen'

interface InWalletScrollScreenProps extends ScrollViewProps {
  style?: StyleProp<ViewStyle>
}

const ScrollScreen = ({ children, style, ...props }: InWalletScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)
  const scrollHandler = useScrollEventHandler()

  useScrollToTop(viewRef) // Scrolls to top when tapping the active tab

  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      viewRef.current?.scrollTo({ y: 0, animated: false })
    })

    return unsubscribe
  })

  return (
    <Screen style={style}>
      <ScrollView
        contentOffset={{ y: 0, x: 0 }}
        onScroll={scrollHandler}
        ref={viewRef}
        {...props}
        scrollEventThrottle={16}
      >
        <View>{children}</View>
      </ScrollView>
    </Screen>
  )
}

export default ScrollScreen
