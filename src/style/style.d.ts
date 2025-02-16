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

import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      highlight: string
      primary: string
      secondary: string
      tertiary: string
      back1: string
      back2: string
      accent: string
      contrast: string
    }
    font: {
      primary: string
      secondary: string
      tertiary: string
      contrast: string
      highlight: string
    }
    shadow: {
      primary: string
      secondary: string
      tertiary: string
    }
    border: {
      primary: string
      secondary: string
    }
    global: {
      accent: string
      alert: string
      valid: string
      star: string
      pale: string
      complementary: string
    }
    gradient: {
      yellow: string
      orange: string
      red: string
      purple: string
      cyan: string
    }
  }
}
