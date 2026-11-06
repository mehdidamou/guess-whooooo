import { useContext } from 'react'
import { LangContext, useT } from '../i18n/index.js'
import { SettingsContext, speak } from '../audio.js'

// Top-right controls: sound effects, read-aloud, language.
export default function LangToggle() {
  const { lang, setLang } = useContext(LangContext)
  const { sound, voice, setSound, setVoice } = useContext(SettingsContext)
  const t = useT()
  return (
    <div className="lang" role="group" aria-label="Settings">
      <button
        type="button"
        className={sound ? 'on' : ''}
        aria-pressed={sound}
        aria-label={t('soundFx')}
        onClick={() => setSound(!sound)}
      >
        {sound ? '🔊' : '🔇'}
      </button>
      <button
        type="button"
        className={voice ? 'on' : ''}
        aria-pressed={voice}
        aria-label={t('readAloud')}
        onClick={() => {
          setVoice(!voice)
          if (!voice) speak(t('readAloudOn'), lang)
        }}
      >
        🗣️
      </button>
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
