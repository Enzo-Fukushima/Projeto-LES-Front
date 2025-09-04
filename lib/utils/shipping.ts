// Shipping calculation utilities (RF requirement)

export interface ShippingOption {
  id: string
  name: string
  price: number
  estimatedDays: string
  description: string
}

export const calculateShipping = (cep: string, weight: number, value: number): ShippingOption[] => {
  // Mock shipping calculation based on CEP, weight, and value
  // In real app, this would integrate with shipping APIs (Correios, etc.)

  const basePrice = weight * 2.5 // R$ 2.50 per kg
  const distanceMultiplier = cep.startsWith("0") ? 1.2 : 1.0 // SP region cheaper

  const options: ShippingOption[] = [
    {
      id: "sedex",
      name: "SEDEX",
      price: Math.round(basePrice * 2.5 * distanceMultiplier * 100) / 100,
      estimatedDays: "1-2 dias úteis",
      description: "Entrega expressa com rastreamento",
    },
    {
      id: "pac",
      name: "PAC",
      price: Math.round(basePrice * 1.5 * distanceMultiplier * 100) / 100,
      estimatedDays: "3-7 dias úteis",
      description: "Entrega econômica com rastreamento",
    },
  ]

  // Free shipping for orders over R$ 100
  if (value >= 100) {
    options.push({
      id: "free",
      name: "Frete Grátis",
      price: 0,
      estimatedDays: "5-10 dias úteis",
      description: "Frete grátis para compras acima de R$ 100",
    })
  }

  return options
}

export const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.length === 8
}

export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2")
}
