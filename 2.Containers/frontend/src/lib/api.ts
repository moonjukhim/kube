const API_BASE = {
  userservice: process.env.USERSERVICE_URL || 'http://localhost:8000',
  balanceReader: process.env.BALANCE_READER_URL || 'http://localhost:8081',
  transactionHistory: process.env.TRANSACTION_HISTORY_URL || 'http://localhost:8082',
  ledgerWriter: process.env.LEDGER_WRITER_URL || 'http://localhost:8083',
  contacts: process.env.CONTACTS_URL || 'http://localhost:8001',
}

export interface User {
  username: string
  firstName: string
  lastName: string
  accountId: string
}

export interface Transaction {
  id: string
  date: string
  type: 'credit' | 'debit'
  account: string
  label: string
  amount: number
}

export interface Contact {
  username: string
  accountNumber: string
  label: string
}

// User Service API
export const userApi = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE.userservice}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },

  signup: async (data: {
    username: string
    password: string
    firstName: string
    lastName: string
  }) => {
    const res = await fetch(`${API_BASE.userservice}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Signup failed')
    return res.json()
  },

  getUser: async (token: string) => {
    const res = await fetch(`${API_BASE.userservice}/user`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to get user')
    return res.json()
  },
}

// Balance Reader API
export const balanceApi = {
  getBalance: async (token: string, accountId: string) => {
    const res = await fetch(`${API_BASE.balanceReader}/balance/${accountId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to get balance')
    return res.json()
  },
}

// Transaction History API
export const transactionApi = {
  getHistory: async (token: string, accountId: string) => {
    const res = await fetch(`${API_BASE.transactionHistory}/transactions/${accountId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to get transactions')
    return res.json()
  },
}

// Ledger Writer API
export const ledgerApi = {
  deposit: async (token: string, data: { accountId: string; amount: number; label?: string }) => {
    const res = await fetch(`${API_BASE.ledgerWriter}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Deposit failed')
    return res.json()
  },

  transfer: async (token: string, data: {
    fromAccountId: string
    toAccountId: string
    amount: number
    label?: string
  }) => {
    const res = await fetch(`${API_BASE.ledgerWriter}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Transfer failed')
    return res.json()
  },
}

// Contacts API
export const contactsApi = {
  getContacts: async (token: string, username: string) => {
    const res = await fetch(`${API_BASE.contacts}/contacts/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to get contacts')
    return res.json()
  },

  addContact: async (token: string, data: {
    username: string
    contactUsername: string
    accountNumber: string
    label: string
  }) => {
    const res = await fetch(`${API_BASE.contacts}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to add contact')
    return res.json()
  },
}

