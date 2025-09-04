// Password validation utilities (RNF requirements)

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = []

  // Minimum 8 characters
  if (password.length < 8) {
    errors.push("A senha deve ter pelo menos 8 caracteres")
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula")
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra minúscula")
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("A senha deve conter pelo menos um caractere especial")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const generateCustomerCode = (): string => {
  // Generate unique customer code (RNF requirement)
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `CLI${timestamp}${random}`
}
