import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const product = await api
        .get(`products/${productId}`)
        .then((response) => response.data);

      const hasInCart = cart.filter(
        (productCart) => productCart.id === product.id
      );

      if (hasInCart.length > 0) {
        updateProductAmount({
          productId: product.id,
          amount: hasInCart[0].amount + 1,
        });
      } else {
        setCart((oldState) => {
          return [...oldState, { ...product, amount: 1 }];
        });
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, { ...product, amount: 1 }])
        );
        toast.success("Produto adicionado com sucesso!");
      }
    } catch (error) {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productExists = cart.find((product) => product.id === productId);
      if (productExists) {
        const newCart = cart.filter((product) => product.id !== productId);
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        toast.warn("Produto removido com sucesso!");
      } else {
        toast.error("Erro na remoção do produto");
      }
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount > 0) {
        const stock: Stock = await api
          .get(`stock/${productId}`)
          .then((response) => response.data);

        if (stock) {
          const product = cart.find((product) => product.id === productId);
          if (product) {
            if (stock.amount >= amount) {
              const newCart = cart.map((product) => {
                if (product.id === productId) {
                  product.amount = amount;
                }
                return product;
              });
              setCart(newCart);
              localStorage.setItem(
                "@RocketShoes:cart",
                JSON.stringify(newCart)
              );
              toast.info("Quantidade alterada no carrinho!");
            } else {
              toast.error("Quantidade solicitada fora de estoque");
            }
          } else {
            toast.error("Erro na alteração de quantidade do produto");
          }
        } else {
          toast.error("Erro na alteração de quantidade do produto");
        }
      } else {
        toast.error("Erro na alteração de quantidade do produto");
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
