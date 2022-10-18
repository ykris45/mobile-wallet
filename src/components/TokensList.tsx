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

import { chunk } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import { selectAllAddresses, selectAllTokens } from '../store/addressesSlice'
import { AddressToken, ALEPHIUM_TOKEN_ID, TokenMetadata, TokensMetadataMap } from '../types/tokens'
import Carousel from './Carousel'
import HighlightRow from './HighlightRow'
import { ScreenSection, ScreenSectionTitle } from './layout/Screen'
import TokenInfo from './TokenInfo'

// TODO: Use official Alephium tokens-meta repo
const TOKEN_METADATA_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/tokens.json'

const PAGE_SIZE = 3

const TokensList = () => {
  const price = useAppSelector((state) => state.price)
  const addresses = useAppSelector(selectAllAddresses)
  const addressDataStatus = useAppSelector((state) => state.addresses.status)
  const fiatCurrency = useAppSelector((state) => state.settings.currency)
  const [carouselItemHeight, setCarouselItemHeight] = useState(258)
  const [isCarouselItemHeightAdapted, setIsCarouselItemHeightAdapted] = useState(false)
  const allTokens = useAppSelector((state) => selectAllTokens(state))

  const [tokensChunked, setTokensChunked] = useState<AddressToken[][]>([])
  const [tokensMetadata, setTokensMetadata] = useState<TokensMetadataMap>()

  const isLoading = price.status === 'uninitialized' || addressDataStatus === 'uninitialized'

  allTokens.forEach((token) => {
    token.worth = {
      // TODO: Fetch token prices
      price: undefined,
      currency: fiatCurrency
    }
  })

  const sortByWorthThenName = useCallback(
    (tokenA: AddressToken, tokenB: AddressToken) => {
      if (tokenA.worth?.price !== undefined && tokenB.worth?.price !== undefined) {
        return (tokenB.worth.price ?? 0) - (tokenA.worth.price ?? 0)
      }

      if (!tokensMetadata) {
        return tokenA.id.localeCompare(tokenB.id)
      }

      const tokenAName = tokensMetadata[tokenA.id]?.name
      const tokenBName = tokensMetadata[tokenB.id]?.name

      if (!tokenAName || !tokenBName) {
        return tokenA.id.localeCompare(tokenB.id)
      }

      return tokenAName.localeCompare(tokenBName)
    },
    [tokensMetadata]
  )

  useEffect(() => {
    const fetchTokensMetadata = async () => {
      const response = await fetch(TOKEN_METADATA_URL)
      const data = await response.json()

      setTokensMetadata(data)
    }

    fetchTokensMetadata()
  }, [])

  useEffect(() => {
    if (addressDataStatus === 'uninitialized') return

    const alephiumToken: AddressToken = {
      id: ALEPHIUM_TOKEN_ID,
      balances: {
        balance: addresses.reduce((acc, addr) => acc + BigInt(addr.networkData.details.balance), BigInt(0)).toString(),
        lockedBalance: addresses
          .reduce((acc, addr) => acc + BigInt(addr.networkData.details.lockedBalance), BigInt(0))
          .toString()
      },
      worth: {
        price: price.value,
        currency: fiatCurrency
      }
    }

    setTokensChunked(chunk(allTokens.concat([alephiumToken]).sort(sortByWorthThenName), PAGE_SIZE))
  }, [addressDataStatus, addresses, allTokens, fiatCurrency, price.value, sortByWorthThenName])

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    const newCarouselItemHeight = event.nativeEvent.layout.height

    if (!isCarouselItemHeightAdapted || (isCarouselItemHeightAdapted && newCarouselItemHeight > carouselItemHeight)) {
      setCarouselItemHeight(newCarouselItemHeight)
      setIsCarouselItemHeightAdapted(true)
    }
  }

  const renderCarouselItem = ({ item }: { item: AddressToken[] }) => (
    <View onLayout={onLayoutCarouselItem}>
      {item.map((token, index, arr) => {
        const metadata =
          token.id === ALEPHIUM_TOKEN_ID
            ? ({
                name: 'Alephium',
                decimals: 18
              } as TokenMetadata)
            : tokensMetadata
            ? tokensMetadata[token.id]
            : undefined

        return (
          <HighlightRow
            key={token.id}
            isTopRounded={index === 0}
            isBottomRounded={index === arr.length - 1}
            hasBottomBorder={arr.length > 1}
          >
            <TokenInfo {...{ ...token, ...metadata }} isLoading={isLoading} />
          </HighlightRow>
        )
      })}
    </View>
  )

  return (
    <>
      {tokensChunked.length > 1 && (
        <>
          <ScreenSectionTitleStyled>Assets</ScreenSectionTitleStyled>
          <Carousel
            data={tokensChunked}
            renderItem={renderCarouselItem}
            padding={20}
            distance={10}
            height={carouselItemHeight}
          />
        </>
      )}
      {tokensChunked.length === 1 && (
        <ScreenSection>
          <ScreenSectionTitle>Assets</ScreenSectionTitle>
          {renderCarouselItem({ item: tokensChunked[0] })}
        </ScreenSection>
      )}
    </>
  )
}

export default TokensList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
`
