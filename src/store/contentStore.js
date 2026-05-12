import { create } from 'zustand';

export const useContentStore = create((set) => ({
  currentDraft: null,
  selectedPlatform: 'instagram',
  selectedContentType: 'caption',
  selectedTone: 'professional',
  generatedContent: null,
  isGenerating: false,

  setDraft: (draft) => set({ currentDraft: draft }),
  clearDraft: () => set({ currentDraft: null, generatedContent: null }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setSelectedContentType: (type) => set({ selectedContentType: type }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));
