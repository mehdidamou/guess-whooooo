import { useContext } from 'react'
import { LangContext } from '../i18n/index.js'

export const imageUrl = (c) => `${import.meta.env.BASE_URL}${c.image}`

export default function CharacterCard({ character, selected = false, onClick, big = false }) {
  const { lang } = useContext(LangContext)
  const name = character.name[lang]
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`card${selected ? ' selected' : ''}${big ? ' big' : ''}`}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
    >
      <img src={imageUrl(character)} alt="" draggable="false" />
      <span>{name}</span>
    </Tag>
  )
}
