
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { MockUSDC__factory, CharityPoolWithVolatilityProtection__factory } from '@/types'

// Contract addresses
const MOCK_USDC_ADDRESS = '0xA64e1689B1a1890F5c0f0fFa11C674339B8B714b' as const
const CHARITY_POOL_ADDRESS = '0x126DF791a1fd4f89bcabB404D7AD79155A57909a' as const

// Extract ABIs from your TypeChain factories
const mockUSDCABI = MockUSDC__factory.abi
const charityPoolABI = CharityPoolWithVolatilityProtection__factory.abi

export function UseMockUSDC() {
  const { address } = useAccount()
  
  // Read contract example - get balance
  const { data: balance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: mockUSDCABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    }
  })

  // Write contract setup
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  // Mint function
  const mintTokens = async (amount: string) => {
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: mockUSDCABI,
      functionName: 'mint',
      args: [parseUnits(amount, 6)], // 6 decimals for USDC
    })
  }

  return {
    balance,
    mintTokens,
    isPending,
    isConfirming,
    isConfirmed,
    error
  }
}

export function UseCharityPool() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  // Read how much user has donated
  const { data: userDonations } = useReadContract({
    address: CHARITY_POOL_ADDRESS,
    abi: charityPoolABI,
    functionName: 'getDonorStats',
    args: [address!],
    query: {
      enabled: !!address,
    }
  })

  // Read total donation count
  const { data: donationCount } = useReadContract({
    address: CHARITY_POOL_ADDRESS,
    abi: charityPoolABI,
    functionName: 'donationCount',
  })

  // Donate ETH function
  const donateEth = async (amount: string) => {
    writeContract({
      address: CHARITY_POOL_ADDRESS,
      abi: charityPoolABI,
      functionName: 'donateEth',
      value: parseUnits(amount, 18), // ETH has 18 decimals
    })
  }

  // Donate USDC function
  const donateUsdc = async (amount: string) => {
    writeContract({
      address: CHARITY_POOL_ADDRESS,
      abi: charityPoolABI,
      functionName: 'donateUsdc',
      args: [parseUnits(amount, 6)], // USDC has 6 decimals
    })
  }

  const approveUsdc = async ( amount: string) => {
  writeContract({
    address: MOCK_USDC_ADDRESS,
    abi: mockUSDCABI,
    functionName: 'approve',
    args: [CHARITY_POOL_ADDRESS, parseUnits(amount, 6)],
  })
}

  return {
    userDonations,
    donationCount,
    donateEth,
    donateUsdc,
    isPending,
    isConfirming,
    isConfirmed,
    approveUsdc,
    error
  }
}