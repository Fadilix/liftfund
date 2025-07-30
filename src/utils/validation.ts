import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Le prénom est requis',
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'L\'email est requis',
    'string.email': 'Format d\'email invalide'
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s]+$/).optional().messages({
    'string.pattern.base': 'Format de téléphone invalide'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'L\'email est requis',
    'string.email': 'Format d\'email invalide'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis'
  })
});

export const otpVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'L\'email est requis',
    'string.email': 'Format d\'email invalide'
  }),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Le code OTP est requis',
    'string.length': 'Le code OTP doit contenir 6 chiffres',
    'string.pattern.base': 'Le code OTP doit contenir uniquement des chiffres'
  })
});

export const createAdminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'L\'email est requis',
    'string.email': 'Format d\'email invalide'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
});
