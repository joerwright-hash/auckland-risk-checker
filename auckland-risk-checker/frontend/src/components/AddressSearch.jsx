import { useState } from 'react'
import './SearchForm.css'

export default function AddressSearch({ onSearch, loading }) {
  const [address, setAddress] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) return
    onSearch(trimmed)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-inner">
        <label className="search-label" htmlFor="address-input">
          Enter an Auckland property address
        </label>
        <div className="search-row">
          <input
            id="address-input"
            className="search-input"
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. 135 Albert Street, Auckland CBD"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className="search-btn"
            type="submit"
            disabled={loading || !address.trim()}
          >
            {loading ? 'Checking…' : 'Check risks'}
          </button>
        </div>
        <p className="search-hint">
          Try: "25 Shortland Street, Auckland" or "123 Tamaki Drive, Mission Bay"
        </p>
      </div>
    </form>
  )
}
