import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AnonymousMessage from '#models/anonymous_message'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare publicKey: string

  @column()
  declare avatar: string | null

  @beforeCreate()
  static async generateAttributes(user: User) {
    if (!user.publicKey) {
      const random = Math.floor(100000 + Math.random() * 900000)
      const prefix = user.email.substring(0, 6)
      user.publicKey = `${prefix}-${random}`
    }

    if (!user.avatar) {
      const seed = Math.random().toString(36).substring(7)
      user.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    }
  }

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => AnonymousMessage, {
    foreignKey: 'recipientId',
  })
  declare anonymousMessages: HasMany<typeof AnonymousMessage>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}