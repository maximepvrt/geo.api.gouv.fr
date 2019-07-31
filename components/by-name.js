import {useState, useCallback, useEffect} from 'react'
import PropTypes from 'prop-types'
import debounce from 'debounce'
import FaTag from 'react-icons/lib/fa/tag'

import api from '../lib/api'
import theme from '../styles/theme'

import {useInput} from './hooks/input'

import TryName from './try-name'
import Tuto from './tuto'

let currentRequest = null

function renderDefaultItem(item, isHighlighted) {
  return (
    <div key={item.code} className={`item ${isHighlighted ? 'item-highlighted' : ''}`}>
      <div>{item.nom}</div>
      <div>{item.code}</div>
      <style jsx>{`
        .item {
          display: flex;
          flex-flow: row;
          justify-content: space-between;
          align-items: center;
          padding: 1em;
          border-bottom: 1px solid whitesmoke;
        }

        .item:hover {
          cursor: pointer;
        }

        .item-highlighted {
          background-color: ${theme.primary};
          color: ${theme.colors.white};
        }
      `}</style>
    </div>
  )
}

const ByName = ({defaultInput, placeholder, renderQuery, renderItem, children}) => {
  const [input, setInput] = useInput(defaultInput || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [boost, setBoost] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState(renderQuery(input, boost))

  const handleSelect = useCallback(item => {
    setInput(item.nom)
  }, [setInput])

  const handleSearch = useCallback(debounce(async () => {
    setError(null)
    try {
      const req = api(query)

      currentRequest = req

      const response = await await api(query)
      if (currentRequest === req) {
        setResults(response.splice(0, 5) || [])
      }
    } catch (error) {
      setError(error)
    }

    setLoading(false)
  }, 200), [results, error, query, setLoading, setError])

  const handleBoost = useCallback(() => {
    setBoost(!boost)
  }, [boost, setBoost])

  useEffect(() => {
    const query = renderQuery(input, boost)
    setQuery(query)
  }, [input, boost, handleSearch, renderQuery])

  useEffect(() => {
    handleSearch()
  }, [handleSearch, query])

  return (
    <div id='name'>
      <Tuto
        title='Recherche par nom'
        description='La variable nom vous permet d’effectuer une recherche par nom.'
        icon={<FaTag />}
        exemple={`https://geo.api.gouv.fr/${query}`}
        results={results}
        tips='Il est possible d’utiliser la recherche par nom pour faire de l’autocomplétion.'
        side='right'
        loading={loading}
      >
        {children}
      </Tuto>

      <TryName
        value={input}
        placeholder={placeholder}
        results={results}
        boost={boost}
        loading={loading}
        error={error}
        disabledBoost={false}
        renderItem={renderItem || renderDefaultItem}
        handleChange={setInput}
        handleSelect={handleSelect}
        handleBoost={handleBoost}
      />

      <style jsx>{`
          .field {
            background: ${theme.primary};
            color: ${theme.colors.white};
            border-radius: 2px;
            padding: 0.1em 0.3em;
          }
      `}</style>
    </div>
  )
}

ByName.defaultProps = {
  defaultInput: '',
  placeholder: null,
  renderItem: null,
  children: null
}

ByName.propTypes = {
  defaultInput: PropTypes.string,
  placeholder: PropTypes.string,
  renderQuery: PropTypes.func.isRequired,
  renderItem: PropTypes.func,
  children: PropTypes.node
}

export default ByName
