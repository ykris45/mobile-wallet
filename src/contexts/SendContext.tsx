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

import { APIError, AssetAmount, getHumanReadableError } from '@alephium/sdk'
import { node } from '@alephium/web3'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import Toast from 'react-native-root-toast'

import { buildSweepTransactions, buildUnsignedTransactions, signAndSendTransaction } from '~/api/transactions'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import ConsolidationModal from '~/components/ConsolidationModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressByHash, transactionSent } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { getTransactionAssetAmounts } from '~/utils/transactions'

type UnsignedTxData = {
  unsignedTxs: {
    txId: node.BuildTransactionResult['txId'] | node.SweepAddressTransaction['txId']
    unsignedTx: node.BuildTransactionResult['unsignedTx'] | node.SweepAddressTransaction['unsignedTx']
  }[]
  fees: bigint
}

type BuildTransactionCallbacks = {
  onBuildSuccess: () => void
  onConsolidationSuccess: () => void
}

interface SendContextProps {
  toAddress?: AddressHash
  setToAddress: (toAddress: AddressHash) => void
  fromAddress?: AddressHash
  setFromAddress: (toAddress: AddressHash) => void
  assetAmounts: AssetAmount[]
  setAssetAmount: (assetId: string, amount?: bigint) => void
  fees: bigint
  buildTransaction: (callbacks: BuildTransactionCallbacks) => Promise<void>
  sendTransaction: (onSendSuccess: () => void) => Promise<void>
}

const initialValues: SendContextProps = {
  toAddress: undefined,
  setToAddress: () => null,
  fromAddress: undefined,
  setFromAddress: () => null,
  assetAmounts: [],
  setAssetAmount: () => null,
  fees: BigInt(0),
  buildTransaction: () => Promise.resolve(undefined),
  sendTransaction: () => Promise.resolve(undefined)
}

const SendContext = createContext(initialValues)

export const SendContextProvider = ({ children }: { children: ReactNode }) => {
  const requiresAuth = useAppSelector((s) => s.settings.requireAuth)
  const dispatch = useAppDispatch()

  const [toAddress, setToAddress] = useState<SendContextProps['toAddress']>(initialValues.toAddress)
  const [fromAddress, setFromAddress] = useState<SendContextProps['fromAddress']>(initialValues.fromAddress)
  const [assetAmounts, setAssetAmounts] = useState<SendContextProps['assetAmounts']>(initialValues.assetAmounts)
  const [unsignedTxData, setUnsignedTxData] = useState<UnsignedTxData>({ unsignedTxs: [], fees: initialValues.fees })

  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isConsolidateModalVisible, setIsConsolidateModalVisible] = useState(false)
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [onSendSuccessCallback, setOnSendSuccessCallback] = useState<() => void>(() => () => null)

  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))

  const setAssetAmount = (assetId: string, amount?: bigint) => {
    const existingAmountIndex = assetAmounts.findIndex(({ id }) => id === assetId)
    const newAssetAmounts = [...assetAmounts]

    if (existingAmountIndex !== -1) {
      amount
        ? newAssetAmounts.splice(existingAmountIndex, 1, { id: assetId, amount })
        : newAssetAmounts.splice(existingAmountIndex, 1)
    } else {
      newAssetAmounts.push({ id: assetId, amount })
    }

    setAssetAmounts(newAssetAmounts)
  }

  const buildConsolidationTransactions = useCallback(async () => {
    if (!address) return

    try {
      const data = await buildSweepTransactions(address, address.hash)
      setUnsignedTxData(data)
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
    }
  }, [address, setUnsignedTxData])

  const buildTransaction = useCallback(
    async (callbacks: BuildTransactionCallbacks) => {
      if (!address || !toAddress) return

      try {
        const data = await buildUnsignedTransactions(address, toAddress, assetAmounts)
        setUnsignedTxData(data)

        callbacks.onBuildSuccess()
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setConsolidationRequired(true)
          setIsConsolidateModalVisible(true)
          setOnSendSuccessCallback(() => callbacks.onConsolidationSuccess)
          await buildConsolidationTransactions()
        } else {
          Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
        }
      }
    },
    [address, assetAmounts, buildConsolidationTransactions, toAddress]
  )

  const sendTransaction = useCallback(
    async (onSendSuccess: () => void) => {
      if (!address || !toAddress) return

      const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

      try {
        for (const { txId, unsignedTx } of unsignedTxData.unsignedTxs) {
          const data = await signAndSendTransaction(address, txId, unsignedTx)

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: address.hash,
              toAddress: consolidationRequired ? address.hash : toAddress,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending'
            })
          )
        }

        onSendSuccess()
      } catch (e) {
        Toast.show(getHumanReadableError(e, 'Could not send transaction'))
      }
    },
    [address, assetAmounts, consolidationRequired, dispatch, toAddress, unsignedTxData.unsignedTxs]
  )

  const authenticateAndSend = useCallback(
    async (onSendSuccess: () => void) => {
      if (requiresAuth) {
        setOnSendSuccessCallback(() => onSendSuccess)
        setIsAuthenticationModalVisible(true)
      } else {
        sendTransaction(onSendSuccess)
      }
    },
    [requiresAuth, sendTransaction]
  )

  return (
    <SendContext.Provider
      value={{
        toAddress,
        setToAddress,
        fromAddress,
        setFromAddress,
        assetAmounts,
        setAssetAmount,
        fees: unsignedTxData.fees,
        buildTransaction,
        sendTransaction: authenticateAndSend
      }}
    >
      {children}
      {isConsolidateModalVisible && (
        <ConsolidationModal
          onConsolidate={() => authenticateAndSend(onSendSuccessCallback)}
          onCancel={() => setIsConsolidateModalVisible(false)}
          fees={unsignedTxData.fees}
        />
      )}
      {isAuthenticationModalVisible && (
        <ConfirmWithAuthModal onConfirm={() => sendTransaction(onSendSuccessCallback)} />
      )}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
