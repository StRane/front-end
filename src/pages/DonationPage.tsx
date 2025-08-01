import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Badge } from '@/components/ui/badge'
import { Heart, DollarSign, Coins, AlertCircle, CheckCircle } from 'lucide-react'
import { UseMockUSDC, UseCharityPool } from '@/lib/useContracts'

interface DonationForm {
  amount: string
}

export default function DonationPage() {
  const { isConnected } = useAccount()
  const [donationType, setDonationType] = useState<'eth' | 'usdc'>('eth')
  const [step, setStep] = useState<'amount' | 'approve' | 'donate' | 'success'>('amount')
  
  const { balance: usdcBalance, mintTokens, isPending: isMinting } = UseMockUSDC()
  const { 
    userDonations, 
    donateEth, 
    donateUsdc, 
    approveUsdc,
    isPending: isDonating,
    isConfirming,
    isConfirmed,
    error 
  } = UseCharityPool()
  
  const ethForm = useForm<DonationForm>({ defaultValues: { amount: '' } })
  const usdcForm = useForm<DonationForm>({ defaultValues: { amount: '' } })
  
  // Format user donation stats
  const ethDonated = userDonations ? formatUnits(userDonations[0], 18) : '0'
  const usdcDonated = userDonations ? formatUnits(userDonations[1], 6) : '0'
  const totalDonations = userDonations ? userDonations[2].toString() : '0'
  
  // Handle approval confirmation -> move to donate step
  useEffect(() => {
    if (step === 'approve' && isConfirmed) {
      setStep('donate')
    }
  }, [isConfirmed, step])
  
  // Handler functions
  const handleEthDonation = async (data: DonationForm) => {
    try {
      await donateEth(data.amount)
      setStep('success')
      ethForm.reset()
    } catch (err) {
      console.error('ETH donation failed:', err)
    }
  }
  
  const handleUsdcApproval = async (data: DonationForm) => {
    try {
      await approveUsdc(data.amount)
      setStep('approve') // Move to approval pending state
    } catch (err) {
      console.error('USDC approval failed:', err)
    }
  }
  
  const handleUsdcDonation = async (data: DonationForm) => {
    try {
      await donateUsdc(data.amount)
      setStep('success')
      usdcForm.reset()
    } catch (err) {
      console.error('USDC donation failed:', err)
    }
  }
  
  const handleMintUsdc = async () => {
    try {
      await mintTokens('1000')
    } catch (err) {
      console.error('Minting failed:', err)
    }
  }
  
  // ETH form submit handler
  const onEthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ethForm.handleSubmit(handleEthDonation)()
  }
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        Please connect wallet
      </div>
    )
  }
  
  return (
    <div>
      <div className="max-w-4xl mx-auto space-y-6">    
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Donation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{ethDonated}</div>
                <div className="text-sm text-gray-500">ETH Donated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{usdcDonated}</div>
                <div className="text-sm text-gray-500">USDC Donated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalDonations}</div>
                <div className="text-sm text-gray-500">Total Donations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Success Display */}
        {isConfirmed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction successful!
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main Donation Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>
              Choose to donate ETH directly or USDC stablecoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={donationType} onValueChange={(value) => setDonationType(value as 'eth' | 'usdc')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="eth" className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Donate ETH
                </TabsTrigger>
                <TabsTrigger value="usdc" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Donate USDC
                </TabsTrigger>
              </TabsList>
              
              {/* ETH Donation */}
              <TabsContent value="eth" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eth-amount">Amount (ETH)</Label>
                    <Input
                      id="eth-amount"
                      placeholder="0.1"
                      {...ethForm.register('amount', { 
                        required: 'Amount is required',
                        min: { value: 0.001, message: 'Minimum 0.001 ETH' }
                      })}
                    />
                    {ethForm.formState.errors.amount && (
                      <p className="text-sm text-red-600 mt-1">
                        {ethForm.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={onEthSubmit}
                    className="w-full" 
                    disabled={isDonating || isConfirming}
                  >
                    {isDonating ? 'Confirming...' : isConfirming ? 'Processing...' : 'Donate ETH'}
                  </Button>
                </div>
              </TabsContent>
              
              {/* USDC Donation */}
              <TabsContent value="usdc" className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Your USDC Balance</p>
                    <p className="text-lg font-bold text-blue-600">
                      {usdcBalance ? formatUnits(usdcBalance, 6) : '0'} USDC
                    </p>
                  </div>
                  <Button 
                    onClick={handleMintUsdc}
                    disabled={isMinting}
                    variant="outline"
                    size="sm"
                  >
                    {isMinting ? 'Minting...' : 'Mint 1000 USDC'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="usdc-amount">Amount (USDC)</Label>
                    <Input
                      id="usdc-amount"
                      placeholder="100"
                      {...usdcForm.register('amount', { 
                        required: 'Amount is required',
                        min: { value: 1, message: 'Minimum 1 USDC' }
                      })}
                    />
                    {usdcForm.formState.errors.amount && (
                      <p className="text-sm text-red-600 mt-1">
                        {usdcForm.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Step 1: Approval Button */}
                  {step === 'amount' && (
                    <Button 
                      onClick={() => usdcForm.handleSubmit(handleUsdcApproval)()}
                      className="w-full"
                      disabled={isDonating || isConfirming}
                    >
                      {isDonating ? 'Approving...' : 'Approve USDC'}
                    </Button>
                  )}
                  
                  {/* Step 2: Approval Pending */}
                  {step === 'approve' && !isConfirmed && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {isDonating ? 'Approving USDC...' : isConfirming ? 'Approval confirming...' : 'Waiting for approval confirmation...'}
                        </AlertDescription>
                      </Alert>
                      <Button className="w-full" disabled>
                        Waiting for Approval...
                      </Button>
                    </div>
                  )}
                  
                  {/* Step 3: Donation Button */}
                  {step === 'donate' && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          USDC approved! Now you can donate.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={() => usdcForm.handleSubmit(handleUsdcDonation)()}
                        className="w-full"
                        disabled={isDonating || isConfirming}
                      >
                        {isDonating ? 'Donating...' : isConfirming ? 'Processing...' : 'Donate USDC'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Transaction Status */}
        {(isDonating || isConfirming) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">
                  {isDonating ? 'Waiting for wallet confirmation...' : 'Transaction processing...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Pool Stats */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Pool Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Badge variant="secondary" className="mb-2">Protected Pool</Badge>
                <p className="text-sm text-gray-600">
                  Your donations are protected with volatility conversion and MEV safeguards
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Auto-Convert</Badge>
                <p className="text-sm text-gray-600">
                  ETH donations automatically convert to USDC when threshold is reached
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}