import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePowerToysStore = create()(
  persist(
    (set, get) => ({

        extensions: [],
        setExtensions: (extensions) => set({ extensions }),

        enabledExtensions: [],
        setEnabledExtensions: (extensions) => set({ enabledExtensions }),
        toggleExtensionEnabled: (extensionName) => {

            console.log('toggleExtensionEnabled', extensionName)

            const extensions = get().enabledExtensions;
            const extensionExists = extensions.some((ext) => ext.name === extensionName);
            
            let updatedExtensions;

            if (extensionExists) {
                updatedExtensions = extensions.map((ext) => {
                    if (ext.name === extensionName) {
                        return { ...ext, enabled: !ext.enabled }
                    }
                    return ext
                })
            } else {

                // const extension_path = 

                updatedExtensions = [
                    ...extensions, 
                    { 
                        name: extensionName, 
                        // extension_path: extension_path,
                        enabled: true 
                    }
                ]
            }

            console.log('new enabledExtensions', updatedExtensions)
            set({ enabledExtensions: updatedExtensions })
        },

    }),
    {
      name: 'articles-media-power-toys-store',
      version: 1,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ![
            // Exclude list of keys to not persist
            'extensions'
          ].includes(key))
        ),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)