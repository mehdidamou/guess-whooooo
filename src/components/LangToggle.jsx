import { useContext } from 'react'
import { LangContext } from '../i18n/index.js'

export default function LangToggle() {
  const { lang, setLang } = useContext(LangContext)
  return (
    <div className="lang" role="group" aria-label="Language">
      {['en', 'fr'].map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'on' : ''}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
