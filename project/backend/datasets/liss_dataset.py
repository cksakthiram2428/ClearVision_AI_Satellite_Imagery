import os
import torch
from torch.utils.data import Dataset
import numpy as np
import albumentations as A
from utils.geotiff_utils import read_geotiff
from utils.preprocessing import normalize_image, generate_cloud_mask

class LISSDataset(Dataset):
    def __init__(self, cloudy_dir, clear_dir, sar_dir=None, temporal_dir=None, patch_size=256, augment=True):
        """
        Dataset for ISRO Challenge 2: LISS-IV Cloud Removal.
        """
        super().__init__()
        self.cloudy_dir = cloudy_dir
        self.clear_dir = clear_dir
        self.sar_dir = sar_dir
        self.temporal_dir = temporal_dir
        
        self.image_files = sorted([f for f in os.listdir(cloudy_dir) if f.endswith('.tif')])
        
        if augment:
            self.transform = A.Compose([
                A.RandomCrop(width=patch_size, height=patch_size),
                A.HorizontalFlip(p=0.5),
                A.VerticalFlip(p=0.5),
                A.RandomRotate90(p=0.5)
            ], additional_targets={'clear': 'image', 'sar': 'image', 'temporal': 'image', 'mask': 'mask'})
        else:
            self.transform = A.Compose([
                A.CenterCrop(width=patch_size, height=patch_size)
            ], additional_targets={'clear': 'image', 'sar': 'image', 'temporal': 'image', 'mask': 'mask'})

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        filename = self.image_files[idx]
        
        # Load Cloudy LISS-IV (Input)
        cloudy_path = os.path.join(self.cloudy_dir, filename)
        cloudy_img, _ = read_geotiff(cloudy_path)
        cloudy_img = normalize_image(cloudy_img)
        
        # Load Clear LISS-IV (Ground Truth)
        clear_path = os.path.join(self.clear_dir, filename)
        clear_img, _ = read_geotiff(clear_path)
        clear_img = normalize_image(clear_img)
        
        # Generate Cloud Mask
        cloud_mask = generate_cloud_mask(cloudy_img)
        
        # Optional Auxiliary Modalities
        sar_img = np.zeros((2, cloudy_img.shape[1], cloudy_img.shape[2]), dtype=np.float32)
        if self.sar_dir:
            sar_path = os.path.join(self.sar_dir, filename)
            if os.path.exists(sar_path):
                sar_img, _ = read_geotiff(sar_path)
                sar_img = normalize_image(sar_img)
                
        temporal_img = np.zeros_like(cloudy_img)
        if self.temporal_dir:
            temp_path = os.path.join(self.temporal_dir, filename)
            if os.path.exists(temp_path):
                temporal_img, _ = read_geotiff(temp_path)
                temporal_img = normalize_image(temporal_img)

        # Albumentations expects (H, W, C) so we transpose
        cloudy_img = np.transpose(cloudy_img, (1, 2, 0))
        clear_img = np.transpose(clear_img, (1, 2, 0))
        sar_img = np.transpose(sar_img, (1, 2, 0))
        temporal_img = np.transpose(temporal_img, (1, 2, 0))
        cloud_mask = np.transpose(cloud_mask, (1, 2, 0))

        # Apply augmentations
        transformed = self.transform(
            image=cloudy_img,
            clear=clear_img,
            sar=sar_img,
            temporal=temporal_img,
            mask=cloud_mask
        )
        
        # Transpose back to (C, H, W) for PyTorch
        cloudy_tensor = torch.from_numpy(np.transpose(transformed['image'], (2, 0, 1)))
        clear_tensor = torch.from_numpy(np.transpose(transformed['clear'], (2, 0, 1)))
        sar_tensor = torch.from_numpy(np.transpose(transformed['sar'], (2, 0, 1)))
        temporal_tensor = torch.from_numpy(np.transpose(transformed['temporal'], (2, 0, 1)))
        mask_tensor = torch.from_numpy(np.transpose(transformed['mask'], (2, 0, 1)))

        return {
            'cloudy_image': cloudy_tensor,
            'cloud_mask': mask_tensor,
            'sar_image': sar_tensor,
            'reference_image': temporal_tensor,
            'target_image': clear_tensor
        }
