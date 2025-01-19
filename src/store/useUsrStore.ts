import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UsrState {
  setAccessToken: (name: string) => void;
  setRefreshToken: (name: string) => void;
  setCrtChldrnNo: (key: string) => void;
  accessToken?: string;
  refreshToken?: string;
  crtChldrnNo?: string;
}

const useUsrStore = create<UsrState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      crtChldrnNo: undefined,
      setAccessToken: (v: string) => set(() => ({ accessToken: v })),
      setRefreshToken: (v: string) => set(() => ({ refreshToken: v })),
      setCrtChldrnNo: (v: string) => set(() => ({ crtChldrnNo: v })),
    }),
    {
      name: "kidlove", // localstorage key
    }
  )
);

export default useUsrStore;
