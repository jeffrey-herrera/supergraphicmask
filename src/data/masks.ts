export interface MaskData {
  id: string;
  name: string;
  path: string;
  preview?: string;
}

export const masks: MaskData[] = [
  {
    id: 'circle',
    name: 'Circle',
    path: '/masks/circle.svg',
  },
  {
    id: 'square',
    name: 'Square',
    path: '/masks/square.svg',
  },
  {
    id: 'heart',
    name: 'Heart',
    path: '/masks/heart.svg',
  },
  {
    id: 'star',
    name: 'Star',
    path: '/masks/star.svg',
  },
];

export function getMaskById(id: string): MaskData | undefined {
  return masks.find(mask => mask.id === id);
}