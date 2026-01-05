'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Transaction {
  id: string
  date: string
  type: 'credit' | 'debit'
  account: string
  label: string
  amount: number
}

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [accountId, setAccountId] = useState('')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    const storedUsername = Cookies.get('username')
    const storedAccountId = Cookies.get('accountId')

    if (!token || !storedUsername) {
      router.push('/')
      return
    }

    setUsername(storedUsername)
    setAccountId(storedAccountId || '')

    fetchData(token, storedAccountId || '')
  }, [router])

  const fetchData = async (token: string, accId: string) => {
    try {
      // Fetch balance
      const balanceRes = await fetch(`/api/balance?accountId=${accId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)
      }

      // Fetch transactions
      const txRes = await fetch(`/api/transactions?accountId=${accId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    }).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="main-container">
        <Header username={username} />
        <main className="content-wrapper">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="main-container">
      <Header username={username} />
      
      <main style={{ flex: 1, background: '#f5f5f5', padding: '1.5rem 0' }}>
        <div className="home-container">
          {/* Account Card */}
          <div className="account-card">
            <div className="account-header">
              <div>
                <p className="account-type">CHECKING</p>
                <h2 className="account-name">Checking Account</h2>
              </div>
              <div className="account-number">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#34a853">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>Account Number: {accountId}</span>
              </div>
            </div>

            <div className="balance-section">
              <p className="balance-label">CURRENT BALANCE</p>
              <p className="balance-amount">{formatCurrency(balance)}</p>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-primary btn-action"
                onClick={() => setShowDepositModal(true)}
              >
                Deposit Funds
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
              <button 
                className="btn btn-primary btn-action"
                onClick={() => setShowPaymentModal(true)}
              >
                Send Payment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="history-section">
            <div className="history-header">
              <h3 className="history-title">Transaction History</h3>
            </div>
            <table className="history-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>ACCOUNT</th>
                  <th>LABEL</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#5f6368' }}>
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.date)}</td>
                      <td className={tx.type === 'credit' ? 'type-credit' : 'type-debit'}>
                        + {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </td>
                      <td>{tx.account}</td>
                      <td>{tx.label}</td>
                      <td style={{ textAlign: 'right' }} className={tx.type === 'credit' ? 'amount-positive' : 'amount-negative'}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal 
          onClose={() => setShowDepositModal(false)}
          accountId={accountId}
          onSuccess={() => {
            setShowDepositModal(false)
            const token = Cookies.get('token')
            if (token) fetchData(token, accountId)
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
          accountId={accountId}
          onSuccess={() => {
            setShowPaymentModal(false)
            const token = Cookies.get('token')
            if (token) fetchData(token, accountId)
          }}
        />
      )}

      <Footer />
    </div>
  )
}

function DepositModal({ onClose, accountId, onSuccess }: { onClose: () => void; accountId: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = Cookies.get('token')
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId, amount: parseFloat(amount), label }),
      })
      if (res.ok) onSuccess()
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Deposit Funds</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">AMOUNT</label>
            <div className="input-wrapper">
              <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0.01" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">LABEL (OPTIONAL)</label>
            <div className="input-wrapper">
              <input type="text" className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Paycheck" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Deposit'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PaymentModal({ onClose, accountId, onSuccess }: { onClose: () => void; accountId: string; onSuccess: () => void }) {
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = Cookies.get('token')
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromAccountId: accountId,
          toAccountId: toAccount,
          amount: parseFloat(amount),
          label,
        }),
      })
      if (res.ok) onSuccess()
    } catch (error) {
      console.error('Transfer failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Send Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">TO ACCOUNT</label>
            <div className="input-wrapper">
              <input type="text" className="form-input" value={toAccount} onChange={(e) => setToAccount(e.target.value)} placeholder="Account number" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">AMOUNT</label>
            <div className="input-wrapper">
              <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0.01" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">LABEL (OPTIONAL)</label>
            <div className="input-wrapper">
              <input type="text" className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Rent" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}

