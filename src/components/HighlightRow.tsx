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

import { ReactNode } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import styled, { css } from 'styled-components/native'

import AppText, { AppTextProps } from '~/components/AppText'
import { INPUTS_HEIGHT, INPUTS_PADDING } from '~/style/globalStyle'

export interface HighlightRowProps {
  children: ReactNode
  isInput?: boolean
  isSecondary?: boolean
  title?: string
  titleColor?: AppTextProps['color']
  subtitle?: string
  onPress?: () => void
  hasRightContent?: boolean
  truncate?: boolean
  isLast?: boolean
  noMaxWidth?: boolean
  style?: StyleProp<ViewStyle>
}

const HighlightRow = ({
  title,
  subtitle,
  children,
  onPress,
  truncate,
  noMaxWidth,
  style,
  titleColor
}: HighlightRowProps) => {
  const componentContent = title ? (
    <>
      <LeftContent>
        <AppText medium numberOfLines={truncate ? 1 : undefined} ellipsizeMode="middle" color={titleColor}>
          {title}
        </AppText>
        {subtitle && (
          <Subtitle numberOfLines={truncate ? 1 : undefined} ellipsizeMode="middle">
            {subtitle}
          </Subtitle>
        )}
      </LeftContent>
      <RightContent noMaxWidth={noMaxWidth}>{children}</RightContent>
    </>
  ) : (
    children
  )

  return onPress ? (
    <Pressable onPress={onPress} style={style}>
      {componentContent}
    </Pressable>
  ) : (
    <View style={style}>{componentContent}</View>
  )
}

export default styled(HighlightRow)`
  ${({ theme, isLast }) =>
    !isLast &&
    css`
      border-bottom-width: 1px;
      border-bottom-color: ${theme.border.secondary};
    `}

  ${({ theme, isInput, isSecondary }) =>
    isInput
      ? css`
          justify-content: center;
          height: ${INPUTS_HEIGHT}px;
          padding: 0 ${INPUTS_PADDING}px;
          background-color: ${isSecondary ? theme.bg.accent : theme.bg.highlight};
        `
      : css`
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          min-height: ${INPUTS_HEIGHT}px;
          padding: 20px;
          background-color: ${isSecondary ? theme.bg.accent : theme.bg.primary};
        `}

  ${({ isInput, hasRightContent }) =>
    isInput &&
    hasRightContent &&
    css`
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    `}
`

const Subtitle = styled(AppText)`
  color: ${({ theme }) => theme.font.tertiary};
  padding-top: 5px;
`

const LeftContent = styled.View`
  flex: 1;
`

const RightContent = styled.View<{ noMaxWidth?: boolean }>`
  padding-left: ${INPUTS_PADDING}px;

  ${({ noMaxWidth }) =>
    !noMaxWidth &&
    css`
      max-width: 200px;
    `}
`
