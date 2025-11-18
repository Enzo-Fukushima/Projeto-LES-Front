import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CarrinhoItemDTO, Livro } from "@/lib/types";

interface CartItemProps {
  item: CarrinhoItemDTO;
  livro?: Livro; // livro completo
  onUpdateQuantity: (livroId: number, quantity: number) => Promise<void>;
  onRemove: (livroId: number) => Promise<void>;
  disabled?: boolean;
}

export function CartItemComponent({
  item,
  livro,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const quantidade = item.quantidade ?? 1;
  const precoUnitario = item.precoUnitario ?? 0;

  const titulo = livro?.titulo ?? item.titulo ?? "Livro desconhecido";
  const autor = livro?.autor ?? item.autor ?? "Autor não informado";

  // Aqui puxamos editora como string diretamente do objeto do livro


  const imagem_url = livro?.imagem_url ?? item.imagemUrl ?? "/placeholder.svg";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const handleChangeQuantity = (quantity: number) => {
    if (quantity < 1) return;
    onUpdateQuantity(item.livroId, quantity);
  };

  return (
    <Card data-testid="cart-item">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-28 flex-shrink-0">
            <Image
              src={imagem_url}
              alt={titulo}
              fill
              className="object-cover rounded"
              sizes="80px"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">{titulo}</h3>
              <p className="text-sm text-muted-foreground">{autor}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeQuantity(quantidade - 1)}
                  disabled={quantidade <= 1 || disabled}
                  data-testid="decrease-quantity"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <Input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) =>
                    handleChangeQuantity(Number.parseInt(e.target.value) || 1)
                  }
                  className="w-16 text-center"
                  disabled={disabled}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeQuantity(quantidade + 1)}
                  disabled={disabled}
                  aria-label="Increment quantity"
                  data-testid="increase-quantity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.livroId)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
                data-testid="remove-item"
                aria-label="Remove item"
                
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatPrice(precoUnitario)} cada
              </span>
              <span className="font-semibold text-primary">
                {formatPrice(precoUnitario * quantidade)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
