import { createContext, useContext, useState, type ReactNode } from 'react';
import { availableProducts, type MomoProduct } from '../data/menu';

interface FlavorState {
  selected: MomoProduct['id'];
  setSelected: (id: MomoProduct['id']) => void;
}

const Ctx = createContext<FlavorState | null>(null);

/** Shares the selected flavour between product cards and the flavour showcase. */
export function FlavorProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<MomoProduct['id']>(availableProducts[0]?.id ?? 'steam');
  return <Ctx.Provider value={{ selected, setSelected }}>{children}</Ctx.Provider>;
}

export function useFlavor(): FlavorState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFlavor must be used inside FlavorProvider');
  return v;
}
