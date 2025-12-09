// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator, updateProfileValidator } from '#validators/auth'

export default class AuthController {
  /**
   * POST /api/auth/signup
   * Créer un nouveau compte utilisateur
   */
  async signup({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      // Vérifier si l'email existe déjà
      const existingUser = await User.findBy('email', payload.email.toLowerCase())
      if (existingUser) {
        return response.status(400).json({
          message: 'Cet email est déjà utilisé',
          code: 'DUPLICATE_EMAIL',
        })
      }

      const user = await User.create({
        email: payload.email,
        password: payload.password,
        fullName: payload.display_name,
      })

      const token = await User.accessTokens.create(user)

      return response.status(201).json({
        token: token.value!.release(),
        user: {
          id: user.id,
          email: user.email,
          display_name: user.fullName,
          public_key: user.publicKey,
        },
      })
    } catch (error) {
      console.error('Signup error:', error)
      return response.status(500).json({
        message: 'Erreur lors de la création du compte',
        code: 'INTERNAL_ERROR',
        details: error.messages || error.message,
      })
    }
  }

  /**
   * POST /api/auth/login
   * Authentifier un utilisateur existant
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      // Vérifier les identifiants
      const user = await User.verifyCredentials(email, password)

      if (!user) {
        return response.status(401).json({
          message: 'Email ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS',
        })
      }

      // Générer le token
      const token = await User.accessTokens.create(user)

      return response.status(200).json({
        token: token.value!.release(),
        user: {
          id: user.id,
          email: user.email,
          display_name: user.fullName,
          public_key: user.publicKey,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.status(401).json({
          message: 'Email ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS',
        })
      }

      return response.status(500).json({
        message: 'Erreur lors de la connexion',
        code: 'INTERNAL_ERROR',
        details: error.messages || error.message,
      })
    }
  }

  /**
   * POST /api/auth/logout
   * Déconnexion (invalide le token)
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (user && user.currentAccessToken) {
        await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      }

      return response.status(200).json({
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      console.error('Logout error:', error)
      return response.status(500).json({
        message: 'Erreur lors de la déconnexion',
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * GET /api/auth/profile
   * Récupérer le profil de l'utilisateur authentifié
   */
  async profile({ auth, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({
          message: 'Non authentifié',
          code: 'UNAUTHORIZED',
        })
      }

      return response.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          display_name: user.fullName,
          public_key: user.publicKey,
          created_at: user.createdAt.toISO(),
        },
      })
    } catch (error) {
      console.error('Profile error:', error)
      return response.status(500).json({
        message: 'Erreur lors de la récupération du profil',
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * PUT /api/auth/profile
   * Mettre à jour le profil de l'utilisateur
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({
          message: 'Non authentifié',
          code: 'UNAUTHORIZED',
        })
      }

      const payload = await request.validateUsing(updateProfileValidator)

      if (payload.display_name) {
        user.fullName = payload.display_name
      }

      await user.save()

      return response.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          display_name: user.fullName,
        },
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du profil',
        code: 'INTERNAL_ERROR',
        details: error.messages || error.message,
      })
    }
  }
}