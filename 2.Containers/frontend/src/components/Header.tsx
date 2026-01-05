'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface HeaderProps {
  username?: string
}

export default function Header({ username }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('token')
    Cookies.remove('username')
    Cookies.remove('accountId')
    router.push('/')
  }

  return (
    <header className="header">
      <Link href={username ? '/home' : '/'}>
        <h1 className="header-title">Bank of MSA</h1>
      </Link>
      {username && (
        <div className="header-user">
          <span>{username}</span>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#34a853',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
