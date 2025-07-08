export interface MaskData {
  id: string;
  name: string;
  path: string;
  preview?: string;
}

export const masks: MaskData[] = [
  {
    id: 'mask1',
    name: 'Mask 1',
    path: '/masks/Mask 1.svg',
  },
  {
    id: 'mask2',
    name: 'Mask 2', 
    path: '/masks/Mask 2.svg',
  },
  {
    id: 'mask3',
    name: 'Mask 3',
    path: '/masks/Mask 3.svg',
  },
  {
    id: 'mask4',
    name: 'Mask 4',
    path: '/masks/Mask 4.svg',
  },
  {
    id: 'mask5',
    name: 'Mask 5',
    path: '/masks/Mask 5.svg',
  },
  {
    id: 'mask6',
    name: 'Mask 6',
    path: '/masks/Mask 6.svg',
  },
];

export function getMaskById(id: string): MaskData | undefined {
  return masks.find(mask => mask.id === id);
}