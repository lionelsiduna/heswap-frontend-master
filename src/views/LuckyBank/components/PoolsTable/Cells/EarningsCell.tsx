import React from 'react'
import styled from 'styled-components'
import { Skeleton, Text, useTooltip, HelpIcon, Flex, Box, useModal, useMatchBreakpoints } from '@heswap/uikit'
import { Pool } from 'state/types'
import BigNumber from 'bignumber.js'
import { PoolCategory } from 'config/constants/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { formatNumber, getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import BaseCell, { CellContent } from './BaseCell'
import CollectModal from '../../PoolCard/Modals/CollectModal'

interface EarningsCellProps {
  pool: Pool
  account: string
  userDataLoaded: boolean
  referrer: string
}

const StyledCell = styled(BaseCell)`
  flex: 4.5;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 120px;
  }
`

const HelpIconWrapper = styled.div`
  align-self: center;
`

const EarningsCell: React.FC<EarningsCellProps> = ({ pool, account, userDataLoaded, referrer }) => {
  const { t } = useTranslation()
  const { isXs, isSm } = useMatchBreakpoints()
  const { sousId, earningToken, poolCategory, userData, earningTokenPrice } = pool
  const isManualCakePool = sousId === 0

  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  // These will be reassigned later if its Auto CAKE vault
  const earningTokenBalance = getBalanceNumber(earnings, earningToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)
  const hasEarnings = account && earnings.gt(0)
  const fullBalance = getFullDisplayBalance(earnings, earningToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)
  const earningsDollarValue = formatNumber(earningTokenDollarBalance)
  const isBnbPool = poolCategory === PoolCategory.BINANCE

  const labelText = t('%asset% Earned', { asset: earningToken.symbol })

  const [onPresentCollect] = useModal(
    <CollectModal
      formattedBalance={formattedBalance}
      fullBalance={fullBalance}
      earningToken={earningToken}
      earningsDollarValue={earningsDollarValue}
      sousId={sousId}
      isBnbPool={isBnbPool}
      isCompoundPool={isManualCakePool}
      referrer={referrer}
    />,
  )

  const handleEarningsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onPresentCollect()
  }

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize="12px" color="textSubtle" textAlign="left">
          {labelText}
        </Text>
        {!userDataLoaded && account ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex>
              <Box mr="8px" height="32px" onClick={hasEarnings ? handleEarningsClick : undefined}>
                <Balance
                  mt="4px"
                  bold={!isXs && !isSm}
                  fontSize={isXs || isSm ? '14px' : '16px'}
                  color={hasEarnings ? 'primary' : 'textDisabled'}
                  decimals={hasEarnings ? 5 : 1}
                  value={hasEarnings ? earningTokenBalance : 0}
                />
                {hasEarnings ? (
                  <Balance
                    display="inline"
                    fontSize="12px"
                    color={hasEarnings ? 'textSubtle' : 'textDisabled'}
                    decimals={2}
                    value={earningTokenDollarBalance}
                    unit=" USD"
                    prefix="~"
                  />
                ) : (
                  <Text mt="4px" fontSize="12px" color={hasEarnings ? 'textSubtle' : 'textDisabled'}>
                    0 USD
                  </Text>
                )}
              </Box>
            </Flex>
          </>
        )}
      </CellContent>
    </StyledCell>
  )
}

export default EarningsCell
